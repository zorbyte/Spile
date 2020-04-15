import Logger from "../cli/Logger";
import { createServer as createTCPServer } from "net";
import chalk from "chalk";

// enum _PlayerSocketState {
//   HANDSHAKE,
//   STATUS,
//   LOGIN,
//   PLAY,
//   CLOSED = 99,
// }

function createServer(log: Logger): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = createTCPServer();

    const resolveServListen = () => {
      server.off("err", rejectServErr);
      resolve();
    };

    const rejectServErr = (err: Error) => {
      server.off("listening", resolveServListen);
      reject(err);
    };

    server.once("listening", resolveServListen);
    server.on("error", rejectServErr);

    server.on("connection", socket => {
      socket.on("data", data => {
        // const trueValues = [];
        log.debug("-------------- INCOMING PACKET --------------");
        let numRead = 0;
        let result = 0;
        let read;
        let i = 0;
        do {
          read = data[i];
          const value = read & 0b01111111;
          result |= value << (7 * numRead);

          numRead++;
          i++;
          if (numRead > 5) break;
        } while ((read & 0b10000000) !== 0);

        log.debug("Length", result);

        result = 0;
        let other;
        numRead = 0;
        do {
          other = data[i];
          const value = other & 0b01111111;
          result |= value << (7 * numRead);

          numRead++;
          i++;
          if (numRead > 5) break;
        } while ((other & 0b10000000) !== 0);
        log.debug("ID", chalk.green(`0x${result.toString(16).toUpperCase()}`));
        log.debug(
          "Raw",
          chalk.cyan(
            data
              .toString("hex")
              .split("")
              .map((v, ind, a) => ind & 1 ? [a[ind - 1], v, " "] : [])
              .flatMap(a => a)
              .join("")
              .toUpperCase()
              .trimEnd(),
          ),
        );
        log.debug("Data", chalk.blue(data.slice(i).toString("utf-8")));
        log.debug(chalk.red("Ending socket."));
        socket.end();
      });
    });

    server.listen(25565);
  });
}

export default createServer;
