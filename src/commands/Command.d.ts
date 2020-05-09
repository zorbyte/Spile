import { Predicate } from "@root/lib/utils/typeUtils";

type CommandExecutor<C> = (ctx: C, msg: string, args: string[]) => Promise<string | void> | string | void;

export default interface Command<C> {
  name: string;
  inhibitors: Predicate<C>[];
  fn: CommandExecutor<C>;
}
