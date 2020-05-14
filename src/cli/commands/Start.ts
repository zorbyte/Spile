import { bootstrap } from "@lib/mediator";
import Stopwatch from "@utils/Stopwatch";

import { Command } from "func";

@Command({ name: "start", alias: "s" })
class StartSpile {
  public constructor() {
    const stopwatch = new Stopwatch();

    bootstrap(stopwatch)
      .catch(err => console.error("An error occurred pre-bootstrap!", err));
  }
}

export default StartSpile;
