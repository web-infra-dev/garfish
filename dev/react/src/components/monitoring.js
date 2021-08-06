import React from 'react';
import { Button } from 'antd';
const reactPort = 2444;

export default function () {
  function fetchM() {
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
    setTimeout(() => {
      throw Error('subApp: unhandledrejection error');
    }, 500);
  }

  function normalError() {
    throw Error('subApp: normal error');
  }

  function resourceError() {
    // resource error
    const sc = document.createElement('script');
    sc.src = `http://localhost:0000/monitoring/xxxxx.js`;
    document.body.appendChild(sc);
  }

  function DynamicResource() {
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
        data-test="click-dynamic-resource"
        type="primary"
        onClick={() => DynamicResource()}
        style={{ marginBottom: '30px' }}
      >
        dynamic resource
      </Button>
      <br />
      <Button
        data-test="click-normal-error"
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
      <Button
        data-test="click-resource-error"
        type="primary"
        danger
        onClick={() => resourceError()}
        style={{ marginBottom: '30px' }}
      >
        resource error
      </Button>
      <br />
    </div>
  );
}
