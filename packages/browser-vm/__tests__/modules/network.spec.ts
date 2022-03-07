import { Sandbox } from '../../src/sandbox';

describe('Init', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  const create = (opts = {}) => {
    return new Sandbox({
      ...opts,
      namespace: 'app',
      baseUrl: 'http://localhost:3333',
      modules: [
        () => ({
          recover() {},
          override: {
            jest,
            expect,
          },
        }),
      ],
    });
  };

  beforeEach(() => {
    sandbox = create();
  });

  it('fetch', (next) => {
    next();
    // const originFetch = window.fetch;
    // window.fetch = function (url) {
    //   expect(url).toBe('http://localhost:3333/get');
    //   next();
    // } as any;
    // sandbox = create();
    // // prettier-ignore
    // sandbox.execScript('fetch(\'./get\')');
    // window.fetch = originFetch;
  });

  it('xhr', (next) => {
    next();
    // const code = `
    //   const xhr = new XMLHttpRequest();
    //   xhr.open('GET', '/get');
    //   xhr.onload = (e) => {
    //     // expect(e.target.response).toBe('ok');
    //     next();
    //   }
    //   xhr.send();
    // `;
    // sandbox.execScript(code, { next });
  });
});
