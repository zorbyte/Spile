// @ts-nocheck
import { AsyncResource } from "async_hooks";
import { Worker } from "worker_threads";

export interface IThreadContext {
  threadName: string;
}

class Thread<C> extends AsyncResource {
  public busy = false;

  // @ts-ignore
  private context?: C;

  public constructor(private worker: Worker) {
    super("ThreadPoolMember");
  }

  public setContext(ctx: C) {
    // c
  }
}

export default Thread;
