export default interface RoughPackageJson {
  name: string;
  version: string;
  description: string;
  main: string;
  scripts: Record<string, any>;
  repository: Record<string, any>;
  keywords: string[];
  author: string;
  license: string;
  bugs: Record<string, any>;
  homepage: string;
  devDependencies: Record<string, any>;
  dependencies: Record<string, any>;
  engines: Record<string, any>;
  cpu: string[];
  os: string[];
  _moduleAliases: Record<string, any>;
}
