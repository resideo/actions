import { SetupCliReturn, TwistlockResults, TwistlockRun } from "./twistlock";
export declare function run({ user, password, consoleUrl, project, repositoryPath, octokit }: TwistlockRun): Generator<Generator<any, any, unknown>, void, (SetupCliReturn & TwistlockResults & {
    message: any;
    pass: any;
} & false) | (SetupCliReturn & TwistlockResults & {
    message: any;
    pass: any;
} & true)>;
//# sourceMappingURL=index.d.ts.map