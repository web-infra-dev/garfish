import { warn, error, Text, transformUrl, assert } from '@garfish/utils';
import type {
  Loader,
  StyleManager,
  TemplateManager,
  JavaScriptManager,
} from '@garfish/loader';
import type { AppInfo } from './app';
import type { interfaces } from '../interface';

// Fetch `script`, `link` and `module meta` elements
function fetchStaticResources(
  appInfo: AppInfo,
  loader: Loader,
  entryManager: TemplateManager,
  sandboxConfig: false | interfaces.SandboxConfig | undefined,
) {
  const toBoolean = (val) => typeof val !== 'undefined' && val !== 'false';

  // Get all script elements
  const jsNodes = Promise.all(
    entryManager
      .findAllJsNodes()
      .filter((node) => {
        if (sandboxConfig && sandboxConfig.excludeAssetFilter) {
          const src = entryManager.findAttributeValue(node, 'src');
          if (src && sandboxConfig.excludeAssetFilter(src)) {
            return false;
          }
        }
        return true;
      })
      .map((node) => {
        const src = entryManager.findAttributeValue(node, 'src');
        const type = entryManager.findAttributeValue(node, 'type');
        let crossOrigin = entryManager.findAttributeValue(node, 'crossorigin');
        if (crossOrigin === '') {
          crossOrigin = 'anonymous';
        }

        // There should be no embedded script in the script element tag with the src attribute specified
        if (src) {
          const fetchUrl = entryManager.url
            ? transformUrl(entryManager.url, src)
            : src;
          const async = entryManager.findAttributeValue(node, 'async');
          const defer = entryManager.findAttributeValue(node, 'defer');

          // Scripts with "async" attribute will make the rendering process very complicated,
          // we have a preload mechanism, so we don’t need to deal with it.
          return loader
            .load<JavaScriptManager>({
              scope: appInfo.name,
              url: fetchUrl,
              crossOrigin,
              defaultContentType: type,
            })
            .then(({ resourceManager: jsManager }) => {
              if (jsManager) {
                jsManager.setDep(node);
                type && jsManager.setMimeType(type);
                jsManager.setAsyncAttribute(toBoolean(async));
                jsManager.setDefferAttribute(toBoolean(defer));
                return jsManager;
              } else {
                warn(`[${appInfo.name}] Failed to load script: ${fetchUrl}`);
              }
            })
            .catch(() => null);
        } else if (node.children.length > 0) {
          const code = (node.children[0] as Text).content;
          if (code) {
            const jsManager = new loader.JavaScriptManager(code, '');
            jsManager.setDep(node);
            type && jsManager.setMimeType(type);
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
        if (
          appInfo.sandbox &&
          typeof appInfo.sandbox === 'object' &&
          appInfo.sandbox.disableLinkTransformToStyle
        )
          return;
        const href = entryManager.findAttributeValue(node, 'href');
        if (href) {
          const fetchUrl = entryManager.url
            ? transformUrl(entryManager.url, href)
            : href;
          return loader
            .load<StyleManager>({ scope: appInfo.name, url: fetchUrl })
            .then(({ resourceManager: styleManager }) => {
              if (styleManager) {
                styleManager.setDep(node);
                styleManager?.correctPath();
                return styleManager;
              } else {
                warn(`${appInfo.name} Failed to load link: ${fetchUrl}`);
              }
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
        if (!toBoolean(async)) {
          const src = entryManager.findAttributeValue(node, 'src');
          if (src) {
            return loader
              .loadModule(src)
              .then(({ resourceManager: moduleManager }) => {
                if (moduleManager && alias) {
                  moduleManager && moduleManager.setAlias(alias);
                }
                return moduleManager;
              })
              .catch(() => null);
          }
        } else if (alias) {
          warn(`Asynchronous loading module, the alias "${alias}" is invalid.`);
        }
      })
      .filter(Boolean),
  );

  return Promise.all([jsNodes, linkNodes, metaNodes]).then((ls) =>
    ls.map((ns: any) => ns.filter(Boolean)),
  );
}

export async function processAppResources(loader: Loader, appInfo: AppInfo) {
  let isHtmlMode: Boolean = false,
    fakeEntryManager;
  const resources: any = { js: [], link: [], modules: [] }; // Default resources
  assert(appInfo.entry, `[${appInfo.name}] Entry is not specified.`);
  const { resourceManager: entryManager } = await loader.load({
    scope: appInfo.name,
    url: transformUrl(location.href, appInfo.entry),
  });

  // Html entry
  if (entryManager instanceof loader.TemplateManager) {
    isHtmlMode = true;
    const [js, link, modules] = await fetchStaticResources(
      appInfo,
      loader,
      entryManager,
      appInfo.sandbox,
    );
    resources.js = js;
    resources.link = link;
    resources.modules = modules;
  } else if (entryManager instanceof loader.JavaScriptManager) {
    // Js entry
    isHtmlMode = false;
    const mockTemplateCode = `<script src="${entryManager.url}"></script>`;
    fakeEntryManager = new loader.TemplateManager(
      mockTemplateCode,
      entryManager.url,
    );
    entryManager.setDep(fakeEntryManager.findAllJsNodes()[0]);
    resources.js = [entryManager];
  } else {
    error(`Entrance wrong type of resource of "${appInfo.name}".`);
  }

  return [fakeEntryManager || entryManager, resources, isHtmlMode];
}
