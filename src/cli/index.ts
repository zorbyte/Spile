/* eslint-disable no-console */
import { bootstrap } from "@lib/mediator";
import Stopwatch from "@utils/Stopwatch";

const stopwatch = new Stopwatch();

bootstrap(stopwatch)
  .catch(err => console.error("An error occurred pre-bootstrap", err));
