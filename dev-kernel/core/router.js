const bus = require("./bus");
const queue = require("./queue");
const workers = require("./workers");

let fileBuffer = new Set();

bus.on("file-change", (file) => {
  fileBuffer.add(file);

  queue.add(() => workers.buildPlugin());
});

bus.on("batch-5", () => {
  queue.add(async () => {
    await workers.snapshot();
    await workers.updateIndex();
  });
});

bus.on("idle", () => {
  queue.add(() => workers.restartServer());
});