import { Vulnerability } from "./twistlock";
declare type VulnerabilityTagged = Vulnerability & {
    yarnWhy?: string[];
};
export interface VulnerabilitiesCategorized {
    severity: string;
    packages: VulnerabilityTagged[];
}
export declare function yarmWhyFormat({ message, tag, repositoryPath }: {
    message: any;
    tag: any;
    repositoryPath: any;
}): Generator<Generator<import("effection").Operation<unknown[]>, VulnerabilityTagged[], unknown>, {
    message: string;
    workflowStatus: string;
}, VulnerabilityTagged[]>;
export {};
//# sourceMappingURL=yarnWhyFormat.d.ts.map