export type PropsInfo = {
  appName: string;
  dom: Element | ShadowRoot | Document;
  basename: string;
  appRenderInfo: Record<string, any>;
  props: Record<string, any>;
};

export type AppInfo = PropsInfo;

export type LoadRootComponent<T> = (opts: PropsInfo) => Promise<T>;
export type TypeComponent<T> =
  | {
      rootComponent: T;
      loadRootComponent?: LoadRootComponent<T>;
    }
  | {
      rootComponent?: T;
      loadRootComponent: LoadRootComponent<T>;
    };

export type ErrorBoundary<T> = (
  caughtError: Error | any,
  props: any,
) => T | null;

export type RenderTypes =
  | 'createRoot'
  | 'unstable_createRoot'
  | 'createBlockingRoot'
  | 'unstable_createBlockingRoot'
  | 'render'
  | 'hydrate';

export type OptionalType<T, U, E> = {
  React: T;
  ReactDOM: U;
  errorBoundary: ErrorBoundary<E>;
  renderResults: Record<string, U>;
  renderType: RenderTypes | (() => RenderTypes);
  el: string;
  canUpdate: boolean; // by default, allow parcels created with garfish-react-bridge to be updated
  suppressComponentDidCatchWarning: boolean;
  domElements: Record<string, HTMLElement>;
  updateResolves: Record<string, Array<any>>;
};

export type UserOptions<T, U, C, E> = TypeComponent<C> &
  Partial<OptionalType<T, U, E>>;
