import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { hot, setConfig } from 'react-hot-loader';
import logo from './logo.svg';
import './App.css';
import { SubAppContext } from './root';
import Home from './Home';
import About from './About';

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
          <BrowserRouter basename={basename}>
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>This is React17.</p>
                <p>
                  Edit <code>src/App.js</code> and save to reload.
                </p>

                <div style={{ color: 'deepskyblue' }}>
                  来自主应用的数据-store.counter {store?.counter}
                  {window.Garfish && (
                    <div
                      className="click-btn"
                      onClick={() => {
                        window?.Garfish.channel.emit(
                          'event',
                          'hello, 我是 react 子应用，版本是 v17, 执行操作：store.increment()',
                        );
                        store && store.increment();
                        console.log(
                          '子应用获取 store.counter:',
                          store?.counter,
                        );
                      }}
                    >
                      increase counter
                    </div>
                  )}
                </div>

                <ul>
                  <li>
                    <NavLink
                      to="/"
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
          </BrowserRouter>
        );
      }}
    </SubAppContext.Consumer>
  );
};

export default hot(module)(App);
