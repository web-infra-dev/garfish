import { ImportSpecifier, init, parse } from 'es-module-lexer';
import type { JavaScriptManager } from '@garfish/loader';
import {
  isAbsolute,
  transformUrl,
  haveSourcemap,
  createSourcemap,
} from '@garfish/utils';
import { interfaces } from '../interface';
import type { App } from './app';

const __GARFISH_ESM_ENV__ = '__GARFISH_ESM_ENV__';

export const getModuleImportProcessor = (code: string) => {
  // split code into two segments
  // avoid 'pause before potential out of memory crash' in chrome
  // for super large string, it can improve performance as well
  let finalCode = '';
  let resetCode = code;
  let prevCodeIndex = 0;
  const rawImport = 'import';
  const wrapImport = '_import_';
  return (importAnalysis: ImportSpecifier, newModuleName = '') => {
    const { d: importType, n: moduleName, s, e, ss, se } = importAnalysis;
    const isDynamicImport = importType > -1;
    if (isDynamicImport) {
      // dynamic import
      // replace 'import' keyword
      const codeStart = ss - prevCodeIndex;
      const codeEnd = se - prevCodeIndex;
      const dynamicImportStatement = resetCode.slice(codeStart, codeEnd);
      // append the code before import statement
      finalCode += resetCode.slice(0, codeStart);
      // append import statement
      finalCode += dynamicImportStatement.replace(rawImport, wrapImport);
      resetCode = resetCode.slice(codeEnd);
      prevCodeIndex = se;
    } else if (moduleName) {
      // static import
      // replace module name
      const codeStart = s - prevCodeIndex;
      const codeEnd = e - prevCodeIndex;
      // append the code before import name
      finalCode += resetCode.slice(0, codeStart);
      // append new import name
      finalCode += newModuleName;
      resetCode = resetCode.slice(codeEnd);
      prevCodeIndex = e;
    }
    return [finalCode, resetCode];
  };
};

export const genShellExecutionCode = (
  id: string | number,
  sourceModuleName: string,
  shellUrl: string,
) =>
  `;import*as m$$_${id} from'${sourceModuleName}';import{u$$_ as u$$_${id}}from'${shellUrl}';u$$_${id}(m$$_${id})`;

let isEsmInit = false;

interface ModuleCacheItem {
  blobUrl?: string;
  shellUrl?: string;
  shellExecuted?: boolean;
  analysis?: ReturnType<typeof parse>;
  source: string;
}

