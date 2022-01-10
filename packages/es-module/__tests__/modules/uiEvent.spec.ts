import { MouseEventPatch } from '../../src/modules/uiEvent';

/**
 * The logic of UIEvent is referenced from qiankun typography
 * https://github.com/umijs/qiankun/pull/593/files
 */
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
