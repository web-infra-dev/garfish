setTimeout(() => {
  window.execOrder.push('second macro task');
});

Promise.resolve().then(() => {
  window.execOrder.push('second micro task');
});

window.execOrder.push('second normal task');
