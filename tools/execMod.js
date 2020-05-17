const { join } = require("path");
const { exec } = require("child_process");

const sep = process.platform === "win32" ? ";" : ":";
const env = { ...process.env };

env.PATH = `${join(__dirname, "..", "node_modules", ".bin")}${sep}${env.PATH}`;

module.exports = cmd => new Promise((resolve, reject) => {
  exec(cmd, {
    cwd: process.cwd(),
    env: env,
  }, err => {
    if (err) return reject(err);
    return resolve();
  });
});
