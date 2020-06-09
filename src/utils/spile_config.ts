interface ServerConfig {
  enabled: boolean;
  host: string;
  port: number;
}

// TODO: Use these correctly, they are exported to suppress errors.
export interface ProtocolServerConfig {
  enableCompression?: boolean;
  encryption: boolean;
  online: boolean;
}

export interface SpileConfig {
  proto: ServerConfig;
}

export async function getConfig() {
  const data = await Deno.readTextFile("./config.json");
  const parsedConfig = JSON.parse(data);
  return parsedConfig;
}
