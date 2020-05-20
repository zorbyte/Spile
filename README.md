# Spile Server

![Discord Shield](https://discordapp.com/api/guilds/702504330456072303/widget.png?style=shield)

Spile is a Minecraft Java edition game server. The goal of it is to slowly errode my brain away. It makes use of Deno.

Check out issue #1 for more info (yes I'm that lazy I'm not going to link to it, please have fun finding it, as at the time of writing it is the only issue.)

## Note on debug logging and windows:

If you want to use debug logs on windows with full support for the characters in it:

If you are using windows and a TTY shell, you should enable the following for powershell:
```
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

or for cmd:

```
chcp 65001
```

This is to allow special characters such as the section symbol (§) work in the debug logs.

Why? Spile writes to the file descriptors of stdout asynchronously instead of using the built in methods of logging to make logging less resource intense.

## File Organisation

```
src - The source code for Spile. Top level folder for modules that deserve their own namespaces like lib, net and cli.
├───cli - CLI used to run Spile.
│   ├───commands - The commands used to run Spile.
│   │   └───base - Base command classes for the CLI.
│   └───options - The flags/options used on the root command (e.g. "spile -v").
├───lib - The library, you could say that the stuff that "does things" and can be reused reside here.
│   ├───errors - Custom errors used throughout Spile.
│   ├───types - Types, including typescript shims, common typings, validators and schemas for data.
│   │   ├───common - Common typings that can be used anywhere.
│   │   ├───schemas - Schemas for JSON validation.
│   │   ├───shims - Type definitions for libraries that do not ship with their own.
│   │   └───validators - Validators for data structures using the ow validator.
│   └───utils - Utilities used globally.
├───marshal - The command framework created for Spile.
│   └───commands - The commands for the game itself.
│       ├───minecraft - NMS commands.
│       └───spile - Spile's commands.
└───net - Network related.
    ├───protocol - Networking related to the Minecraft protocol.
    │   ├───fields - Data fields on packets.
    │   └───packets - Data structures to easily interact with packets.
    │       └───[...] - Folders for the respective protocol states.
    ├───query - Query server.
    └───rcon - Remote control server.
```

## Credits

This project would be impossible without these amazing people, resources, communities and projects:
  - [wiki.vg](https://wiki.vg) - Documentation on the Minecraft protocol.
  - [Mojang](https://www.mojang.com) - Mojang for such a cool game.
  - [GlowstoneMC](https://github.com/GlowstoneMC/Glowstone) - For countless inspirations on how I should go about creating certain aspects on this project.
  - [PrismarineJS](https://github.com/PrismarineJS) - Existing JS code to help me gain insight on how things are done through JS in the MC protocol.
  - [Veza](https://github.com/kyranet/veza) - The Veza project, for without this code, I would not have any examples on how to go about handling TCP packets.

## License

This project is licensed under the MIT license. Please consider its existence... See [LICENSE](./LICENSE) for more information.
