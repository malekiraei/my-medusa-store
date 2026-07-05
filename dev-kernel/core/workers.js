const { exec } = require("child_process");
const paths = require("../config/paths");

let buildLock = false;

function run(cmd, cwd) {
  return new Promise((res, rej) => {
    exec(cmd, { cwd }, (err, out) => {
      if (err) rej(err);
      else res(out);
    });
  });
}

module.exports = {

  async buildPlugin() {
    if (buildLock) return;
    buildLock = true;

    console.log("⚡ BUILD PLUGIN");

    await run("npm run build", paths.plugin);

    buildLock = false;
  },

  async snapshot() {
    console.log("📦 SNAPSHOT");

    await run("git add .", paths.backend);
    await run('git commit -m "auto snapshot"', paths.backend);
  },

  async updateIndex() {
    console.log("🧠 INDEX UPDATE");

    await run("node scripts/update-index.js", paths.backend);
  },

  async restartServer() {
    console.log("🔄 RESTART SERVER");

    await run("npm run dev", paths.backend);
  }
};