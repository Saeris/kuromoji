import { Inflate } from "pako";

export const fetchDictionary = async (
  path: string
): Promise<ArrayBufferLike> => {
  const res = await fetch(path);

  if (res.status !== 200) {
    throw new Error(res.statusText);
  }

  const arraybuffer = new Uint8Array(await res.arrayBuffer());

  const inflate = new Inflate();
  inflate.push(arraybuffer, true);
  if (inflate.err) {
    throw new Error(inflate.err.toString() + `: ` + inflate.msg);
  }
  const decompressed = inflate.result;
  const typed_array =
    decompressed instanceof Uint8Array
      ? decompressed
      : new TextEncoder().encode(decompressed);
  return typed_array.buffer;
};
