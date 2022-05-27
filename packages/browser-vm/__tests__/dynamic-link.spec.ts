import { mockStaticServer } from '@garfish/test-suite';
import { __MockHead__ } from '@garfish/utils';
import { Sandbox } from '../src/sandbox';

declare global {
  interface window {
    execOrder: Array<string>;
    fetch: any;
  }
}

describe('Sandbox: dynamic link', () => {
  const withSuffix = '/resources/links/suffix.css';
  const withoutSuffix = '/resources/links/no-suffix';
  const withoutSuffixAndContentType = '/resources/links/no-content-type-suffix';
  const styleType = 'text/css';
  const jsonType = 'application/json';
  mockStaticServer({
    baseDir: __dirname,
    customerHeaders: {
      [withSuffix]: {
        'Content-Type': jsonType,
      },
      [withoutSuffix]: {
        'Content-Type': styleType,
      },
      [withoutSuffixAndContentType]: {
        'Content-Type': jsonType,
      },
    },
  });

  let sandbox: Sandbox;

  const go = (code: string) => {
    return `
      const sandbox = __debug_sandbox__;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      ${code}
    `;
  };

  beforeEach(() => {
    document.body.innerHTML = `<div id="root">123<div ${__MockHead__}></div></div>`;
    sandbox = new Sandbox({
      namespace: 'app',
      el: () => document.querySelector('#root'),
      modules: [
        () => ({
          recover() {},
          override: { go, jest, expect },
        }),
      ],
    });
    (global as any).fetch = fetch;
  });

  it('without ref', (done) => {
    sandbox.execScript(
      go(`
        const dynamicLink = document.createElement('link');
        dynamicLink.href = "${withSuffix}";
        document.head.appendChild(dynamicLink);
        expect(document.body).toMatchSnapshot();
        jestDone();
      `),
      { jestDone: done },
    );
  });

  it('with suffix', (done) => {
    sandbox.execScript(
      go(`
        const dynamicLink = document.createElement('link');
        dynamicLink.href = "${withSuffix}";
        dynamicLink.rel = 'stylesheet';
        dynamicLink.onload = function () {
          expect(document.body).toMatchSnapshot();
          jestDone();
        }
        document.head.appendChild(dynamicLink);
      `),
      { jestDone: done },
    );
  });

  it('with content-type', (done) => {
    sandbox.execScript(
      go(`
        const dynamicLink = document.createElement('link');
        dynamicLink.href = "${withoutSuffix}";
        dynamicLink.rel = 'stylesheet';
        dynamicLink.onload = function () {
          expect(document.body).toMatchSnapshot();
          jestDone();
        }
        document.head.appendChild(dynamicLink);
      `),
      { jestDone: done },
    );
  });

  it('without suffix and content-type', (done) => {
    sandbox.execScript(
      go(`
        const dynamicLink = document.createElement('link');
        dynamicLink.href = "${withoutSuffixAndContentType}";
        dynamicLink.rel = 'stylesheet';
        dynamicLink.onload = function () {
          expect(document.body).toMatchSnapshot();
          jestDone();
        }
        document.head.appendChild(dynamicLink);
      `),
      { jestDone: done },
    );
  });
});
