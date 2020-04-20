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

/* eslint-disable @typescript-eslint/no-require-imports, promise/no-promise-in-callback, @typescript-eslint/explicit-function-return-type */

const { exec } = require("child_process");
const { src, dest, task, series, parallel } = require("gulp");
const alias = require("gulp-ts-alias");
const jsonTransform = require("gulp-json-transform");
const change = require("gulp-change");
const { readFileSync, constants, promises } = require("fs");
const { join, resolve: resolvePath, relative } = require("path");
const { compile } = require("nexe");
const zip = require("gulp-zip");
const cache = require("gulp-cache");
const { hashElement } = require("folder-hash");
const package = require("./package.json");

const sep = process.platform === "win32" ? ";" : ":";
const env = { ...process.env };

env.PATH = `${resolvePath("./node_modules/.bin")}${sep}${env.PATH}`;

const curSys = process.argv[3] === "--current";
const osData = curSys ? [process.platform] : package.os;
const os = osData.map(osName => osName === "win32" ? "windows" : osName === "darwin" ? "mac" : osName);
const archs = curSys && package.cpu.includes(process.arch) ? [process.arch] : package.cpu;
// This supports more build targets for now.
const nodeVersion = "12.4.0" || process.version;
const lic = ["COPYING", "COPYING.LESSER"];
const outDir = join(__dirname, "dist");
const wrkBinsDir = join(__dirname, "temp", "bin");

const targets = [];
for (const target of os) {
  for (const arch of archs) {
    // No support for x86 mac.
    if (target === "mac" && arch === "x86") continue;
    targets.push(`${target}-${arch}-${nodeVersion}`);
  }
}

task("bundle", async () => {
  if (!await exists(outDir)) await promises.mkdir(outDir);
  const working = "./temp/working-dir";
  const bInfoDir = join(__dirname, "temp", "working-dir");
  const dirComp = join(bInfoDir, "spile");
  if (!await exists(dirComp)) await promises.mkdir(dirComp, { recursive: true });
  const { hash: prevBuildH } = await hashElement("spile", bInfoDir);
  await new Promise((resolve, reject) => {
    exec(`tsc --incremental --project temp/tsconfig.json`, {
      cwd: process.cwd(),
      env: env,
    }, async err => {
      if (err) return reject(err);
      const { hash: curHash } = await hashElement("spile", bInfoDir);
      const wrDirEx = await exists(wrkBinsDir);
      if (!wrDirEx) await promises.mkdir(wrkBinsDir, { recursive: true });
      const same = wrDirEx && curHash === prevBuildH;
      if (same) return resolve();
      const proms = [];
      src("./package.json")
        .pipe(dest(working))
        .on("end", () => {
          for (const t of targets) {
            const split = t.split("-");
            const archiveName = `spile-${split[0]}-${split[1]}`;
            const output = `${archiveName}${t.indexOf("windows") !== -1 ? ".exe" : ""}`;
            proms.push((async () => {
              await compile({
                input: "./spile/index.js",
                name: "spile",
                resources: ["package.json"],
                loglevel: "silent",
                output: join(wrkBinsDir, output),
                target: t,
                cwd: join(__dirname, "temp", "working-dir"),
              }, async cErr => {
                if (cErr) reject(cErr);
                await new Promise(rs => {
                  const dirRel = `./temp/bin/${output}`;
                  src(dirRel)
                    .pipe(src(lic))
                    .pipe(zip(`${archiveName}.zip`))
                    .pipe(dest("./dist"))
                    .on("end", () => {
                      rs();
                    });
                });
              });
            })());

            Promise.all(proms)
              .then(resolve)
              .catch(reject);
          }
        });
    });
  });
});

task("map", () => {
  const tsConf = JSON.parse(readFileSync("./tsconfig.json"));
  tsConf.compilerOptions.paths = {
    "@structs/*": ["lib/structures/"],
    "@utils/*": ["lib/utils/"],
    "@lib/*": ["lib/"],
    "@root/*": ["/"],
  };

  return src("./src/**/*.ts")
    .pipe(change(function mapOver(content, done) {
      if (this.fname.slice(1) === "config.ts") {
        content = content
          .replace("export const VERSION = \"unknown-SNAPSHOT\";", `export const VERSION = "${package.version}";`);
      }
      done(null, content);
    }))
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

    data.compilerOptions.outDir = "./working-dir/spile";

    delete data.compilerOptions.rootDir;
    delete data.compilerOptions.baseUrl;
    delete data.compilerOptions.paths;

    return data;
  }))
  .pipe(dest("./temp")));

async function exists(fileName) {
  try {
    await promises.access(fileName, constants.F_OK);
    return true;
  } catch (_) {
    return false;
  }
}

exports.build = series(parallel("tsconfig", "map"), "bundle");
