import { Context } from "@actions/github/lib/context";
import { Octokit } from "@octokit/action";
import { Distribution, Vulnerability, TwistlockResults } from "./twistlock";
import { Core } from "./types";
export declare function Heading(distribution: Distribution): string;
export declare function Vulnerabilities(list: Vulnerability[]): string;
interface SummaryParams {
    github: Octokit;
    context: Context;
    core: Core;
    results: TwistlockResults;
}
export declare function writeSummary({ github, context, results }: SummaryParams): Promise<void>;
export {};
//# sourceMappingURL=postComment.d.ts.map