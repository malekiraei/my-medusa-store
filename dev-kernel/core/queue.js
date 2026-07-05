class Queue {
  constructor() {
    this.jobs = [];
    this.running = false;
  }

  add(job) {
    this.jobs.push(job);
    this.run();
  }

  async run() {
    if (this.running) return;
    this.running = true;

    while (this.jobs.length) {
      const job = this.jobs.shift();
      await job();
    }

    this.running = false;
  }
}

module.exports = new Queue();