import { Sandbox } from '../src/sandbox';

describe('test sandbox ', () => {
  it('dom sandbox', () => {
    document.head.innerHTML = `
      <style>body{color: 'yellow';}</style>
    `;

    const obj = {
      name: 'zhoushaw',
      age: '24',
      some: 'test delete',
    };

    const sb = new Sandbox('app1', [], obj);

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
