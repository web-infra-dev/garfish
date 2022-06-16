import { PatchEvent } from '../src/patchers/event';

describe('test sandbox ', () => {
  it('dom sandbox', () => {
    const event = new Event('flag-event');
    const evn = new PatchEvent();
    let flag1: string | null = null;
    window.addEventListener('flag-event', () => (flag1 = 'flag1'));

    evn.activate();

    let flag2: string | null = null;
    window.addEventListener('flag-event', () => (flag2 = 'flag2'));

    evn.deactivate();

    window.dispatchEvent(event);
    expect(flag1).toBe('flag1');
    expect(flag2).toBe(null);
  });
});
