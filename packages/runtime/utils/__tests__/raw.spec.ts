import * as raws from '../src/raw';

describe('Garfish shared raw', () => {
  it('Check native attributes', () => {
    expect(raws.rawWindow === window).toBe(true);
    expect(raws.rawDocument === document).toBe(true);
    expect(raws.rawDocumentCtor === Document).toBe(true);

    expect(raws.rawSetTimeout === setTimeout).toBe(true);
    expect(raws.rawSetInterval === setInterval).toBe(true);
    expect(raws.rawClearTimeout === clearTimeout).toBe(true);
    expect(raws.rawClearInterval === clearInterval).toBe(true);

    expect(raws.rawLocalstorage === localStorage).toBe(true);
    expect(raws.rawSessionStorage === sessionStorage).toBe(true);

    expect(raws.rawAddEventListener === addEventListener).toBe(true);
    expect(raws.rawRemoveEventListener === removeEventListener).toBe(true);

    expect(raws.rawMutationObserver === MutationObserver).toBe(true);
    expect(raws.rawObserver === MutationObserver.prototype.observe).toBe(true);

    expect(raws.rawAppendChild === HTMLElement.prototype.appendChild).toBe(
      true,
    );
    expect(raws.rawRemoveChild === HTMLElement.prototype.removeChild).toBe(
      true,
    );

    expect(raws.rawObject === Object).toBe(true);
    expect(raws.rawObjectKeys === Object.keys).toBe(true);
    expect(raws.rawObjectCreate === Object.create).toBe(true);
    expect(raws.rawObjectDefineProperty === Object.defineProperty).toBe(true);
    expect(
      raws.rawObjectGetOwnPropertyDescriptor ===
        Object.getOwnPropertyDescriptor,
    ).toBe(true);
  });
});
