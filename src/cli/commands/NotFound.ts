import { CommandMissing } from "func";

import BaseHelp from "./base/BaseHelp";

@CommandMissing()
class NotFound extends BaseHelp { }

export default NotFound;
