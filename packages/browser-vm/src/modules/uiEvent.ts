import { getType } from '@garfish/utils';

// The logic of UIEvent is referenced from qiankun typography
// https://github.com/umijs/qiankun/pull/593/files
// TODO: fix normal mouse event instanceof MouseEvent === false
export class MouseEventPatch extends MouseEvent {
  constructor(typeArg: string, mouseEventInit?: MouseEventInit) {
    if (mouseEventInit && getType(mouseEventInit.view) === 'window') {
      mouseEventInit.view = window;
    }
    super(typeArg, mouseEventInit);
  }
}

export function UiEventOverride() {
  return {
    override: {
      MouseEvent: MouseEventPatch as any,
    },
  };
}
