import { Vulnerability } from "./twistlock";
declare type VulnerabilityTagged = Vulnerability & {
    yarnWhy?: string[];
    versionInstances: string[];
    allInstances: string[];
};
export interface VulnerabilitiesCategorized {
    severity: string;
    packages: VulnerabilityTagged[];
}
export declare const yarnWhyAll: ({ vulnerabilities, packageList, repositoryPath, logging, runYarnWhy, }: {
    vulnerabilities: any;
    packageList: any;
    repositoryPath: any;
    logging?: boolean | undefined;
    runYarnWhy?: boolean | undefined;
}) => Generator<import("effection").Operation<void[]>, {
    packagesToDisplay: VulnerabilityTagged[];
    packagesToSkip: Vulnerability[];
    skipPackageMessage: string;
}, unknown>;
export declare const withinPathScope: (scanPathScope: string[], pkg: VulnerabilityTagged) => boolean;
export declare const sortAndCategorize: (afterYarnWhy: any, scanPathScope: any) => {
    severity: string;
    packages: VulnerabilityTagged[];
}[];
export declare function yarnWhyFormat({ vulnerabilities, packageList, repositoryPath, scanPathScope, }: {
    vulnerabilities: any;
    packageList: any;
    repositoryPath: any;
    scanPathScope: any;
}): Generator<Generator<import("effection").Operation<void[]>, {
    packagesToDisplay: VulnerabilityTagged[];
    packagesToSkip: Vulnerability[];
    skipPackageMessage: string;
}, unknown>, {
    message: string;
    graceStatus: string;
}, {
    packagesToDisplay: VulnerabilityTagged[];
    skipPackageMessage: string;
}>;
export {};
//# sourceMappingURL=yarnWhyFormat.d.ts.map