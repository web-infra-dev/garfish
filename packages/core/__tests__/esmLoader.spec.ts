import { readFileSync } from 'fs';
import { init, parse } from 'es-module-lexer';
import {
  ESModuleLoader,
  getModuleImportProcessor,
} from '../src/module/esModule';

describe('Core: esm loader', () => {
  it('replace static import module name', async () => {
    await init;

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
    await init;

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

  const baseUrl = 'http://www.test.com';
  const esmFileMap = {
    simpleEntry: `${baseUrl}/simpleEntry.js`,
    esmA: `${baseUrl}/esmA.js`,
    esmB: `${baseUrl}/esmB.js`,
    esmC: `${baseUrl}/esmC.js`,
    circularEntry: `${baseUrl}/circularEntry.js`,
    circularEsmA: `${baseUrl}/circularEsmA.js`,
    circularEsmB: `${baseUrl}/circularEsmB.js`,
  };
  const mockCache = {
    [esmFileMap.esmA]: readFileSync(`${__dirname}/resources/js/esmA.js`, {
      encoding: 'utf-8',
    }),
    [esmFileMap.esmB]: readFileSync(`${__dirname}/resources/js/esmB.js`, {
      encoding: 'utf-8',
    }),
    [esmFileMap.esmC]: readFileSync(`${__dirname}/resources/js/esmC.js`, {
      encoding: 'utf-8',
    }),
    [esmFileMap.circularEsmA]: readFileSync(
      `${__dirname}/resources/js/circularEsmA.js`,
      { encoding: 'utf-8' },
    ),
    [esmFileMap.circularEsmB]: readFileSync(
      `${__dirname}/resources/js/circularEsmB.js`,
      { encoding: 'utf-8' },
    ),
  };
  const loader = new ESModuleLoader({
    appId: 0,
    name: 'unit test for esm module loader',
    global: {},
    context: {
      loader: {
        load({ url }) {
          return {
            resourceManager: {
              url,
              scriptCode: mockCache[url],
            },
          };
        },
      },
    },
    globalVarKey: 'globalVarKey',
    isNoEntryScript: () => false,
  } as any);
  // @ts-ignore
  loader.execModuleCode = () =>
    // @ts-ignore
    loader.app.global[loader.globalVarKey].resolve();
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
});
