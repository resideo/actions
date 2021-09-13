import { Context } from "@actions/github/lib/context";
import * as core from "@actions/core/lib/core";
import { Octokit } from "@octokit/action";
export declare function writeSummary({ github, context, results }: SummaryParams): Promise<void>;
interface TwistlockResults {
    repository: string;
    passed: boolean;
    packages: {
        type: string;
        name: string;
        version: string;
        path: string;
        license: string[];
    }[];
    complianceIssues: unknown;
    complianceDistribution: Distribution;
    vulnerabilities: Vulnerability[];
    vulnerabilityDistribution: Distribution;
}
interface Vulnerability {
    id: string;
    status: string;
    cvss: string;
    vector: string;
    description: string;
    severity: Severity;
    packageName: string;
    link: string;
    riskFactor: string[];
    impactedVersions: string[];
    publishDate: string;
    discoveredDate: string;
}
interface Distribution {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
}
interface SummaryParams {
    github: Octokit;
    context: Context;
    core: typeof core;
    results: TwistlockResults;
}
declare type Severity = "low" | "medium" | "high" | "critical";
export {};
