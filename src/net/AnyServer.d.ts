export default interface AnyServer {
  listen: () => Promise<void>;
  close: () => Promise<void>;
}
