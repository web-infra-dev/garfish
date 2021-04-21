import { createKey, transformCssUrl, VNode } from "@garfish/utils/src";

export interface JsResourceOpts {
  url: string;
  code: string;
  size: number;
  attributes: VNode['attributes'];
}

export interface CssResourceOpts {
  url: string;
  code: string;
  size: number;
}

export class JsResource {
  type = 'js';
  key = createKey();
  opts: JsResourceOpts;
  constructor(opts: JsResourceOpts) {
    this.opts = opts;
  }
}

export class CssResource {
  type = 'css';
  opts: CssResourceOpts;
  constructor(opts: CssResourceOpts) {
    if (opts.url) {
      opts.code = transformCssUrl(opts.url, opts.code);
    }
    this.opts = opts;
  }
}
