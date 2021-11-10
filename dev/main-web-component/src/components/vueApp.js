import React, { useState } from 'react';

import { defineCustomElements } from '@garfish/web-component';

setTimeout(() => {
  defineCustomElements('micro-portal', {
    loading: ({ isLoading, error }) => {
      let loadingElement = document.createElement('div');
      loadingElement.setAttribute(
        'style',
        'font-size:20px; text-align: center;',
      );
      if (error) {
        loadingElement.innerHTML = `load error msg: ${error.message}`;
        return loadingElement;
      } else if (isLoading) {
        loadingElement.innerHTML = `loading`;
        return loadingElement;
      } else {
        return null;
      }
    },
  });
});

export default function Dialog() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <div>
      <h3 data-test="title" style={{ marginTop: '30px', marginBottom: '30px' }}>
        Thank you for the react applications use garfish
      </h3>
      <micro-portal
        app-name="vue-app"
        entry="http://localhost:2666"
        basename="/vue-app"
      ></micro-portal>
    </div>
  );
}
