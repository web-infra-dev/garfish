import logo from '../../assets/logo.svg';
import React from 'react';
import './index.css';

export default function HelloGarfish() {
  return (
    <div>
      <h3 data-test="title" style={{ marginTop: '30px', marginBottom: '30px' }}>
        Thank you for using Garfish for React App
      </h3>
      <img src={logo} className="App-logo" alt="logo" />
    </div>
  );
}
