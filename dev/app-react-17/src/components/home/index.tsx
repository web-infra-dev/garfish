import { SubAppContext } from '../root';
import logo from './logo.svg';
import './index.less';
import { Button } from '@arco-design/web-react';
import { AppInfo } from '@garfish/bridge-react';

const Home = () => (
  <SubAppContext.Consumer>
    {(appInfo: AppInfo) => {
      return (
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h3 data-test="title" className="title">
            Thank you for the React applications use garfish.
            <span>This is React17. </span>
          </h3>

          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>

          <div className="counter">
            【store.counter】: {appInfo?.props?.store?.counter}
            {window.Garfish && (
              <Button
                size="mini"
                type="primary"
                onClick={() => appInfo?.props?.store?.increment()}
              >
                increase counter
              </Button>
            )}
          </div>
        </div>
      );
    }}
  </SubAppContext.Consumer>
);

export default Home;
