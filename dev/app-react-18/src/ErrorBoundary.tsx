import React from 'react';
import { Result } from '@arco-design/web-react';

const Error = () => {
  return (
    <Result
      status="error"
      title="Error message"
      subTitle="Something went wrong. Please try again. "
    ></Result>
  );
};

export default Error;
