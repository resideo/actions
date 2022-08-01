export const imageScanResult = {
  results: [
    {
      packages: [
        {
          type: "nodejs",
          name: "minimatch",
          version: "4.2.1",
          path: "/home/node/app/node_modules/@graphql-codegen/cli/node_modules/minimatch",
          licenses: ["ISC"],
        },

        {
          type: "nodejs",
          name: "minimatch",
          version: "3.0.4",
          path: "/usr/local/lib/node_modules/npm/node_modules/minimatch",
          licenses: ["ISC"],
        },
        {
          type: "nodejs",
          name: "minimatch",
          version: "3.0.4",
          path: "/home/node/app/node_modules/minimatch",
          licenses: ["ISC"],
        },
      ],
      applications: [
        {
          name: "node",
          version: "14.20.0",
          path: "/usr/local/bin/node",
        },
      ],
      compliances: [
        {
          id: 425,
          title: "Private keys stored in image",
          severity: "high",
          cause:
            "Found: /home/node/app/apps/template/node_modules/agent-base/test/ssl-cert-snakeoil.key",
          layerTime: "1970-01-01T00:00:00Z",
          category: "Twistlock Labs",
        },
      ],
      complianceDistribution: {
        critical: 0,
        high: 1,
        medium: 0,
        low: 0,
        total: 1,
      },
      complianceScanPassed: false,
      vulnerabilities: [
        {
          id: "PRISMA-2022-0039",
          status: "fixed in 3.0.5",
          cvss: 7.5,
          description:
            "minimatch package versions before 3.0.5 are vulnerable to Regular Expression Denial of Service (ReDoS). It\\'s possible to cause a denial of service when calling function braceExpand (The regex /\\\\{.*\\\\}/ is vulnerable and can be exploited).",
          severity: "high",
          packageName: "minimatch",
          packageVersion: "3.0.4",
          link: "https://github.com/isaacs/minimatch/commit/a8763f4388e51956be62dc6025cec1126beeb5e6",
          riskFactors: ["DoS", "Has fix", "High severity"],
          impactedVersions: ["\u003c3.0.5"],
          publishedDate: "2022-02-21T09:51:41Z",
          discoveredDate: "2022-07-29T21:05:04Z",
          graceDays: -128,
          fixDate: "2022-02-21T09:51:41Z",
          layerTime: "2022-07-12T01:20:10Z",
        },
        {
          id: "CVE-2021-3807",
          status: "fixed in 3.0.1, 4.1.1, 5.0.1, 6.0.1",
          cvss: 7,
          vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
          description:
            "ansi-regex is vulnerable to Inefficient Regular Expression Complexity",
          severity: "high",
          packageName: "ansi-regex",
          packageVersion: "4.1.0",
          link: "https://github.com/advisories/GHSA-93q8-gq69-wqmw",
          riskFactors: [
            "High severity",
            "Recent vulnerability",
            "Attack complexity: low",
            "Attack vector: network",
            "Has fix",
          ],
          impactedVersions: ["\u003c4.1.1", "\u003e=4.0.0"],
          publishedDate: "2021-09-17T07:15:00Z",
          discoveredDate: "2022-07-29T21:05:04Z",
          graceDays: -282,
          fixDate: "2021-09-20T20:20:09Z",
          layerTime: "2022-07-12T01:20:10Z",
        },
      ],
      vulnerabilityDistribution: {
        critical: 0,
        high: 3,
        medium: 2,
        low: 2,
        total: 7,
      },
      vulnerabilityScanPassed: false,
    },
  ],
};
