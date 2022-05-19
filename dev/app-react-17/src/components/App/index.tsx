import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppInfo } from '@garfish/bridge-react';
import { Layout, Grid, Modal, Menu } from '@arco-design/web-react';
import CardItem from '../CardItem';
import { SubAppContext } from '../root';
import {
  backToMainStr,
  channelWithMainStr,
  increaseStr,
  toVue3Str,
} from '../../constant';
import './index.less';

const Row = Grid.Row;
const Col = Grid.Col;
const Content = Layout.Content;

export interface IProps {
  basename?: string;
  store?: Record<string, any>;
}

const MenuItem = Menu.Item;

const App = () => {
  const [visible, setVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>(['1']);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setSelectedKeys([location.pathname.replace('/', '')]);
  }, [location]);

  return (
    <SubAppContext.Consumer>
      {(appInfo: AppInfo) => {
        return (
          <Content>
            <Row
              gutter={[24, 12]}
              style={{
                marginBottom: 16,
                backgroundColor: 'var(--color-fill-2)',
              }}
            >
              <Col span={8} className="card-columns">
                <CardItem
                  title="返回主应用"
                  onClick={() =>
                    // window.history.replaceState(null, '', '/examples/main/index')
                    window.Garfish.router.push({ path: '/main/index' })
                  }
                  href="https://garfishjs.org/api/router"
                  markdownStr={backToMainStr}
                />

                <CardItem
                  title="跳转vue3"
                  onClick={() => {
                    // window.history.replaceState(
                    //   null,
                    //   '',
                    //   '/examples/vue3/home',
                    // );
                    window.Garfish.router.push({ path: '/vue3/home' });
                  }}
                  href="https://garfishjs.org/api/router"
                  markdownStr={toVue3Str}
                />

                <CardItem
                  title="Modal 弹窗"
                  onClick={() => setVisible(true)}
                  href="https://garfishjs.org/api/channel"
                />
                <CardItem
                  title="和主应用通信"
                  onClick={() => {
                    window?.Garfish.channel.emit(
                      'event',
                      'hello, 我是 react17 子应用',
                    );
                  }}
                  href="https://garfishjs.org/api/channel"
                  markdownStr={channelWithMainStr}
                />

                <CardItem
                  title="increase global counter"
                  onClick={() =>
                    appInfo.props.store && appInfo.props.store.increment()
                  }
                  markdownStr={increaseStr}
                />

                {/* <CardItem
                  title="获取主应用window变量"
                  onClick={() => {
                    console.log(' window.testName');
                  }}
                  href="https://garfishjs.org/api/channel"
                  markdownStr={hmrStr}
                /> */}
              </Col>
              <Col span={16}>
                <Menu
                  mode="horizontal"
                  selectedKeys={selectedKeys}
                  onClickMenuItem={(v) => setSelectedKeys([v])}
                >
                  <MenuItem
                    key="home"
                    onClick={() => navigate({ pathname: '/home' })}
                  >
                    Home
                  </MenuItem>
                  <MenuItem
                    key="list"
                    onClick={() => navigate({ pathname: '/list' })}
                  >
                    员工列表
                  </MenuItem>
                  <MenuItem
                    key="detail"
                    onClick={() => navigate({ pathname: '/detail?id=002' })}
                  >
                    员工详情
                  </MenuItem>
                </Menu>
                <div className="App-header">
                  <Outlet></Outlet>
                </div>
              </Col>
            </Row>
            <Modal
              title="Sub APP React 17"
              visible={visible}
              onOk={() => setVisible(false)}
              onCancel={() => setVisible(false)}
              autoFocus={false}
              focusLock={true}
            >
              <p>
                You can customize modal body text by the current situation. This
                modal will be closed immediately once you press the OK button.
              </p>
            </Modal>
          </Content>
        );
      }}
    </SubAppContext.Consumer>
  );
};

export default App;
