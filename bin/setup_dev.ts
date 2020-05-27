const {
  mkdir,
  stat,
  writeTextFile,
  errors: { NotFound },
} = Deno;

const tsconfigProject = {
  extends: "./etc/tsconfig.json",
  include: ["./src/**/*", "./bin/setup_dev.ts", "./etc/version.ts"],
};

const vscodeSettings = {
  "deno.enable": true,
  "deno.unstable": true,
  "deno.tsconfig": "./tsconfig.json",
  "prettier.configPath": "./etc/.prettierrc",
  "cSpell.words": ["prettierrc"],
};

await Promise.all([
  writeJson("./tsconfig.json", tsconfigProject),
  writeJson("./.vscode/settings.json", vscodeSettings),
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
