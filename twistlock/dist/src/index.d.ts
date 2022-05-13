import type { TwistlockRun } from "./twistlock";
export declare function run({ user, password, token, consoleUrl, project, repositoryPath, image, githubComment, scanPathScope, octokit, }: TwistlockRun): Generator<any, void, {
    results: any;
    code: any;
} & {
    message: any;
    graceStatus: any;
}>;
//# sourceMappingURL=index.d.ts.map