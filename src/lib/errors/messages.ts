export type SpileErrorMessage = ((...args: any[]) => string) | string;

// Can't annotate this because I want types to work everywhere else... Oh well.
const _ERROR_MESSAGES = {
  FEATURE_TODO: "This feature is currently not implemented. It will be implemented eventually...",
  INVALID_COMMAND_BUILDER: (cmdFileName: string) => `The file ${cmdFileName} is not a valid Command Builder.`,

  INVALID_PACKET_SCHEMA: (cmdFileName: string) => `The file ${cmdFileName} is not a valid Packet Schema.`,

  INBOUND_PACKET_HOOK_ABSENT: (name: string) => `The inbound packet ${name} must have a hook attached to it!`,
};

export type ErrorMessageKeys = keyof typeof _ERROR_MESSAGES;
export const ERROR_MESSAGES = _ERROR_MESSAGES as Record<ErrorMessageKeys, SpileErrorMessage>;
