export const each = (strings: TemplateStringsArray, values?: string[]) =>
  values?.map((value) => `${strings[0]}${value}${strings[1]}`).join("") ?? "";
