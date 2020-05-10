import { getPackageJson } from "@utils/utils";

import { Option } from "func";

// Something, use the func module.
@Option({
  name: "version",
  alias: "v",
})
class VersionOption {
  public constructor() {
    this.displayVersion()
      .catch(err => console.error(
        "Failed to display version! This is probably a really bad error,"
        + "but it's probably >v1.0.0... Please report this error!\n",
        err,
      ));
  }

  private async displayVersion() {
    // If this property doesn't exist while destructuring, we want this to throw since this is quite abnormal.
    const { version } = await getPackageJson();

    console.log(`Spile v${version}, written by zorbyte.`);
  }
}

export default VersionOption;
