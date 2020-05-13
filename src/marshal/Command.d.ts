import { Asyncable, Predicate } from "@utils/typeUtils";

type CommandExecutor<C> = (ctx: C, msg: string, args: string[]) => Asyncable<string | void>;

export default interface Command<C> {
  name: string;
  namespace: string;
  inhibitors: Predicate<[C]>[];
  fn: CommandExecutor<C>;
}
