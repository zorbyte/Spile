import {
  constants as zConst,
  deflate as deflateCb,
  unzip as unzipCb,
} from "zlib";

export function protocolDeflate(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    deflateCb(data, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}

export function protocolInflate(data: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    unzipCb(data, { finishFlush: zConst.Z_SYNC_FLUSH }, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
}
