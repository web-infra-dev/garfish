import fs from 'fs';
import path from 'path';
import 'isomorphic-fetch';
import fetchMock from 'jest-fetch-mock';
import { isAbsolute } from '@garfish/utils';

// Unit test server
export function mockStaticServer({
  baseDir,
  filterKeywords,
  customerHeaders = {},
}: {
  baseDir: string;
  filterKeywords?: Array<string>;
  customerHeaders?: Record<string, Record<string, any>>;
}) {
  const match = (input: Request) => {
    return Array.isArray(filterKeywords)
      ? !filterKeywords.some((words) => input.url.includes(words))
      : true;
  };

  fetchMock.enableMocks();
  fetchMock.doMock();

  fetchMock.mockIf(match, (req) => {
    let pathname = req.url;
    if (isAbsolute(req.url)) {
      pathname = new URL(req.url).pathname;
    }
    const fullDir = path.resolve(baseDir, `./${pathname}`);
    const { ext } = path.parse(fullDir);
    // prettier-ignore
    const mimeType =
      ext === '.html'
        ? 'text/html'
        : ext === '.js'
          ? 'text/javascript'
          : ext === '.css'
            ? 'text/css'
            : 'text/plain';
    const { timeConsuming = 0, ...headers} = (customerHeaders[pathname] || ({timeConsuming: 0})) ;
    return new Promise((resolve) => {
      const res = {
        url: req.url,
        body: fs.readFileSync(fullDir, 'utf-8'),
        headers: {
          'Content-Type': mimeType,
          ...(headers || {}),
        },
      };
      if (timeConsuming) {
        setTimeout(() => resolve(res), timeConsuming);
      } else {
        resolve(res);
      }
    });
  });
}
