import { Predicate } from "@utils/typeUtils";

import Command from "./Command";
import { CommandContext } from "./CommandContext";

class CommandBuilder<C extends CommandContext> {
  private commandData: Command<C>;

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
