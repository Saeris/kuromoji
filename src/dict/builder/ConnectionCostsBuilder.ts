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
import { ConnectionCosts } from "../ConnectionCosts.js";

export class ConnectionCostsBuilder {
  lines: number;
  connection_cost: ConnectionCosts | null;

  /**
   * Builder class for constructing ConnectionCosts object
   * @constructor
   */
  constructor() {
    this.lines = 0;
    this.connection_cost = null;
  }

  putLine(line: string): void {
    if (this.lines === 0 || this.connection_cost === null) {
      var dimensions = line.split(` `);
      var forward_dimension = parseInt(dimensions[0]);
      var backward_dimension = parseInt(dimensions[1]);

      if (forward_dimension < 0 || backward_dimension < 0) {
        throw new Error(`Parse error of matrix.def`);
      }

      this.connection_cost = new ConnectionCosts(
        forward_dimension,
        backward_dimension
      );
      this.lines++;
      return;
    }

    var costs = line.split(` `);

    if (costs.length !== 3) {
      return;
    }

    var forward_id = parseInt(costs[0]);
    var backward_id = parseInt(costs[1]);
    var cost = parseInt(costs[2]);

    if (
      forward_id < 0 ||
      backward_id < 0 ||
      !isFinite(forward_id) ||
      !isFinite(backward_id) ||
      this.connection_cost.forward_dimension <= forward_id ||
      this.connection_cost.backward_dimension <= backward_id
    ) {
      throw new Error(`Parse error of matrix.def`);
    }

    this.connection_cost.put(forward_id, backward_id, cost);
    this.lines++;
  }

  build(): ConnectionCosts | null {
    return this.connection_cost;
  }
}
