import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import IPADic from "mecab-ipadic-seed";
import { DictionaryBuilder } from "./DictionaryBuilder.js";
import { pathJoin } from "../../util/PathJoin.js";

const outDir = `dict-uncompressed/`;

const toBuffer = (
  typed?:
    | ArrayBuffer
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array
): Buffer => {
  if (typeof typed === `undefined`) {
    return Buffer.alloc(0);
  }
  return typed instanceof ArrayBuffer
    ? Buffer.from(typed)
    : Buffer.from(typed.buffer);
};

const buildBinaryDictionaries = async (
  promises: Array<Promise<void>>,
  builder: DictionaryBuilder
): Promise<void> => {
  // Build kuromoji.js binary dictionary
  await Promise.all(promises);
  console.log(`Finishied to read all seed dictionary files`);
  console.log(`Building binary dictionary ...`);
  const dic = builder.build();

  const base_buffer = toBuffer(dic.trie.bc.getBaseBuffer());
  const check_buffer = toBuffer(dic.trie.bc.getCheckBuffer());
  const token_info_buffer = toBuffer(
    dic.token_info_dictionary.dictionary.buffer
  );
  const tid_pos_buffer = toBuffer(dic.token_info_dictionary.pos_buffer.buffer);
  const tid_map_buffer = toBuffer(
    dic.token_info_dictionary.targetMapToBuffer()
  );
  const connection_costs_buffer = toBuffer(dic.connection_costs.buffer);
  const unk_buffer = toBuffer(dic.unknown_dictionary.dictionary.buffer);
  const unk_pos_buffer = toBuffer(dic.unknown_dictionary.pos_buffer.buffer);
  const unk_map_buffer = toBuffer(dic.unknown_dictionary.targetMapToBuffer());
  const char_map_buffer = toBuffer(
    dic.unknown_dictionary.character_definition?.character_category_map
  );
  const char_compat_map_buffer = toBuffer(
    dic.unknown_dictionary.character_definition?.compatible_category_map
  );
  const invoke_definition_map_buffer = toBuffer(
    dic.unknown_dictionary.character_definition?.invoke_definition_map?.toBuffer()
  );

  writeFileSync(pathJoin([outDir, `base.dat`]), base_buffer);
  writeFileSync(pathJoin([outDir, `check.dat`]), check_buffer);
  writeFileSync(pathJoin([outDir, `tid.dat`]), token_info_buffer);
  writeFileSync(pathJoin([outDir, `tid_pos.dat`]), tid_pos_buffer);
  writeFileSync(pathJoin([outDir, `tid_map.dat`]), tid_map_buffer);
  writeFileSync(pathJoin([outDir, `cc.dat`]), connection_costs_buffer);
  writeFileSync(pathJoin([outDir, `unk.dat`]), unk_buffer);
  writeFileSync(pathJoin([outDir, `unk_pos.dat`]), unk_pos_buffer);
  writeFileSync(pathJoin([outDir, `unk_map.dat`]), unk_map_buffer);
  writeFileSync(pathJoin([outDir, `unk_char.dat`]), char_map_buffer);
  writeFileSync(pathJoin([outDir, `unk_compat.dat`]), char_compat_map_buffer);
  writeFileSync(
    pathJoin([outDir, `unk_invoke.dat`]),
    invoke_definition_map_buffer
  );
};

const createDatFiles = async (): Promise<void> => {
  if (!existsSync(outDir)) {
    mkdirSync(outDir);
  }

  const dic = new IPADic();
  const builder = new DictionaryBuilder();

  // Build token info dictionary
  const tokenInfo = async (): Promise<void> => {
    await dic.readTokenInfo((line) => {
      builder.addTokenInfoDictionary(line);
    });
    console.log(`Finishied to read token info dics`);
  };

  // Build connection costs matrix
  const matrixDef = async (): Promise<void> => {
    await dic.readMatrixDef((line) => {
      builder.putCostMatrixLine(line);
    });
    console.log(`Finishied to read matrix.def`);
  };

  // Build unknown dictionary
  const unkDef = async (): Promise<void> => {
    await dic.readUnkDef((line) => {
      builder.putUnkDefLine(line);
    });
    console.log(`Finishied to read unk.def`);
  };

  // Build character definition dictionary
  const charDef = async (): Promise<void> => {
    await dic.readCharDef((line) => {
      builder.putCharDefLine(line);
    });
    console.log(`Finishied to read char.def`);
  };

  await buildBinaryDictionaries(
    [tokenInfo(), matrixDef(), unkDef(), charDef()],
    builder
  );
};

await createDatFiles();
