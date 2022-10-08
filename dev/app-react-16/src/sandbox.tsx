import React, { useEffect } from 'react';
import { Button } from '@arco-design/web-react';

export const appSourceUrl = `http://localhost:8092`;
export const dynamicScriptUrl = appSourceUrl + '/dynamic.js';
export const dynamicErrorScriptUrl = 'http://localhost:1234/error.js';

export function assert(condition, msg) {
  if (!condition) {
    throw Error(`Garfish error: ${msg}`);
  }
}

function sandboxExpect() {
  // jest can't window instanceof Window === false
  assert(
    window instanceof Window === true,
    `expect window instanceof Window === true`,
  );
}

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
    let sc = document.createElement('script');
    sc.src = dynamicScriptUrl;
    sc.onload = function () {
      window.dynamicScriptOnloadTag = true;
      document.head.removeChild(sc);
    };
    document.head.appendChild(sc);
  }

  function addDynamicScriptTestOnerror() {
    //eslint-disable-next-line
    let sc = document.createElement('script');
    sc.src = dynamicErrorScriptUrl;
    sc.onerror = function () {
      window.dynamicScriptOnerrorTag = true;
    };
    document.head.appendChild(sc);
  }

  useEffect(() => {
    sandboxExpect();
  }, []);

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
      <div className={'instanceof'}>
        <div data-test={"document-instanceof"}>document instanceof Document: {String(document instanceof Document)}</div>
        <div data-test={'document-parentNode'}>document.body.parentNode?.parentNode: {String(document === document.body.parentNode?.parentNode)}</div>
      </div>
      <div className='pre-fix'>
        <iframe data-test={'iframe-pre-fix'} src="/iframe" style={{display: 'none'}} />
        <img data-test={'img-pre-fix'} src="/img"  style={{display: 'none'}} />
      </div>
    </div>
  );
}
