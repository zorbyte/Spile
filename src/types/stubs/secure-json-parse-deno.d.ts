declare module "https://raw.githubusercontent.com/zorbyte/secure-json-parse-deno/master/mod.js" {
  function secureJsonParse(data: string): any;

  // @ts-ignore
  export const parse = secureJsonParse;
}
