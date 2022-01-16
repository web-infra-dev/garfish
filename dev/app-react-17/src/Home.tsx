import { SubAppContext } from './root';
import { IProps } from './App';

const Home = () => (
  <SubAppContext.Consumer>
    {({ basename, store }: IProps) => {
      return (
        <div>
          <div> This is Home Page.</div>
        </div>
      );
    }}
  </SubAppContext.Consumer>
);

export default Home;
