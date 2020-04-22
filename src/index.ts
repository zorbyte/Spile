/* eslint-disable no-console */

import Spile from "@internals/Spile";

new Spile()
  .start()
  .catch(err => console.error("An error occurred pre-bootstrap! Have you run \"npm install\"?\n", err));
