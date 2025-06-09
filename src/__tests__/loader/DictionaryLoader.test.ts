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
import { loadDictionaries } from "../../loader/loadDictionaries";
import { readDictionary } from "../../loader/readDictionary";

const DIC_DIR = `dict/`;

describe(`dictionaryLoader`, async () => {
  const dictionaries = await loadDictionaries(DIC_DIR, readDictionary);

  it(`unknown dictionaries are loaded properly`, () => {
    expect(dictionaries.unknown_dictionary.lookup(` `)).toMatchObject({
      class_id: 1,
      class_name: `SPACE`,
      is_always_invoke: 0,
      is_grouping: 1,
      max_length: 0
    });
  });

  it(`tokenInfoDictionary is loaded properly`, () => {
    expect(
      dictionaries.token_info_dictionary.getFeatures(`0`)
    ).not.toHaveLength(0);
  });
});
