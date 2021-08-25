import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

export default function () {
  // init global val
  //eslint-disable-next-line
  history.scrollRestoration = 'auto';

  function setScrollRestoration() {
    //eslint-disable-next-line
    history.scrollRestoration = 'manual';
    console.log('set val');
  }

  return (
    <div>
      <h3 data-test="title">set proxy variable</h3>
      <Button
        data-test="click-set-history-proxy-variable"
        type="primary"
        onClick={() => setScrollRestoration()}
        style={{ marginBottom: '30px' }}
      >
        set setScrollRestoration
      </Button>
      <br />
    </div>
  );
}
