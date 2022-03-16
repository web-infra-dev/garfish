import { SubAppContext } from '../root';
import { IProps } from '../App';
import logo from './logo.svg';
import './index.less';
import { Button } from '@arco-design/web-react';

const Home = () => (
  <SubAppContext.Consumer>
    {({ basename, store }: IProps) => {
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
            【store.counter】: {store?.counter}
            {window.Garfish && (
              <Button
                size="mini"
                type="primary"
                onClick={() => store && store.increment()}
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
