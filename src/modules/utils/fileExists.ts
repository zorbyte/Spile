import { promises, constants, PathLike } from "fs";

async function fileExists(fileName: PathLike) {
  try {
    await promises.access(fileName, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export default fileExists;
