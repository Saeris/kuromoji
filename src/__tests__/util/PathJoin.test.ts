import { pathJoin } from "../../util/PathJoin";

describe(`pathJoin`, () => {
  it(`basic`, () => {
    const dir = `foo/`;
    const file = `bar.gz`;
    const path = pathJoin([dir, file]);

    const expected = `foo/bar.gz`;
    expect(path).toStrictEqual(expected);
  });
  it(`absolute path`, () => {
    const dir = `/foo/`;
    const file = `bar.gz`;
    const path = pathJoin([dir, file]);

    const expected = `/foo/bar.gz`;
    expect(path).toStrictEqual(expected);
  });
  it(`duplicate slash`, () => {
    const dir = `foo/`;
    const file = `/bar.gz`;
    const path = pathJoin([dir, file]);

    const expected = `foo/bar.gz`;
    expect(path).toStrictEqual(expected);
  });
});
