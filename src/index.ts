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
import { fetchDictionary } from "./loader/fetchDictionary.js";
import { loadDictionaries } from "./loader/loadDictionaries.js";
import { readDictionary } from "./loader/readDictionary.js";
import { Tokenizer } from "./Tokenizer.js";

export { DictionaryBuilder } from "./dict/builder/DictionaryBuilder.js";

export const tokenizerNode = async (dictPath: string): Promise<Tokenizer> =>
  new Tokenizer(await loadDictionaries(dictPath, readDictionary));

export const tokenizerWeb = async (dictPath: string): Promise<Tokenizer> =>
  new Tokenizer(await loadDictionaries(dictPath, fetchDictionary));
