import { Garfish } from '../src/garfish';

export const mockHtmlEntry = 'http://localhost:3333/index.html';

export function isObject(val) {
  return !!(val && typeof val === 'object');
}

export async function isAsyncError(fn, msg?: string) {
  try {
    await fn();
    return false;
  } catch (e) {
    if (msg) {
      return e instanceof Error ? e.message.includes(msg) : e.includes(msg);
    }
    return true;
  }
}

export function createGarfish(opts = {}, run?: boolean) {
  const garfish = new Garfish();
  garfish.setOptions(opts);
  if (run) garfish.run();
  return garfish;
}

export function createHtmlManager<T>(Ctor: { new (...args: any[]): T }) {
  return new Ctor({
    size: 0,
    url: mockHtmlEntry,
    code: `
      <body>
        <!-- content -->
        <link></link>
        <link rel="stylesheet" href="./index.css"></link>
        <b><a></a></b><div><div></div></div>
      </body>
    `,
  });
}
