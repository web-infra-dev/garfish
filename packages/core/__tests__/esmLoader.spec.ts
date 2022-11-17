import { readFileSync as fsReadFileSync } from 'fs';
import { init, parse } from '@garfish/es-module-lexer';
import {
  ESModuleLoader,
  getModuleImportProcessor,
} from '../src/module/esModule';

describe('Core: esm loader', () => {
  it('replace static import module name', async () => {
    await init();

    const code = `
      import React from 'react';
      import { render } from 'react-dom';
      // import lodash from 'lodash';
      /* import VueRouter from 'vue-router'; */
      console.log('render', render);
      console.log(\`import Vue from 'vue';console.log(Vue);\`);
      const importString = 'import router from "react-router"';
    `;
    const processImportModule = getModuleImportProcessor(code);
    const [imports] = parse(code);
    let result = ['', code];

    for (let i = 0, length = imports.length; i < length; i++) {
      result = processImportModule(imports[i], 'new-module-name');
    }
    expect(result.join('')).toBe(`
      import React from 'new-module-name';
      import { render } from 'new-module-name';
      // import lodash from 'lodash';
      /* import VueRouter from 'vue-router'; */
      console.log('render', render);
      console.log(\`import Vue from 'vue';console.log(Vue);\`);
      const importString = 'import router from "react-router"';
    `);
  });

  it('replace dynamic import keyword with "_import_"', async () => {
    await init();

    const code = `
      import React from 'react';
      import { render } from 'react-dom';
      // import lodash from 'lodash';
      /* import VueRouter from 'vue-router'; */
      console.log('render', render);
      console.log(\`import Vue from 'vue';console.log(Vue);\`);
      const dynamicImport = import('react-router');
    `;
    const processImportModule = getModuleImportProcessor(code);
    const [imports] = parse(code);
    let result = ['', code];

    for (let i = 0, length = imports.length; i < length; i++) {
      result = processImportModule(imports[i]);
    }
    expect(result.join('')).toBe(`
      import React from '';
      import { render } from '';
      // import lodash from 'lodash';
      /* import VueRouter from 'vue-router'; */
      console.log('render', render);
      console.log(\`import Vue from 'vue';console.log(Vue);\`);
      const dynamicImport = _import_('react-router');
    `);
  });

  const readFileSync = (fileName: string) =>
    fsReadFileSync(`${__dirname}/resources/scripts/${fileName}`, { encoding: 'utf-8' });
  const baseUrl = 'http://www.test.com';
  const esmFileMap = {
    simpleEntry: `${baseUrl}/simpleEntry.js`,
    esmA: `${baseUrl}/esmA.js`,
    esmB: `${baseUrl}/esmB.js`,
    esmC: `${baseUrl}/esmC.js`,
    circularEntry: `${baseUrl}/circularEntry.js`,
    circularEsmA: `${baseUrl}/circularEsmA.js`,
    circularEsmB: `${baseUrl}/circularEsmB.js`,
    dynamicEsmA: `${baseUrl}/dynamicEsmA.js`,
    dynamicEsmA1: `${baseUrl}/dynamicEsmA1.js`,
    dynamicEsmA2: `${baseUrl}/dynamicEsmA2.js`,
    dynamicEsmB: `${baseUrl}/dynamicEsmB.js`,
    dynamicEsmB1: `${baseUrl}/dynamicEsmB1.js`,
  };
  const mockCache = {
    [esmFileMap.esmA]: readFileSync('esmA.js'),
    [esmFileMap.esmB]: readFileSync('esmB.js'),
    [esmFileMap.esmC]: readFileSync('esmC.js'),
    [esmFileMap.circularEsmA]: readFileSync('circularEsmA.js'),
    [esmFileMap.circularEsmB]: readFileSync('circularEsmB.js'),
    [esmFileMap.dynamicEsmA]: readFileSync('dynamicEsmA.js'),
    [esmFileMap.dynamicEsmA1]: readFileSync('dynamicEsmA1.js'),
    [esmFileMap.dynamicEsmA2]: readFileSync('dynamicEsmA2.js'),
    [esmFileMap.dynamicEsmB]: readFileSync('dynamicEsmB.js'),
    [esmFileMap.dynamicEsmB1]: readFileSync('dynamicEsmB1.js'),
  };
  const delay = (time: number) => {
    return new Promise<void>(resolve => {
      if (time === -1) {
        resolve();
      } else {
        setTimeout(resolve, time);
      }
    });
  };
  const loadCache: Record<string, any> = {};
  const loader = new ESModuleLoader({
    appId: 0,
    name: 'unit test for esm module loader',
    global: {},
    context: {
      loader: {
        async load({ url }) {
          if (!loadCache[url]) {
            loadCache[url] = new Promise(resolve => {
              (async () => {
                // mock load time
                await delay(
                  [esmFileMap.dynamicEsmA1, esmFileMap.dynamicEsmA2].includes(url)
                    ? 500
                    : 10
                );
                resolve({
                  resourceManager: {
                    url,
                    scriptCode: mockCache[url],
                  },
                });
              })();
            });
          }
          return await loadCache[url];
        },
      },
    },
    globalVarKey: 'globalVarKey',
    isNoEntryScript: () => false,
  } as any);
  // @ts-ignore
  loader.execModuleCode = () => {
    // @ts-ignore
    loader.app.global[loader.globalVarKey].resolve();
    // @ts-ignore
    loader.lock.release();
  };
  global.URL.revokeObjectURL = jest.fn();

  it('load simple es module successfully', async () => {
    let blobIndex = 0;
    // @ts-ignore
    loader.createBlobUrl = () => `blob:${++blobIndex}`;

    const entryCode = 'import "./esmA.js";';
    // @ts-ignore
    await loader.load(entryCode, {}, esmFileMap.simpleEntry, {});

    // @ts-ignore
    const moduleCache = loader.moduleCache;
    expect(moduleCache[esmFileMap.simpleEntry].blobUrl).toBe('blob:4');
    expect(moduleCache[esmFileMap.simpleEntry].shellUrl).toBeUndefined();
    expect(moduleCache[esmFileMap.esmA].blobUrl).toBe('blob:3');
    expect(moduleCache[esmFileMap.esmA].shellUrl).toBeUndefined();
    expect(moduleCache[esmFileMap.esmB].blobUrl).toBe('blob:1');
    expect(moduleCache[esmFileMap.esmB].shellUrl).toBeUndefined();
    expect(moduleCache[esmFileMap.esmC].blobUrl).toBe('blob:2');
    expect(moduleCache[esmFileMap.esmC].shellUrl).toBeUndefined();

    loader.destroy();
    // @ts-ignore
    expect(Object.keys(loader.moduleCache).length).toBe(0);
  });

  it('load circular dep es module successfully', async () => {
    let blobIndex = 0;
    const blobCodeList: string[] = [];
    // @ts-ignore
    loader.createBlobUrl = (code: string) => {
      blobCodeList.push(code);
      return `blob:${++blobIndex}`;
    };
    const entryCode = 'import "./circularEsmA.js";';
    // @ts-ignore
    await loader.load(entryCode, {}, esmFileMap.circularEntry, {});
    // @ts-ignore
    const moduleCache = loader.moduleCache;
    expect(moduleCache[esmFileMap.circularEntry].blobUrl).toBe('blob:5');
    expect(moduleCache[esmFileMap.circularEntry].shellUrl).toBeUndefined();
    expect(moduleCache[esmFileMap.circularEsmA].blobUrl).toBe('blob:4');
    expect(moduleCache[esmFileMap.circularEsmA].shellUrl).toBe('blob:2');
    expect(moduleCache[esmFileMap.circularEsmB].blobUrl).toBe('blob:3');
    expect(moduleCache[esmFileMap.circularEsmB].shellUrl).toBeUndefined();
    expect(moduleCache[esmFileMap.esmC].blobUrl).toBe('blob:1');
    expect(moduleCache[esmFileMap.esmC].shellUrl).toBeUndefined();

    // shell code for module A
    expect(blobCodeList[1])
      .toBe(`export function u$$_(m){sayA=m.sayA,execSayB=m.execSayB}export let sayA;export let execSayB;export * from 'blob:1'
//# sourceURL=http://www.test.com/circularEsmA.js?cycle`);

    loader.destroy();
    // @ts-ignore
    expect(Object.keys(loader.moduleCache).length).toBe(0);
  });

  it('concurrent dynamic import analysis should be blocked by static import', async () => {
    let blobIndex = 0;
    // @ts-ignore
    loader.createBlobUrl = () => `${++blobIndex}`;

    // mock concurrent dynamic import
    // just like 'import("./virtualDynamicEsmA");import("./virtualDynamicEsmB");'
    // @ts-ignore
    loader.load('import "./dynamicEsmA.js";', {}, `${baseUrl}/virtualDynamicEsmA.js`, {});
    // @ts-ignore
    loader.load('import "./dynamicEsmB.js";', {}, `${baseUrl}/virtualDynamicEsmB.js`, {});

    await delay(2000);

    // @ts-ignore
    const moduleCache = loader.moduleCache;
    const orderList = Object.keys(moduleCache)
      .map(cacheKey => {
        return {
          ...moduleCache[cacheKey],
          cacheKey,
        };
      })
      .sort((a, b) => parseInt(a.blobUrl || '', 10) - parseInt(b.blobUrl || '', 10))
      .map(item => item.cacheKey);

    expect(orderList).toEqual([
      esmFileMap.dynamicEsmA1,
      esmFileMap.dynamicEsmA2,
      esmFileMap.dynamicEsmA,
      `${baseUrl}/virtualDynamicEsmA.js`,
      esmFileMap.dynamicEsmB1,
      esmFileMap.dynamicEsmB,
      `${baseUrl}/virtualDynamicEsmB.js`,
    ]);

    loader.destroy();
    // @ts-ignore
    expect(Object.keys(loader.moduleCache).length).toBe(0);
  });
});
