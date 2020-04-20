/**
 * Spile Minecraft Server
 * @author zorbyte <zorbytee@gmail.com>
 *
 * @license
 * Copyright (C) 2020 The Spile Developers
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <https: //www.gnu.org/licenses/>.
 */

/**
 * Used for optional servers like rcon.
 *
 * @interface
 */
interface OptionalServer {
  port: number;
  enabled: boolean;
}

/**
 * This configuration is the consumer/user config. Therefore it is not used for @root/config.rs!!!
 *
 * @interface
 */
export interface UserConfig {
  port: number;
  rcon: OptionalServer;
  query: OptionalServer;

  // Plugins should be optional, as this should be a viable alternative to a notchian server as well!
  usePlugins: boolean;

  // DANGER: This option disables commands of all other namespaces except minecraft:*!!!
  // It is best you do not touch this.
  __notchainCommands: boolean;
}
