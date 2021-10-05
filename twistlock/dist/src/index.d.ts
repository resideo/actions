import { SetupCliReturn, TwistlockResults, TwistlockRun } from "./twistlock";
export declare function run({ user, password, consoleUrl, project, repositoryPath, octokit }: TwistlockRun): Generator<Generator<any, SetupCliReturn, any> | Generator<any, TwistlockResults, any> | Generator<Generator<import("effection").Operation<{
    [x: string]: unknown;
}>, (import("./twistlock").Vulnerability & {
    yarnWhy?: string[] | undefined;
})[], unknown>, string, (import("./twistlock").Vulnerability & {
    yarnWhy?: string[] | undefined;
})[]> | Generator<any, void, unknown>, void, SetupCliReturn & TwistlockResults>;
//# sourceMappingURL=index.d.ts.map