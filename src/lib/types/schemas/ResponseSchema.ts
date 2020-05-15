import { ObjectSchema } from "fast-json-stringify";

interface PlayerSample {
  name: string;
  id: string;
}

export interface ResponseBody {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    max?: number;
    online?: number;
    sample?: PlayerSample[];
  };
  description: {
    text?: string;
  };
  favicon?: string;
}

const ResponseSchema: ObjectSchema = {
  type: "object",
  properties: {
    version: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        protocol: {
          type: "number",
        },
      },
    },
    players: {
      type: "object",
      properties: {
        max: {
          "type": "number",
          "default": 20,
        },
        online: {
          "type": "number",
          "default": 0,
        },
        sample: {
          "type": "array",
          "default": [],
          "items": {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              id: {
                type: "string",
              },
            },
          },
        },
      },
    },
    description: {
      type: "object",
      properties: {
        // TODO: Implement chat objects.
        text: {
          "type": "string",
          "default": "A Minecraft server.",
        },
      },
    },
    favicon: {
      type: "string",
    },
  },
  required: [
    "version",
    "players",
    "description",
  ],
};

export default ResponseSchema;
