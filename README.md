# Spile Server

![Discord Shield](https://discordapp.com/api/guilds/702504330456072303/widget.png?style=shield)

Spile is a Minecraft Java edition game server. The goal of it is to slowly errode my brain away.

Check out issue #1 for more info (yes I'm that lazy I'm not going to link to it, please have fun finding it, as at the time of writing it is the only issue.)

## File Organisation

```
src - Here, the library, certain modules that deserve their own namespace like net and cli reside here.
├───cli - CLI used to run Spile.
│   ├───commands - The commands used to run Spile.
│   │   └───base - Base command classes for the CLI.
│   └───options
├───lib - The library, you could say that the stuff that "does things" reside here.
│   ├───errors - Custom errors used throughout Spile.
│   ├───types - Types, including typescript shims, common typings, validators and schemas for data.
│   │   ├───common - Common typings.
│   │   ├───schemas - Schemas for JSON validation.
│   │   ├───shims - Shims for typescript types.
│   │   └───validators - Validators for datastructures using ow.
│   └───utils
├───marshal - The command framework created for Spile.
│   └───commands - The commands for the game itself.
│       ├───minecraft - NMS commands.
│       └───spile - Spile's commands.
└───net - Network related.
    ├───protocol - Networking related to the Minecraft protocol.
    │   ├───fields - Data fields on packets.
    │   └───packets - Data structures to easily interact with packets.
    ├───query - Query server.
    └───rcon - Remote control server.
```

## License

This project is licensed under the MIT license. Please consider its existence... See [LICENSE](./LICENSE) for more information.
