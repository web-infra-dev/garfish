import type { JavaScriptManager } from '@garfish/loader';
import { isAbsolute, transformUrl, createSourcemap } from '@garfish/utils';
import type { App, ExecScriptOptions } from './app';

const __GARFISH_ESM_ENV__ = '__GARFISH_ESM_ENV__';
export const COMMENT_REG = /[^:]\/\/.*|\/\*[\w\W]*?\*\//g;
export const DYNAMIC_IMPORT_REG =
  /([\s\n;=\(:>{><\+\-\!&|]+|^)import[\s\n]*\([\s\S]+\)(?![\s\n]*{)/g;
// Template strings are not processed because they are too complex
export const STRING_REG = new RegExp(
  // eslint-disable-next-line quotes
  `((import|export)\\s?([^.'"]*(from)?\\s*))?${["'", '"']
    .map((c) => {
      return `(${c}((\\\\${c})?[^${c}\\\\]*)(\\\\${c})?[^${c}]*(\\\\${c})?${c})`;
    })
    .join('|')}`,
  'g',
);

export class ESModuleLoader {
  private app: App;
  private globalVarKey: string;
  private moduleCache: Record<string, string> = {};

  constructor(app: App) {
    this.app = app;
    this.globalVarKey = `${__GARFISH_ESM_ENV__}_${this.app.appId}`;
  }

  private execModuleCode(blobUrl: string) {
    return (0, eval)(`import('${blobUrl}')`);
  }

  // TODO: base64 is too slow, but it can solve the problem of sourcemap debugging
  private async createBlobUrl(code: string) {
    return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  }

  private setBlobUrl(saveId: string, blobUrl: string) {
    if (this.moduleCache[saveId]) {
      URL.revokeObjectURL(this.moduleCache[saveId]);
    }
    this.moduleCache[saveId] = blobUrl;
  }

  private haveSourcemap(code: string) {
    return /[@#] sourceMappingURL=/g.test(code);
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

      if (!this.haveSourcemap(scriptCode)) {
        sourcemap = await createSourcemap(scriptCode, requestUrl);
      }
      scriptCode = await this.analysisModule(
        scriptCode,
        envVarStr,
        saveUrl,
        url,
      );
      const blobUrl = await this.createBlobUrl(
        `import.meta.url='${url}';${envVarStr}${scriptCode}\n${sourcemap}`,
      );
      this.setBlobUrl(saveUrl, blobUrl);
    }
  }

  // Remove comment and string
  private removeExtraCode(code: string) {
    code = ' ' + code.replace(COMMENT_REG, '');
    return code.replace(STRING_REG, (k1) => {
      return k1.startsWith('import') || k1.startsWith('export') ? k1 : '';
    });
  }

  private async analysisModule(
    code: string,
    envVarStr,
    baseUrl: string,
    realUrl: string,
  ) {
    let matchRes;
    const analysisCode = this.removeExtraCode(code);
    // Each module requires a brand new regular object
    const IMPORT_REG =
      /((import|export)\s?([^'"]*from\s*)?)['"]([^\n'";]+)['"]/g;
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
      // TODO: filter string
      return `${k2}'${blobUrl || k5}'`;
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
    options: ExecScriptOptions,
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
      if (!this.haveSourcemap(code)) {
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
      const blobUrl = await this.createBlobUrl(code);
      if (!options.isInline) {
        this.setBlobUrl(url, blobUrl);
      }
      this.execModuleCode(blobUrl);
    });
  }
}
