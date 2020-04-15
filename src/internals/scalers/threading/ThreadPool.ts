// @ts-nocheck
import { EventEmitter } from "events";
import { cpus } from "os";

class ThreadPool extends EventEmitter {
  public constructor(private threadAmnt?: number) {
    super();
    const amntCpus = cpus().length;
    if (!this.threadAmnt) this.threadAmnt = amntCpus < 4 ? 4 : amntCpus;
    // for (let i = 0; i < this.threadAmnt; i++) this.addNewWorker();
  }
}
