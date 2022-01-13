import type { JavaScriptManager } from '@garfish/loader';
import {
  isAbsolute,
  transformUrl,
  haveSourcemap,
  createSourcemap,
} from '@garfish/utils';
import type { App } from './app';
import { interfaces } from '../interface';

const COMMENT_REG = /[^:]\/\/.*|\/\*[\w\W]*?\*\//g;
const DYNAMIC_IMPORT_REG = /[\s\n;]?(import)[\s\n]*\(/g;
const __GARFISH_ESM_ENV__ = '__GARFISH_ESM_ENV__';

export class ESModuleLoader {
  private app: App;
  private globalVarKey: string;
  private moduleCache: Record<string, string> = {};

  constructor(app: App) {
    this.app = app;
    this.globalVarKey = `${__GARFISH_ESM_ENV__}_${this.app.appId}`;
  }

  private execModuleCode(blobUrl: string) {
    // TODO: Don't use eval, it will cause sandbox escape
    return (0, eval)(`import('${blobUrl}')`);
  }

  private createBlobUrl(code: string) {
    return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  }

  private async fetchModuleResource(
    envVarStr: string,
    saveUrl: string,
    requestUrl: string,
  ) {
    const { resourceManager } =
      await this.app.context.loader.load<JavaScriptManager>(
        this.app.name,
        requestUrl,
      );
    // Maybe other resource
    if (resourceManager) {
      let sourcemap = '';
      // eslint-disable-next-line prefer-const
      let { url, scriptCode } = resourceManager;

      if (!haveSourcemap(scriptCode)) {
        sourcemap = await createSourcemap(scriptCode, requestUrl);
      }
      scriptCode = await this.analysisModule(
        scriptCode,
        envVarStr,
        saveUrl,
        url,
      );
      const blobUrl = this.createBlobUrl(
        `import.meta.url='${url}';${envVarStr}${scriptCode}\n${sourcemap}`,
      );
      this.moduleCache[saveUrl] = blobUrl;
    }
  }

  private async analysisModule(
    code: string,
    envVarStr,
    baseUrl: string,
    realUrl: string,
  ) {
    let matchRes;
    const analysisCode = ' ' + code.replace(COMMENT_REG, '');
    // Each module requires a brand new regular object
    const IMPORT_REG = /((import|export)\s?([^'"]*from\s*)?)['"]([^\n;]+)['"]/g;
    const dynamicImport = `var _import_=(url)=>window.${this.globalVarKey}.import(url,'${baseUrl}','${realUrl}');`;

    while ((matchRes = IMPORT_REG.exec(analysisCode))) {
      const moduleId = matchRes[4];
      if (moduleId) {
        let saveUrl = moduleId;
        let requestUrl = moduleId;

        if (!isAbsolute(moduleId)) {
          saveUrl = transformUrl(baseUrl, moduleId);
          requestUrl = transformUrl(realUrl, moduleId);
        }
        if (!this.moduleCache[saveUrl]) {
          await this.fetchModuleResource(envVarStr, saveUrl, requestUrl);
        }
      }
    }

    // Static import
    code = code.replace(IMPORT_REG, (k1, k2, k3, k4, k5) => {
      if (!isAbsolute(k5)) {
        k5 = transformUrl(baseUrl, k5);
      }
      const blobUrl = this.moduleCache[k5];
      return `${k2} '${blobUrl || k5}'`;
    });

    // Dynamic import
    code = code.replace(DYNAMIC_IMPORT_REG, (k1) => {
      return k1.replace('import', '_import_');
    });

    return `${dynamicImport}${code}`;
  }

  destroy() {
    for (const key in this.moduleCache) {
      URL.revokeObjectURL(this.moduleCache[key]);
    }
    this.moduleCache = {};
    delete this.app.global[this.globalVarKey];
  }

  load(
    code: string,
    env: Record<string, any>,
    url: string,
    options: interfaces.ExecScriptOptions,
  ) {
    return new Promise<void>(async (resolve) => {
      if (this.moduleCache[url]) {
        return resolve();
      }

      env = {
        ...env,
        resolve,
        import: async (moduleId: string, baseUrl: string, realUrl: string) => {
          let saveUrl = moduleId;
          let requestUrl = moduleId;

          if (!isAbsolute(moduleId)) {
            saveUrl = transformUrl(baseUrl, moduleId);
            requestUrl = transformUrl(realUrl, moduleId);
          }
          let blobUrl = this.moduleCache[saveUrl];
          if (!blobUrl) {
            await this.fetchModuleResource(envVarStr, saveUrl, requestUrl);
            blobUrl = this.moduleCache[saveUrl];
          }
          return this.execModuleCode(blobUrl);
        },
      };

      const envVarStr = Object.keys(env).reduce((prevCode, name) => {
        if (name === 'resolve' || name === 'import') return prevCode;
        return `${prevCode} var ${name} = window.${this.globalVarKey}.${name};`;
      }, '');

      let sourcemap = '';
      if (!haveSourcemap(code)) {
        sourcemap = await createSourcemap(
          code,
          options.isInline
            ? `index.html(inline.${this.app.scriptCount}.js)`
            : url,
        );
      }

      code = await this.analysisModule(code, envVarStr, url, url);
      code = `import.meta.url='${url}';${envVarStr}${code}\n;window.${this.globalVarKey}.resolve();\n${sourcemap}`;

      this.app.global[this.globalVarKey] = env;
      const blobUrl = this.createBlobUrl(code);
      if (!options.isInline) {
        this.moduleCache[url] = blobUrl;
      }
      this.execModuleCode(blobUrl);
    });
  }
}
