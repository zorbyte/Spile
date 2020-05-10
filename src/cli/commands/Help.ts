import { Command } from "func";

import BaseHelp from "./base/BaseHelp";

@Command({ name: "help", alias: "h" })
class Help extends BaseHelp { }

export default Help;
