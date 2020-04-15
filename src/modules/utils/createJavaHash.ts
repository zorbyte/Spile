// This is a polyfill of Java's Object.hashCode() method.
function createJavaHash(strToHash: string): number {
  let hash = 0;
  let char: number;
  for (const charStr of strToHash) {
    char = charStr.charCodeAt(0);
    hash = hash * 31 + char;

    // Convert to 32bit integer
    hash |= 0;
  }

  return hash;
}

export default createJavaHash;
