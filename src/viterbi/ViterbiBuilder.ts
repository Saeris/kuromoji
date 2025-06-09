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
import type DoubleArray from "doublearray.ts/dist/doubleArrayClass.js";
import { ViterbiNode } from "./ViterbiNode.js";
import { ViterbiLattice } from "./ViterbiLattice.js";
import { SurrogateAwareString } from "../util/SurrogateAwareString.js";
import type { DynamicDictionaries } from "../dict/DynamicDictionaries.js";
import type { TokenInfoDictionary } from "../dict/TokenInfoDictionary.js";
import type { UnknownDictionary } from "../dict/UnknownDictionary.js";

export class ViterbiBuilder {
  trie: DoubleArray;
  token_info_dictionary: TokenInfoDictionary;
  unknown_dictionary: UnknownDictionary;

  /**
   * ViterbiBuilder builds word lattice (ViterbiLattice)
   * @param {DynamicDictionaries} dic dictionary
   * @constructor
   */
  constructor(dic: DynamicDictionaries) {
    this.trie = dic.trie;
    this.token_info_dictionary = dic.token_info_dictionary;
    this.unknown_dictionary = dic.unknown_dictionary;
  }

  /**
   * Build word lattice
   * @param {string} sentence_str Input text
   * @returns {ViterbiLattice} Word lattice
   */
  build(sentence_str: string): ViterbiLattice {
    const lattice = new ViterbiLattice();
    const sentence = new SurrogateAwareString(sentence_str);

    let trie_id: number | undefined,
      left_id: number,
      right_id: number,
      word_cost: number;
    for (let pos = 0; pos < sentence.length; pos++) {
      const tail = sentence.slice(pos);
      const vocabulary = this.trie.commonPrefixSearch(tail);
      for (const { v, k } of vocabulary) {
        // Words in dictionary do not have surrogate pair (only UCS2 set)
        trie_id = v;
        let key = k;
        if (key === null || key === undefined) continue;

        if (trie_id == null) continue;

        const token_info_ids = this.token_info_dictionary.target_map[trie_id];
        for (const id of token_info_ids) {
          // FIXME parseInt要らない説
          const token_info_id = parseInt(id.toString());

          left_id =
            this.token_info_dictionary.dictionary.getShort(token_info_id);
          right_id = this.token_info_dictionary.dictionary.getShort(
            token_info_id + 2
          );
          word_cost = this.token_info_dictionary.dictionary.getShort(
            token_info_id + 4
          );

          // node_name, cost, start_index, length, type, left_id, right_id, surface_form
          lattice.append(
            new ViterbiNode(
              token_info_id,
              word_cost,
              pos + 1,
              key.length,
              `KNOWN`,
              left_id,
              right_id,
              key
            )
          );
        }
      }

      // Unknown word processing
      const surrogate_aware_tail = new SurrogateAwareString(tail);
      const head_char = new SurrogateAwareString(
        surrogate_aware_tail.charAt(0)
      );
      const head_char_class = this.unknown_dictionary.lookup(
        head_char.toString()
      );
      if (head_char_class === undefined) continue;
      if (vocabulary.length === 0 || head_char_class.is_always_invoke === 1) {
        // Process unknown word
        let key: SurrogateAwareString | string = head_char;
        if (
          head_char_class.is_grouping === 1 &&
          1 < surrogate_aware_tail.length
        ) {
          for (var k = 1; k < surrogate_aware_tail.length; k++) {
            const next_char = surrogate_aware_tail.charAt(k);
            const next_char_class = this.unknown_dictionary.lookup(next_char);
            if (head_char_class.class_name !== next_char_class?.class_name) {
              break;
            }
            key = key.toString() + next_char;
          }
        }

        const unk_ids =
          this.unknown_dictionary.target_map[head_char_class.class_id];
        for (const id of unk_ids) {
          // FIXME parseInt要らない説
          const unk_id = parseInt(id.toString());

          left_id = this.unknown_dictionary.dictionary.getShort(unk_id);
          right_id = this.unknown_dictionary.dictionary.getShort(unk_id + 2);
          word_cost = this.unknown_dictionary.dictionary.getShort(unk_id + 4);

          // node_name, cost, start_index, length, type, left_id, right_id, surface_form
          lattice.append(
            new ViterbiNode(
              unk_id,
              word_cost,
              pos + 1,
              key.length,
              `UNKNOWN`,
              left_id,
              right_id,
              key.toString()
            )
          );
        }
      }
    }
    lattice.appendEos();

    return lattice;
  }
}
