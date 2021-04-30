import { VText, VNode } from '@garfish/utils';

namespace interfaces {
  export interface Loader {
    takeJsResources: () => void;
  }

  export interface HtmlResourceOpts {
    url: string;
    code: string;
    size: number;
  }

  export interface JsResourceOpts {
    url: string;
    code: string;
    size: number;
    attributes: VNode['attributes'];
  }

  export interface VNode {
    key?: string;
    type: 'element';
    tagName: string;
    children: Array<VNode | VText>;
    attributes: Array<Record<string, string | null>>;
  }
}
