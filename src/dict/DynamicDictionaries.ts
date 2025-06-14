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
import doublearray from "doublearray.ts";
import type DoubleArray from "doublearray.ts/dist/doubleArrayClass.js";
import type { ArrayBuffer } from "doublearray.ts/dist/types.js";
import { TokenInfoDictionary } from "./TokenInfoDictionary.js";
import { ConnectionCosts } from "./ConnectionCosts.js";
import { UnknownDictionary } from "./UnknownDictionary.js";

export class DynamicDictionaries {
  trie: DoubleArray;
  token_info_dictionary: TokenInfoDictionary;
  connection_costs: ConnectionCosts;
  unknown_dictionary: UnknownDictionary;

  /**
   * Dictionaries container for Tokenizer
   * @param {DoubleArray} trie
   * @param {TokenInfoDictionary} token_info_dictionary
   * @param {ConnectionCosts} connection_costs
   * @param {UnknownDictionary} unknown_dictionary
   * @constructor
   */
  constructor(
    trie?: DoubleArray | null,
    token_info_dictionary?: TokenInfoDictionary | null,
    connection_costs?: ConnectionCosts | null,
    unknown_dictionary?: UnknownDictionary | null
  ) {
    if (trie != null) {
      this.trie = trie;
    } else {
      this.trie = doublearray.builder(0).build([
        {
          k: ``,
          v: 1
        }
      ]);
    }
    if (token_info_dictionary != null) {
      this.token_info_dictionary = token_info_dictionary;
    } else {
      this.token_info_dictionary = new TokenInfoDictionary();
    }
    if (connection_costs != null) {
      this.connection_costs = connection_costs;
    } else {
      // backward_size * backward_size
      this.connection_costs = new ConnectionCosts(0, 0);
    }
    if (unknown_dictionary != null) {
      this.unknown_dictionary = unknown_dictionary;
    } else {
      this.unknown_dictionary = new UnknownDictionary();
    }
  }

  // from base.dat & check.dat
  loadTrie(base_buffer: ArrayBuffer, check_buffer: ArrayBuffer): this {
    this.trie = doublearray.load(base_buffer, check_buffer);
    return this;
  }

  loadTokenInfoDictionaries(
    token_info_buffer: Uint8Array,
    pos_buffer: Uint8Array,
    target_map_buffer: Uint8Array
  ): this {
    this.token_info_dictionary.loadDictionary(token_info_buffer);
    this.token_info_dictionary.loadPosVector(pos_buffer);
    this.token_info_dictionary.loadTargetMap(target_map_buffer);
    return this;
  }

  loadConnectionCosts(cc_buffer: Int16Array): this {
    this.connection_costs.loadConnectionCosts(cc_buffer);
    return this;
  }

  loadUnknownDictionaries(
    unk_buffer: Uint8Array,
    unk_pos_buffer: Uint8Array,
    unk_map_buffer: Uint8Array,
    cat_map_buffer: Uint8Array,
    compat_cat_map_buffer: Uint32Array,
    invoke_def_buffer: Uint8Array
  ): this {
    this.unknown_dictionary.loadUnknownDictionaries(
      unk_buffer,
      unk_pos_buffer,
      unk_map_buffer,
      cat_map_buffer,
      compat_cat_map_buffer,
      invoke_def_buffer
    );
    return this;
  }
}
