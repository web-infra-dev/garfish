import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { setExternal, loadComponent } from '@garfish/micro-component';
import logo from './logo.svg';
import './App.css';
import { Modal, Button } from 'antd';
import 'antd/dist/antd.css';

// let cur = document.querySelector('#root');
// setTimeout(() => {
//   console.log(cur, document);
//   while (cur !== document && cur) {
//     cur = cur && cur.parentNode;
//     console.log(cur);
//   }
// }, 3000);

setExternal({ React, classnames });

function MicroComp(params) {
  const { name, url, props } = params;
  const [Comp, setComp] = useState('');

  useEffect(() => {
    if (!Comp) {
      loadComponent('item', {
        url:
          'https://sf-unpkg-src.bytedance.net/@k12-fe/im-components@1.3.10/lib/ChatItem/index.js',
      }).then((res) => {
        console.log(res);
      });
    }
  });

  return Comp && <Comp {...props} />;
}

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

  return (
    <div className="App">
      <MicroComp />
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
