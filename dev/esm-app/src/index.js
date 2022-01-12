export function render() {
  const div = document.createElement('div');
  const span = document.createElement('span');
  span.innerText = 'esmApp content';
  div.id = 'esmAppContent';
  div.appendChild(span);
  document.body.appendChild(div);
}
