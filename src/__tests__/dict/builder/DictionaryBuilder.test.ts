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

import fs from "node:fs/promises";
import { join } from "node:path";
import { DictionaryBuilder } from "../../..";
import { Tokenizer } from "../../../Tokenizer";
import type { DynamicDictionaries } from "../../../dict/DynamicDictionaries";

const DIC_DIR = join(__dirname, `../../resource/minimum-dic/`);
const connection_costs_file = join(DIC_DIR, `matrix.def`);
const char_def_file = join(DIC_DIR, `char.def`);
const unk_def_file = join(DIC_DIR, `unk.def`);
const tid_dic_file = join(DIC_DIR, `minimum.csv`);

describe(`dictionaryBuilder`, () => {
  let kuromoji_dic: DynamicDictionaries; // target object of DynamicDictionaries to build

  beforeAll(async () => {
    // Build token info dictionary
    const builder = new DictionaryBuilder();
    const tokenInfo = await fs.readFile(tid_dic_file, `utf-8`);
    tokenInfo.split(`\n`).map((line) => {
      builder.addTokenInfoDictionary(line);
    });

    // Build connection costs matrix
    const cc_text = await fs.readFile(connection_costs_file, `ascii`);
    const cc_lines = cc_text.split(`\n`);
    cc_lines.map((line) => {
      builder.putCostMatrixLine(line);
    });

    // Build unknown dictionary
    const cd_text = await fs.readFile(char_def_file, `utf-8`);
    const cd_lines = cd_text.split(`\n`);
    cd_lines.map((line) => {
      builder.putCharDefLine(line);
    });
    const unk_text = await fs.readFile(unk_def_file, `utf-8`);
    const unk_lines = unk_text.split(`\n`);
    unk_lines.map((line) => {
      builder.putUnkDefLine(line);
    });

    kuromoji_dic = builder.build();
  }, 30000);

  it(`dictionary not to be null`, () => {
    expect(kuromoji_dic).not.toBeNull();
  });
  it(`tokenInfoDictionary not to be null`, () => {
    expect(kuromoji_dic.token_info_dictionary).not.toBeNull();
  });
  it(`tokenInfoDictionary`, () => {
    expect(
      kuromoji_dic.token_info_dictionary.dictionary.buffer.length
    ).toBeGreaterThan(1);
  });
  it(`doubleArray not to be null`, () => {
    expect(kuromoji_dic.trie).not.toBeNull();
  });
  it(`connectionCosts not to be null`, () => {
    expect(kuromoji_dic.connection_costs).not.toBeNull();
  });
  it(`tokenize simple test`, () => {
    const tokenizer = new Tokenizer(kuromoji_dic);
    const path = tokenizer.tokenize(`すもももももももものうち`);

    const expected_tokens = [
      {
        word_type: `KNOWN`,
        word_position: 1,
        surface_form: `すもも`,
        pos: `名詞`,
        pos_detail_1: `一般`,
        pos_detail_2: `*`,
        pos_detail_3: `*`,
        conjugated_type: `*`,
        conjugated_form: `*`,
        basic_form: `すもも`,
        reading: `スモモ`,
        pronunciation: `スモモ`
      },
      {
        word_type: `KNOWN`,
        word_position: 4,
        surface_form: `も`,
        pos: `助詞`,
        pos_detail_1: `係助詞`,
        pos_detail_2: `*`,
        pos_detail_3: `*`,
        conjugated_type: `*`,
        conjugated_form: `*`,
        basic_form: `も`,
        reading: `モ`,
        pronunciation: `モ`
      },
      {
        word_type: `KNOWN`,
        word_position: 5,
        surface_form: `もも`,
        pos: `名詞`,
        pos_detail_1: `一般`,
        pos_detail_2: `*`,
        pos_detail_3: `*`,
        conjugated_type: `*`,
        conjugated_form: `*`,
        basic_form: `もも`,
        reading: `モモ`,
        pronunciation: `モモ`
      },
      {
        word_type: `KNOWN`,
        word_position: 7,
        surface_form: `も`,
        pos: `助詞`,
        pos_detail_1: `係助詞`,
        pos_detail_2: `*`,
        pos_detail_3: `*`,
        conjugated_type: `*`,
        conjugated_form: `*`,
        basic_form: `も`,
        reading: `モ`,
        pronunciation: `モ`
      },
      {
        word_type: `KNOWN`,
        word_position: 8,
        surface_form: `もも`,
        pos: `名詞`,
        pos_detail_1: `一般`,
        pos_detail_2: `*`,
        pos_detail_3: `*`,
        conjugated_type: `*`,
        conjugated_form: `*`,
        basic_form: `もも`,
        reading: `モモ`,
        pronunciation: `モモ`
      },
      {
        word_type: `KNOWN`,
        word_position: 10,
        surface_form: `の`,
        pos: `助詞`,
        pos_detail_1: `連体化`,
        pos_detail_2: `*`,
        pos_detail_3: `*`,
        conjugated_type: `*`,
        conjugated_form: `*`,
        basic_form: `の`,
        reading: `ノ`,
        pronunciation: `ノ`
      },
      {
        word_type: `KNOWN`,
        word_position: 11,
        surface_form: `うち`,
        pos: `名詞`,
        pos_detail_1: `非自立`,
        pos_detail_2: `副詞可能`,
        pos_detail_3: `*`,
        conjugated_type: `*`,
        conjugated_form: `*`,
        basic_form: `うち`,
        reading: `ウチ`,
        pronunciation: `ウチ`
      }
    ];

    expect(path).to.have.length(7);

    for (let i = 0; i < expected_tokens.length; i++) {
      const expected_token = expected_tokens[i];
      const target_token = path[i];
      for (const key in expected_token) {
        expect(target_token).toHaveProperty(key, expected_token[key]);
      }
    }
  });
});
