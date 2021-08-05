import React from 'react';
import { Button } from 'antd';
const reactPort = 2444;

export default function () {
  setTimeout(() => {
    window.Garfish.props.normalError();
  });
  function fetchM() {
    // At the same time master application http request
    if (window.__GARFISH__) window.Garfish.props.fetchM();
    const xhr = new XMLHttpRequest();
    xhr.open('get', `http://localhost:${reactPort}/subApp`, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log('subApp xhr');
      }
    };
    xhr.send(null);

    fetch(`http://localhost:${reactPort}/fetch/subApp`).then((res) => {});
  }

  function unhandledrejectionError() {
    if (window.__GARFISH__) window.Garfish.props.unhandledrejectionError();
    // At the same time master application error
    setTimeout(() => {
      throw Error('subApp: unhandledrejection error');
    }, 2000);
  }

  function normalError() {
    // setTimeout(()=>{
    //   throw Error('subApp: normal error');
    // })
    // At the same time master application error
    if (window.__GARFISH__) window.Garfish.props.normalError();
  }

  function DynamicResource() {
    if (window.__GARFISH__) window.Garfish.props.DynamicResource();

    // At the same time master application inject dynamicResource
    const sc = document.createElement('script');
    sc.src = `http://localhost:${reactPort}/monitoring/dynamicScript.js`;
    document.body.appendChild(sc);

    const link = document.createElement('link');
    link.href = `http://localhost:${reactPort}/monitoring/dynamicLink.css`;
    document.body.appendChild(link);
  }

  return (
    <div>
      <h3 data-test="title">React sub App Monitoring</h3>
      <Button
        data-test="click-fetch"
        type="primary"
        onClick={() => fetchM()}
        style={{ marginBottom: '30px' }}
      >
        fetch
      </Button>
      <br />
      <Button
        data-test="click-fetch"
        type="primary"
        onClick={() => DynamicResource()}
        style={{ marginBottom: '30px' }}
      >
        dynamic resource
      </Button>
      <br />
      <Button
        data-test="click-error"
        type="primary"
        danger
        onClick={() => normalError()}
        style={{ marginBottom: '30px' }}
      >
        error
      </Button>
      <br />
      <Button
        data-test="click-unhandledrejection-error"
        type="primary"
        danger
        onClick={() => unhandledrejectionError()}
        style={{ marginBottom: '30px' }}
      >
        unhandledrejection error
      </Button>
      <br />
    </div>
  );
}
