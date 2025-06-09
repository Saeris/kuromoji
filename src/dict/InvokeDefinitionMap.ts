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
import { ByteBuffer } from "../util/ByteBuffer.js";
import { CharacterClass } from "./CharacterClass.js";

export class InvokeDefinitionMap {
  map: CharacterClass[];
  lookup_table: { [key: string]: number };

  /**
   * InvokeDefinitionMap represents invoke definition a part of char.def
   * @constructor
   */
  constructor() {
    this.map = [];
    this.lookup_table = {}; // Just for building dictionary
  }

  /**
   * Load InvokeDefinitionMap from buffer
   * @param {Uint8Array} invoke_def_buffer
   * @returns {InvokeDefinitionMap}
   */
  static load(invoke_def_buffer: Uint8Array): InvokeDefinitionMap {
    var invoke_def = new InvokeDefinitionMap();
    var character_category_definition: CharacterClass[] = [];

    var buffer = new ByteBuffer(invoke_def_buffer);
    while (buffer.position + 1 < buffer.size()) {
      var class_id: number = character_category_definition.length;
      var is_always_invoke = buffer.get();
      var is_grouping = buffer.get();
      var max_length = buffer.getInt();
      var class_name = buffer.getString();
      character_category_definition.push(
        new CharacterClass(
          class_id,
          class_name,
          is_always_invoke,
          is_grouping,
          max_length
        )
      );
    }

    invoke_def.init(character_category_definition);

    return invoke_def;
  }

  /**
   * Initializing method
   * @param {Array.<CharacterClass>} character_category_definition Array of CharacterClass
   */
  init(character_category_definition: CharacterClass[]): void {
    if (!Array.isArray(character_category_definition)) {
      return;
    }
    for (var i = 0; i < character_category_definition.length; i++) {
      var character_class = character_category_definition[i];
      this.map[i] = character_class;
      this.lookup_table[character_class.class_name] = i;
    }
  }

  /**
   * Get class information by class ID
   * @param {number} class_id
   * @returns {CharacterClass}
   */
  getCharacterClass(class_id: number): CharacterClass {
    return this.map[class_id];
  }

  /**
   * For building character definition dictionary
   * @param {string} class_name character
   * @returns {number} class_id
   */
  lookup(class_name: string): number | null {
    return Object.hasOwn(this.lookup_table, class_name)
      ? this.lookup_table[class_name]
      : null;
  }

  /**
   * Transform from map to binary buffer
   * @returns {Uint8Array}
   */
  toBuffer(): Uint8Array {
    var buffer = new ByteBuffer();
    for (const char_class of this.map) {
      buffer.put(Number(char_class.is_always_invoke));
      buffer.put(Number(char_class.is_grouping));
      buffer.putInt(char_class.max_length);
      buffer.putString(char_class.class_name);
    }
    buffer.shrink();
    return buffer.buffer;
  }
}
