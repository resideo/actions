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

const yarnWhyAll = function* (twistlockjson, repositoryPath) {
  const vulnerabilities = !twistlockjson.vulnerabilities
    ? twistlockjson.results[0].vulnerabilities
    : twistlockjson.vulnerabilities;
  const duplicatesRemoved = vulnerabilities.reduce((acc, pkg) => {
    if (
      !acc.find(
        (vulnerablePackage) =>
          vulnerablePackage.packageName == pkg.packageName || !acc.length
      )
    ) {
      return [...acc, pkg];
    } else {
      return acc;
    }
  }, []);

  console.log("::group::results");
  console.dir(duplicatesRemoved);
  console.log("::endgroup::");

  let packagesToSkip: Vulnerability[] = [];
  let packagesToDisplay: VulnerabilityTagged[] = [];

  yield all(
    duplicatesRemoved.map(
      ({ packageName: pkg }) =>
        function* () {
          let messages: string[] = [];
          let errors: string[] = [];
          const command = yield exec(`yarn why ${pkg}`, {
            cwd: repositoryPath,
          });

          yield spawn(
            command.stdout.forEach((message) => {
              const messageStringified = message.toString().trim();
              messages = [...messages, messageStringified];
            })
          );
          yield spawn(
            command.stderr.forEach((error) => {
              const errorStringified = error.toString().trim();
              if (errorStringified.match(/^error/i)) {
                errors = [...errors, errorStringified];
              }
            })
          );
          yield command.join();

          // Twistlock may report npm packages that are not in yarn.lock.
          // Yarn is a good example of such a package.
          // It might be reporting system-level packages,
          // but when we run those with yarn why, the command fails.
          // This is to avoid these packages.
          if (errors.length > 0) {
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

  if (packagesToSkip.length > 0) {
    console.warn(
      `The following dependencies are excluded from the github comment because they could not be found within the repository/monorepo: ${packagesToSkip
        .map((pkg) => pkg.packageName)
        .join(", ")}`
    );
  }

  return packagesToDisplay;
};

const sortAndCategorize = (afterYarnWhy) => {
  return afterYarnWhy.reduce(
    (acc, pkg) => {
      return acc.map((group) => {
        if (group.severity == pkg.severity) {
          return {
            severity: group.severity,
            packages: [...group.packages, pkg],
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
      { severity: "low", packages: [] },
    ]
  );
};

const formatComment = (sorted, tag) => {
  const dropdown = (title, content) =>
    `<details><summary>${title}</summary>${content}</details>`;

  const convertArrayForMarkdown = (output) =>
    output
      .join("")
      .replace(/\n/g, "<br>")
      .replace(/info \r/g, "");

  const htmlTable = (rows) => {
    const allRows = rows
      .map((columns) => {
        return `<tr>${columns.join("")}</tr>`;
      })
      .join("");
    return `<table>${allRows}</table>`;
  };

  let workflowStatus = "pass";
  const listOfDependencies = (packages: VulnerabilityTagged[]) => {
    return packages
      .map((pkg) => {
        const {
          cvss,
          description,
          link,
          packageName,
          packageVersion,
          status,
          yarnWhy,
        } = pkg;

        const yarnWhyDetails = dropdown(
          "Details",
          convertArrayForMarkdown(yarnWhy)
        );

        const graceDays = !pkg.graceDays ? undefined : parseInt(pkg.graceDays);
        let graceCountdown = "🤷 no defined resolution period";
        if (graceDays) {
          if (graceDays >= 0) {
            graceCountdown = `⏳ ${graceDays} days left`;
          } else {
            graceCountdown = `⚠️ ${graceDays} days overdue`;
            workflowStatus = "failed";
          }
        }

        const summaryTable = htmlTable([
          [
            "<th>Current Ver.</th>",
            "<th>Status</th>",
            "<th>Severity</th>",
            "<th>Grace Period</th>",
          ],
          [
            `<th>${packageVersion}</th>`,
            `<th>${status}</th>`,
            `<th>${cvss}</th>`,
            `<th>${graceCountdown}</th>`,
          ],
        ]);

        const detailsTable = htmlTable([
          ["<td>Description</td>", `<td>${description}</td>`],
          ["<td>Source</td>", `<td><a href=${link}>Link</a></td>`],
          ["<td>Yarn Why</td>", `<td>${yarnWhyDetails}</td>`],
        ]);

        return dropdown(
          `<code>${packageName}</code><span> ${graceCountdown}</span>`,
          `\n${summaryTable}${detailsTable}`
        );
      })
      .join("");
  };

  const severityTable = sorted
    .map((group) => {
      if (group.packages.length > 0) {
        return (
          `<hr>\n${group.severity.toUpperCase()} (${group.packages.length})\n` +
          `${listOfDependencies(group.packages)}\n`
        );
      } else {
        return "";
      }
    })
    .join("");

  if (severityTable) {
    return {
      message:
        "Below are the list of dependencies with security vulnerabilities grouped by severity levels. Click to expand.\n\n" +
        severityTable +
        tag,
      workflowStatus,
    };
  } else {
    return {
      message:
        "You are receiving this comment because there are no dependencies with a security vulnerability" +
        tag,
      workflowStatus,
    };
  }
};

export function* yarmWhyFormat({ message, tag, repositoryPath }) {
  const yarnWhyResults: VulnerabilityTagged[] = yield yarnWhyAll(
    message,
    repositoryPath
  );
  const sorted: VulnerabilitiesCategorized[] =
    sortAndCategorize(yarnWhyResults);
  return formatComment(sorted, tag);
}
