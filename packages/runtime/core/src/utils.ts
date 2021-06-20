import { warn, Text, transformUrl } from '@garfish/utils';
import {
  Loader,
  StyleManager,
  TemplateManager,
  JavaScriptManager,
} from '@garfish/loader';

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

// Fetch script and link elements
export const fetchStaticResources = (
  appName: string,
  loader: Loader,
  entryManager: TemplateManager,
) => {
  // Get all script elements
  const jsNodes = Promise.all(
    entryManager
      .findAllJsNodes()
      .map((node) => {
        const src = entryManager.findAttributeValue(node, 'src');
        const type = entryManager.findAttributeValue(node, 'type');

        // There should be no embedded script in the script element tag with the src attribute specified
        if (src) {
          const fetchUrl = transformUrl(entryManager.url, src);
          const async = entryManager.findAttributeValue(node, 'async');
          // Scripts with "async" attribute will make the rendering process very complicated,
          // we have a preload mechanism, so we don’t need to deal with it.
          return loader
            .load<JavaScriptManager>(appName, fetchUrl)
            .then(({ resourceManager: jsManager }) => {
              jsManager.setDep(node);
              jsManager.setMimeType(type);
              jsManager.setAsyncAttribute(Boolean(async));
              return jsManager;
            });
        } else if (node.children.length > 0) {
          const code = (node.children[0] as Text).content;
          if (code) {
            const jsManager = new JavaScriptManager(code, '');
            jsManager.setDep(node);
            jsManager.setMimeType(type);
            return jsManager;
          }
        }
      })
      .filter(Boolean),
  );

  // Get all link elements
  const linkNodes = Promise.all(
    entryManager
      .findAllLinkNodes()
      .map((node) => {
        if (!entryManager.DOMApis.isCssLinkNode(node)) return;
        const href = entryManager.findAttributeValue(node, 'href');
        if (href) {
          const fetchUrl = transformUrl(entryManager.url, href);
          return loader
            .load<StyleManager>(appName, fetchUrl)
            .then(({ resourceManager: styleManager }) => {
              styleManager.setDep(node);
              // styleManager.setScope(appName);
              styleManager.correctPath();
              return styleManager;
            });
        }
      })
      .filter(Boolean),
  );

  return Promise.all([jsNodes, linkNodes]);
};
