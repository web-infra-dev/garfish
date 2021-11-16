import React, { useState } from 'react';

export default function ReactApp() {
  return (
    <div>
      <h3 data-test="title" style={{ marginTop: '30px', marginBottom: '30px' }}>
        React-app
      </h3>
      <micro-portal
        name="react-app"
        entry="http://localhost:2444"
        basename="/react-app"
      ></micro-portal>
    </div>
  );
}
