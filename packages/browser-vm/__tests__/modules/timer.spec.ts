import type { Sandbox } from '../../src/sandbox';

describe('timer module', () => {
  const createSandbox = (disableCollect = false) =>
    ({ options: { disableCollect } } as Sandbox);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('removes a timeout after it runs', () => {
    const clearTimeout = jest.spyOn(window, 'clearTimeout');
    const { timeoutModule } = require('../../src/modules/timer');
    const timer = timeoutModule(createSandbox());
    const callback = jest.fn();

    timer.override.setTimeout(callback, 10, 'value');
    jest.advanceTimersByTime(10);

    expect(callback).toHaveBeenCalledWith('value');
    expect(callback.mock.instances[0]).toBe(window);
    clearTimeout.mockClear();
    timer.recover();
    expect(clearTimeout).not.toHaveBeenCalled();
  });

  it('supports string handlers without retaining completed timeouts', () => {
    const clearTimeout = jest.spyOn(window, 'clearTimeout');
    const { timeoutModule } = require('../../src/modules/timer');
    const timer = timeoutModule(createSandbox());
    const originalName = window.name;
    window.name = 'before timeout';

    timer.override.setTimeout('window.name = String(1)', 10);
    jest.advanceTimersByTime(10);

    expect(window.name).toBe('1');
    clearTimeout.mockClear();
    timer.recover();
    expect(clearTimeout).not.toHaveBeenCalled();
    window.name = originalName;
  });

  it('removes a timeout when it is cleared explicitly', () => {
    const clearTimeout = jest.spyOn(window, 'clearTimeout');
    const { timeoutModule } = require('../../src/modules/timer');
    const timer = timeoutModule(createSandbox());
    const timeoutId = timer.override.setTimeout(() => {}, 10);

    timer.override.clearTimeout(timeoutId);
    expect(clearTimeout).toHaveBeenCalledWith(timeoutId);

    clearTimeout.mockClear();
    timer.recover();
    expect(clearTimeout).not.toHaveBeenCalled();
  });

  it('clears timeout records after recovery', () => {
    const clearTimeout = jest.spyOn(window, 'clearTimeout');
    const { timeoutModule } = require('../../src/modules/timer');
    const timer = timeoutModule(createSandbox());
    const firstId = timer.override.setTimeout(() => {}, 10);
    const secondId = timer.override.setTimeout(() => {}, 20);

    timer.recover();
    expect(clearTimeout).toHaveBeenCalledTimes(2);
    expect(clearTimeout).toHaveBeenCalledWith(firstId);
    expect(clearTimeout).toHaveBeenCalledWith(secondId);

    clearTimeout.mockClear();
    timer.recover();
    expect(clearTimeout).not.toHaveBeenCalled();
  });

  it('clears interval records after recovery', () => {
    const clearInterval = jest.spyOn(window, 'clearInterval');
    const { intervalModule } = require('../../src/modules/timer');
    const timer = intervalModule(createSandbox());
    const intervalId = timer.override.setInterval(() => {}, 10);

    timer.recover();
    expect(clearInterval).toHaveBeenCalledWith(intervalId);

    clearInterval.mockClear();
    timer.recover();
    expect(clearInterval).not.toHaveBeenCalled();
  });
});
