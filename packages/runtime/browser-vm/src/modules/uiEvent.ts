import { _extends, objectToString } from '@garfish/utils';

_extends(MouseEventPatch, MouseEvent);

export function MouseEventPatch(
  typeArg: string,
  mouseEventInit?: MouseEventInit,
): void {
  if (
    mouseEventInit &&
    objectToString.call(mouseEventInit.view) === '[object Window]'
  ) {
    mouseEventInit.view = window;
  }
  return new MouseEvent(typeArg, mouseEventInit) as any;
}

export function UiEventOverride() {
  class MouseEventPatch extends MouseEvent {
    constructor(typeArg: string, mouseEventInit?: MouseEventInit) {
      if (
        mouseEventInit &&
        objectToString.call(mouseEventInit.view) === '[object Window]'
      ) {
        mouseEventInit.view = window;
      }
      super(typeArg, mouseEventInit);
    }
  }
  return {
    override: {
      MouseEvent: MouseEventPatch as any,
    },
  };
}
