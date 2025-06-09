declare module "mecab-ipadic-seed" {
  export default class MecabIpadicSeed {
    readTokenInfo(callback: (line: string) => void): Promise<void>;
    readMatrixDef(callback: (line: string) => void): Promise<void>;
    readUnkDef(callback: (line: string) => void): Promise<void>;
    readCharDef(callback: (line: string) => void): Promise<void>;
  }
  export class DictionaryReader {
    constructor(filename: string);
    read(callback: (line: string) => void): Promise<void>;
  }
}
