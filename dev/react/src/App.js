import React, { useState } from 'react';
import { loadComponent, setExternal } from '@garfish/remote-component';
import logo from './logo.svg';
import './App.css';
import { Modal, Button } from 'antd';
import 'antd/dist/antd.css';

setExternal({ React });

function App() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const fn = () => {
    window.a.b.c = 1;
  };

  const RemoteComponent = React.lazy(() => {
    return loadComponent('http://localhost:3000/remoteComponent.js').then(
      (components) => {
        // eslint-disable-next-line
        console.log('window', window.a, window.b);
        return {
          __esModule: true,
          default: components.One,
        };
      },
    );
  });

  return (
    <div className="App">
      <React.Suspense fallback={<div>loading</div>}>
        <div>
          <RemoteComponent text="2333" />
        </div>
      </React.Suspense>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal
        title="Basic Modal"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={fn}>test error</button>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
// console.log(document.createElement('div').contains(document.body));
// console.log(window.a.a.b);
// class MyComponent extends React.Component {
//   constructor(props) {
//     super(props);
//     this.myRef = React.createRef();
//   }
//   componentDidMount() {
//     setTimeout(()=>{
//       // console.log(this.myRef.current);
//       console.log(this.myRef.current.contains(document.createElement('div')))
//     }, 2000)
//   }
//   render() {
//     return <div id="woshi" ref={this.myRef} >
//       hello
//     </div>;
//   }
// }
// export default MyComponent;
export default App;
