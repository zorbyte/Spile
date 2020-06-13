const {
  mkdir,
  stat,
  writeTextFile,
  readTextFile,
  errors: { NotFound },
} = Deno;

interface ImportMap {
  imports: Record<string, string>;
}

const importMap = await loadJson<ImportMap>("./etc/import_map.json");

if (!importMap) {
  console.error(
    "Import map does not exist! Please create one at './etc/import_map.json'",
  );

  Deno.exit(1);
}

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

const customDictionary = await loadJson<string[]>(
  "./custom_dictionary.json",
);

const vscodeSettings: Record<string, any> = {
  "deno.enable": true,
  "deno.unstable": true,
  "deno.tsconfig": "./tsconfig.json",
  "deno.importmap": "./import_map_dev.json",
  "prettier.configPath": "./etc/.prettierrc",
};

if (customDictionary) vscodeSettings["cSpell.words"] = customDictionary;

const tsconfigProject = {
  extends: "./etc/tsconfig.json",
  include: ["./src/**/*", "./bin/setup_dev.ts", "./etc/package.ts"],
};

await Promise.all([
  writeJson("./tsconfig.json", tsconfigProject),
  writeJson("./.vscode/settings.json", vscodeSettings),
  writeJson("./import_map_dev.json", importMapDev),
]);

async function loadJson<T>(location: string) {
  const exists = await locExists(location, false);
  if (!exists) return;

  const loadedText = await readTextFile(location);
  return JSON.parse(loadedText) as T;
}

async function writeJson(location: string, data: Record<string, any>) {
  const dirs = location.split("/");
  if (dirs.length >= 4) {
    throw new Error("Files deeper than 1 directory are not supported yet!");
  }

  if (dirs.length > 2) {
    const [, dir] = dirs;
    const dirLoc = `./${dir}`;
    const exists = await locExists(dirLoc, true);
    if (!exists) await mkdir(dirLoc);
  }

  await writeTextFile(location, JSON.stringify(data));
}

async function locExists(path: string, isDirectory: boolean) {
  try {
    const stats = await stat(path);
    return isDirectory ? stats.isDirectory : stats.isFile;
  } catch (err) {
    if (err instanceof NotFound) return false;
    throw err;
  }
}
