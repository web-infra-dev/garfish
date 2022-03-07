function a() {
  return function b() {
    with ({}) {
    }
  };
}
a();
