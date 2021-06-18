import { warn } from '@garfish/utils';

const exportTag = '-garfish-exports';

export function markAndDerived() {
  let historyTags = [];
  let curringAddTags = [];

  return {
    markExport(global) {
      historyTags = [];
      curringAddTags = [];
      for (const p in global) {
        if (p.indexOf(exportTag) !== -1) {
          historyTags.push(p);
        }
      }
    },

    getExport(global) {
      for (const p in global) {
        if (p.indexOf(exportTag) !== -1) {
          if (historyTags.indexOf(p) < 0) {
            curringAddTags.push(p);
          }
        }
      }
      if (curringAddTags.length > 1) {
        const tagString = curringAddTags.concat(',');
        warn(`Access to export the contents of two or more： ${tagString}`);
      }
      if (global[curringAddTags[0]]) {
        return global[curringAddTags[0]];
      }
      return null;
    },
  };
}
