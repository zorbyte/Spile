const { exec } = require("child_process");
const { readFileSync } = require("fs");
const { resolve: resolvePath } = require("path");

const { src, dest, task, series, parallel } = require("gulp");
const alias = require("gulp-ts-alias");
const cache = require("gulp-cache");
const jsonTransform = require("gulp-json-transform");

const sep = process.platform === "win32" ? ";" : ":";
const env = { ...process.env };

env.PATH = `${resolvePath("./node_modules/.bin")}${sep}${env.PATH}`;

task("bundle", async () => {
  await new Promise((resolve, reject) => {
    exec(`tsc --incremental --project temp/tsconfig.json`, {
      cwd: process.cwd(),
      env: env,
    }, err => {
      if (err) return reject(err);
      return resolve();
    });
  });
});

task("map", () => {
  const tsConf = JSON.parse(readFileSync("./tsconfig.json"));

  return src("./src/**/*.ts")
    .pipe(cache(
      alias({ configuration: tsConf, base: "./src" }),
      {
        name: "mappedTs",
      },
    ))
    .pipe(dest("./temp/mapped"));
});

task("tsconfig", () => src("./tsconfig.json")
  .pipe(jsonTransform((data, _file) => {
    data.include = ["mapped/**/*"];

    data.compilerOptions.outDir = "../dist";

    delete data.compilerOptions.rootDir;
    delete data.compilerOptions.baseUrl;
    delete data.compilerOptions.paths;

    return data;
  }))
  .pipe(dest("./temp")));

task("jsonFiles", () => src("./src/**/*.json")
  .pipe(dest("./temp/mapped")));

exports.dist = series(parallel("tsconfig", "map", "jsonFiles"), "bundle");
