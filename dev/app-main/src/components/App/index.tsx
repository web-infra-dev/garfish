import { useEffect, useState, useRef, useCallback } from 'react';
import { Layout, Menu, Breadcrumb, Button } from '@arco-design/web-react';
import {
  IconCaretRight,
  IconCaretLeft,
  IconPlus,
  IconMinus,
} from '@arco-design/web-react/icon';
import './index.less';
import { basename } from '../../constant';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { observer } from 'mobx-react';
import { hot, setConfig } from 'react-hot-loader';
import { subAppMenus } from './constant';
import logo from '../../static/img/Garfish.png';
import homeSvg from '../../static/icons/Home.svg';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const Sider = Layout.Sider;
const Header = Layout.Header;
const Footer = Layout.Footer;
const Content = Layout.Content;

setConfig({
  showReactDomPatchNotification: false,
});

const App = observer(({ store }: { store: any }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const storeRef = useRef(store);
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [breadcrumbData, setBreadcrumbData] = useState<Array<string>>([]);

  // 当 store 变化时，才 emit stateChange
  useEffect(() => {
    if (storeRef.current !== store.counter) {
      storeRef.current = JSON.stringify(store);
      window?.Garfish.channel.emit('stateChange');
    }
  }, [JSON.stringify(store)]);

  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== `/${basename}`) {
      const _path = location.pathname.replace(`/${basename}/`, '');
      setSelectedKeys([_path]);
      setBreadcrumbData(_path.split('/'));
      store.setActiveApp(_path);
    }
  }, [location]);

  const handleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const getSubMenu = () => {
    return subAppMenus.map((v) => {
      return v.routes?.length > 0 ? (
        <SubMenu
          key={v.key}
          title={
            <span>
              {v.icon}
              {v.title}
            </span>
          }
        >
          {v.routes.map((k) => {
            return (
              <MenuItem
                key={k.path}
                onClick={() => navigate(`/${basename}/${k.path}`)}
              >
                {k.title}
              </MenuItem>
            );
          })}
        </SubMenu>
      ) : (
        <MenuItem key={v.key} onClick={() => navigate(`/${basename}/${v.key}`)}>
          {v.icon}
          {v.title}
        </MenuItem>
      );
    });
  };
  return (
    <Layout>
      <Sider
        collapsed={collapsed}
        resizeDirections={['right']}
        collapsible
        trigger={null}
        breakpoint="xl"
      >
        <div className="logo">
          <img src={logo} alt="logo" />
          {!collapsed && <h1> Garfish example</h1>}
        </div>

        <Menu
          defaultOpenKeys={['react17']}
          selectedKeys={selectedKeys}
          style={{ width: '100%' }}
        >
          <MenuItem key="home" onClick={() => navigate(`/${basename}/home`)}>
            <img src={homeSvg} className="sidebar-item-icon" />
            【主应用】首页
          </MenuItem>
          {getSubMenu()}
        </Menu>
      </Sider>
      <Layout>
        <Header>
          <Button shape="round" onClick={handleCollapsed}>
            {collapsed ? <IconCaretRight /> : <IconCaretLeft />}
          </Button>
          <h3 className="trigger" style={{ display: 'inline-block' }}>
            全局 Counter: {store.counter}
          </h3>

          <Button
            style={{ margin: '0 10px' }}
            type="primary"
            onClick={() => store.increment()}
            size="mini"
          >
            <IconPlus />
          </Button>
          <Button size="mini" type="primary" onClick={() => store.decrement()}>
            <IconMinus />
          </Button>
        </Header>
        <Layout style={{ padding: '0 24px' }}>
          {
            <Breadcrumb style={{ margin: '16px 0' }}>
              {breadcrumbData.map((v) => (
                <Breadcrumb.Item key={v}>{v}</Breadcrumb.Item>
              ))}
            </Breadcrumb>
          }

          <Content>
            <Outlet />
            <div id="submodule"></div>
            <div id="sub-container"></div>
          </Content>
          <Footer> </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
});

export default hot(module)(App);
