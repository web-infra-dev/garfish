let div;

export function render() {
  div = document.createElement('div');
  const span = document.createElement('span');
  span.innerText = 'esmApp content';
  div.id = 'esmAppContent';
  div.appendChild(span);
  document.body.appendChild(div);
}

export function destroy() {
  if (div) {
    document.body.removeChild(div);
  }
}
