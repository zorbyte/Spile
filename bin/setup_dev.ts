const tsconfigContent = {
  extends: "./etc/tsconfig.json",
  include: ["./src/**/*"],
};

await Deno.writeTextFile(
  "./tsconfig.json",
  JSON.stringify(tsconfigContent, void 0, 2),
);
