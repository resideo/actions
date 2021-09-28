import { SetupCliReturn, TwistlockResults } from "./twistlock";
import { Logger } from "./types";
interface TwistlockRun {
    user: string;
    password: string;
    consoleUrl: string;
    project: string;
    logger: Logger;
    repositoryPath: string;
}
export declare function run({ logger, user, password, consoleUrl, project, repositoryPath }: TwistlockRun): Generator<Generator<any, SetupCliReturn, any> | Generator<any, TwistlockResults, any>, void, SetupCliReturn & TwistlockResults>;
export {};
//# sourceMappingURL=index.d.ts.map