import { SetupCliReturn, TwistlockResults, TwistlockRun } from "./twistlock";
export declare function run({ user, password, token, consoleUrl, project, repositoryPath, image, githubComment, scanPathScope, octokit, }: TwistlockRun): Generator<Generator<any, SetupCliReturn, any> | Generator<any, TwistlockResults, any> | Generator<any, void, unknown> | Generator<Generator<import("effection").Operation<void[]>, {
    packagesToDisplay: (import("./twistlock").Vulnerability & {
        yarnWhy?: string[] | undefined;
        versionInstances: string[];
        allInstances: string[];
    })[];
    packagesToSkip: import("./twistlock").Vulnerability[];
    skipPackageMessage: string;
}, unknown>, {
    message: string;
    graceStatus: string;
}, {
    packagesToDisplay: (import("./twistlock").Vulnerability & {
        yarnWhy?: string[] | undefined;
        versionInstances: string[];
        allInstances: string[];
    })[];
    skipPackageMessage: string;
}>, void, SetupCliReturn & {
    results: TwistlockResults;
    code: number;
} & {
    message: any;
    graceStatus: any;
}>;
//# sourceMappingURL=index.d.ts.map