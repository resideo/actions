import { markdownTable } from "markdown-table";
import { Distribution, SEVERITY_LEVELS, Vulnerability } from "./twistlock";

export function Heading(distribution: Distribution) {
  return `${distribution.total === 0 ? "👎" : "👍"} - ${
    distribution.critical
  } critical, ${distribution.high} high, ${distribution.medium} medium, ${
    distribution.low
  } low`;
}

export function Vulnerabilities(list: Vulnerability[]) {
  const sorted = list
    .map(({ severity, ...rest }) => ({
      ...rest,
      severity,
      severityLevel: SEVERITY_LEVELS.indexOf(severity)
    }))
    .sort((a, b) => a.severityLevel - b.severityLevel);

  return markdownTable([
    ["Severity", "Package", "Versions", "Description", "Risk Factor"],
    ...sorted.map(item => [
      item.severity,
      item.packageName,
      item.impactedVersions.join(", "),
      item.description,
      item.riskFactor.join(", ")
    ])
  ]);
}