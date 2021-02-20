declare const __DEV__: boolean;
declare const __TEST__: boolean;
declare const __BROWSER__: boolean;
declare const __VERSION__: string;
type Writeable<T> = { -readonly [P in keyof T]: T[P] };
type CombinePromise<T> = T extends Promise<infer P> ? P : T;
