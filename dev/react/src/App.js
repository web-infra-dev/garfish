import React, { Suspense } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams,
} from 'react-router-dom';
import HelloGarfish from './components/helloGarfish/index.js';
import RemoteComponent from './components/remoteComponent.js';
import './App.css';
const LazyComponent = React.lazy(() => import('./components/lazyComponent.js'));

export default function App({ basename }) {
  return (
    <Router basename={basename}>
      <div className="ReactApp">
        <ul className="nav-bas">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/lazy-component">Lazy Component</Link>
          </li>
          <li>
            <Link to="/remote-component">Remote Component</Link>
          </li>
        </ul>
        <Switch>
          <Route exact path="/">
            <HelloGarfish />
          </Route>
          <Route path="/lazy-component">
            <Suspense fallback={<div>Loading...</div>}>
              <LazyComponent />
            </Suspense>
          </Route>
          <Route path="/remote-component">
            <RemoteComponent />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
