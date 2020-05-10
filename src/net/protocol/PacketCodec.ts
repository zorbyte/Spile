import Packet, { kCompressedLength } from "./Packet";

export async function serialise<P extends Packet>(packet: P, compressThresh = -1) {
  const isCompressed = compressThresh < 0;
  
  let byteSize = 0;
  let uncompSize = 0;
  for (const [key, field] of Packet.getFields(packet).entries()) {
    if (key === kCompressedLength && isCompressed) continue;
    const serialised = await field.serialise(packet[key as keyof P]);
  }
}
