import { argv } from "yargs";

// This is a replica of Java's Object.hashCode() method.
export function createJavaHash(strToHash: string): number {
  let hash = 0;
  let char: number;

  for (const charStr of strToHash) {
    char = charStr.charCodeAt(0);
    hash = hash * 31 + char;

    // Convert to 32bit integer.
    hash |= 0;
  }

  return hash;
}

export async function dependencyPresent(dependencyName: string): Promise<boolean> {
  try {
    await import(dependencyName);

    return true;
  } catch {
    return false;
  }
}

export function checkEnvBool(envVar?: string): boolean {
  return !!envVar && envVar === "yes"
    || envVar === "true"
    || envVar === "1"
    || envVar === "y";
}


export const isDebug = checkEnvBool(process.env.S_DEBUG)
  || !!argv.debug
  || !!argv.develop;

export default createJavaHash;
