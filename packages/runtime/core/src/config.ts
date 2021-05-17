import { deepMerge, error } from '@garfish/utils';
import { interfaces } from './interface';

const defaultOptions: interfaces.Options = {
  apps: [],
  basename: '',
  sandbox: {
    snapshot: false,
    useStrict: true,
    strictIsolation: false,
  },
  protectVariable: [],
  insulationVariable: [],
  autoRefreshApp: true,
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
