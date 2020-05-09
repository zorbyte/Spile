import { bootstrap } from "@lib/mediator";

import { CommandModule } from "yargs";

const startCommand: CommandModule = {
  command: "start",
  aliases: ["s"],
  builder: yargs => yargs
    .option("something", {
      desc: "Does something",
    }),
  async handler() {
    await bootstrap();
  },
};

module.exports = startCommand;
