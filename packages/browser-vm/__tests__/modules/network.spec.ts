import { Sandbox } from '../../src/sandbox';

describe('Init', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  beforeEach(() => {
    sandbox = new Sandbox({
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
  });

  it('xhr', (next) => {
    const code = `
      const xhr = new XMLHttpRequest();

    `;
    sandbox.execScript(code, { next });
    next();
  });

  // it('fetch', async () => {

  // });

  // it('websocket', async () => {

  // });
});
