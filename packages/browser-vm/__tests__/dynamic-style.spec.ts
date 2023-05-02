import { __MockHead__ } from '@garfish/utils';
import { Sandbox } from '../src/sandbox';
import { StyleManager } from '@garfish/loader';

describe('Sandbox: dynamic style', () => {
  let sandbox: Sandbox;

  const go = (code: string | (() => void)) => {
    if (typeof code === 'function') {
      code = `(${code})();`;
    }
    return `
      const sandbox = __debug_sandbox__;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      ${code}
    `;
  };

  // Mock style transformer
  const styleManagerProto = StyleManager.prototype;
  const originalTransformCode = styleManagerProto.transformCode;
  styleManagerProto.transformCode = function (code) {
    return originalTransformCode('.app ' + code);
  };

  beforeEach(() => {
    document.body.innerHTML = `<div id="root">123<div ${__MockHead__}></div></div>`;
    sandbox = new Sandbox({
      namespace: 'app',
      el: () => document.querySelector('#root'),
      baseUrl: 'http://test.app',
      modules: [
        () => ({
          recover() {},
          override: { go, jest, expect },
        }),
      ],
    });
  });

  it('set textContent', (done) => {
    sandbox.execScript(
      go(() => {
        const style = document.createElement('style');
        style.textContent = '.a { color: black; }';
        document.head.appendChild(style);
        expect([
          style.textContent,
          Array.from(style.sheet!.cssRules).map((x) => x.cssText),
        ]).toMatchSnapshot();
        done();
      }),
      { done },
    );
  });

  it('append text node', (done) => {
    sandbox.execScript(
      go(() => {
        const style = document.createElement('style');
        style.textContent = '.a { color: black; }';
        document.head.appendChild(style);
        style.appendChild(document.createTextNode('.b { color: white; }'));
        expect([
          style.textContent,
          Array.from(style.sheet!.cssRules).map((x) => x.cssText),
        ]).toMatchSnapshot();
        done();
      }),
      { done },
    );
  });

  it('insertRule', (done) => {
    sandbox.execScript(
      go(() => {
        const style = document.createElement('style');
        document.head.appendChild(style);
        style.sheet!.insertRule('.b { color: white; }');
        style.sheet!.insertRule('.a { color: black; }');
        style.sheet!.insertRule('.c { color: white; }', 2);
        expect(
          Array.from(style.sheet!.cssRules).map((x) => x.cssText),
        ).toMatchSnapshot();
        done();
      }),
      { done },
    );
  });
});
