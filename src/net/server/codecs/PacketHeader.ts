import ByteConsumer from "../ByteConsumer";

import VarInt from "./types/VarInt";

export interface HeaderData {
  packetLength: number;
  dataLengthOrId: number;
}

class PacketHeader {
  public static async deserialiseHeader(consumer: ByteConsumer): Promise<HeaderData> {
    const headerData: HeaderData = { packetLength: 0, dataLengthOrId: 0 };


    return headerData;
  }
}

export default PacketHeader;
