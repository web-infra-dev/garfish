__GARFISH_EXPORTS__.provider = function () {
  return {
    render() {
      const dom = document.querySelector('#app');
      dom.innerHTML = '<div>Hello World preload app</div>';
    },
    destroy() {},
  };
};
