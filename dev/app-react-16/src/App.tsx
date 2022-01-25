import React, { useEffect, useState } from 'react';
import { Switch, Route, NavLink, useLocation } from 'react-router-dom';
import { hot, setConfig } from 'react-hot-loader';
import logo from './logo.svg';
import './App.css';
import { SubAppContext } from './root';

setConfig({
  showReactDomPatchNotification: false,
});

type AppTypes = {
  basename?: string;
  store?: Record<string, any>;
};

const Index = () => {
  return (
    <div>
      <input type="text" />
      This is Home Page.
    </div>
  );
};

const About = () => {
  return <div>This is About Page. </div>;
};

export interface IProps {
  basename?: string;
  store?: Record<string, any>;
}

const App = ({ basename = '', store = {} }: AppTypes) => {
  const location = useLocation();
  const [isActive, setIsActive] = useState('home');

  useEffect(() => {
    setIsActive(location.pathname.includes('about') ? 'about' : 'home');
  }, [location.pathname]);

  return (
    <SubAppContext.Consumer>
      {({ basename, store }: IProps) => {
        return (
          <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Thank you for the React applications use garfish.
                <span style={{ color: 'aqua' }}> This is React16.</span>
              </p>
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <ul>
                <li onClick={() => setIsActive('home')}>
                  <NavLink
                    to="/"
                    className={isActive === 'home' ? 'tabActive' : ''}
                  >
                    Home
                  </NavLink>
                </li>
                <li onClick={() => setIsActive('about')}>
                  <NavLink
                    to="/about"
                    className={isActive === 'about' ? 'tabActive' : ''}
                  >
                    About
                  </NavLink>
                </li>
              </ul>
              <Switch>
                <Route path="/" exact component={Index}></Route>
                <Route path="/about" component={About}></Route>
              </Switch>
            </header>
          </div>
        );
      }}
    </SubAppContext.Consumer>
  );
};

export default App;
