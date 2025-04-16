import chalk from "chalk";
import { defaults, hashElement } from "folder-hash";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import logger from "./logger.ts";
import { each } from "./utils/tagged-templates.ts";

function hashValue(value: any) {
  return createHash(defaults.algo ?? "sha1")
    .update(JSON.stringify(value))
    .digest(defaults.encoding ?? "base64");
}

const hashFileOrDirList = (paths: string[] = []) =>
  Promise.all(
    paths.map(async (path) => {
      try {
        return (await hashElement(path)).hash;
      } catch {
        return null;
      }
    }),
  );

/**
 * Caches the result of a callback function based on the hashes of input and output files or directories and additional dependencies.
 * If the hashes of the inputs, outputs and other dependencies have not changed since the last run, the callback will not be executed.
 *
 * @param name - A unique name for the cache entry. Example: "build".
 * @param callback - The function to execute if the cache is missed.
 * @param options - An object containing the following optional properties:
 *   - inputs: An array of file or directory paths to hash for cache validation.
 *   - outputs: An array of file or directory paths to hash for cache validation.
 *   - dependencies: An array of arbitrary values to hash for cache validation.
 *   - clean: A boolean indicating whether to clean the cache (default: false).
 *   - debug: A boolean indicating whether to log debug information (default: false).
 */
export default async function dejarun(
  name: string,
  callback: () => Promise<any>,
  options?: {
    inputs?: string[];
    outputs?: string[];
    dependencies?: string[];
    clean?: boolean;
    debug?: boolean;
  },
) {
  const cacheName = `${process.env.npm_package_name}/${name}`;
  const CACHE_FILE = new URL("../.cache.json", import.meta.url).pathname;

  let cache: Record<string, string> = {};
  try {
    cache = JSON.parse(await fs.readFile(CACHE_FILE, "utf8"));
  } catch {}

  const inputs = await hashFileOrDirList(options?.inputs);

  const totalHash = hashValue({
    inputs,
    outputs: await hashFileOrDirList(options?.outputs),
    dependencies: options?.dependencies,
  });

  if (options?.debug) {
    logger(
      "debug",
      `
  name:       ${chalk.bold(name)}
  cache name: ${chalk.bold(cacheName)}
  cache file: ${chalk.bold(CACHE_FILE)}
  inputs:${chalk.bold(each`
    ${options?.inputs}`)}
  outputs:${chalk.bold(each`
    ${options?.outputs}`)}
  dependencies:${chalk.bold(each`
    ${options?.dependencies}`)}
  total hash: ${totalHash}`,
    );
  }

  if (options?.clean) {
    logger("clean", name);
    delete cache[cacheName];
  } else {
    if (totalHash === cache[cacheName]) {
      logger("hit", name);
      return;
    }
    logger("miss", name);
  }

  await callback();

  cache[cacheName] = hashValue({
    inputs,
    outputs: await hashFileOrDirList(options?.outputs),
    dependencies: options?.dependencies,
  });

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}
