const React = require('React');

exports.One = function (props) {
  return React.createElement('div', null, ['远程组件1: ', props.text]);
};

exports.Two = function (props) {
  return React.createElement('div', null, ['远程组件2: ', props.text]);
};
