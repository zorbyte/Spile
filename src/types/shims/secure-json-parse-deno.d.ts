declare module "secure-json-parse-deno/mod.js" {
  function secureJsonParse(data: string): any;

  // @ts-ignore
  export const parse = secureJsonParse;
}
