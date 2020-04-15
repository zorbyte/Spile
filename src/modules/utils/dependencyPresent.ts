async function dependencyPresent(dependencyName: string): Promise<boolean> {
  try {
    await import(dependencyName);
    return true;
  } catch {
    return false;
  }
}

export default dependencyPresent;
