export type AppInfo = {
  appName: string;
  dom: Element | ShadowRoot | Document;
  basename: string;
  appRenderInfo: Record<string, any>;
  props: Record<string, any>;
};

export type LoadRootComponent<T> = (opts: AppInfo) => Promise<T>;

export type TypeComponent<T> =
  | {
      rootComponent: T;
      loadRootComponent?: LoadRootComponent<T>;
    }
  | {
      rootComponent?: T;
      loadRootComponent: LoadRootComponent<T>;
    };

export type OptionalType<T extends new (...args: any) => any> = {
  Vue: T;
  canUpdate: boolean; // by default, allow parcels created with garfish-react-bridge to be updated
  appOptions: (
    opts: Record<string, any>,
  ) => Record<string, any> | Record<string, any>;
  handleInstance: (vueInstance: InstanceType<T>, opts: AppInfo) => void;
};

export type UserOptions<T, U> = TypeComponent<U> & Partial<OptionalType<T>>;
