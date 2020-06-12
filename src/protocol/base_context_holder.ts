import nanoid from "nanoid/mod.ts";

import { Logger } from "@utils/logger.ts";

export class BaseContextHolder {
  public id = nanoid(8);
  public log: Logger;

  public constructor(protected typeName: string, log: Logger) {
    this.log = log.child(this.typeName, this.id);
  }
}
