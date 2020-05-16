import { STypeError } from "@lib/errors";
import { UUID } from "@utils/typeUtils";

import uuid from "uuid-1345";

import Field from "../Field";

// TODO(@zorbyte) - TEST ME: Is this a bruh moment? I feel like endianness might be a little mean to me here.
// wiki.vg docs say to do some fancy stuff (https://wiki.vg/Protocol#Data_types),
// but I saw this lib being used with no problems in
// https://github.com/PrismarineJS/node-minecraft-protocol/blob/master/src/datatypes/minecraft.js
// so we'll see later when it breaks!
const MCUuid: Field<UUID> = {
  encode(value) {
    const validityCheck = uuid.check(value);
    if (!validityCheck) throw new STypeError("INVALID_FIELD", "An invalid UUID was provided");

    const buff = uuid.parse(value);

    return buff;
  },

  decode(consumer) {
    const bytes = consumer.consume(16);
    const validityCheck = uuid.check(bytes);
    if (!validityCheck) throw new STypeError("INVALID_FIELD", "An invalid UUID was received");

    return uuid.stringify(bytes);
  },
};

export default MCUuid;
