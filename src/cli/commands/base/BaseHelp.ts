import { inspect } from "util";

import { CommandDataItem } from "@type/schemas/CommandData";
import { streamSupportsColour } from "@utils/utils";

class BaseHelp {
  public constructor() {
    this.showHelpMenu()
      .catch(err => console.error("Error showing help menu!\n", err));
  }

  private async showHelpMenu() {
    const helpData = (await import("../../commandData.json")).default as CommandDataItem[];

    console.log(
      // eslint-disable-next-line prefer-template
      "This help menu is a WIP, as such it is just a dump of the help data which will become a user friendly menu in future. "
        + inspect(helpData, { colors: streamSupportsColour(process.stdout), depth: Infinity }),
    );
  }
}

export default BaseHelp;
