interface IInternalField<P> {
  key: keyof P;
  type: IDataType<any>;
}

export interface IField<P> extends IInternalField<P> {
  key: Exclude<keyof P, "length" | "compressedLength" | "id">;
}

export interface IProgress<T> {
  accumulated: T;
  meta: any;
}

type TDeserialiseRet<T> = T | IProgress<T>;

export interface IDataType<T> {
  serialise: (data: T) => Uint8Array | Promise<Uint8Array>;
  deserialise: (raw: Uint8Array, progress?: IProgress<T>) => TDeserialiseRet<T> | Promise<TDeserialiseRet<T>>;
}

export enum EDestination {
  CLIENT_BOUND,
  SERVER_BOUND,
  DUPLEX_BOUND,
}

const test: IDataType<number> = {
  serialise(_data) { return new Uint8Array(); },
  deserialise(_raw) { return 1; },
};

abstract class Packet<P extends Packet<P>> {
  public length: number;
  public compressedLength?: number;
  public id: number;

  public constructor(private fields: IField<P>[]) {
    (this.fields as IInternalField<P>[]).unshift(
      { key: "length", type: test },
      { key: "compressedLength", type: test },
      { key: "id", type: test },
    );
  }
}

export default Packet;
