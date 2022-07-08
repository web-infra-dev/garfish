import { Sandbox } from '../src/sandbox';
import assert from 'assert';
import { sandboxMap } from '../src/utils';
import {
  recordStyledComponentCSSRules,
  rebuildCSSRules,
} from '../src/dynamicNode';

// Garfish 使用 Proxy 对 dom 进行了劫持, 同时对调用 dom 的函数做了劫持, 修正 dom 节点的类型
// 对调用 dom 的相关方法进行测试
describe('Sandbox:Dom & Bom', () => {
  let sandbox: Sandbox;
  window.dispatchEvent = () => true;

  const go = (code: string) => {
    return `
      const sandbox = __debug_sandbox__;
      const Sandbox = sandbox.constructor;
      const nativeWindow = Sandbox.getNativeWindow();
      document.body.innerHTML = '<div id="root">123</div><div __garfishmockhead__></div>'
      ${code}
    `;
  };

  const create = (opts = {}) => {
    return new Sandbox({
      ...opts,
      namespace: 'app',
      el: () => document.createElement('div'),
      modules: [
        () => ({
          recover() {},
          override: {
            go,
            jest,
            expect,
          },
        }),
      ],
    });
  };

  beforeEach(() => {
    sandbox = create();
  });

  it('clear dom side effect', () => {
    const rootId = 'root';
    const testId = 'test';
    sandbox.execScript(
      go(`
        const root = document.getElementById('${rootId}');
        const div = document.createElement('div');
        const id = '${testId}';
        div.id = id;
        root.appendChild(div);
      `),
    );

    const rootNode = document.getElementById(rootId);
    const testNode = document.getElementById(testId);

    assert(rootNode, 'root node should exist');
    expect(rootNode.contains(testNode)).toBeTruthy();
    sandbox.close();

    expect(rootNode.contains(testNode)).toBeFalsy();
  });

  it('dom side effect memory leak', () => {
    const rootId = 'root';
    const testId = 'test';
    const test2Id = 'test2';
    sandbox.execScript(
      go(`
        const root = document.getElementById('${rootId}');
        const div = document.createElement('div');
        div.id = '${testId}';
        const div2 = document.createElement('div');
        div2.id = '${test2Id}';

        div.appendChild(div2);
        root.appendChild(div);
      `),
    );

    const rootNode = document.getElementById(rootId);
    const testNode = document.getElementById(testId);
    const test2Node = document.getElementById(testId);

    expect(sandbox.deferClearEffects.size).toBe(1);

    assert(testNode, 'root node should exist');
    assert(rootNode, 'rootNode node should exist');

    expect(testNode.contains(test2Node)).toBeTruthy();
    expect(rootNode.contains(testNode)).toBeTruthy();
    sandbox.close();

    expect(rootNode.contains(testNode)).toBeFalsy();
  });
});
