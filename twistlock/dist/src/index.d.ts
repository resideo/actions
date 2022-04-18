import { SetupCliReturn, TwistlockResults, TwistlockRun } from "./twistlock";
export declare function run({ user, password, token, consoleUrl, project, repositoryPath, image, githubComment, octokit, }: TwistlockRun): Generator<Generator<any, SetupCliReturn, any> | Generator<any, TwistlockResults, any> | Generator<Generator<import("effection").Operation<unknown[]>, (import("./twistlock").Vulnerability & {
    yarnWhy?: string[] | undefined;
})[], unknown>, {
    message: string;
    workflowStatus: string;
}, (import("./twistlock").Vulnerability & {
    yarnWhy?: string[] | undefined;
})[]> | Generator<any, void, unknown>, void, SetupCliReturn & {
    results: TwistlockResults;
    code: number;
} & {
    message: any;
    workflowStatus: any;
}>;
//# sourceMappingURL=index.d.ts.map