import { isMaster } from "cluster";
import { createInterface, Interface } from "readline";

import Spile from "@internals/Spile";
import Environment from "@utils/Environment";
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

      this.rl.on("SIGINT", () => this.spile.stop());

      this.rl.on("line", async line => {
        this.log.debug("Line sent:", line);
        if (line === "stop") {
          this.rl.pause();
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.spile.stop();
        } else if (Environment.normal) {
          this.rl.prompt();
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
