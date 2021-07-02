export function toEsModule<T>(component: T) {
  return {
    __esModule: true,
    default: component,
  };
}
