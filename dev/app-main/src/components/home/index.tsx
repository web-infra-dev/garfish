import { observer } from 'mobx-react';
import { useState, useCallback, useEffect } from 'react';
import { Grid, Tabs, Spin } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import Garfish from 'garfish';
import MDEditor from '@uiw/react-md-editor';
import AppLink from '../Link';
import CardItem from '../CardItem';
import { loadAppFunc } from '../loadApp/loadAppFunc';
import {
  featuresStr,
  toSubAppStr,
  loadAppStr,
  channelStr,
  upgradeStr,
  getAppBasicInfo,
} from '../mdStr';
import './index.less';

const Row = Grid.Row;
const Col = Grid.Col;

const TabPane = Tabs.TabPane;

const HomePage = observer(({ store }) => {
  const navigate = useNavigate();
  const [bascInfo, setBascInfo] = useState('');
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [text, setText] = useState('【主应用】动态加载应用');
  const [app, setApp] = useState<any>(null);
  const [loadAsync, setLoadAsync] = useState(false);

  const loadApplication = useCallback(async () => {
    setActiveTab('loadApp');
    if (!app) {
      setLoadAsync(true);

      Garfish.router.push({
        path: '/main/index/detail',
        query: { id: '002' },
      });

      const app = await loadAppFunc({
        appName: 'vue2',
        domID: 'loadApp_mount',
        basename: '/examples/main/index',
      });

      setApp(app);
      setLoadAsync(false);
      setText('隐藏');
    } else {
      app.display ? setText('显示') : setText('隐藏');
      app.display ? app.hide() : app.show();
    }
  }, [app]);

  useEffect(() => {
    return () => {
      app && app.hide();
    };
  }, [app]);

  useEffect(() => {
    window.Garfish.appInfos &&
      Object.keys(window.Garfish.appInfos).length > 0 &&
      setBascInfo(getAppBasicInfo(window.Garfish.appInfos));
  }, [window.Garfish.appInfos]);

  return (
    <Row
      gutter={[24, 12]}
      style={{
        marginBottom: 16,
        backgroundColor: 'var(--color-fill-2)',
      }}
    >
      <Col span={8} className="card-columns">
        <CardItem
          title="访问子应用"
          href="https://garfishjs.org/quickStart"
          content={
            <div className="content-wrapper">
              {store.apps.map((v: any) => (
                <AppLink key={v.name} href={v.entry}>
                  {v.name}
                </AppLink>
              ))}
            </div>
          }
        />

        <CardItem
          title="跳转 react 子应用"
          onClick={() => {
            // navigate(`/${basename}/react17`);
            Garfish.router.push({
              path: '/react17/home',
            });
            // Garfish.router.push({
            //   path: '/react17/detail',
            //   query: { id: '002' },
            // });
          }}
          href="https://garfishjs.org/api/router/#routerpush"
          markdownStr={toSubAppStr}
        />

        <CardItem
          title={text}
          onClick={loadApplication}
          href="https://garfishjs.org/api/loadApp"
          markdownStr={loadAppStr}
        />

        <CardItem
          title="与子应用通信"
          onClick={() =>
            window?.Garfish?.channel.emit('sayHello', 'hello, i am main app')
          }
          href="https://garfishjs.org/api/channel"
          markdownStr={channelStr}
        />
      </Col>

      <Col span={16}>
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabPane key="basicInfo" title="example信息">
            <MDEditor.Markdown source={bascInfo} linkTarget="_blank" />
          </TabPane>
          <TabPane key="features" title="已实现feature">
            <MDEditor.Markdown source={featuresStr} linkTarget="_blank" />
          </TabPane>
          <TabPane key="loadApp" title="子应用挂载">
            <div id="loadApp_mount">
              {loadAsync && <Spin style={{ marginTop: '200px' }} />}
            </div>
          </TabPane>
          <TabPane key="upgrade" title="如何升级">
            <MDEditor.Markdown source={upgradeStr} linkTarget="_blank" />
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  );
});

export default HomePage;
