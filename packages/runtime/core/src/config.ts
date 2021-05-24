import { deepMerge, error } from '@garfish/utils';
import { interfaces } from './interface';

export const lifecycle: Array<Exclude<
  keyof interfaces.HooksLifecycle,
  'customLoader'
>> = [
  'beforeLoad',
  'afterLoad',
  'beforeEval',
  'afterEval',
  'beforeMount',
  'afterMount',
  'beforeUnmount',
  'afterUnmount',
  'errorLoadApp',
  'errorMountApp',
  'errorUnmountApp',
];

const defaultOptions: interfaces.Options = {
  apps: [],
  basename: '',
  domGetter: () => null,
  sandbox: {
    snapshot: false,
    useStrict: true,
    strictIsolation: false,
  },
  nested: false,
  protectVariable: [],
  insulationVariable: [],
  autoRefreshApp: true,
  disableStatistics: false,
  disablePreloadApp: false,
  beforeLoad: async () => {},
  afterLoad: () => {},
  beforeEval: () => {},
  afterEval: () => {},
  beforeMount: () => {},
  afterMount: () => {},
  beforeUnmount: () => {},
  afterUnmount: () => {},
  errorLoadApp: (err) => error(err),
  errorMountApp: (err) => error(err),
  errorUnmountApp: (err) => error(err),
  onNotMatchRouter: () => {},
};

export const getDefaultOptions = () => deepMerge({}, defaultOptions);
