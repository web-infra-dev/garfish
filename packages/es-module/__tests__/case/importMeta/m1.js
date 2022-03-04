expect(Object.getPrototypeOf(import.meta)).toBe(null);

expect(Object.getOwnPropertyDescriptor(import.meta, 'url')).toEqual({
  writable: true,
  enumerable: true,
  configurable: true,
  value: 'http://localhost/case/importMeta/m1.js',
});
