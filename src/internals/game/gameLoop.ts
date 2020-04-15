import Logger, { calculateLevel } from "../cli/Logger";
import { workerData } from "worker_threads";
import Environment from "../../modules/Environment";

const log = new Logger("loop", calculateLevel(Environment), workerData.fd);

// const subChannel = new MessageChannel();
// worker.postMessage({ hereIsYourPort: subChannel.port1 }, [subChannel.port1]);

const TICK_RATE = 20;
// let tick = 0;
let previous = hrtimeMs();
const tickLengthMs = 1000 / TICK_RATE;

const loop = () => {
  setTimeout(loop, tickLengthMs);
  const now = hrtimeMs();
  const delta = (now - previous) / 1000;
  log.debug("Loop Delta:", delta);
  // game.update(delta, tick) // game logic would go here
  previous = now;
  // tick++;
};

function hrtimeMs() {
  const time = process.hrtime();
  return time[0] * 1000 + time[1] / 1000000;
}

loop();
