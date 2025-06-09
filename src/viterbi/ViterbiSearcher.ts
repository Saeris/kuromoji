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
import type { ConnectionCosts } from "../dict/ConnectionCosts.js";
import type { ViterbiLattice } from "./ViterbiLattice.js";
import type { ViterbiNode } from "./ViterbiNode.js";

export class ViterbiSearcher {
  connection_costs: ConnectionCosts;

  /**
   * ViterbiSearcher is for searching best Viterbi path
   * @param {ConnectionCosts} connection_costs Connection costs matrix
   * @constructor
   */
  constructor(connection_costs: ConnectionCosts) {
    this.connection_costs = connection_costs;
  }

  /**
   * Search best path by forward-backward algorithm
   * @param {ViterbiLattice} lattice Viterbi lattice to search
   * @returns {Array} Shortest path
   */
  search(lattice: ViterbiLattice): ViterbiNode[] {
    lattice = this.forward(lattice);
    return this.backward(lattice);
  }

  forward(lattice: ViterbiLattice): ViterbiLattice {
    for (let i = 1; i <= lattice.eos_pos; i++) {
      const nodes = lattice.nodes_end_at[i];
      if (!Array.isArray(nodes)) {
        continue;
      }
      for (const node of nodes) {
        let cost = Number.MAX_VALUE;
        let shortest_prev_node: ViterbiNode | null = null;

        const index = node.start_pos - 1;
        if (!(index in lattice.nodes_end_at)) {
          // TODO process unknown words (repair word lattice)
          continue;
        }
        const prev_nodes = lattice.nodes_end_at[index];
        for (const prev_node of prev_nodes) {
          let edge_cost: number;
          if (node.left_id == null || prev_node.right_id == null) {
            // TODO assert
            console.log(`Left or right is null`);
            edge_cost = 0;
          } else {
            edge_cost = this.connection_costs.get(
              prev_node.right_id,
              node.left_id
            );
          }

          const _cost = prev_node.shortest_cost + edge_cost + node.cost;
          if (_cost < cost) {
            shortest_prev_node = prev_node;
            cost = _cost;
          }
        }

        node.prev = shortest_prev_node;
        node.shortest_cost = cost;
      }
    }
    return lattice;
  }

  backward(lattice: ViterbiLattice): ViterbiNode[] {
    const shortest_path: ViterbiNode[] = [];
    const eos = lattice.nodes_end_at[lattice.nodes_end_at.length - 1][0];

    let node_back = eos.prev;
    if (node_back == null) {
      return [];
    }
    while (node_back.type !== `BOS`) {
      shortest_path.push(node_back);
      if (node_back.prev == null) {
        // TODO Failed to back. Process unknown words?
        return [];
      }
      node_back = node_back.prev;
    }

    return shortest_path.reverse();
  }
}
