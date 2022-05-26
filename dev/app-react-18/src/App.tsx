import { useEffect, useState, createContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Layout } from '@arco-design/web-react';
import logo from './logo.svg';
import './App.less';
import { AppInfo } from '@garfish/bridge-react-v18';
// import { AppInfo } from '@garfish/bridge-react-v18';
export const SubAppContext = createContext({});
const Content = Layout.Content;

export const prefixCls = 'sub-app-react18';

type AppTypes = {
  basename?: string;
  store?: Record<string, any>;
};

const App = () => {
  const location = useLocation();
  const [isActive, setIsActive] = useState('home');

  useEffect(() => {
    setIsActive(location.pathname.includes('about') ? 'about' : 'home');
  }, [location.pathname]);

  return (
    <SubAppContext.Consumer>
      {(appInfo: AppTypes) => {
        return (
          <Content>
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                  Thank you for the React applications use garfish.
                  <span style={{ color: 'aqua' }}> This is React18. </span>
                </p>
                <p>
                  Edit <code>src/App.js</code> and save to reload.
                </p>

                <ul>
                  <li onClick={() => setIsActive('home')}>
                    <NavLink
                      to="/home"
                      className={isActive === 'home' ? 'tabActive' : ''}
                    >
                      Home
                    </NavLink>
                  </li>
                  <li onClick={() => setIsActive('about')}>
                    <NavLink
                      to="/about"
                      className={isActive === 'home' ? 'tabActive' : ''}
                    >
                      About
                    </NavLink>
                  </li>
                </ul>
              </header>
              <Outlet />
            </div>
          </Content>
        );
      }}
    </SubAppContext.Consumer>
  );
};

export default App;
