a = 1;
window.b = 2;
const React = require('React');

exports.One = function (props) {
  return React.createElement('div', null, ['远程组件1: ', props.text]);
};

exports.Two = function (props) {
  return React.createElement('div', null, ['远程组件2: ', props.text]);
};

// module.exports = new Promise((resolve) => {
//   setTimeout(() => {
//     resolve({
//       One(props) {
//         return React.createElement('div', null, ['远程组件1: ', props.text]);
//       },
//       Two(props) {
//         return React.createElement('div', null, ['远程组件2: ', props.text]);
//       }
//     })
//   }, 2000)
// })
