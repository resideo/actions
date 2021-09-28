import { Logger } from "./types";
export declare const SEVERITY_LEVELS: readonly ["critical", "high", "medium", "low"];
export interface TwistlockResults {
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
export interface Vulnerability {
    id: string;
    status: string;
    cvss: string;
    vector: string;
    description: string;
    severity: typeof SEVERITY_LEVELS[number];
    packageName: string;
    link: string;
    riskFactor: string[];
    impactedVersions: string[];
    publishDate: string;
    discoveredDate: string;
}
export interface Distribution {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
}
interface DownloadCliParams {
    user: string;
    password: string;
    consoleUrl: string;
    project: string;
    logger: Logger;
}
interface ScanRepositoryParams {
    repositoryPath: string;
}
export declare type SetupCliReturn = {
    scanRepository: (params: ScanRepositoryParams) => Generator<any, TwistlockResults, any>;
};
export declare function setupCli({ logger, user, password, consoleUrl, project }: DownloadCliParams): Generator<any, SetupCliReturn, any>;
export {};
//# sourceMappingURL=twistlock.d.ts.map