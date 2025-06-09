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
import { InvokeDefinitionMap } from "../../dict/InvokeDefinitionMap";
import { CharacterDefinitionBuilder } from "../../dict/builder/CharacterDefinitionBuilder";

const DIC_DIR = join(__dirname, `../resource/minimum-dic/`);

describe(`characterDefinition from char.def`, async () => {
  const cd_builder = new CharacterDefinitionBuilder();
  const filepath = join(DIC_DIR, `char.def`);
  (await fs.readFile(filepath, `utf-8`))
    .split(`\n`)
    .forEach((line) => cd_builder.putLine(line));
  const char_def = cd_builder.build();

  it(`lookup by space, return SPACE class`, () => {
    expect(char_def.lookup(` `)?.class_name).toBe(`SPACE`);
  });
  it(`lookup by 日, return KANJI class`, () => {
    expect(char_def.lookup(`日`)?.class_name).toBe(`KANJI`);
  });
  it(`lookup by !, return SYMBOL class`, () => {
    expect(char_def.lookup(`!`)?.class_name).toBe(`SYMBOL`);
  });
  it(`lookup by 1, return NUMERIC class`, () => {
    expect(char_def.lookup(`1`)?.class_name).toBe(`NUMERIC`);
  });
  it(`lookup by A, return ALPHA class`, () => {
    expect(char_def.lookup(`A`)?.class_name).toBe(`ALPHA`);
  });
  it(`lookup by あ, return HIRAGANA class`, () => {
    expect(char_def.lookup(`あ`)?.class_name).toBe(`HIRAGANA`);
  });
  it(`lookup by ア, return KATAKANA class`, () => {
    expect(char_def.lookup(`ア`)?.class_name).toBe(`KATAKANA`);
  });
  it(`lookup by 一, return KANJINUMERIC class`, () => {
    expect(char_def.lookup(`一`)?.class_name).toBe(`KANJINUMERIC`);
  });
  it(`lookup by surrogate pair character, return DEFAULT class`, () => {
    expect(char_def.lookup(`𠮷`)?.class_name).toBe(`DEFAULT`);
  });

  it(`lookup by 一, return KANJI class as compatible category`, () => {
    expect(char_def.lookupCompatibleCategory(`一`)[0].class_name).toBe(`KANJI`);
  });
  it(`lookup by 0x4E00, return KANJINUMERIC class as compatible category`, () => {
    expect(
      char_def.lookupCompatibleCategory(String.fromCharCode(0x3007))[0]
        .class_name
    ).toBe(`KANJINUMERIC`);
  });

  it(`sPACE class definition of INVOKE: false, GROUP: true, LENGTH: 0`, () => {
    expect(char_def.lookup(` `)?.is_always_invoke).toBe(false);
    expect(char_def.lookup(` `)?.is_grouping).toBe(true);
    expect(char_def.lookup(` `)?.max_length).toBe(0);
  });
  it(`kANJI class definition of INVOKE: false, GROUP: false, LENGTH: 2`, () => {
    expect(char_def.lookup(`日`)?.is_always_invoke).toBe(false);
    expect(char_def.lookup(`日`)?.is_grouping).toBe(false);
    expect(char_def.lookup(`日`)?.max_length).toBe(2);
  });
  it(`sYMBOL class definition of INVOKE: true, GROUP: true, LENGTH: 0`, () => {
    expect(char_def.lookup(`!`)?.is_always_invoke).toBe(true);
    expect(char_def.lookup(`!`)?.is_grouping).toBe(true);
    expect(char_def.lookup(`!`)?.max_length).toBe(0);
  });
  it(`nUMERIC class definition of INVOKE: true, GROUP: true, LENGTH: 0`, () => {
    expect(char_def.lookup(`1`)?.is_always_invoke).toBe(true);
    expect(char_def.lookup(`1`)?.is_grouping).toBe(true);
    expect(char_def.lookup(`1`)?.max_length).toBe(0);
  });
  it(`aLPHA class definition of INVOKE: true, GROUP: true, LENGTH: 0`, () => {
    expect(char_def.lookup(`A`)?.is_always_invoke).toBe(true);
    expect(char_def.lookup(`A`)?.is_grouping).toBe(true);
    expect(char_def.lookup(`A`)?.max_length).toBe(0);
  });
  it(`hIRAGANA class definition of INVOKE: false, GROUP: true, LENGTH: 2`, () => {
    expect(char_def.lookup(`あ`)?.is_always_invoke).toBe(false);
    expect(char_def.lookup(`あ`)?.is_grouping).toBe(true);
    expect(char_def.lookup(`あ`)?.max_length).toBe(2);
  });
  it(`kATAKANA class definition of INVOKE: true, GROUP: true, LENGTH: 2`, () => {
    expect(char_def.lookup(`ア`)?.is_always_invoke).toBe(true);
    expect(char_def.lookup(`ア`)?.is_grouping).toBe(true);
    expect(char_def.lookup(`ア`)?.max_length).toBe(2);
  });
  it(`kANJINUMERIC class definition of INVOKE: true, GROUP: true, LENGTH: 0`, () => {
    expect(char_def.lookup(`一`)?.is_always_invoke).toBe(true);
    expect(char_def.lookup(`一`)?.is_grouping).toBe(true);
    expect(char_def.lookup(`一`)?.max_length).toBe(0);
  });
  it(`save and load`, () => {
    if (char_def.invoke_definition_map == null) {
      throw new Error(`invoke_definition_map must not be null`);
    }
    const buffer = char_def.invoke_definition_map.toBuffer();
    const invoke_def = InvokeDefinitionMap.load(buffer);
    expect(invoke_def.getCharacterClass(0)).toMatchObject({
      class_id: 0,
      class_name: `DEFAULT`,
      is_always_invoke: 0,
      is_grouping: 1,
      max_length: 0
    });
    expect(invoke_def.getCharacterClass(10)).toMatchObject({
      class_id: 10,
      class_name: `CYRILLIC`,
      is_always_invoke: 1,
      is_grouping: 1,
      max_length: 0
    });
  });
});
