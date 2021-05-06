import { PatchGlobalVal } from '../patchers/variable';

// 1.测试沙盒能否正常清除沙盒运行期间对window全局变量产生的副作用变量
// 2.测试沙盒能否能正常保护指定变量在沙盒关闭后不会清除
describe('test sandbox window', () => {
  it('test normal obj', () => {
    const obj: any = {
      update: 'update value',
      name: 'add delete val',
      nObj: { name: 'hello' },
    };

    const nVal = new PatchGlobalVal(obj);
    nVal.activate();

    obj.a = 'hello';
    obj.update = 'new value';
    delete obj.name;

    nVal.deactivate();

    expect(obj).toMatchSnapshot();

    nVal.activate();
    expect(obj).toMatchSnapshot();
  });
});
