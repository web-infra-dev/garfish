const loadModule = require('loadModule');
console.log(loadModule);

const components = {
  cmOne: {
    props: ['text'],
    data: () => ({
      name: 'chen',
    }),
    render(h) {
      return h('div', {}, [this.text, '---', this.name]);
    },
  },

  cmTwo: {
    props: ['text'],
    data: () => ({
      name: 'tao',
    }),
    render(h) {
      return h('div', {}, [this.text, '---', this.name]);
    },
  },
};

module.exports = new Promise((resolve) => {
  console.log('loading other modules.');
  setTimeout(() => {
    resolve(components);
  }, 1000);
});
