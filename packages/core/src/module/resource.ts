import { warn, error, Text, transformUrl } from '@garfish/utils';
import {
  Loader,
  StyleManager,
  TemplateManager,
  JavaScriptManager,
} from '@garfish/loader';
import { AppInfo } from './app';

// Fetch `script`, `link` and `module meta` elements
function fetchStaticResources(
  appName: string,
  loader: Loader,
  entryManager: TemplateManager,
) {
  const isAsync = (val) => typeof val !== 'undefined' && val !== 'false';

  // Get all script elements
  const jsNodes = Promise.all(
    entryManager
      .findAllJsNodes()
      .map((node) => {
        const src = entryManager.findAttributeValue(node, 'src');
        const type = entryManager.findAttributeValue(node, 'type');
        const crossOrigin = entryManager.findAttributeValue(
          node,
          'crossorigin',
        );

        // There should be no embedded script in the script element tag with the src attribute specified
        if (src) {
          const fetchUrl = transformUrl(entryManager.url, src);
          const async = entryManager.findAttributeValue(node, 'async');

          // Scripts with "async" attribute will make the rendering process very complicated,
          // we have a preload mechanism, so we don’t need to deal with it.
          return loader
            .load<JavaScriptManager>(appName, fetchUrl, false, crossOrigin)
            .then(({ resourceManager: jsManager }) => {
              jsManager.setDep(node);
              jsManager.setMimeType(type);
              jsManager.setAsyncAttribute(isAsync(async));
              return jsManager;
            })
            .catch(() => null);
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
              return styleManager;
            })
            .catch(() => null);
        }
      })
      .filter(Boolean),
  );

  // Get all remote modules
  const metaNodes = Promise.all(
    entryManager
      .findAllMetaNodes()
      .map((node) => {
        if (!entryManager.DOMApis.isRemoteModule(node)) return;
        const async = entryManager.findAttributeValue(node, 'async');
        const alias = entryManager.findAttributeValue(node, 'alias');
        if (!isAsync(async)) {
          const src = entryManager.findAttributeValue(node, 'src');
          return loader
            .loadModule(src)
            .then(({ resourceManager: moduleManager }) => {
              moduleManager.setAlias(alias);
              return moduleManager;
            })
            .catch(() => null);
        } else if (alias) {
          warn(`Asynchronous loading module, the alias "${alias}" is invalid.`);
        }
      })
      .filter(Boolean),
  );

  return Promise.all([jsNodes, linkNodes, metaNodes]).then((ls) =>
    ls.map((ns) => ns.filter(Boolean)),
  );
}

export async function processAppResources(loader: Loader, appInfo: AppInfo) {
  let isHtmlMode: Boolean, fakeEntryManager;
  const resources = { js: [], link: [], modules: [] }; // Default resources
  const { resourceManager: entryManager } = await loader.load(
    appInfo.name,
    transformUrl(location.href, appInfo.entry),
  );

  // Html entry
  if (entryManager instanceof TemplateManager) {
    isHtmlMode = true;
    const [js, link, modules] = await fetchStaticResources(
      appInfo.name,
      loader,
      entryManager,
    );
    resources.js = js;
    resources.link = link;
    resources.modules = modules;
  } else if (entryManager instanceof JavaScriptManager) {
    // Js entry
    isHtmlMode = false;
    const mockTemplateCode = `<script src="${entryManager.url}"></script>`;
    fakeEntryManager = new TemplateManager(mockTemplateCode, entryManager.url);
    entryManager.setDep(fakeEntryManager.findAllJsNodes()[0]);
    resources.js = [entryManager];
  } else {
    error(`Entrance wrong type of resource of "${appInfo.name}".`);
  }

  return [fakeEntryManager || entryManager, resources, isHtmlMode];
}
