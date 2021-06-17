import { warn, exportTag } from '@garfish/utils';

function findArray(arr, p) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === p) {
      return p;
    }
  }
  return null;
}

export function markAndDerived() {
  let curringAddTags = [];
  let historyTags = [];

  return {
    markExport(global) {
      curringAddTags = [];
      historyTags = [];
      for (const p in global) {
        if (p.indexOf(exportTag) !== -1) {
          historyTags.push(p);
        }
      }
    },
    getExport(global) {
      for (const p in global) {
        if (p.indexOf(exportTag) !== -1) {
          if (!findArray(historyTags, p)) {
            curringAddTags.push(p);
          }
        }
      }
      if (curringAddTags.length > 1) {
        warn(
          `Access to export the contents of two or more： ${curringAddTags.concat(
            ',',
          )}`,
        );
      }
      if (global[curringAddTags[0]]) {
        return global[curringAddTags[0]];
      }
      return null;
    },
  };
}
