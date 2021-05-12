import { PatchGlobalVal } from '../src/patchers/variable';

// 1.Can remove the sand box running normal test box during the side effects of the variables on the window global variables
// 2.Test sandbox can protect properly named variables in the closure will not remove the sandbox
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
