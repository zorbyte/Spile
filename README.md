# Spile Server

![Discord Shield](https://discordapp.com/api/guilds/702504330456072303/widget.png?style=shield)

Spile is a Minecraft Java edition game server. The goal of it is to slowly errode my brain away.

Check out issue #1 for more info (yes I'm that lazy I'm not going to link to it, please have fun finding it, as at the time of writing it is the only issue.)

## File Organisation

Source code goes in an src folder.
```
src - Here, the library, certain modules that deserve their own namespace like net and structures like commands reside here.
├───commands
│   ├───minecraft - nms commands
│   └───spile - spile related commands
├───lib - The library, you could say that the stuff that "does things" reside here.
│   ├───errors - Custom errors used throughout spile. 
│   ├───types - Types, including typescript shims, common typings, validators and schemas for data.
│   │   ├───common - Common typings.
│   │   ├───schemas - Schemas for JSON.
│   │   ├───shims - Shims for typescript types.
│   │   └───validators - Validators for datastructures using ow.
│   └───utils
└───net
    ├───query
    ├───rcon
    ├───server
    │   ├───codecs
    │   │   └───types
    │   ├───packets
    │   │   ├───shake
    │   │   │   └───inbound
    │   │   └───status
    │   │       ├───inbound
    │   │       └───outbound
    │   └───schemas
    └───typings
```

## License

This project is licensed under the MIT license. Please consider its existence... See [LICENSE](./LICENSE) for more information.
