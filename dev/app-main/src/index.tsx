import ReactDOM from 'react-dom';
import { GarfishInit } from './garfishInit';
import RootComponent from './components/root';

const render = async () => {
  await GarfishInit();
  ReactDOM.render(<RootComponent />, document.getElementById('root'));
};

render();
