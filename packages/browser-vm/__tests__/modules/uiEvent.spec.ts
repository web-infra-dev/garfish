import { MouseEventPatch } from '../../src/modules/uiEvent';

test('patch UIEvent', async () => {
  const dispatchEventAction = jest.fn();

  const dom = document.createElement('a');
  dom.onclick = dispatchEventAction;

  const evt = new MouseEventPatch('click', {
    view: new Proxy(window, {}), // fakeWindow can't use to MouseEventPatch
    bubbles: true,
    cancelable: false,
  });
  dom.dispatchEvent(evt);

  expect(dispatchEventAction).toBeCalledTimes(1);
});
