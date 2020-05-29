interface ServerConfig {
  enabled: boolean;
  host: string;
  port: number;
}

interface ProtocolServerConfig {
  enableCompression?: boolean;
  encryption: boolean;
  online: boolean;
}

interface SpileConfig {
  proto: ServerConfig;
}

export async function getConfig() {
  const data = await Deno.readTextFile("./config.json")
  const parsedConfig = JSON.parse(data);
}
