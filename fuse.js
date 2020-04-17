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

/* eslint-disable */
const { fusebox, sparky } = require("fuse-box");
const { compilerOptions: { paths } } = require("./src/tsconfig.json");
const { join } = require("path");

const alias = Object.fromEntries(
  Object.entries(paths)
    .map(([k, v], i) => [k, join("src", v[0]).replace(/\\/g, "/").replace(/\/\*/g, "")]),
);

console.log(alias)

class Context {
  getConfig = () =>
    fusebox({
      alias,
      entry: "src/index.ts",
      compilerOptions: {
        outDir: String,
        tsConfig: "./tsconfig.build.json",
      },
      cache: true
    });
}
const { task } = sparky(Context);

task("default", async ctx => {
  const fuse = ctx.getConfig();
  await fuse.runDev();
});

task("preview", async ctx => {
  const fuse = ctx.getConfig();
  await fuse.runProd({ uglify: false });
});

task("buiold", async ctx => {
  const fuse = ctx.getConfig();
  await fuse.runProd({ uglify: false });
});