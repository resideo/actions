import * as core from "@actions/core/lib/core";

export type Core = typeof core;

export type Logger = Pick<Core, "debug" | "error" | "info" | "warning">;
