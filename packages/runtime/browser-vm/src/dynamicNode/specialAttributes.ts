import { warn } from '@garfish/utils';
import { sandboxMap } from '../utils';

const ownerDocumentAndParentNode = () => {
  [
    'ownerDocument',
    // 'parentNode'
  ].forEach((key) => {
    Object.defineProperty(window.Element.prototype, key, {
      get() {
        const sandbox = this && sandboxMap.get(this);
        return sandbox ? sandbox.global.document : document;
      },
      set() {
        __DEV__ && warn(`"${key}" is a read-only attribute.`);
      },
    });
  });
};

export function wrapAttributes() {
  ownerDocumentAndParentNode();
}
