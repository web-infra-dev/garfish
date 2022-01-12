import React from 'react';

export default function VueApp() {
  return (
    <div>
      <h3 data-test="title" style={{ marginTop: '30px', marginBottom: '30px' }}>
        Vue-app
      </h3>
      <micro-portal
        name="vue-app"
        basename="/vue-app"
        entry="http://localhost:2666"
      ></micro-portal>
    </div>
  );
}
