import { inspect } from "util";

import { CommandDataItem } from "@_types/schemas/CommandData";
import { streamSupportsColour } from "@utils/utils";

async function showHelpMenu() {
  const helpData = (await import("./commandData.json")).default as CommandDataItem[];

  // eslint-disable-next-line no-console
  console.log(
    // eslint-disable-next-line prefer-template
    "Hello, this doesn't look like a help menu, rather a feeble dump of data. "
    + "Well I'm glad you noticed! This isn't finished yet.\n"
    + inspect(helpData, { colors: streamSupportsColour(process.stdout), depth: Infinity }),
  );
}

export default showHelpMenu;
