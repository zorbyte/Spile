export type SpileErrorMessage = ((...args: any[]) => string) | string;

const _ERROR_MESSAGES = {
  /* Misc. */

  NOT_IMPLEMENTED: "This feature is currently not implemented",

  INVALID_ERROR_KEY: (key: string) =>
    `An invalid error message key was used: ${key}`,

  /* Packet Codec. */

  INBOUND_PACKET_HOOK_ABSENT: (name: string) =>
    `The inbound packet ${name} must have a hook attached to it`,

  INVALID_FIELD_KEY: (key: string) => `An invalid field key was used: ${key}`,

  /* Packet Codec in flight */

  INVALID_FIELD_DATA: (
    fieldType: string,
    stage: "encoding" | "decoding",
    data: any,
  ) =>
    `Invalid data was supplied to ${fieldType} while ${stage}. Offending data: ${data}`,

  PACKET_FIELD_VALIDATION_FAILURE: (
    packetName: string,
    field: string,
    data: string,
  ) => `Field ${field} of ${packetName} failed validation with data ${data}`,

  // Not really an error, but since errors rise up the stack this is extremely useful.
  CONNECTION_CLOSED: "The request was cancelled.",
};

export type ErrorMessages = typeof _ERROR_MESSAGES;
export type ErrorMessageKeys = keyof ErrorMessages;
export const ERROR_MESSAGES = _ERROR_MESSAGES as Record<
  ErrorMessageKeys,
  SpileErrorMessage
>;
