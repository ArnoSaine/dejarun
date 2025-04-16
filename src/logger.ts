import chalk from "chalk";

const logo = `[${chalk.hex("#ffae42")("déjà")}${chalk.hex("#00e0d3")("run")}]`;

export default function logger(
  type: "hit" | "miss" | "clean" | "debug" | "error",
  message: string,
) {
  const titleStyle = {
    hit: chalk.greenBright,
    miss: chalk.yellowBright,
    clean: chalk.redBright,
    debug: chalk,
    error: chalk.redBright,
  }[type];
  const messageStyle = {
    hit: chalk.dim,
    miss: chalk.bold,
    clean: chalk.bold,
    debug: chalk.dim,
    error: chalk.redBright,
  }[type];
  const runOrSkip = type === "hit" ? "skip" : "run";

  const title = type === "debug" ? "Debug" : `Cache ${type}, ${runOrSkip}`;

  if (type === "error") {
    console.error(`${logo} ${messageStyle(message)}`);
  } else {
    console.log(`${logo} ${titleStyle(`${title}:`)} ${messageStyle(message)}`);
  }
}
