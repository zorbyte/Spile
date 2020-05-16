// File not in use, see the FIXME bellow.
import { Container } from "func";

import Main from "./commands/main";
import NotFound from "./commands/NotFound";
import StartSpile from "./commands/Start";
import VersionOption from "./options/Version";

// FIXME: Write my own lib, turns out this lib adds a full second to boot time!
new Container([Main, StartSpile, VersionOption, NotFound]);
