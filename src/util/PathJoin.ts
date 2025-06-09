export const pathJoin = (pathes: string[]): string => {
  let result = ``;
  for (const path of pathes) {
    if (path.startsWith(`/`) && result.endsWith(`/`)) {
      result += path.slice(1);
    } else if (path.startsWith(`/`) || result.endsWith(`/`) || result == ``) {
      result += path;
    } else {
      result += `/` + path;
    }
  }
  return result;
};
