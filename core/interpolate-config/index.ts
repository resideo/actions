import { render } from "mustache";

export const interpolate = (
  template: string,
  eventPath = process.env.GITHUB_EVENT_PATH || ""
): string => render(template, { event: require(eventPath) });
