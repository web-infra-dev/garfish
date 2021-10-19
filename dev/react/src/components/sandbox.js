import React from 'react';
import { Button } from 'antd';
import { dynamicScriptUrl,dynamicErrorScriptUrl } from '../config';

export default function () {
  // init global val
  //eslint-disable-next-line
  history.scrollRestoration = 'auto';

  function setScrollRestoration() {
    //eslint-disable-next-line
    history.scrollRestoration = 'manual';
    console.log('set val');
  }

  function addDynamicScriptTestOnload() {
    let sc = document.createElement("script");
    sc.src = dynamicScriptUrl
    sc.onload = function () {
      window.dynamicScriptOnloadTag = true;
      document.head.removeChild(sc);
    }
    document.head.appendChild(sc);
  }

  function addDynamicScriptTestOnerror() {
    //eslint-disable-next-line
    let sc = document.createElement("script");
    sc.src = dynamicErrorScriptUrl
    sc.onerror = function () {
      window.dynamicScriptOnerrorTag = true;
    }
    document.head.appendChild(sc);
  }


  return (
    <div>
      <h3 data-test="title">vm sandbox</h3>
      <Button
        data-test="click-set-history-proxy-variable"
        type="primary"
        onClick={() => setScrollRestoration()}
        style={{ marginBottom: '30px' }}
      >
        set setScrollRestoration
      </Button>
      <br />
      <Button
        data-test="click-set-add-dynamic-script-onload"
        type="primary"
        onClick={() => addDynamicScriptTestOnload()}
        style={{ marginBottom: '30px' }}
      >
        add script test onload
      </Button>
      <br />
      <Button
        data-test="click-set-add-dynamic-script-onerror"
        type="primary"
        onClick={() => addDynamicScriptTestOnerror()}
        style={{ marginBottom: '30px' }}
      >
        add script test onerror
      </Button>
    </div>
  );
}
