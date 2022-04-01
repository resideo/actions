import { SetupCliReturn, TwistlockResults, TwistlockRun } from "./twistlock";
export declare function run({ user, password, token, consoleUrl, project, repositoryPath, image, octokit, }: TwistlockRun): Generator<Generator<any, SetupCliReturn, any> | Generator<any, TwistlockResults, any> | Generator<Generator<import("effection").Operation<unknown[]>, (import("./twistlock").Vulnerability & {
    yarnWhy?: string[] | undefined;
})[], unknown>, {
    message: string;
    workflowStatus: string;
}, (import("./twistlock").Vulnerability & {
    yarnWhy?: string[] | undefined;
})[]> | Generator<any, void, unknown>, void, SetupCliReturn & TwistlockResults & {
    message: any;
    workflowStatus: any;
}>;
//# sourceMappingURL=index.d.ts.map