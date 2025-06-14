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
import { ViterbiBuilder } from "../../viterbi/ViterbiBuilder";

const DIC_DIR = `dict/`;

describe(`viterbiBuilder`, async () => {
  const viterbi_builder = new ViterbiBuilder(
    await loadDictionaries(DIC_DIR, readDictionary)
  );

  it(`unknown word`, () => {
    // lattice to have "ト", "トト", "トトロ"
    const lattice = viterbi_builder.build(`トトロ`);
    for (let i = 1; i < lattice.eos_pos; i++) {
      const nodes = lattice.nodes_end_at[i];
      if (!Array.isArray(nodes)) {
        continue;
      }
      expect(
        nodes.map((node) => {
          return node.surface_form;
        })
      ).toContain(`トトロ`.slice(0, i));
    }
  });
});
