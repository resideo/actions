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
    `<details><summary>${title}</summary><hr>${content}</details>`;
  const convertArrayForMarkdown = output =>
    output
      .join("")
      .replace(/\n/g, "<br>")
      .replace(/info \r/g, "");

  const tableOfDependencies = (packages: VulnerabilityTagged[]) => {
    const header =
      "<thead><tr><th>Dependencies</th><th>Yarn Why</th></tr></thead>";
    const table = packages
      .map(pkg => {
        const outputDropdown = dropdown(
          "Details",
          convertArrayForMarkdown(pkg.yarnWhy)
        );
        return `<tr><td><code>${pkg.packageName}</code></td><td>${outputDropdown}</td></tr>`;
      })
      .join("");
    return `<table>${header}${table}</table>`;
  };

  const severityTable = sorted
    .map(group => {
      if (group.packages.length > 0) {
        return dropdown(
          `${group.severity.toUpperCase()} (${group.packages.length})`,
          `${tableOfDependencies(group.packages)}<hr>`
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
