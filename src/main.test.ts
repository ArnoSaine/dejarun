import assert from "node:assert";
import fs, { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import dejarun from "./main.ts";

const TEST_ROOT = path.resolve(".tmp/test-cache-operation");
const INPUT_FILE = path.join(TEST_ROOT, "input.txt");
const OUTPUT_FILE = path.join(TEST_ROOT, "output.txt");
const options = {
  inputs: [INPUT_FILE],
  outputs: [OUTPUT_FILE],
};

let ran: boolean;

beforeEach(async () => {
  ran = false;
  await rm(TEST_ROOT, { recursive: true, force: true });
  await mkdir(TEST_ROOT, { recursive: true });
});

afterEach(async () => {
  await rm(TEST_ROOT, { recursive: true, force: true });
});

test("runs callback on first run (cache miss)", async () => {
  await writeFile(INPUT_FILE, "hello");

  await dejarun(
    "test-op",
    async () => {
      ran = true;
      await writeFile(OUTPUT_FILE, "world");
    },
    options,
  );

  assert.equal(ran, true, "callback should run on first call");
});

test("skips callback on second run with no changes (cache hit)", async () => {
  await writeFile(INPUT_FILE, "hello");

  // First run
  await dejarun(
    "test-op",
    async () => {
      ran = true;
      await writeFile(OUTPUT_FILE, "world");
    },
    options,
  );

  ran = false; // reset for second run

  // Second run (no changes)
  await dejarun(
    "test-op",
    async () => {
      ran = true;
    },
    options,
  );

  assert.equal(ran, false, "callback should NOT run if nothing changed");
});

test("reruns callback if input changes", async () => {
  await writeFile(INPUT_FILE, "original");

  await dejarun(
    "test-op",
    async () => {
      ran = true;
      await writeFile(OUTPUT_FILE, "v1");
    },
    options,
  );

  await writeFile(INPUT_FILE, "modified");
  ran = false;

  await dejarun(
    "test-op",
    async () => {
      ran = true;
      await writeFile(OUTPUT_FILE, "v2");
    },
    options,
  );

  assert.equal(ran, true, "callback should run after input file change");
});

test("reruns callback if output is deleted", async () => {
  await writeFile(INPUT_FILE, "hello");

  await dejarun(
    "test-op",
    async () => {
      ran = true;
      await writeFile(OUTPUT_FILE, "world");
    },
    options,
  );

  await fs.unlink(OUTPUT_FILE);
  ran = false;

  await dejarun(
    "test-op",
    async () => {
      ran = true;
      await writeFile(OUTPUT_FILE, "new world");
    },
    options,
  );

  assert.equal(ran, true, "callback should run if output is missing");
});

test("reruns callback if output is modified", async () => {
  await writeFile(INPUT_FILE, "original");

  await dejarun(
    "test-op",
    async () => {
      ran = true;
      await writeFile(OUTPUT_FILE, "v1");
    },
    options,
  );

  await writeFile(OUTPUT_FILE, "modified");
  ran = false;

  await dejarun(
    "test-op",
    async () => {
      ran = true;
      await writeFile(OUTPUT_FILE, "v2");
    },
    options,
  );

  assert.equal(ran, true, "callback should run after output file change");
});
