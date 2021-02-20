import { createContext } from '../src/index';
import { preloadApp } from '../src/preloadApp';
import { __GARFISH_FLAG__ } from '../src/utils';
import { mockHtmlEntry } from './testUtils';

describe('Garfish index', () => {
  beforeEach(() => {
    if ((preloadApp as any)._registered) {
      delete (preloadApp as any)._registered;
    }
  });

  afterEach(() => {
    // 清除副作用
    if (window.__GARFISH__) {
      delete (window as any).Gar;
      delete (window as any).__GAR__;
      delete window.Garfish;
      delete window.__GARFISH__;
      delete window.__PROWER_BY_GAR__;
    }
  });

  it('Global identifier', () => {
    const garfish = createContext();
    expect(garfish.flag === __GARFISH_FLAG__).toBe(true);
  });

  it('The "preloadApp" plugin is installed by default', () => {
    createContext().run({} as any);
    expect((preloadApp as any)._registered).toBe(true);
  });

  it('Sub-app render normally after hot update', (done) => {
    let callCount = 0;
    const el = document.createElement('div');

    const webpackHotUpdate = function (a: Number, b: Number) {
      callCount++;
      expect(a).toBe(1);
      expect(b).toBe(2);
      expect(this === window).toBe(true);
      document.body.appendChild(el);
    };

    (window as any).webpackHotUpdate = webpackHotUpdate;
    expect((window as any).webpackHotUpdate === webpackHotUpdate).toBe(true);

    const garfish = createContext();
    garfish.run({
      domGetter: () => document.body,
      apps: [
        {
          name: 'app',
          entry: mockHtmlEntry,
        },
      ],
    });

    expect((window as any).webpackHotUpdate === webpackHotUpdate).toBe(false);

    garfish.loadApp('app').then(async (app) => {
      await app.mount();
      expect(app.display).toBe(true);
      expect(app.mounted).toBe(true);

      const spyShow = jest.spyOn(app, 'show');
      const spyHide = jest.spyOn(app, 'hide');

      (window as any).webpackHotUpdate(1, 2);

      setTimeout(async () => {
        expect(callCount).toBe(1);
        expect(app.display).toBe(true);
        expect(app.mounted).toBe(true);
        expect(spyShow).toHaveBeenCalled();
        expect(spyHide).toHaveBeenCalled();

        spyShow.mockRestore();
        spyHide.mockRestore();
        delete (window as any).webpackHotUpdate;
        el.parentNode && el.parentNode.removeChild(el);

        done();
      });
    });
  });

  it('The only garfish instance [1]', () => {
    const one = createContext();
    const two = createContext();
    expect(one === two).toBe(true);
    expect(one.id === two.id).toBe(true);
  });

  // 这个测试用例只能放在最后
  it('The only garfish instance [2]', () => {
    Object.defineProperty(window, '__GARFISH__', {
      value: null,
      writable: true,
      configurable: false,
    });
    expect(window.__GARFISH__).toBe(null);
    createContext();
    expect(window.__GARFISH__).toBe(true);
  });
});
