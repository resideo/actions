import { render } from "mustache";

interface Config {
  eventPath: string;
}

interface ConfigVariables {
  pullRequest: string;
}

const configVariables = ({ eventPath }: Config): ConfigVariables => ({
  pullRequest: require(eventPath)?.pull_request?.number
});

export const interpolate = (
  template: string,
  eventPath = process.env.GITHUB_EVENT_PATH || ""
): string => render(template, configVariables({ eventPath }));
