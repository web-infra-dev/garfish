import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from '@arco-design/web-react';
import './index.less';
import { Layout, Grid, Modal, Message } from '@arco-design/web-react';
import { SubAppContext } from '../root';
import CardItem from '../CardItem';
import {
  backToMainStr,
  channelWithMainStr,
  increaseStr,
  hmrStr,
  toVue3Str,
} from '../../constant';

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
  const handleMsg = (msg) => Message.info(msg);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window?.Garfish?.channel.on('sayHello', handleMsg);
    return () => {
      window?.Garfish.channel.removeListener('sayHello', handleMsg);
    };
  }, []);

  useEffect(() => {
    setSelectedKeys([location.pathname.replace('/', '')]);
  }, [location]);

  return (
    <SubAppContext.Consumer>
      {({ basename, store }: any) => {
        return (
          <Content>
            <Row
              className="grid-demo"
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
                  href="https://garfish.top/api/router"
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
                  href="https://garfish.top/api/router"
                  markdownStr={toVue3Str}
                />

                <CardItem
                  title="Modal 弹窗"
                  onClick={() => setVisible(true)}
                  href="https://garfish.top/api/channel"
                />
                <CardItem
                  title="和主应用通信"
                  onClick={() => {
                    window?.Garfish.channel.emit(
                      'event',
                      'hello, 我是 react17 子应用',
                    );
                  }}
                  href="https://garfish.top/api/channel"
                  markdownStr={channelWithMainStr}
                />

                <CardItem
                  title="increase global counter"
                  onClick={() => store && store.increment()}
                  markdownStr={increaseStr}
                />

                <CardItem title="支持应用热更新(hmr)" markdownStr={hmrStr} />

                <CardItem
                  title="获取主应用window变量"
                  onClick={() => {
                    console.log(' window.testName');
                  }}
                  href="https://garfish.top/api/channel"
                  markdownStr={hmrStr}
                />
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
