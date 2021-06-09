interface Hook<T, R> {
  tapPromise(options: string, fn: (...args: Array<T>) => Promise<R>): void;
}

type bootstrap = Hook<string, Object>;

type extractCb<T> = T extends {
  tapPromise: (options: any, fn: (...args: infer A) => infer AR) => any;
}
  ? (...args: A) => AR
  : never;

type Test = extractCb<bootstrap>;
