import fs from "node:fs/promises";
import { Inflate } from "pako";

export const readDictionary = async (
  path: string
): Promise<ArrayBufferLike> => {
  const buffer = await fs.readFile(path);
  const inflate = new Inflate();
  inflate.push(buffer, true);
  if (inflate.err) throw new Error(inflate.err.toString());
  const decompressed = inflate.result;
  const typed_array =
    decompressed instanceof Uint8Array
      ? decompressed
      : new TextEncoder().encode(decompressed);
  return typed_array.buffer;
};
