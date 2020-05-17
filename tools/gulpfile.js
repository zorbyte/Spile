const { promises: { readFile } } = require("fs");

const execMod = require("./execMod");

const { src, dest, task, series, parallel } = require("gulp");
const alias = require("gulp-ts-alias");
const cache = require("gulp-cache");
const jsonTransform = require("gulp-json-transform");

task("bundle", async () => await execMod("tsc --incremental --project ../temp/tsconfig.json"));

task("map", async () => {
  const tsConf = JSON.parse(await readFile("../tsconfig.json", { encoding: "utf8" }));

  return src("../src/**/*.ts")
    .pipe(cache(
      alias({ configuration: tsConf, base: "../src" }),
      {
        name: "mappedTs",
      },
    ))
    .pipe(dest("../temp/mapped"));
});

task("tsconfig", () => src("../tsconfig.json")
  .pipe(jsonTransform((data, _file) => {
    data.include = ["mapped/**/*"];

    data.compilerOptions.outDir = "../dist";

    delete data.compilerOptions.rootDir;
    delete data.compilerOptions.baseUrl;
    delete data.compilerOptions.paths;

    return data;
  }))
  .pipe(dest("../temp")));

task("jsonFiles", () => src("../src/**/*.json")
  .pipe(dest("../temp/mapped")));

exports.dist = series(parallel("tsconfig", "map", "jsonFiles"), "bundle");
