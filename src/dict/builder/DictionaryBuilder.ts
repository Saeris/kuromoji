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
import type { Key } from "doublearray.ts/dist/types";
import type DoubleArray from "doublearray.ts/dist/doubleArrayClass.js";
import { DynamicDictionaries } from "../DynamicDictionaries.js";
import { TokenInfoDictionary } from "../TokenInfoDictionary.js";
import { ConnectionCostsBuilder } from "./ConnectionCostsBuilder.js";
import { CharacterDefinitionBuilder } from "./CharacterDefinitionBuilder.js";
import { UnknownDictionary } from "../UnknownDictionary.js";

export class DictionaryBuilder {
  tid_entries: string[][];
  unk_entries: string[][];
  cc_builder: ConnectionCostsBuilder;
  cd_builder: CharacterDefinitionBuilder;

  /**
   * Build dictionaries (token info, connection costs)
   *
   * Generates from matrix.def
   * cc.dat: Connection costs
   *
   * Generates from *.csv
   * dat.dat: Double array
   * tid.dat: Token info dictionary
   * tid_map.dat: targetMap
   * tid_pos.dat: posList (part of speech)
   */
  constructor() {
    // Array of entries, each entry in Mecab form
    // (0: surface form, 1: left id, 2: right id, 3: word cost, 4: part of speech id, 5-: other features)
    this.tid_entries = [];
    this.unk_entries = [];
    this.cc_builder = new ConnectionCostsBuilder();
    this.cd_builder = new CharacterDefinitionBuilder();
  }

  addTokenInfoDictionary(line: string): this {
    this.tid_entries.push(line.split(`,`));
    return this;
  }

  /**
   * Put one line of "matrix.def" file for building ConnectionCosts object
   * @param {string} line is a line of "matrix.def"
   */
  putCostMatrixLine(line: string): this {
    this.cc_builder.putLine(line);
    return this;
  }

  putCharDefLine(line: string): this {
    this.cd_builder.putLine(line);
    return this;
  }

  /**
   * Put one line of "unk.def" file for building UnknownDictionary object
   * @param {string} line is a line of "unk.def"
   */
  putUnkDefLine(line: string): this {
    this.unk_entries.push(line.split(`,`));
    return this;
  }

  build(): DynamicDictionaries {
    const dictionaries = this.buildTokenInfoDictionary();
    const unknown_dictionary = this.buildUnknownDictionary();

    return new DynamicDictionaries(
      dictionaries.trie,
      dictionaries.token_info_dictionary,
      this.cc_builder.build(),
      unknown_dictionary
    );
  }

  /**
   * Build TokenInfoDictionary
   *
   * @returns {{trie: *, token_info_dictionary: *}}
   */
  buildTokenInfoDictionary(): {
    trie: DoubleArray;
    token_info_dictionary: TokenInfoDictionary;
  } {
    const token_info_dictionary = new TokenInfoDictionary();

    // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
    const dictionary_entries = token_info_dictionary.buildDictionary(
      this.tid_entries
    );

    const trie = this.buildDoubleArray();

    for (const [token_info_id, surface_form] of Object.entries(
      dictionary_entries
    )) {
      token_info_dictionary.addMapping(
        trie.lookup(surface_form),
        parseInt(token_info_id)
      );
    }

    return {
      trie: trie,
      token_info_dictionary: token_info_dictionary
    };
  }

  buildUnknownDictionary(): UnknownDictionary {
    const unk_dictionary = new UnknownDictionary();

    // using as hashmap, string -> string (word_id -> surface_form) to build dictionary
    const dictionary_entries = unk_dictionary.buildDictionary(this.unk_entries);

    const char_def = this.cd_builder.build(); // Create CharacterDefinition

    unk_dictionary.characterDefinition(char_def);

    for (const [token_info_id, class_name] of Object.entries(
      dictionary_entries
    )) {
      const class_id = char_def.invoke_definition_map?.lookup(class_name);
      if (class_id == null) continue;
      unk_dictionary.addMapping(class_id, parseInt(token_info_id));
    }

    return unk_dictionary;
  }

  /**
   * Build double array trie
   *
   * @returns {DoubleArray} Double-Array trie
   */
  buildDoubleArray(): DoubleArray {
    let trie_id = 0;
    const words: Key[] = this.tid_entries.map(([surface_form]) => ({
      k: surface_form,
      v: trie_id++
    }));
    return doublearray.builder(1024 * 1024).build(words);
  }
}
