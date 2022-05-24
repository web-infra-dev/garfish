import { isAbsolute } from '@garfish/utils';
import fs from 'fs';
import path from 'path';
import fetchMock from 'jest-fetch-mock';
import 'isomorphic-fetch';

// Unit test server
export function mockStaticServer(
  baseDir: string,
  filterKeywords?: Array<string>,
) {
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
    const miniType =
      ext === '.html'
        ? 'text/html'
        : ext === '.js'
        ? 'text/javascript'
        : ext === '.css'
        ? 'text/css'
        : 'text/plain';

    return Promise.resolve({
      url: req.url,
      body: fs.readFileSync(fullDir, 'utf-8'),
      headers: {
        'Content-Type': miniType,
      },
    });
  });
}
