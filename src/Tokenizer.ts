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
import { ViterbiBuilder } from "./viterbi/ViterbiBuilder.js";
import { ViterbiSearcher } from "./viterbi/ViterbiSearcher.js";
import {
  formatEntry,
  formatUnknownEntry,
  type IpadicFormatterToken
} from "./util/IpadicFormatter.js";
import type { DynamicDictionaries } from "./dict/DynamicDictionaries.js";
import type { ViterbiLattice } from "./viterbi/ViterbiLattice.js";

/**
 * 読点と句読点。
 */
const PUNCTUATION = /、|。/;

export class Tokenizer {
  token_info_dictionary;
  unknown_dictionary;
  viterbi_builder;
  viterbi_searcher;

  /**
   * Tokenizer
   * @param {DynamicDictionaries} dic Dictionaries used by this tokenizer
   * @constructor
   */
  constructor(dic: DynamicDictionaries) {
    this.token_info_dictionary = dic.token_info_dictionary;
    this.unknown_dictionary = dic.unknown_dictionary;
    this.viterbi_builder = new ViterbiBuilder(dic);
    this.viterbi_searcher = new ViterbiSearcher(dic.connection_costs);
  }

  /**
   * Split into sentence by punctuation
   * @param {string} input Input text
   * @returns {Array.<string>} Sentences end with punctuation
   */
  static splitByPunctuation(input: string): string[] {
    const sentences: string[] = [];
    let tail = input;
    while (true) {
      if (tail === ``) {
        break;
      }
      const index = tail.search(PUNCTUATION);
      if (index < 0) {
        sentences.push(tail);
        break;
      }
      sentences.push(tail.substring(0, index + 1));
      tail = tail.substring(index + 1);
    }
    return sentences;
  }

  /**
   * Tokenize text
   * @param {string} text Input text to analyze
   * @returns {Array} Tokens
   */
  tokenize(text: string): IpadicFormatterToken[] {
    const sentences = Tokenizer.splitByPunctuation(text);
    const tokens: IpadicFormatterToken[] = [];
    for (const sentence of sentences) {
      tokens.push(...this.tokenizeForSentence(sentence, tokens));
    }
    return tokens;
  }

  tokenizeForSentence(
    sentence: string,
    tokens: IpadicFormatterToken[] = []
  ): IpadicFormatterToken[] {
    const lattice = this.getLattice(sentence);
    const best_path = this.viterbi_searcher.search(lattice);
    let last_pos = 0;
    if (tokens.length > 0) {
      last_pos = tokens[tokens.length - 1].word_position;
    }

    const result: IpadicFormatterToken[] = [];

    for (const node of best_path) {
      let token: IpadicFormatterToken;
      let features: string[];
      let features_line: string;
      if (node.type === `KNOWN`) {
        features_line = this.token_info_dictionary.getFeatures(
          node.name.toString()
        );
        if (typeof features_line !== `string`) {
          features = [];
        } else {
          features = features_line.split(`,`);
        }
        token = formatEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          features
        );
      } else if (node.type === `UNKNOWN`) {
        // Unknown word
        features_line = this.unknown_dictionary.getFeatures(
          node.name.toString()
        );
        if (typeof features_line !== `string`) {
          features = [];
        } else {
          features = features_line.split(`,`);
        }
        token = formatUnknownEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          features,
          node.surface_form
        );
      } else {
        // TODO User dictionary
        token = formatEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          []
        );
      }

      result.push(token);
    }

    return result;
  }

  /**
   * Build word lattice
   * @param {string} text Input text to analyze
   * @returns {ViterbiLattice} Word lattice
   */
  getLattice(text: string): ViterbiLattice {
    return this.viterbi_builder.build(text);
  }
}
