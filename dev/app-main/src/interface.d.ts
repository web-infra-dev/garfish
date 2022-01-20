export type AppInfos = {
  name: string;
  entry: string;
  activeWhen?: string | ((path: string) => boolean);
  cache?: boolean;
  domGetter?: string | (() => Element);
};

export interface LoadDataOptions {
  // 在 Goofy 上注册的主应用路由
  url: string;

  // 获取失败时重试次数，默认为 3
  maxRetry?: number;
}
export interface LoadDataWithRouteIdOptions {
  // Goofy 提供的默认域名，只能在内网或者 Node 环境访问，不同环境不一样，具体如下：
  // CN：https://goofy.bytedance.net/api/garfish_mod/v1/modlist
  // BOE：https://goofy-boe.bytedance.net/api/garfish_mod/v1/modlist
  // BOE I18n: https://gf-boei18n.bytedance.net/api/garfish_mod/v1/modlist
  // US: https://goofy-us.bytedance.net/api/garfish_mod/v1/modlist
  // I18n: https://goofy-i18n.bytedance.net/api/garfish_mod/v1/modlist
  url: string;

  // 获取失败时重试次数，默认为 3
  maxRetry?: number;

  /* 下面是微前端相关参数 */

  // 在 Goofy 上注册的主应用路由 ID，具体获取方式查看下面“ 如何在 Goofy 平台上获取主应用路由 ID”
  rid: number;

  // 传递给服务器端计算小流量的 cookie
  cookie?: Record<string, string>;

  // 传递给服务器端计算小流量的 query
  query?: Record<string, string>;

  // 传递给服务器端计算小流量的用户 ID
  uid?: number;

  // 传递给服务器端计算小流量的 header
  header?: Record<string, string>;
}
export interface MicroFrontendModule {
  // 子应用名
  name: string;

  // 子应用入口文件地址
  source_url: string;

  // 子应用版本
  version: string;

  // 自定义内容
  content: Record<string, string>;
}
export interface MicroFrontendDataRes {
  // 状态吗，0 表示成功，其他表示失败
  code: number;

  // 子模块列表
  data: Array<MicroFrontendModule> | null;

  // 在平台定义的菜单信息
  menu?: string;
}
