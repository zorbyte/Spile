import { CommandMissing } from "func";

import showHelpMenu from "../showHelpMenu";

@CommandMissing()
class NotFound {
  public constructor() {
    showHelpMenu()
      .catch(err => console.error("Error showing help menu!\n", err));
  }
}

export default NotFound;
