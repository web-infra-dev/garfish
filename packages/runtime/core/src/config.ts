import { Options } from './type';
import { deepMerge, error } from '@garfish/utils';

const defaultOptions: Options = {
  apps: [],
  basename: '',
  // sandbox: {
  //   snapshot: false,
  //   useStrict: true,
  //   strictIsolation: false,
  // },
  // protectVariable: [],
  // insulationVariable: [],
  // autoRefreshApp: true,
  // disableStatistics: false,
  // disablePreloadApp: false,
  // domGetter: () => null,
  // beforeLoad: () => {},
  // afterLoad: () => {},
  // beforeEval: () => {},
  // afterEval: () => {},
  // beforeMount: () => {},
  // afterMount: () => {},
  // beforeUnmount: () => {},
  // afterUnmount: () => {},
  // errorLoadApp: (err) => error(err),
  // errorMountApp: (err) => error(err),
  // errorUnmountApp: (err) => error(err),
  // onNotMatchRouter: () => {},
};

export const getDefaultOptions = () => deepMerge({}, defaultOptions);
