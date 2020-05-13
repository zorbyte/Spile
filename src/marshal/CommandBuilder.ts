import { Predicate } from "@utils/typeUtils";

import Command from "./Command";
import { CommandContext } from "./CommandContext";

class CommandBuilder<C extends CommandContext> {
  private commandData: Command<C>;

  // The word condition looks kinda ugly so I used checkIf,
  // if anyone has better ideas, please enlighten me!
  public checkIf(predicate: Predicate<[C]>): CommandBuilder<C> {
    this.commandData.inhibitors.push(predicate);

    return this;
  }

  public compile(namespace: string): Command<C> {
    this.commandData.namespace = namespace;

    return this.commandData;
  }
}

export default CommandBuilder;
