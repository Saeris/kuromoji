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

import { ByteBuffer } from "../../util/ByteBuffer";

describe(`byteBuffer static methods`, () => {
  let byteBuffer: ByteBuffer;

  beforeEach(() => {
    byteBuffer = new ByteBuffer(50);
  });

  it(`putShort() and getShort()`, () => {
    const v = -413;
    byteBuffer.putShort(v);
    expect(byteBuffer.position).toBe(2);
    const got = byteBuffer.getShort(0);
    expect(got).toStrictEqual(v);
  });

  it(`putString() and getString() 2 bytes UTF-8`, () => {
    const str = `âbcde`;
    byteBuffer.putString(str);
    // 2 bytes x1 + 1 byte x4 + 1 byte (null character) - 1 (this is zero-based index) + 1 (next position)
    expect(byteBuffer.position).toBe(7);
    const got = byteBuffer.getString(0);
    expect(got).toStrictEqual(str);
  });

  it(`putString() and getString() 3 bytes UTF-8`, () => {
    const str = `あいうえお`;
    byteBuffer.putString(str);
    // 3 bytes x5 + 1 byte (null character) - 1 (this is zero-based index) + 1 (next position)
    expect(byteBuffer.position).toBe(16);
    const got = byteBuffer.getString(0);
    expect(got).toStrictEqual(str);
  });

  it(`putString() and getString() 4 bytes UTF-8`, () => {
    const str = `𠮷野屋`;
    byteBuffer.putString(str);
    // 4 bytes x1 + 3 bytes x2 + 1 byte (null character) - 1 (this is zero-based index) + 1 (next position)
    expect(byteBuffer.position).toBe(11);
    const got = byteBuffer.getString(0);
    expect(got).toStrictEqual(str);
  });

  it(`too long string against buffer size`, () => {
    const str = `あいうえおかきくけこさしすせそたちつてと`; // 60 bytes
    byteBuffer.putString(str);
    expect(byteBuffer.position).toBe(61);
    const got = byteBuffer.getString(0);
    expect(got).toStrictEqual(str);
  });
});