export class ESModuleLoader {
  private app: App;
  private globalVarKey: string;
  private moduleCache: Record<string, ModuleCacheItem> = {};

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
    this.moduleCache[saveId].blobUrl = blobUrl;
  }

  private async fetchModuleResource(
    envVarStr: string,
    noEntryEnvVarStr: string,
    saveUrl: string,
    requestUrl: string,
  ) {
    const { resourceManager } =
      await this.app.context.loader.load<JavaScriptManager>({
        scope: this.app.name,
        url: requestUrl,
      });
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
        noEntryEnvVarStr,
        saveUrl,
        url,
      );
      const blobUrl = await this.createBlobUrl(
        `import.meta.url='${url}';${this.app.isNoEntryScript(url) ? noEntryEnvVarStr : envVarStr}${scriptCode}\n${sourcemap}`,
      );
      this.setBlobUrl(saveUrl, blobUrl);
    }
  }

  private getUrl(referUrl, targetUrl) {
    return !isAbsolute(targetUrl) && referUrl
      ? transformUrl(referUrl, targetUrl)
      : targetUrl;
  }

  private preloadStaticModuleAsync(
    analysis: ReturnType<typeof parse>,
    realUrl?: string | null,
  ) {
    const [imports] = analysis;

    for (let i = 0, length = imports.length; i < length; i++) {
      const importAnalysis = imports[i];
      const { d: importType, n: moduleName } = importAnalysis;
      const isDynamicImport = importType > -1;
      if (moduleName && !isDynamicImport) {
        // async preload all static import module of current file
        this.app.context.loader.load<JavaScriptManager>({
          scope: this.app.name,
          url: this.getUrl(realUrl, moduleName),
        });
      }
    }
  }

  private async analysisModule(
    code: string,
    envVarStr: string,
    noEntryEnvVarStr: string,
    baseUrl?: string,
    realUrl?: string | null,
  ) {
    if (!isEsmInit) {
      // this is necessary for the Web Assembly boot
      await init;
      isEsmInit = true;
    }

    const analysis = parse(code, realUrl || '');
    const thisModule: ModuleCacheItem = {
      analysis,
      source: code,
    };

    if (baseUrl) {
      this.moduleCache[baseUrl] = thisModule;
    }

    let result = ['', code];
    let shellExecutionCode = '';
    const dynamicImport = `var _import_=(url)=>window.${this.globalVarKey}.import(url,'${baseUrl}','${realUrl}');`;
    const processImportModule = getModuleImportProcessor(code);
    const [imports] = analysis;

    this.preloadStaticModuleAsync(analysis, realUrl);

    for (let i = 0, length = imports.length; i < length; i++) {
      const importAnalysis = imports[i];
      const { d: importType, n: moduleName } = importAnalysis;
      const isDynamicImport = importType > -1;
      let saveUrl = moduleName || '';
      let newModuleName = '';
      if (moduleName && !isDynamicImport) {
        // static import
        const requestUrl = this.getUrl(realUrl, moduleName);
        saveUrl = this.getUrl(baseUrl, moduleName);

        let currentModule = this.moduleCache[saveUrl];
        if (currentModule && !currentModule.blobUrl) {
          // circular dependency
          if (!currentModule.shellUrl) {
            const [currentModuleImports, currentModuleExports] =
              currentModule.analysis!;
            // case 'export * from "xxx"'
            // we can find this in the import statement
            const wildcardExports = currentModuleImports.filter(
              (importItem) => {
                const statement = currentModule.source.substring(
                  importItem.ss,
                  importItem.se,
                );
                return /^export\s*\*\s*from\s*/.test(statement);
              },
            );
            const wildcardExportStatements: string[] = [];
            for (let j = 0, l = wildcardExports.length; j < l; j++) {
              // find wildcard exports
              const wildcardExport = wildcardExports[j];
              const wildcardExportUrl = wildcardExport.n || '';
              const wildcardExportSaveUrl = this.getUrl(
                baseUrl,
                wildcardExportUrl,
              );
              // fetch and analyze wildcard export module
              await this.fetchModuleResource(
                envVarStr,
                noEntryEnvVarStr,
                wildcardExportSaveUrl,
                this.getUrl(realUrl, wildcardExportUrl),
              );
              const wildcardModule = this.moduleCache[wildcardExportSaveUrl];
              if (wildcardModule?.blobUrl) {
                wildcardExportStatements.push(
                  `export * from '${wildcardModule.blobUrl}'`,
                );
              }
            }
            // create a shell code for delay assignment
            currentModule.shellUrl = await this.createBlobUrl(
              `export function u$$_(m){${currentModuleExports
                .map((name) =>
                  name === 'default' ? 'd$$_=m.default' : `${name}=m.${name}`,
                )
                .join(',')}}${currentModuleExports
                .map((name) =>
                  name === 'default'
                    ? 'let d$$_;export{d$$_ as default}'
                    : `export let ${name}`,
                )
                .join(';')}${
                wildcardExportStatements.length
                  ? `;${wildcardExportStatements.join(';')}`
                  : ''
              }\n//# sourceURL=${saveUrl}?cycle`,
            );
          }
          newModuleName = currentModule.shellUrl;
        } else if (!currentModule) {
          await this.fetchModuleResource(envVarStr, noEntryEnvVarStr, saveUrl, requestUrl);
          currentModule = this.moduleCache[saveUrl];
          const { blobUrl, shellUrl, shellExecuted } = currentModule;
          newModuleName = blobUrl!;
          if (shellUrl && !shellExecuted) {
            // find circular shell, just execute it
            shellExecutionCode += genShellExecutionCode(
              i,
              newModuleName,
              shellUrl,
            );
            currentModule.shellExecuted = true;
          }
        } else {
          newModuleName = currentModule.blobUrl!;
        }
      }
      result = processImportModule(importAnalysis, newModuleName || moduleName);
    }

    // clear
    thisModule.source = '';
    delete thisModule.analysis;

    return `${dynamicImport}${shellExecutionCode};${result.join('')}`;
  }

  destroy() {
    for (const key in this.moduleCache) {
      const { blobUrl, shellUrl } = this.moduleCache[key];
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      if (shellUrl) {
        URL.revokeObjectURL(shellUrl);
      }
    }
    this.moduleCache = {};
    delete this.app.global[this.globalVarKey];
  }

  load(
    code: string,
    env: Record<string, any>,
    url?: string,
    options?: interfaces.ExecScriptOptions,
  ) {
    return new Promise<void>(async (resolve) => {
      if (url && this.moduleCache[url]) {
        return resolve();
      }

      const genShellCodeWrapper = (
        blobUrl: string,
        shellUrl: string,
        sourceUrl: string,
      ) => {
        return `export * from '${blobUrl}'${genShellExecutionCode(
          0,
          blobUrl,
          shellUrl,
        )}\n//# sourceURL=${sourceUrl}?cycle`;
      };

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
          let targetModule = this.moduleCache[saveUrl];
          if (!targetModule?.blobUrl) {
            await this.fetchModuleResource(envVarStr, noEntryEnvVarStr, saveUrl, requestUrl);
            targetModule = this.moduleCache[saveUrl];
          }
          if (
            targetModule &&
            targetModule.shellUrl &&
            !targetModule.shellExecuted &&
            targetModule.blobUrl
          ) {
            // if the top level load is a shell code, we need to run its update function
            return this.execModuleCode(
              await this.createBlobUrl(
                genShellCodeWrapper(
                  targetModule.blobUrl,
                  targetModule.shellUrl,
                  saveUrl,
                ),
              ),
            );
          }
          return this.execModuleCode(targetModule.blobUrl!);
        },
      };
      const genEnvVarStr = (targetEnv: Record<string, any>, noEntry?: boolean) => {
        const newEnv = { ...targetEnv };
        if (noEntry) {
          delete newEnv.exports;
          delete newEnv.module;
        }
        return Object.keys(newEnv).reduce((prevCode, name) => {
          if (name === 'resolve' || name === 'import') return prevCode;
          return `${prevCode} var ${name} = window.${this.globalVarKey}.${name};`;
        }, '');
      };
      const envVarStr = genEnvVarStr(env);
      const noEntryEnvVarStr = genEnvVarStr(env, true);

      let sourcemap = '';
      if (!haveSourcemap(code) && url) {
        sourcemap = await createSourcemap(
          code,
          options && options.isInline
            ? `index.html(inline.${this.app.scriptCount}.js)`
            : url,
        );
      }

      code = await this.analysisModule(code, envVarStr, noEntryEnvVarStr, url, url);
      code = `import.meta.url='${url}';${options?.noEntry ? noEntryEnvVarStr : envVarStr}${code}\n;window.${this.globalVarKey}.resolve();\n${sourcemap}`;

      this.app.global[this.globalVarKey] = env;

      let blobUrl = await this.createBlobUrl(code);
      if (options && !options.isInline && url) {
        this.setBlobUrl(url, blobUrl);
      }
      const currentModule = this.moduleCache[url || ''];
      if (currentModule?.shellUrl && !currentModule.shellExecuted) {
        // if the top level load is a shell code, we need to run its update function
        blobUrl = await this.createBlobUrl(
          genShellCodeWrapper(blobUrl, currentModule.shellUrl, url || ''),
        );
      }
      this.execModuleCode(blobUrl);
    });
  }
}
