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
  const linkOrder1 = '/resources/links/link-order-1.css';
  const linkOrder2 = '/resources/links/link-order-2.css';
  const linkOrder3 = '/resources/links/link-order-3.css';
  const linkOrder404 = '/resources/links/404.css';
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
      [linkOrder1]: {
        'Content-Type': styleType,
        timeConsuming: 500,
      },
      [linkOrder2]: {
        'Content-Type': styleType,
        timeConsuming: 100,
      },
      [linkOrder3]: {
        'Content-Type': styleType,
        timeConsuming: 300,
      }
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

  it('dynamic inject link by order', (done) => {
    sandbox.execScript(
      go(`
        let a = document.createElement("link");
        a.setAttribute("rel", "stylesheet");
        a.setAttribute("href", "${linkOrder1}");
        a.setAttribute("test-id", "order1");
        document.head.appendChild(a);

        let b = document.createElement("link");
        b.setAttribute("rel", "stylesheet");
        b.setAttribute("href", "${linkOrder2}");
        b.setAttribute("test-id", "order2");
        document.head.appendChild(b);

        let c = document.createElement("link");
        c.setAttribute("rel", "stylesheet");
        c.setAttribute("href", "${linkOrder3}");
        c.setAttribute("test-id", "order3");
        c.onload = function () {
          let links = document.querySelectorAll("style");
          expect(links[0].innerHTML).toContain("link-order-1.css");
          expect(links[0].innerHTML).toContain("red");
          expect(links[1].innerHTML).toContain("link-order-2.css");
          expect(links[1].innerHTML).toContain("blue");
          expect(links[2].innerHTML).toContain("link-order-3.css");
          expect(links[2].innerHTML).toContain("yellow");
          jestDone();
        };
        document.head.appendChild(c);

      `),
      { jestDone: done },
    );
  });
});
