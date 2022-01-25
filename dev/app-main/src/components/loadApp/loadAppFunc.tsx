import Garfish from 'garfish';
import portMap from '../../../../config.json';

export const loadAppFunc = async ({ id, appName, basename, domID }) => {
  let app;
  const loadPromise = () => {
    // 模拟异步请求
    return new Promise<any>(async (resolve, reject) => {
      setTimeout(async () => {
        const app = await Garfish.loadApp(id, {
          entry:
            process.env.NODE_ENV === 'development'
              ? `http://localhost:${portMap[appName].port}`
              : '',
          basename,
          domGetter: () => document.getElementById(domID),
          // 缓存设置，建议开启缓存避免重复的编译代码造成的性能浪费
          cache: true,
        });
        resolve(app);
      }, 1000);
    });
  };

  const mountApp = async () => {
    app = await loadPromise();
    // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
    app && !app.mounted ? await app.mount() : app?.show();
  };

  await mountApp();
  return app;
};
