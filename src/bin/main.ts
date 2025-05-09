#!/usr/bin/env node

import { execa } from "execa";
import { parseArgs } from "node:util";
import logger from "../logger.ts";
import dejarun from "../main.ts";

const {
  values: {
    input: inputs,
    output: outputs,
    dependency: dependencies,
    clean,
    debug,
    logo,
    "no-logo": noLogo,
  },
  positionals,
} = parseArgs({
  options: {
    input: { type: "string", multiple: true },
    output: { type: "string", multiple: true },
    dependency: { type: "string", multiple: true },
    clean: { type: "boolean" },
    debug: { type: "boolean" },
    logo: { type: "string" },
    "no-logo": { type: "boolean" },
  },
  allowPositionals: true,
});

const command = positionals.join(" ");

const logoOption = noLogo ? false : logo;

if (!command) {
  logger("error", "No command provided to execute.", logoOption);
  process.exit(1);
}

await dejarun(
  command,
  () => execa(command, { shell: true, stdio: "inherit" }),
  {
    inputs,
    outputs,
    dependencies,
    clean,
    debug,
    logo: logoOption,
  },
);
