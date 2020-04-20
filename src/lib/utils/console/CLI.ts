/**
 * Spile Minecraft Server
 * @author zorbyte <zorbytee@gmail.com>
 *
 * @license
 * Copyright (C) 2020 The Spile Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https: //www.gnu.org/licenses/>.
 */

import { isMaster } from "cluster";
import { createInterface, Interface } from "readline";

import Spile from "@lib/Spile";
import EventBus from "@utils/EventBus";

import chalk from "chalk";
import ora from "ora";

class CLI {
  /**
   * The Readline instance used for the server input prompt.
   */
  private rl?: Interface;

  /**
   * The current ora instance.
   */
  private currentOra?: ora.Ora;

  /**
   * The logger instance for the CLI.
   */
  private log = this.spile.log.child("cli");

  public constructor(private spile: Spile) {
    EventBus.on("refreshPrompt", () => {
      if (this.rl) this.rl.prompt(true);
    });
  }

  public openPrompt(): void {
    try {
      this.checkPrivilege("open");
      if (this.rl) return;
      this.rl = createInterface({
        input: process.stdin,
        output: process.stderr,
        prompt: `${chalk.blue(">")} `,
        crlfDelay: Infinity,
      });

      this.rl.prompt();

      this.rl.on("SIGINT", this.spile.stop);

      this.rl.on("line", async line => {
        this.log.debug("Line sent:", line);
        if (line === ".credits") {
          await EventBus.send(
            "rawLog",
            "Spile is created by zorbyte [https://github.com/zorbyte] " +
            "and the contributors of the code at https://github.com/SpileMC/Spile\n" +
            "Spile is licensed under the LGPL-3.0 license:\n" +
            "Spile Minecraft Server  Copyright (C) 2020  The Spile Developers\n" +
            "This program comes with ABSOLUTELY NO WARRANTY.\n" +
            "This is free software, and you are welcome to redistribute it\n" +
            "under certain conditions; see the license that was included with this software.",
          );
          return;
        } else if (line === "stop") {
          await this.spile.stop();
        }
        await EventBus.send("line", line);
      });
    } catch (err) {
      this.log.error("An error occurred while opening the prompt!\n", err);
    }
  }

  public closePrompt(): void {
    try {
      this.checkPrivilege("close");
      this.rl?.close();
      this.rl = void 0;
    } catch (err) {
      this.log.error("An error occurred while closing the prompt!\n", err);
    }
  }

  public startSpinner(text?: string): void {
    try {
      this.checkPrivilege("start");
      if (this.currentOra) this.stopSpinner();
      this.currentOra = ora({ text, spinner: "dots" }).start();
    } catch (err) {
      this.log.error("An error occurred while starting the spinner!\n", err);
    }
  }

  public update(text: string): void {
    if (this.currentOra) this.currentOra.text = text;
  }

  public stopSpinner(): void {
    try {
      this.checkPrivilege("stop");
      this.currentOra?.stop();
      this.currentOra = void 0;
    } catch (err) {
      this.log.error("An error occurred while stopping the spinner!\n", err);
    }
  }

  private checkPrivilege(action: "open" | "start" | "close" | "stop"): void {
    const instanceTypeName = action === "open" || action === "close" ? "readline" : "spinner";
    if (!isMaster) throw new Error(`A non-master process can not ${action} a ${instanceTypeName} instance!`);
  }
}

export default CLI;
