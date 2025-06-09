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
import type { ViterbiNodeType } from "../viterbi/ViterbiNode.js";

export interface IpadicFormatterToken {
  /** 辞書内での単語ID */
  word_id: number;
  /** 単語タイプ(辞書に登録されている単語ならKNOWN, 未知語ならUNKNOWN) */
  word_type: ViterbiNodeType;
  /** 単語の開始位置 */
  word_position: number;
  /** 表層形 */
  surface_form: string | Uint8Array;
  /** 品詞 */
  pos: string;
  /** 品詞細分類1 */
  pos_detail_1: string;
  /** 品詞細分類2 */
  pos_detail_2: string;
  /** 品詞細分類3 */
  pos_detail_3: string;
  /** 活用型 */
  conjugated_type: string;
  /** 活用形 */
  conjugated_form: string;
  /** 基本形 */
  basic_form: string;
  /** 読み */
  reading?: string;
  /** 発音 */
  pronunciation?: string;
}

/**
 * Mappings between IPADIC dictionary features and tokenized results
 */
export const formatEntry = (
  word_id: number,
  position: number,
  type: ViterbiNodeType,
  features: string[]
): IpadicFormatterToken => {
  return {
    word_id,
    word_type: type,
    word_position: position,

    surface_form: features[0],
    pos: features[1],
    pos_detail_1: features[2],
    pos_detail_2: features[3],
    pos_detail_3: features[4],
    conjugated_type: features[5],
    conjugated_form: features[6],
    basic_form: features[7],
    reading: features[8],
    pronunciation: features[9].trim()
  };
};

export const formatUnknownEntry = (
  word_id: number,
  position: number,
  type: ViterbiNodeType,
  features: string[],
  surface_form: string | Uint8Array
): IpadicFormatterToken => {
  return {
    word_id,
    word_type: type,
    word_position: position,

    surface_form: surface_form,
    pos: features[1],
    pos_detail_1: features[2],
    pos_detail_2: features[3],
    pos_detail_3: features[4],
    conjugated_type: features[5],
    conjugated_form: features[6],
    basic_form: features[7]
    // reading: features[8],
    // pronunciation: features[9],
  };
};
