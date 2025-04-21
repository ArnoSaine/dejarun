import chalk from "chalk";

export default function logger(
  type: "hit" | "miss" | "clean" | "debug" | "error",
  message: string,
  logo:
    | string
    | false = '[${chalk.hex("#ffae42")("déjà")}${chalk.hex("#00e0d3")("run")}]',
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
  const formattedLogo =
    logo === false ? "" : new Function("chalk", `return \`${logo} \``)(chalk);

  if (type === "error") {
    console.error(`${formattedLogo}${messageStyle(message)}`);
  } else {
    console.log(
      `${formattedLogo}${titleStyle(`${title}:`)} ${messageStyle(message)}`,
    );
  }
}
