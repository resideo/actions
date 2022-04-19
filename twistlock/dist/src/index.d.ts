import { SetupCliReturn, TwistlockResults, TwistlockRun } from "./twistlock";
export declare function run({ user, password, token, consoleUrl, project, repositoryPath, image, githubComment, octokit, }: TwistlockRun): Generator<Generator<any, SetupCliReturn, any> | Generator<any, TwistlockResults, any> | Generator<Generator<import("effection").Operation<unknown[]>, {
    packagesToDisplay: (import("./twistlock").Vulnerability & {
        yarnWhy?: string[] | undefined;
        instances: {
            type: string;
            name: string;
            version: string;
            path: string;
        }[];
    })[];
    packagesToSkip: import("./twistlock").Vulnerability[];
    skipPackageMessage: string;
}, unknown>, {
    message: string;
    workflowStatus: string;
}, {
    packagesToDisplay: (import("./twistlock").Vulnerability & {
        yarnWhy?: string[] | undefined;
        instances: {
            type: string;
            name: string;
            version: string;
            path: string;
        }[];
    })[];
    skipPackageMessage: string;
}> | Generator<any, void, unknown>, void, SetupCliReturn & {
    results: TwistlockResults;
    code: number;
} & {
    message: any;
    workflowStatus: any;
}>;
//# sourceMappingURL=index.d.ts.map