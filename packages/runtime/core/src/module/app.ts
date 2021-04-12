import { AppInfo, LoadAppOptions } from '../type';
import { evalWithEnv } from '@garfish/utils';

const __GARFISH_EXPORTS__ = '__GARFISH_EXPORTS__';

export class App {
  public appInfo: AppInfo;
  public options: LoadAppOptions;
  public cjsModules: Record<string, any>;
  public customExports: Record<string, any> = {}; // 如果不希望使用 cjs 导出，可以用这个

  constructor(appInfo: AppInfo, options: LoadAppOptions) {
    this.appInfo = appInfo;
    this.options = options;
    this.cjsModules = {
      exports: {},
      module: this.cjsModules,
      require: (_key: string) => null,
    };
  }

  // TODO: 增加执行代码编译过程失败Hook
  execScript(
    code: string,
    url?: string,
    options?: { async?: boolean; noEntry?: boolean },
  ) {
    const sourceUrl = url ? `//# sourceURL=${url}\n` : '';
    const { noEntry, async } = options;

    const Env = noEntry
      ? { [__GARFISH_EXPORTS__]: this.customExports } // 如果不希望使用 cjs 导出，可以用这个
      : this.cjsModules;

    try {
      evalWithEnv(`;${code}\n${sourceUrl}`, Env);
    } catch (e) {
      // this.context.emit(ERROR_COMPILE_APP, this, e);
      throw e;
    }
  }
}
