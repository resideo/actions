import { Vulnerability } from "./twistlock";
declare type VulnerabilityTagged = Vulnerability & {
    yarnWhy?: string[];
    instances: {
        type: string;
        name: string;
        version: string;
        path: string;
    }[];
};
export interface VulnerabilitiesCategorized {
    severity: string;
    packages: VulnerabilityTagged[];
}
export declare function yarmWhyFormat({ message, tag, repositoryPath }: {
    message: any;
    tag: any;
    repositoryPath: any;
}): Generator<Generator<import("effection").Operation<unknown[]>, {
    packagesToDisplay: VulnerabilityTagged[];
    packagesToSkip: Vulnerability[];
    skipPackageMessage: string;
}, unknown>, {
    message: string;
    workflowStatus: string;
}, {
    packagesToDisplay: VulnerabilityTagged[];
    skipPackageMessage: string;
}>;
export {};
//# sourceMappingURL=yarnWhyFormat.d.ts.map