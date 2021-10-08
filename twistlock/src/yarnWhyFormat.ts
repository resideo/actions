import { spawn, all } from "effection";
import { exec } from "@effection/process";
import { Vulnerability } from "./twistlock";

type VulnerabilityTagged = Vulnerability & {
  yarnWhy?: string[];
};

export interface VulnerabilitiesCategorized {
  severity: string;
  packages: VulnerabilityTagged[];
}

const yarnWhyAll = function*(twistlockjson) {
  const duplicatesRemoved = twistlockjson.vulnerabilities.reduce((acc, pkg) => {
    if (
      !acc.find(
        vulnerablePackage =>
          vulnerablePackage.packageName == pkg.packageName || !acc.length
      )
    ) {
      return [...acc, pkg];
    } else {
      return acc;
    }
  }, []);

  let packagesToSkip: Vulnerability[] = [];
  let packagesToDisplay: VulnerabilityTagged[] = [];

  yield all(
    duplicatesRemoved.map(
      ({ packageName: pkg }) =>
        function*() {
          let messages: string[] = [];
          let errors: string[] = [];
          const command = yield exec(`yarn why ${pkg}`);

          yield spawn(
            command.stdout.forEach(message => {
              messages = [...messages, message];
            })
          );
          yield spawn(
            command.stderr.forEach(error => {
              if (error.match(/^error/i)) {
                errors = [...errors, error];
              }
            })
          );
          yield command.join();

          // Twistlock reports npm packages that are not in yarn.lock. Yarn is a good example of such a package. It might be reporting system-level packages, but when we run those with yarn why, the command fails. this is to avoid these packages.
          if (errors.length) {
            const pkgToSkip = duplicatesRemoved.find(
              ({ packageName: name }) => name == pkg
            );
            packagesToSkip = [...packagesToSkip, pkgToSkip];
          } else {
            const pkgToDisplay = duplicatesRemoved.find(
              ({ packageName: name }) => name == pkg
            );
            pkgToDisplay.yarnWhy = messages;
            packagesToDisplay = [...packagesToDisplay, pkgToDisplay];
          }
        }
    )
  );

  // TODO: Remove this and convert errors to a boolean if we don't need this information
  if (packagesToSkip.length > 0) {
    console.warn(
      `The following dependencies are excluded from the github comment because they could not be found within the repository/monorepo: ${packagesToSkip
        .map(pkg => pkg.packageName)
        .join(", ")}`
    );
  }

  return packagesToDisplay;
};

const sortAndCategorize = afterYarnWhy => {
  return afterYarnWhy.reduce(
    (acc, pkg) => {
      return acc.map(group => {
        if (group.severity == pkg.severity) {
          return {
            severity: group.severity,
            packages: [...group.packages, pkg]
          };
        } else {
          return group;
        }
      });
    },
    [
      { severity: "critical", packages: [] },
      { severity: "high", packages: [] },
      { severity: "moderate", packages: [] },
      { severity: "medium", packages: [] },
      { severity: "low", packages: [] }
    ]
  );
};

const formatComment = (sorted, tag) => {
  const dropdown = (title, content) =>
    `<details><summary>${title}</summary>${content}</details>`;

  const convertArrayForMarkdown = output =>
    output
      .join("")
      .replace(/\n/g, "<br>")
      .replace(/info \r/g, "");

  const htmlTable = rows => {
    const allRows = rows
      .map(columns => {
        return `<tr>${columns.join("")}</tr>`;
      })
      .join("");
    return `<table>${allRows}</table>`;
  };

  const listOfDependencies = (packages: VulnerabilityTagged[]) => {
    return packages
      .map(pkg => {
        const {
          cvss,
          description,
          discoveredDate,
          link,
          packageName,
          packageVersion,
          status,
          yarnWhy
        } = pkg;

        const yarnWhyDetails = dropdown(
          "Details",
          convertArrayForMarkdown(yarnWhy)
        );

        // The grace time interval is hard coded for now. We should eventually be getting this value from the twistlock CLI response.
        const graceTime = 30;
        const fixDiscoveredDate = new Date(discoveredDate);
        const graceExpiry = fixDiscoveredDate.setDate(
          fixDiscoveredDate.getDate() + graceTime
        );
        const graceDays = Math.floor((graceExpiry - Date.now()) / 86_400_000);
        const graceCountdown =
          graceDays >= 0
            ? `${graceDays} days left`
            : `⚠️ ${graceDays} days overdue`;

        const summaryTable = htmlTable([
          [
            "<th>Current Ver.</th>",
            "<th>Status</th>",
            "<th>Severity</th>",
            "<th>Grace Period</th>"
          ],
          [
            `<th>${packageVersion}</th>`,
            `<th>${status}</th>`,
            `<th>${cvss}</th>`,
            `<th>${graceCountdown}</th>`
          ]
        ]);

        const detailsTable = htmlTable([
          ["<td>Description</td>", `<td>${description}</td>`],
          ["<td>Source</td>", `<td><a href=${link}>Link</a></td>`],
          ["<td>Yarn Why</td>", `<td>${yarnWhyDetails}</td>`]
        ]);

        return dropdown(
          `<code>${packageName}</code>`,
          `<br>${summaryTable}${detailsTable}`
        );
      })
      .join("");
  };

  const severityTable = sorted
    .map(group => {
      if (group.packages.length > 0) {
        return dropdown(
          `${group.severity.toUpperCase()} (${group.packages.length})`,
          `<hr>${listOfDependencies(group.packages)}<hr>`
        );
      } else {
        return "";
      }
    })
    .join("");

  if (severityTable) {
    return (
      "Below are the list of dependencies with security vulnerabilities grouped by severity levels. Click to expand.<br>" +
      severityTable +
      tag
    );
  } else {
    return (
      "You are receiving this comment because there are no dependencies with a security vulnerability" +
      tag
    );
  }
};

export function* yarmWhyFormat({ message, tag }) {
  const yarnWhyResults: VulnerabilityTagged[] = yield yarnWhyAll(message);
  const sorted: VulnerabilitiesCategorized[] = sortAndCategorize(
    yarnWhyResults
  );
  return formatComment(sorted, tag);
}
