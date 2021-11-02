import { SetupCliReturn, TwistlockResults, TwistlockRun } from "./twistlock";
export declare function run({ user, password, consoleUrl, project, repositoryPath, octokit }: TwistlockRun): Generator<import("@effection/core/dist-esm/operation").OperationPromise<import("@effection/process").ProcessResult> | import("@effection/core/dist-esm/operation").OperationResolution<import("@effection/process").ProcessResult> | import("@effection/core/dist-esm/operation").OperationFuture<import("@effection/process").ProcessResult> | import("@effection/core/dist-esm/operation").OperationFunction<import("@effection/process").ProcessResult> | import("effection").Resource<import("@effection/process").ProcessResult> | Generator<any, any, unknown> | undefined, void, (SetupCliReturn & TwistlockResults & {
    message: any;
    pass: any;
} & false) | (SetupCliReturn & TwistlockResults & {
    message: any;
    pass: any;
} & true)>;
//# sourceMappingURL=index.d.ts.map