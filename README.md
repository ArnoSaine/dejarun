# Déjà-run

Skip running expensive commands or functions when input or output files or directories, or other dependencies haven’t changed.

## CLI

```sh
npx dejarun
  --input src \
  --output lang.json \
  -- 'formatjs extract "src/**/*.{ts,tsx,vue}" --out-file lang.json'
```

## API

```ts
import dejarun from "dejarun";

await dejarun(
  "extract-messages", // Unique name for this operation
  async () => {
    // Your expensive operation
    await extractAndWrite(["src"], {
      outFile: "lang.json",
    });
  },
  // Options
  {
    inputs: ["src"], // Files or directories
    outputs: ["lang.json"], // Files or directories
    // dependencies: [], // Other dependencies
  }
);
```

## Example output

```sh
[déjàrun] Cache hit, skip: extract-messages
```

## Options

| CLI flag                    | API Option     | Type       | Description                                       |
| --------------------------- | -------------- | ---------- | ------------------------------------------------- |
| `--input` _(multiple)_      | `inputs`       | `string[]` | Input files or directories to hash                |
| `--output` _(multiple)_     | `outputs`      | `string[]` | Output files or directories to hash               |
| `--dependency` _(multiple)_ | `dependencies` | `any[]`    | Extra data to hash (e.g. CLI args, config values) |
| `--clean`                   | `clean`        | `boolean`  | Force rerun even if nothing changed               |
| `--debug`                   | `debug`        | `boolean`  | Print internal debug info                         |

All options are optional.
