import { it } from "@effection/jest";
import { imageScanResult } from "./fixtures";

import { yarnWhyAll, sortAndCategorize } from "../src/yarnWhyFormat";

describe("image scan", () => {
  const repositoryPath = ["/home/node"];
  it("yarnWhyAll", function* () {
    const { vulnerabilities, packages: packageList } =
      imageScanResult.results[0];
    const { packagesToDisplay, skipPackageMessage } = yield yarnWhyAll({
      vulnerabilities,
      packageList,
      repositoryPath,
      logging: false,
      runYarnWhy: false,
    });
    expect(packagesToDisplay[0].allInstances).toEqual([
      "4.2.1 at /home/node/app/node_modules/@graphql-codegen/cli/node_modules/minimatch",
      "3.0.4 at /usr/local/lib/node_modules/npm/node_modules/minimatch",
      "3.0.4 at /home/node/app/node_modules/minimatch",
    ]);
    expect(skipPackageMessage).toBe("");
  });

  it("sortAndCategorize", function* () {
    const { vulnerabilities, packages: packageList } =
      imageScanResult.results[0];
    const { packagesToDisplay } = yield yarnWhyAll({
      vulnerabilities,
      packageList,
      repositoryPath,
      logging: false,
      runYarnWhy: false,
    });

    const sorted = sortAndCategorize(packagesToDisplay, repositoryPath);

    // expect(JSON.stringify(sorted, null, 2)).toBe("");
    expect(sorted[1].severity).toBe("high");
    expect(sorted[1].packages[0].packageName).toBe("minimatch");
    expect(sorted[1].packages[0].packageVersion).toBe("3.0.4");
  });
});
