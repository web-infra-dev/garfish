import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { hot, setConfig } from 'react-hot-loader';
import logo from './logo.svg';
import './App.css';

/***
 * 防止控制台后输入hmr 相关 warning
 */
setConfig({
  showReactDomPatchNotification: false,
});

const App = ({
  store = {},
  basename = '',
}: {
  basename?: string;
  store?: Record<string, any>;
}) => {
  const Index = () => {
    return (
      <div>
        <div> This is Home Page.</div>
        {/* {window.Garfish && (
          <div
            className="click-btn"
            onClick={() => {
              window?.Garfish.channel.emit(
                "event",
                "hello, 我是 react 子应用，版本是 v17, 执行操作：store.increment()"
              );
              store.increment();
              console.log("子应用获取 store.amount:", store?.amount);
            }}
          >
            click me
          </div>
        )} */}
      </div>
    );
  };

  const About = () => {
    return <div> This is About Page.</div>;
  };

  return (
    <BrowserRouter basename={basename}>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload. This is React17.
          </p>

          <ul>
            <li>
              <NavLink
                to="/"
                className={(navData) => (navData.isActive ? 'active' : '')}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={(navData) => (navData.isActive ? 'active' : '')}
              >
                About
              </NavLink>
            </li>
          </ul>
          <Routes>
            <Route path="/" element={<Index />}></Route>
            <Route path="/about" element={<About />}></Route>
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
};

export default hot(module)(App);
