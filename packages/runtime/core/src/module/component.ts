import { evalWithEnv, setDocCurrentScript } from '@garfish/utils';
import { Garfish } from '../garfish';
import { interfaces } from '../interface';

export class Component {
  public name: string;
  public cjsModules: Record<string, any>;
  public componentInfo: interfaces.ComponentInfo;
  public esModule: boolean = false;
  public manager: interfaces.JsResource;
  private context: Garfish;
  public global: any = window;

  constructor(
    context: Garfish,
    componentInfo: interfaces.ComponentInfo,
    manager: interfaces.JsResource,
  ) {
    this.context = context;
    this.name = componentInfo.name;
    this.componentInfo = componentInfo;
    this.manager = manager;
    this.cjsModules = {
      exports: {},
      module: this.cjsModules,
      require: (_key: string) => context.externals[_key],
    };
    this.init();
  }

  init() {
    const { code, url } = this.manager.opts;

    //Execute script
    try {
      this.execScript(code, {}, url, {
        async: false,
        noEntry: false,
      });
    } catch (err) {
      console.error(err);
    }
  }

  execScript(
    code: string,
    env: Record<string, any>,
    url?: string,
    options?: { async?: boolean; noEntry?: boolean },
  ) {
    const revertCurrentScript = setDocCurrentScript(
      this.global.document,
      code,
      true,
      url,
      options.async,
    );
    env = this.getExecScriptEnv() || {};
    const sourceUrl = url ? `//# sourceURL=${url}\n` : '';

    try {
      // const fn = evalWithEnv(`;${code}\n${sourceUrl}`, env);
      // Todo: Provide extensions for component source code parsing
      const fn = eval(`;${code}\n${sourceUrl}`);
      fn.call(env.exports, env.module, env.exports, env.require.bind(env));
    } catch (e) {
      // this.context.hooks.lifecycle.errorExecCode.call(this.componentInfo, e);
      throw e;
    }
    revertCurrentScript();
  }

  getComponent() {
    return this.cjsModules.exports.default || this.cjsModules.exports;
  }

  getExecScriptEnv() {
    // The legacy of commonJS function support
    return this.esModule ? {} : this.cjsModules;
  }
}
