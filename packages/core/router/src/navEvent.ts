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
  if (RouterConfig.basename !== '/') url = RouterConfig.basename + url;
  if (url[0] !== '/') url = '/' + url;
  return url;
};

export const push = ({
  path,
  query,
}: {
  path: string;
  query?: { [key: string]: string };
}) => {
  const url = handlerParams(path, query!);
  history.pushState({ [__GARFISH_ROUTER_UPDATE_FLAG__]: true }, '', url);
};

export const replace = ({
  path,
  query,
}: {
  path: string;
  query?: { [key: string]: string };
}) => {
  const url = handlerParams(path, query!);
  history.replaceState({ [__GARFISH_ROUTER_UPDATE_FLAG__]: true }, '', url);
};
