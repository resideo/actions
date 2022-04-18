import { GitHub } from "@actions/github/lib/utils";
export declare const SEVERITY_LEVELS: readonly ["critical", "high", "medium", "low"];
export interface Vulnerability {
    id: string;
    status: string;
    cvss: string;
    vector: string;
    description: string;
    severity: typeof SEVERITY_LEVELS[number];
    packageName: string;
    packageVersion: string;
    link: string;
    riskFactor: string[];
    impactedVersions: string[];
    publishDate: string;
    discoveredDate: string;
    fixDate: string;
    graceDays?: string;
}
export interface Distribution {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
}
export interface TwistlockRun {
    user?: string;
    password?: string;
    token?: string;
    consoleUrl: string;
    project: string;
    repositoryPath: string;
    image: string;
    githubComment: boolean;
    octokit: InstanceType<typeof GitHub>;
}
export interface TwistlockResults {
    code: number;
    results: {
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
    };
}
interface DownloadCliParams {
    user?: string;
    password?: string;
    token?: string;
    consoleUrl: string;
    project: string;
}
interface ScanRepositoryParams {
    repositoryPath: string;
    image: string;
}
export declare type SetupCliReturn = {
    scanRepository: (params: ScanRepositoryParams) => Generator<any, TwistlockResults, any>;
};
export declare function setupCli({ user, password, token, consoleUrl, project, }: DownloadCliParams): Generator<any, SetupCliReturn, any>;
export {};
//# sourceMappingURL=twistlock.d.ts.map