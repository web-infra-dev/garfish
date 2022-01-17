import React, { useEffect, useState } from 'react';
import { Switch, Route, NavLink, useLocation } from 'react-router-dom';
import { hot, setConfig } from 'react-hot-loader';
import logo from './logo.svg';
import './App.css';

setConfig({
  showReactDomPatchNotification: false,
});

type AppTypes = {
  basename?: string;
  store?: Record<string, any>;
};

const App = ({ basename = '', store = {} }: AppTypes) => {
  const location = useLocation();
  const [isActive, setIsActive] = useState('home');
  const Index = () => {
    return (
      <div>
        <input type="text" />
        This is Home Page.
        {/* {window.Garfish && (
          <div
            className="click-btn"
            onClick={() => {
              window?.Garfish.channel.emit(
                "event",
                "hello, 我是 react 子应用，版本是 v16, 执行操作：store.increment()"
              );
              store.increment();
              console.log("子应用获取 store.counter:", store.counter);
            }}
          >
            click me
          </div>
        )} */}
      </div>
    );
  };

  useEffect(() => {
    setIsActive(location.pathname.includes('about') ? 'about' : 'home');
  }, [location.pathname]);

  const About = () => {
    return <div>This is About Page. </div>;
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <p> React v16.</p>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <ul>
          <li onClick={() => setIsActive('home')}>
            <NavLink to="/" className={isActive === 'home' ? 'tabActive' : ''}>
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
};

export default hot(module)(App);
