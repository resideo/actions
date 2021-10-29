import { Vulnerability } from "./twistlock";
declare type VulnerabilityTagged = Vulnerability & {
    yarnWhy?: string[];
};
export interface VulnerabilitiesCategorized {
    severity: string;
    packages: VulnerabilityTagged[];
}
export declare function yarmWhyFormat({ results, tag }: {
    results: any;
    tag: any;
}): Generator<Generator<import("effection").Operation<{
    [x: string]: unknown;
}>, VulnerabilityTagged[], unknown>, {
    message: string;
    pass: any;
}, VulnerabilityTagged[]>;
export {};
//# sourceMappingURL=yarnWhyFormat.d.ts.map