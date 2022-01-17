import { Routes, Route, NavLink } from 'react-router-dom';
import { hot, setConfig } from 'react-hot-loader';
import logo from './logo.svg';
import './App.css';
import { Grid, Button } from '@arco-design/web-react';
import { SubAppContext } from './root';
import Home from './Home';
import About from './About';

const Row = Grid.Row;
const Col = Grid.Col;

// 防止控制台后输入hmr 相关 warning
setConfig({
  showReactDomPatchNotification: false,
});
export interface IProps {
  basename?: string;
  store?: Record<string, any>;
}

const App = () => {
  return (
    <SubAppContext.Consumer>
      {({ basename, store }: IProps) => {
        return (
          <Row
            className="grid-demo"
            gutter={[24, 12]}
            style={{
              marginBottom: 16,
              backgroundColor: 'var(--color-fill-2)',
            }}
          >
            <Col span={8} className="col-btn">
              <Button
                onClick={() => {
                  window.history.replaceState(null, '', '/examples/home');
                }}
                type="primary"
              >
                【子应用react17】返回主应用
              </Button>

              <Button
                onClick={() =>
                  window?.Garfish.channel.emit(
                    'event',
                    'hello, 我是 react17 子应用',
                  )
                }
                type="primary"
              >
                【子应用 react17】和主应用通信
              </Button>

              <Button onClick={() => store && store.increment()} type="primary">
                【子应用 react17】操作全局状态（increase counter）
              </Button>
            </Col>
            <Col span={16}>
              <div className="App">
                <header className="App-header">
                  <img src={logo} className="App-logo" alt="logo" />
                  <p>This is React17.</p>
                  <p>
                    Edit <code>src/App.js</code> and save to reload.
                  </p>

                  <h3 style={{ color: 'deepskyblue' }}>
                    【store.counter】: {store?.counter}
                    {window.Garfish && (
                      <div
                        className="click-btn"
                        onClick={() => store && store.increment()}
                      >
                        increase counter
                      </div>
                    )}
                  </h3>

                  <ul>
                    <li>
                      <NavLink
                        to="/home"
                        className={(navData) =>
                          navData.isActive ? 'active' : ''
                        }
                      >
                        Home
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/about"
                        className={(navData) =>
                          navData.isActive ? 'active' : ''
                        }
                      >
                        About
                      </NavLink>
                    </li>
                  </ul>
                  <Routes>
                    <Route path="/" element={<Home />}></Route>
                    <Route path="/about" element={<About />}></Route>
                  </Routes>
                </header>
              </div>
            </Col>
          </Row>
        );
      }}
    </SubAppContext.Consumer>
  );
};

export default hot(module)(App);
