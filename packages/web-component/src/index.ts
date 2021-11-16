import { def } from '@garfish/utils';
import { CustomOptions, generateCustomerElement } from './customerElement';
export { GarfishInstance as Garfish } from './instance';

interface AppInfo {
  name: string;
  entry: string;
  basename: string;
}

function createLoadableWebComponent(htmlTag: string, options: CustomOptions) {
  if (typeof htmlTag !== 'string') {
    throw new Error('garfish requires a `htmlTag` name');
  }

  if (!options.loading) {
    throw new Error('garfish requires a `loading` component');
  }

  const opts = Object.assign(
    {
      loading: false,
      delay: 200,
      timeout: null,
    },
    options,
  );
  return generateCustomerElement(htmlTag, opts);
}

def(window, '__GARFISH__', true);

export function defineCustomElements(htmlTag: string, options: CustomOptions) {
  return createLoadableWebComponent(htmlTag, options);
}
