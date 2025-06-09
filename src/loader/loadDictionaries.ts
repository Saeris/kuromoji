/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { pathJoin } from "../util/PathJoin.js";
import { DynamicDictionaries } from "../dict/DynamicDictionaries.js";

export const loadDictionaries = async (
  dic_path: string,
  loader: (path: string) => Promise<ArrayBufferLike>,
  dic = new DynamicDictionaries()
): Promise<DynamicDictionaries> => {
  const trie = async (): Promise<void> => {
    const buffers = await Promise.all(
      [`base.dat.tgz`, `check.dat.tgz`].map(async (filename) =>
        loader(pathJoin([dic_path, filename]))
      )
    );
    const base_buffer = new Int32Array(buffers[0]);
    const check_buffer = new Int32Array(buffers[1]);
    dic.loadTrie(base_buffer, check_buffer);
  };

  const takeDictionaryInfo = async (): Promise<void> => {
    const buffers = await Promise.all(
      [`tid.dat.tgz`, `tid_pos.dat.tgz`, `tid_map.dat.tgz`].map(
        async (filename) => loader(pathJoin([dic_path, filename]))
      )
    );
    const token_info_buffer = new Uint8Array(buffers[0]);
    const pos_buffer = new Uint8Array(buffers[1]);
    const target_map_buffer = new Uint8Array(buffers[2]);

    dic.loadTokenInfoDictionaries(
      token_info_buffer,
      pos_buffer,
      target_map_buffer
    );
  };

  const connectionCostMatrix = async (): Promise<void> => {
    const buffer = await loader(pathJoin([dic_path, `cc.dat.tgz`]));
    dic.loadConnectionCosts(
      buffer instanceof ArrayBuffer
        ? new Int16Array(buffer, 0, Math.floor(buffer.byteLength / 2))
        : new Int16Array(0)
    );
  };

  const unknownDictionaries = async (): Promise<void> => {
    const buffers = await Promise.all(
      [
        `unk.dat.tgz`,
        `unk_pos.dat.tgz`,
        `unk_map.dat.tgz`,
        `unk_char.dat.tgz`,
        `unk_compat.dat.tgz`,
        `unk_invoke.dat.tgz`
      ].map(async (filename) => loader(pathJoin([dic_path, filename])))
    );
    const unk_buffer = new Uint8Array(buffers[0]);
    const unk_pos_buffer = new Uint8Array(buffers[1]);
    const unk_map_buffer = new Uint8Array(buffers[2]);
    const cat_map_buffer = new Uint8Array(buffers[3]);
    const compat_cat_map_buffer = new Uint32Array(buffers[4]);
    const invoke_def_buffer = new Uint8Array(buffers[5]);

    dic.loadUnknownDictionaries(
      unk_buffer,
      unk_pos_buffer,
      unk_map_buffer,
      cat_map_buffer,
      compat_cat_map_buffer,
      invoke_def_buffer
    );
  };

  try {
    await Promise.all([
      trie(),
      takeDictionaryInfo(),
      connectionCostMatrix(),
      unknownDictionaries()
    ]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err);
    }
  }

  return dic;
};
