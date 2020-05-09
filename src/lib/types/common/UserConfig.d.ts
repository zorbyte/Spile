interface OptionalServer {
  port: number;
  enabled: boolean;
}

export interface UserConfig {
  port: number;
  rcon: OptionalServer;
  query: OptionalServer;

  // Plugins should be optional, as this should be a viable alternative to a notchian server as well!
  usePlugins: boolean;

  // DANGER: This option disables commands of all other namespaces except minecraft:*!!!
  // It is best you do not touch this.
  __notchainCommands: boolean;
}
