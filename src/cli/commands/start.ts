import { bootstrap } from "@lib/mediator";

import { Command } from "func";

@Command({ name: "start" })
class StartSpile {
  public constructor() {
    bootstrap()
      .catch(err => console.error("An error occurred pre-bootstrap!", err));
  }
}

export default StartSpile;
