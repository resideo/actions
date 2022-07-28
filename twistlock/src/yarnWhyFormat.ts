import { spawn, all } from "effection";
import { exec } from "@effection/process";
import { Vulnerability } from "./twistlock";

type VulnerabilityTagged = Vulnerability & {
  yarnWhy?: string[];
  versionInstances: string[];
  allInstances: string[];
};

export interface VulnerabilitiesCategorized {
  severity: string;
  packages: VulnerabilityTagged[];
}

const yarnWhyAll = function* (vulnerabilities, packageList, repositoryPath) {
  console.log("::group::results");
  console.dir(vulnerabilities);
  console.log("::endgroup::");

  const vulns = vulnerabilities.reduce((acc, pkg, index) => {
    if (!acc[pkg.packageName]) acc[pkg.packageName] = [];
    acc[pkg.packageName].push({ index, version: pkg.packageVersion });
    return acc;
  }, {});

  let packagesToSkip: Vulnerability[] = [];
  let skipPackageMessage = "";
  let packagesToDisplay: VulnerabilityTagged[] = [];

  yield all(
    Object.keys(vulns).map(
      (pkg) =>
        function* () {
          let messages: string[] = [];
          let errors: string[] = [];
          const command = yield exec(`yarn why ${pkg}`, {
            cwd: repositoryPath,
          });

          yield spawn(
            command.stdout.forEach((message) => {
              // const messageStringified = message.toString().trim();
              messages = [...messages, message.toString()];
            })
          );
          yield spawn(
            command.stderr.forEach((error) => {
              const errorStringified = error.toString().trim();
              if (errorStringified.match(/^error/i)) {
                errors = [...errors, error.toString()];
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
            vulns[pkg].forEach((vuln) => {
              packagesToSkip = [...packagesToSkip, vulnerabilities[vuln.index]];
            });
          } else {
            const packageInstances = packageList.reduce(
              (instances, instance) => {
                if (instance.name === pkg && instance.type === "nodejs") {
                  instances.push(instance);
                }
                return instances;
              },
              []
            );

            vulns[pkg].forEach((vuln) => {
              const pkgToDisplay = vulnerabilities[vuln.index];

              pkgToDisplay.yarnWhy = messages;
              pkgToDisplay.allInstances = packageInstances.map((instance) => {
                return `${instance.version} at ${instance.path}`;
              });

              pkgToDisplay.versionInstances = packageInstances
                .filter(
                  (instance) => instance.version === pkgToDisplay.packageVersion
                )
                .map((instance) => instance.path);
              packagesToDisplay = [...packagesToDisplay, pkgToDisplay];
            });
          }
        }
    )
  );

  if (packagesToSkip.length > 0) {
    skipPackageMessage = `The following dependencies are excluded from the github comment because they could not be found within the repository/monorepo: ${packagesToSkip
      .map((pkg) => pkg.packageName)
      .join(", ")}.\n`;
    console.warn(skipPackageMessage);
  }

  return { packagesToDisplay, packagesToSkip, skipPackageMessage };
};

const withinPathScope = (scanPathScope: string[], pkg: VulnerabilityTagged) => {
  if (scanPathScope.length === 0) return true;
  let within = false;
  const { versionInstances } = pkg;
  versionInstances.forEach((instance) => {
    // if (instance.startsWith("/home/node/")) {
    scanPathScope.forEach((scope) => {
      if (instance.startsWith(scope)) {
        within = true;
      }
    });
    // }
  });
  return within;
};

const sortAndCategorize = (
  afterYarnWhy,
  scanPathScope
): { severity: string; packages: VulnerabilityTagged[] }[] => {
  const categories: { severity: string; packages: VulnerabilityTagged[] }[] = [
    { severity: "critical", packages: [] },
    { severity: "high", packages: [] },
    { severity: "moderate", packages: [] },
    { severity: "medium", packages: [] },
    { severity: "low", packages: [] },
  ];

  if (scanPathScope.length > 0)
    categories.push({ severity: "image (won't fail workflow)", packages: [] });

  return categories.map((category) => {
    afterYarnWhy.forEach((pkg: VulnerabilityTagged) => {
      if (category.severity === pkg.severity) {
        if (withinPathScope(scanPathScope, pkg)) {
          category.packages.push(pkg);
        } else {
          categories[categories.length - 1].packages.push(pkg);
        }
      }
    });
    return category;
  });
};

const formatComment = ({ sorted, skipPackageMessage }) => {
  const dropdown = (title, content) =>
    `<details><summary>${title}</summary>${content}</details>`;

  // const convertArrayForMarkdown = (output) =>
  //   output
  //     .join("")
  //     .replace(/\n/g, "<br>")
  //     .replace(/info \r/g, "");

  const htmlTable = (rows) => {
    const allRows = rows
      .map((columns) => {
        return `<tr>${columns.join("")}</tr>`;
      })
      .join("");
    return `<table>${allRows}</table>`;
  };

  let graceStatus = "pass";
  const listOfDependencies = (group) => {
    const { packages } = group;
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
          allInstances,
          versionInstances,
        } = pkg;

        const yarnWhyDetails = "\n\n```\n" + yarnWhy.join("") + "```\n\n";

        const curVersionInstanceDetails = versionInstances.join("<br>");

        // console.log("current instance");
        // console.dir(curVersionInstanceDetails);

        const allInstanceDetails = allInstances.join("<br>");

        const graceDays = !pkg.graceDays ? undefined : parseInt(pkg.graceDays);
        let graceCountdown = "🤷 no defined resolution period";
        if (graceDays) {
          if (graceDays >= 0) {
            graceCountdown = `⏳ ${graceDays} days left`;
          } else {
            graceCountdown = `⚠️ ${graceDays} days overdue`;
            console.log("current instance???");
            console.log(curVersionInstanceDetails.startsWith("/home/node/"));
            if (curVersionInstanceDetails.startsWith("/home/node/")) {
              graceStatus = "failed";
              console.log("grace status");
              console.dir(graceStatus);
            }
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
          [
            "<td>Current Version<br>Instance</td>",
            `<td>${curVersionInstanceDetails}</td>`,
          ],
          ["<td>All Instances</td>", `<td>${allInstanceDetails}</td>`],
        ]);

        return dropdown(
          `<code>${packageName}</code><code>@</code><code>${packageVersion}</code><span> ${graceCountdown}</span>`,
          `\n${summaryTable}${detailsTable}`
        );
      })
      .join("");
  };

  const severityTable =
    sorted
      .map((group) => {
        if (group.packages.length > 0) {
          return (
            `<hr>\n${group.severity.toUpperCase()} (${
              group.packages.length
            })\n` + `${listOfDependencies(group)}\n`
          );
        } else {
          return "";
        }
      })
      .join("") + "\n<hr>";

  return {
    message:
      "## Vulnerabilities\n\nBelow are the list of dependencies with security vulnerabilities grouped by severity levels. Click to expand.\n\n" +
      severityTable +
      skipPackageMessage,
    graceStatus,
  };
};

export function* yarnWhyFormat({
  vulnerabilities,
  packageList,
  repositoryPath,
  scanPathScope,
}) {
  const {
    packagesToDisplay,
    skipPackageMessage,
  }: {
    packagesToDisplay: VulnerabilityTagged[];
    skipPackageMessage: string;
  } = yield yarnWhyAll(vulnerabilities, packageList, repositoryPath);
  const sorted: VulnerabilitiesCategorized[] = sortAndCategorize(
    packagesToDisplay,
    scanPathScope
  );

  console.log("::group::organized results");
  console.log(JSON.stringify(sorted, null, 2));
  console.log("::endgroup::");

  return formatComment({ sorted, skipPackageMessage });
}
