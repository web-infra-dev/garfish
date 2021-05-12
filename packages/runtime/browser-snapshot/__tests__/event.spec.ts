import { PatchEvent } from '../src/patchers/event';

describe('test sandbox ', () => {
  it('dom sandbox', () => {
    const event = new Event('flag-event');
    const evn = new PatchEvent();

    evn.activate();

    let flag = null;
    window.addEventListener('flag-event', () => (flag = true));

    evn.deactivate(true);

    window.dispatchEvent(event);
    expect(flag).toBe(null);
  });
});
