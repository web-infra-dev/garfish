import { useState, useCallback, useEffect } from 'react';
import { Grid, Tabs, Input, Checkbox } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react';
import { loadAppFunc } from '../loadApp/loadAppFunc';
import { Spin } from '@arco-design/web-react';
import './index.less';
import Garfish from 'garfish';
import MDEditor from '@uiw/react-md-editor';
import AppLink from '../Link';
import CardItem from '../CardItem';
import {
  basicInfoStr_dev,
  basicInfoStr_prod,
  featuresStr,
  toSubAppStr,
  loadAppStr,
  channelStr,
  upgradeStr,
} from '../mdStr';

const Row = Grid.Row;
const Col = Grid.Col;

const TabPane = Tabs.TabPane;

const HomePage = observer(({ store }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basicInfo');
  const [text, setText] = useState('【主应用】手动挂载应用');
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
        id: 'loadApp_react17',
        domID: 'loadApp_mount',
        appName: 'vue2',
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
          title="访问独立子应用"
          href="https://garfish.top/quick-start"
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
          title="跳转子应用 react17 详情页"
          onClick={() => {
            // navigate(`/${basename}/react17`);
            Garfish.router.push({
              path: '/react17/detail',
              query: { id: '002' },
            });
          }}
          href="https://garfish.top/api/router/#routerpush"
          markdownStr={toSubAppStr}
        />

        <CardItem
          title={text}
          onClick={loadApplication}
          href="https://garfish.top/api/loadApp"
          markdownStr={loadAppStr}
        />

        <CardItem
          title="测试热更新"
          onClick={() => setActiveTab('HMR')}
          href="https://garfish.top/api/channel"
          markdownStr={channelStr}
        />

        <CardItem
          title="与子应用通信"
          onClick={() =>
            window?.Garfish.channel.emit('sayHello', 'hello, i am main app')
          }
          href="https://garfish.top/api/channel"
          markdownStr={channelStr}
        />

        {/* <CardItem
          title="设置window变量"
          onClick={() => {
            window.testName = 'danping';
          }}
          href="https://garfish.top/api/channel"
          markdownStr={channelStr}
        /> */}
      </Col>

      <Col span={16}>
        <Tabs activeTab={activeTab} onChange={setActiveTab}>
          <TabPane key="basicInfo" title="example信息">
            <MDEditor.Markdown
              source={
                process.env.NODE_ENV === 'development'
                  ? basicInfoStr_dev
                  : basicInfoStr_prod
              }
              linkTarget="_blank"
            />
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
