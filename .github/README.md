# Spile Server

![Discord Shield](https://discordapp.com/api/guilds/702504330456072303/widget.png?style=shield)

Spile is a Minecraft Java edition game server written in Typescript using Deno.

Check out issue [#1](../../issues/1) for more info.

## About

Spile was originally written in Node.js, however it is being ported to Deno for latency benefits and to participate in a better ecosystem.

## Contributing

To use the scripts, install the [Velociraptor](https://github.com/umbopepato/velociraptor) CLI.

To configure the development environment, run `vr setup_dev` (this requires the aforementioned CLI).

To run Spile (in development mode), run `vr dev`.

Ensure that you lint everything with prettier and then `deno fmt` prior to committing.

## Credits

This project would be impossible without these amazing people, resources, communities and projects:
  - [Deno Standard Library](https://deno.land/std) - Useful guide on how I should go about writing stuff in Deno, especially the packet parser.
  - [wiki.vg](https://wiki.vg) - Documentation on the Minecraft protocol.
  - [Mojang](https://www.mojang.com) - Mojang for such a cool game.
  - [GlowstoneMC](https://github.com/GlowstoneMC/Glowstone) - For countless inspirations on how I should go about creating certain aspects on this project.
  - [PrismarineJS](https://github.com/PrismarineJS) - Existing JS code to help me gain insight on how things are done through JS in the MC protocol.

## License

This project is licensed under the MIT license. Please consider its existence... See [LICENSE](./LICENSE) for more information.
