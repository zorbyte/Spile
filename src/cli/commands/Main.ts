import { CommandMajor } from "func";

import showHelpMenu from "../showHelpMenu";

@CommandMajor()
class Main {
  public constructor() {
    showHelpMenu()
      .catch(err => console.error("Error showing help menu!\n", err));
  }
}

export default Main;
