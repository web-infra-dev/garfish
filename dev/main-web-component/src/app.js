import React, { Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import HelloGarfish from './components/helloGarfish.js';
import VueApp from './components/vueApp.js';
import './app.css';

export default function App({ basename }) {
  return (
    <Router basename={basename}>
      <div className="ReactApp">
        <ul className="nav-bas">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/vue-app">Vue Component</Link>
          </li>
        </ul>

        <Switch>
          <Route exact path="/">
            <HelloGarfish />
          </Route>
          <Route path="/vue-app">
            <VueApp />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
