setTimeout(() => {
  window.execOrder.push('macro task');
});

Promise.resolve().then(() => {
  window.execOrder.push('micro task');
});

window.execOrder.push('normal task');
