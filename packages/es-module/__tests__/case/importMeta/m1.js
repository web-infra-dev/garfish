expect(Object.getPrototypeOf(import.meta)).toBe(null);

expect(Object.getOwnPropertyDescriptor(import.meta, 'url')).toEqual({
  writable: true,
  enumerable: true,
  configurable: true,
  value: 'http://localhost:3310/es-module/__tests__/case/importMeta/m1.js',
});
