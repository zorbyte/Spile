import { Container } from "func";

import Main from "./commands/main";
import NotFound from "./commands/NotFound";
import StartSpile from "./commands/Start";
import VersionOption from "./options/Version";

// I have no clue why whoever wrote this lib thought it'd be a good idea to use new for a side effect.
// Regardless of that, it's still was easier than other solutions.
new Container([Main, StartSpile, VersionOption, NotFound]);
