import { ArraySchema } from "fast-json-stringify";

export interface BaseDataItem {
  name: string;
  description: string;
}

export interface CommandDataItem extends BaseDataItem {
  flags: BaseDataItem[];
}

// Consider using these schemas later.

const baseProps = {
  name: {
    type: "string",
  },
  description: {
    type: "string",
  },
};

const basePropRequired = [
  "name",
  "description",
];

const CommandDataSchema: ArraySchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      ...baseProps,
      flags: {
        "type": "array",
        "default": [],
        "items": {
          type: "object",
          properties: baseProps,
          required: basePropRequired,
        },
      },
    },
    required: basePropRequired,
  },
};

export default CommandDataSchema;
