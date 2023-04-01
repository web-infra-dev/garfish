import { Sandbox } from '../sandbox';
const rawMatchMedia = window.matchMedia;

type MatchMediaResult = ReturnType<typeof matchMedia>;

export function matchMediaModule(_sandbox: Sandbox) {
  const matchMediaSet = new Set<{
    matchMedia: MatchMediaResult;
    type: any;
    listener: any;
  }>();

  function ProxyMatchMedia(...args: Parameters<typeof matchMedia>) {
    const res = rawMatchMedia(...args);
    const nativeAddListener = res.addListener;
    const nativeAddEventListener = res.addEventListener;
    const proxyAddListener = (
      ..._args: Parameters<MatchMediaResult['addListener']>
    ) => {
      const [listener] = _args;
      nativeAddListener.apply(res, [listener]);
      matchMediaSet.add({
        matchMedia: res,
        type: 'change',
        listener,
      });
    };
    const proxyAddEventListener = (
      ..._args1: Parameters<MatchMediaResult['addEventListener']>
    ) => {
      const [type, listener, options] = _args1;
      nativeAddEventListener.apply(res, [type, listener, options]);
      matchMediaSet.add({
        matchMedia: res,
        type,
        listener,
      });
    };
    res.addListener = proxyAddListener.bind(res);
    res.addEventListener = proxyAddEventListener.bind(res);
    return res;
  }

  const recover = () => {
    matchMediaSet.forEach((md) => {
      md.matchMedia.removeEventListener(md.type, md.listener);
    });
  };

  return {
    recover,
    override: {
      matchMedia: ProxyMatchMedia,
    },
  };
}
