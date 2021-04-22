import {
  createElement,
  createLinkNode,
  createScriptNode,
  createStyleNode,
  findProp,
  isCssLink,
  isJs,
  isPrefetchJsLink,
  parseContentType,
  rawDocument,
  rawWindow,
  toResolveUrl,
  transformCssUrl,
  VText,
  warn,
} from '@garfish/utils';
import { ResourceModules } from './app';
import { HtmlResource } from './source';

export function renderContainer(
  entryResManager: HtmlResource,
  baseUrl: string,
  container: HTMLElement,
  strictIsolation: boolean,
  resources: ResourceModules,
  execScript: Function
) {
  entryResManager.renderElements(
    {
      meta: () => null,
      a: (vnode) => {
        toResolveUrl(vnode, 'href', baseUrl);
        return createElement(vnode);
      },
      img: (vnode) => {
        toResolveUrl(vnode, 'src', baseUrl);
        return createElement(vnode);
      },
      // body 和 head 这样处理是为了兼容旧版本
      body: (vnode) => {
        if (!strictIsolation) {
          vnode.tagName = 'div';
          vnode.attributes.push({
            key: '__GarfishMockBody__',
            value: null,
          });
          return createElement(vnode);
        } else {
          return createElement(vnode);
        }
      },
      head: (vnode) => {
        if (!strictIsolation) {
          vnode.tagName = 'div';
          vnode.attributes.push({
            key: '__GarfishMockHead__',
            value: null,
          });
          return createElement(vnode);
        } else {
          return createElement(vnode);
        }
      },
      script: (vnode) => {
        const type = findProp(vnode, 'type');
        const mimeType = type?.value;
        if (mimeType) {
          if (mimeType === 'module') return null;
          if (!isJs(parseContentType(mimeType))) {
            return createElement(vnode);
          }
        }

        const resource = resources.js.find((manager) => {
          if (!(manager as any).async) {
            if (vnode.key) {
              return vnode.key === (manager as any).key;
            }
          }
          return false;
        });

        if (resource) {
          const { code, url } = (resource as any).opts;
          execScript(code, {}, url, {
            async: false,
            noEntry: !!findProp(vnode, 'no-entry'),
          });
        } else if (__DEV__) {
          const async = findProp(vnode, 'async');
          if (!async) {
            const nodeStr = JSON.stringify(vnode, null, 2);
            warn(`The current js node cannot be found.\n\n ${nodeStr}`);
          }
        }
        return createScriptNode(vnode);
      },

      style: (vnode) => {
        const text = vnode.children[0] as VText;
        if (text) {
          text.content = transformCssUrl(baseUrl, text.content);
        }
        return createElement(vnode);
      },

      link: (vnode) => {
        if (isCssLink(vnode)) {
          const href = findProp(vnode, 'href');
          const resource = resources.link.find(
            ({ opts }) => opts.url === href?.value,
          );
          if (!resource) {
            return createElement(vnode);
          }

          const { url, code } = resource.opts;
          const content = __DEV__
            ? `\n/*${createLinkNode(vnode)}*/\n${code}`
            : code;

          if (resource.type !== 'css') {
            warn(`The current resource type does not match. "${url}"`);
            return null;
          }
          return createStyleNode(content);
        }
        return isPrefetchJsLink(vnode)
          ? createScriptNode(vnode)
          : createElement(vnode);
      },
    },
    container,
  );
}
