import { validURL } from '@garfish/utils';
import { RouterConfig, __GARFISH_ROUTER_UPDATE_FLAG__ } from './config';

function createPopStateEvent(state: any, originalMethodName: string) {
  let evt;
  try {
    evt = new PopStateEvent('popstate', { state });
  } catch (err) {
    // IE 11 compatibility
    evt = document.createEvent('PopStateEvent');
    (evt as any).initPopStateEvent('popstate', false, false, state);
  }
  (evt as any).gar = true;
  (evt as any).garTrigger = originalMethodName;
  return evt;
}

export const callCapturedEventListeners = (type: keyof History) => {
  const eventArguments = createPopStateEvent(window.history.state, type);
  window.dispatchEvent(eventArguments);
};

const handlerParams = function (
  path: string,
  query: { [key: string]: string },
  basename?: string,
): string {
  if (!path || typeof path !== 'string') return '';
  let url = path;
  if (url[0] !== '/') url = '/' + url;
  if (Object.prototype.toString.call(query) === '[object Object]') {
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    url += qs ? '?' + qs : '';
  }
  if (basename !== '/') url = basename + url;
  if (url[0] !== '/') url = '/' + url;
  return url;
};

export const push = ({
  path,
  query,
  basename,
}: {
  path: string;
  query?: { [key: string]: string };
  basename?: string;
}) => {
  if (!basename) basename = RouterConfig.basename;

  let url = null;
  if (validURL(path)) {
    url = /(^https?:)|(^\/\/)/.test(path) ? path : `//${path}`;
  } else {
    url = handlerParams(path, query!, basename);
  }
  // 不保留之前history.state的状态会导致vue3依赖state的情况无法正常渲染页面
  history.pushState(
    { [__GARFISH_ROUTER_UPDATE_FLAG__]: true, ...history.state },
    '',
    url,
  );
};

export const replace = ({
  path,
  query,
  basename,
}: {
  path: string;
  query?: { [key: string]: string };
  basename?: string;
}) => {
  if (!basename) basename = RouterConfig.basename;

  let url = null;
  if (validURL(path)) {
    url = /^(https?:)(\/\/)/.test(path) ? path : `//${path}`;
  } else {
    url = handlerParams(path, query!, basename);
  }
  history.replaceState(
    { [__GARFISH_ROUTER_UPDATE_FLAG__]: true, ...history.state },
    '',
    url,
  );
};
