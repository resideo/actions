export declare const imageScanResult: {
    results: {
        packages: {
            type: string;
            name: string;
            version: string;
            path: string;
            licenses: string[];
        }[];
        applications: {
            name: string;
            version: string;
            path: string;
        }[];
        compliances: {
            id: number;
            title: string;
            severity: string;
            cause: string;
            layerTime: string;
            category: string;
        }[];
        complianceDistribution: {
            critical: number;
            high: number;
            medium: number;
            low: number;
            total: number;
        };
        complianceScanPassed: boolean;
        vulnerabilities: ({
            id: string;
            status: string;
            cvss: number;
            description: string;
            severity: string;
            packageName: string;
            packageVersion: string;
            link: string;
            riskFactors: string[];
            impactedVersions: string[];
            publishedDate: string;
            discoveredDate: string;
            graceDays: number;
            fixDate: string;
            layerTime: string;
            vector?: undefined;
        } | {
            id: string;
            status: string;
            cvss: number;
            vector: string;
            description: string;
            severity: string;
            packageName: string;
            packageVersion: string;
            link: string;
            riskFactors: string[];
            impactedVersions: string[];
            publishedDate: string;
            discoveredDate: string;
            graceDays: number;
            fixDate: string;
            layerTime: string;
        })[];
        vulnerabilityDistribution: {
            critical: number;
            high: number;
            medium: number;
            low: number;
            total: number;
        };
        vulnerabilityScanPassed: boolean;
    }[];
};
//# sourceMappingURL=fixtures.d.ts.map