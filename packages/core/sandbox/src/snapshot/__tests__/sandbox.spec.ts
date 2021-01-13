import { SnapshotSandbox } from '../index';

describe('test sandbox ', () => {
  it('dom sandbox', () => {
    document.head.innerHTML = `
      <style>body{color: 'yellow';}</style>
    `;

    const obj = {
      name: 'bytedance',
      age: '8',
      some: 'test delete',
    };

    const sb = new SnapshotSandbox('app1', obj);

    const st = document.createElement('style');
    st.style.cssText = 'background: red;';
    document.head.appendChild(st);
    obj.name = 'wu';
    obj.age = '23';
    delete obj.some;

    sb.deactivate();

    const result = document.querySelectorAll('style');
    expect(result).toMatchSnapshot();
    expect(obj).toMatchSnapshot();
  });
});
