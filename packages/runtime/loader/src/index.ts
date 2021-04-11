import { Loader } from './apis';
import { preload } from './preload';

export default function (context: any) {
  return {
    name: 'loader',
    afterPlugin() {
      const appInfos = context.appInfos;
    },
  };
}
