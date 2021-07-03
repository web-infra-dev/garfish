export function esModule<T>(obj: T) {
  return {
    default: obj,
    __esModule: true,
  };
}
