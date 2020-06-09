const {
  mkdir,
  stat,
  writeTextFile,
  readTextFile,
  errors: { NotFound },
} = Deno;

const tsconfigProject = {
  extends: "./etc/tsconfig.json",
  include: ["./src/**/*", "./bin/setup_dev.ts", "./etc/package.ts"],
};

const vscodeSettings = {
  "deno.enable": true,
  "deno.unstable": true,
  "deno.tsconfig": "./tsconfig.json",
  "deno.importmap": "./import_map_dev.json",
  "prettier.configPath": "./etc/.prettierrc",
  "cSpell.words": ["prettierrc"],
};

const importMap = JSON.parse(await readTextFile("./etc/import_map.json")) as {
  imports: Record<string, string>;
};

const importMapDev = {
  imports: Object.fromEntries(
    Object.entries(importMap.imports).map(([alias, loc]) => {
      if (alias.startsWith("@")) {
        loc = loc.slice(1);
      }

      return [alias, loc];
    }),
  ),
};

await Promise.all([
  writeJson("./tsconfig.json", tsconfigProject),
  writeJson("./.vscode/settings.json", vscodeSettings),
  writeJson("./import_map_dev.json", importMapDev),
]);

async function writeJson(location: string, data: Record<string, any>) {
  const dirs = location.split("/");
  if (dirs.length >= 4) {
    throw new Error("Files deeper than 1 directory are not supported yet!");
  }

  if (dirs.length > 2) {
    const [, dir] = dirs;
    const dirLoc = `./${dir}`;
    const exists = await dirExists(dirLoc);
    if (!exists) await mkdir(dirLoc);
  }

  await writeTextFile(location, JSON.stringify(data));
}

async function dirExists(path: string) {
  try {
    const stats = await stat(path);
    return stats.isDirectory;
  } catch (err) {
    if (err instanceof NotFound) return false;
    throw err;
  }
}
