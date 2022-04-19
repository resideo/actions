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
export declare function yarnWhyFormat({ message, tag, repositoryPath, scanPathScope, }: {
    message: any;
    tag: any;
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