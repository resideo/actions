import { Vulnerability } from "./twistlock";
declare type VulnerabilityTagged = Vulnerability & {
    yarnWhy?: string[];
};
export interface VulnerabilitiesCategorized {
    severity: string;
    packages: VulnerabilityTagged[];
}
export declare function yarmWhyFormat({ message, tag }: {
    message: any;
    tag: any;
}): Generator<Generator<import("effection").Operation<{
    [x: string]: unknown;
}>, VulnerabilityTagged[], unknown>, string, VulnerabilityTagged[]>;
export {};
//# sourceMappingURL=yarnWhyFormat.d.ts.map