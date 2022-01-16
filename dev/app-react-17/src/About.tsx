import { SubAppContext } from './root';
import { IProps } from './App';

const About = () => (
  <SubAppContext.Consumer>
    {({ basename, store }: IProps) => {
      return <div> This is About Page.</div>;
    }}
  </SubAppContext.Consumer>
);

export default About;
