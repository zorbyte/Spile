export type SpileErrorMessage = ((...args: any[]) => string) | string;

const _ERROR_MESSAGES = {
  /* Misc. */

  NOT_IMPLEMENTED: "This feature is currently not implemented",

  INVALID_ERROR_KEY: (key: string) =>
    `An invalid error message key was used: ${key}`,

  /* Packet Codec. */

  INVALID_PACKET: (packetName: string) =>
    `The ${packetName} is not a valid Packet Codec`,

  NO_INBOUND_PACKET_HOOK: (name: string) =>
    `The inbound packet ${name} must have a hook attached to it`,

  INVALID_FIELD_KEY: (key: string) => `An invalid field key was used: ${key}`,

  /* Packet Codec in flight */

  FIELD_DATA_INVALID: (
    key: string,
    stage: "encoding" | "decoding",
    data: any,
  ) =>
    `The field ${key} failed its predicate with data ${data} during ${stage}`,

  MALFORMED_PACKET: (field: string, data: string) =>
    `Packet malformed at field ${field}. Data: ${data}`,
};

export type ErrorMessages = typeof _ERROR_MESSAGES;
export type ErrorMessageKeys = keyof ErrorMessages;
export const ERROR_MESSAGES = _ERROR_MESSAGES as Record<
  ErrorMessageKeys,
  SpileErrorMessage
>;
