import { useState, useEffect } from 'react';
import Garfish from 'garfish';
import { basename, loadApp } from './constant';
import portMap from '../../config.json';

export const loadAppFunc = async ({ id, appName, domID }) => {
  // const [app, setApp] = useState<any>();

  let app;
  const loadPromise = () => {
    // 模拟异步请求
    return new Promise<any>(async (resolve, reject) => {
      // setTimeout(async () => {
      //   const _app = await Garfish.loadApp(id, {
      //     entry: `http://localhost:${portMap[appName].port}`,
      //     basename: `${basename}/${loadApp}`,
      //     domGetter: () => document.getElementById(domID),

      //     // 缓存设置，建议开启缓存避免重复的编译代码造成的性能浪费
      //     cache: true,
      //   });
      //   resolve(_app);
      // }, 1000);

      const _app = await Garfish.loadApp(id, {
        entry: `http://localhost:${portMap[appName].port}`,
        basename: `${basename}/${loadApp}`,
        domGetter: () => document.getElementById(domID),

        // 缓存设置，建议开启缓存避免重复的编译代码造成的性能浪费
        cache: true,
      });
      resolve(_app);
    });
  };

  const mountApp = async () => {
    // setApp(_app);
    app = await loadPromise();
    // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
    app && !app.mounted ? await app.mount() : app?.show();
  };

  // useEffect(() => {
  //   mountApp();
  //   return () => {
  //     app?.hide();
  //   };
  // }, [app]);

  await mountApp();
  // const app = await loadPromise();
  return app;
};
