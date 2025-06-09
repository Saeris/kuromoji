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
import { TokenInfoDictionary } from "./TokenInfoDictionary.js";
import { CharacterDefinition } from "./CharacterDefinition.js";
import { ByteBuffer } from "../util/ByteBuffer.js";
import type { CharacterClass } from "./CharacterClass.js";

// Inherit from TokenInfoDictionary as a super class
export class UnknownDictionary extends TokenInfoDictionary {
  dictionary: ByteBuffer;
  target_map: { [key: string]: number[] };
  pos_buffer: ByteBuffer;
  character_definition: CharacterDefinition | null;

  /**
   * UnknownDictionary
   * @constructor
   */
  constructor() {
    super();
    this.dictionary = new ByteBuffer(10 * 1024 * 1024);
    this.target_map = {}; // class_id (of CharacterClass) -> token_info_id (of unknown class)
    this.pos_buffer = new ByteBuffer(10 * 1024 * 1024);
    this.character_definition = null;
  }

  // Inherit from TokenInfoDictionary as a super class
  // UnknownDictionary.prototype = Object.create(TokenInfoDictionary.prototype);

  characterDefinition(character_definition: CharacterDefinition): this {
    this.character_definition = character_definition;
    return this;
  }

  lookup(ch: string): CharacterClass | undefined {
    return this.character_definition?.lookup(ch);
  }

  lookupCompatibleCategory(ch: string): CharacterClass[] | undefined {
    return this.character_definition?.lookupCompatibleCategory(ch);
  }

  loadUnknownDictionaries(
    unk_buffer: Uint8Array,
    unk_pos_buffer: Uint8Array,
    unk_map_buffer: Uint8Array,
    cat_map_buffer: Uint8Array,
    compat_cat_map_buffer: Uint32Array,
    invoke_def_buffer: Uint8Array
  ): void {
    this.loadDictionary(unk_buffer);
    this.loadPosVector(unk_pos_buffer);
    this.loadTargetMap(unk_map_buffer);
    this.character_definition = CharacterDefinition.load(
      cat_map_buffer,
      compat_cat_map_buffer,
      invoke_def_buffer
    );
  }
}
