/* eslint-disable @typescript-eslint/no-require-imports, promise/no-promise-in-callback, @typescript-eslint/explicit-function-return-type */

const { exec } = require("child_process");
const { readFileSync, constants, promises } = require("fs");
const { join, resolve: resolvePath, relative } = require("path");

const through2 = require("through2");

const { compile } = require("nexe");
const { src, dest, task, series, parallel } = require("gulp");
const alias = require("gulp-ts-alias");
const zip = require("gulp-zip");
const cache = require("gulp-cache");
const jsonTransform = require("gulp-json-transform");

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
    .pipe(
      through2.obj((file, _, cb) => {
        let contents = file.contents.toString();

        if (relative(join(__dirname, "src"), file.path) === "config.ts") {
          contents = contents
            .replace("export const VERSION = \"unknown-SNAPSHOT\";", `export const VERSION = "${package.version}";`);
        }

        if (file.isBuffer()) {
          file.contents = Buffer.from(contents);
        }

        cb(null, file);
      }),
    )
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
