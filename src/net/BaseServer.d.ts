export default interface BaseServer {
  listen: () => Promise<void>;
  close: () => Promise<void>;
}
