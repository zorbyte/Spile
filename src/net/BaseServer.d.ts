export default interface BaseServer {
  listen: () => Promise<unknown>;
  close: () => Promise<unknown>;
}
