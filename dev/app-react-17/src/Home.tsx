import { SubAppContext } from './root';
import { IProps } from './App';

const Home = () => (
  <SubAppContext.Consumer>
    {({ basename, store }: IProps) => {
      return <div> This is Home Page.</div>;
    }}
  </SubAppContext.Consumer>
);

export default Home;
