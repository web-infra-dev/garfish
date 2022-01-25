import React, { createContext } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import App from './App';
import './App.css';
export const SubAppContext = createContext({});
import { hot, setConfig } from 'react-hot-loader';
const PageNotFound = () => <div>Page not found! </div>;

setConfig({
  showReactDomPatchNotification: false,
});

const RootComponent = (props) => {
  const { basename, store } = props;
  return (
    <SubAppContext.Provider value={{ basename, store }}>
      <BrowserRouter basename={basename}>
        <Switch>
          <Route exact path="/" component={() => <Redirect to="/home" />} />
          <Route exact path="/home" component={() => <App />} />
          <Route exact path="/about" component={() => <App />} />
          <Route exact path="*" component={() => <PageNotFound />} />
        </Switch>
      </BrowserRouter>
    </SubAppContext.Provider>
  );
};

export default hot(module)(RootComponent);
