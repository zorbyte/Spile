declare module "secure-json-parse" {
  function secureJsonParse(data: string): any;

  export = { parse: secureJsonParse };
}
