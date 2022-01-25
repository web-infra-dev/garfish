import { useState, useEffect } from 'react';
import Garfish from '@byted/garfish';
import { Spin } from '@arco-design/web-react';
import { basename, loadApp } from '../../constant';
import portMap from '../../../../config.json';

function LoadApp({ id, appName, domID }) {
  const [app, setApp] = useState<any>();

  const loadPromise = () => {
    // 模拟异步请求
    return new Promise<any>((resolve, reject) => {
      setTimeout(async () => {
        const _app = await Garfish.loadApp(id, {
          entry: `http://localhost:${portMap[appName].port}`,
          basename: `${basename}/${loadApp}`,
          domGetter: () => document.getElementById(domID),
          // 缓存设置，建议开启缓存避免重复的编译代码造成的性能浪费
          cache: true,
        });
        resolve(_app);
      }, 1000);
    });
  };

  const mountApp = async () => {
    const _app = await loadPromise();
    setApp(_app);
    // 若已经渲染触发 show，只有首次渲染触发 mount，后面渲染都可以触发 show 提供性能
    _app && !_app.mounted ? await _app.mount() : _app?.show();
  };

  useEffect(() => {
    mountApp();
    return () => {
      app?.hide();
    };
  }, [app]);

  return (
    <div id={domID} style={{ textAlign: 'center' }}>
      {!app ? (
        <div style={{ marginTop: '10%' }}>
          {' '}
          <Spin />{' '}
        </div>
      ) : (
        ''
      )}
    </div>
  );
}

export default LoadApp;
