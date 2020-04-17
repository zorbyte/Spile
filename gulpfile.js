/**
 * Spile Minecraft Server
 * @author zorbyte <zorbytee@gmail.com>
 *
 * @license
 * Copyright (C) 2020 The Spile Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https: //www.gnu.org/licenses/>.
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const { execSync } = require("child_process");
const { src, dest, task, series, parallel } = require("gulp");
const alias = require("gulp-ts-alias");
const jsonTransform = require("gulp-json-transform");
const { readFileSync } = require("fs");
const clean = require("gulp-clean");
const terser = require("gulp-terser");

task("bundle", () => {
  execSync("npm run tsBuild");
  return src("./temp/temp-build/**/*.js")
    .pipe(terser())
    .pipe(dest("./dist-prod"));
});

task("clean", () => src("temp", { read: false }).pipe(clean()));

task("map", () => {
  const tsConf = JSON.parse(readFileSync("./tsconfig.json"));
  tsConf.compilerOptions.paths = {
    "@structs/*": ["lib/structures/"],
    "@utils/*": ["lib/utils/"],
    "@lib/*": ["lib/"],
    "@root/*": ["/"],
  };

  return src("./src/**/*.ts")
    .pipe(alias({ configuration: tsConf, base: "./src" }))
    .pipe(dest("./temp/mapped"));
});

task("tsconfig", () => src("./tsconfig.json")
  .pipe(jsonTransform((data, _file) => {
    data.include = ["mapped/**/*"];

    data.compilerOptions.outDir = "./temp-build";

    delete data.compilerOptions.rootDir;
    delete data.compilerOptions.baseUrl;
    delete data.compilerOptions.paths;

    return data;
  }))
  .pipe(dest("./temp")));

exports.build = series(parallel("tsconfig", "map"), "bundle", "clean");
