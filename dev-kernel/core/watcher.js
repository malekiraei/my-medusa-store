const chokidar = require("chokidar");
const bus = require("./bus");
const paths = require("../config/paths");

let buffer = new Set();
let timer;

function idle() {
  bus.emit("idle");
  buffer.clear();
}

function watchPath(path, type) {
  const watcher = chokidar.watch(path, {
    ignored: /node_modules/,
    persistent: true
  });

  watcher.on("all", (_, file) => {

    buffer.add(file);

    if (type === "plugin") {
      bus.emit("file-change", file);
    }

    if (buffer.size >= 5) {
      bus.emit("batch-5");
      buffer.clear();
    }

    clearTimeout(timer);
    timer = setTimeout(idle, 1200);
  });
}

watchPath(paths.plugin, "plugin");
watchPath(paths.backend, "backend");

console.log("🔥 ULTRA MAX++ WATCHER ACTIVE");