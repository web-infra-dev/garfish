import * as ets from '../src/eventTypes';

describe('Garfish eventTypes', () => {
  it('Check types', () => {
    expect(ets.BEFORE_BOOTSTRAP).toBe('beforeBootstrap');
    expect(ets.BOOTSTRAP).toBe('bootstrap');
    expect(ets.REGISTER_APP).toBe('registerApp');
    expect(ets.BEFORE_LOAD_APP).toBe('beforeLoadApp');
    expect(ets.START_LOAD_APP).toBe('startLoadApp');
    expect(ets.CREATE_APP).toBe('createApp');
    expect(ets.LOAD_APP_ERROR).toBe('loadAppError');
    expect(ets.END_LOAD_APP).toBe('endLoadApp');
    expect(ets.START_COMPILE_APP).toBe('startCompileApp');
    expect(ets.END_COMPILE_APP).toBe('endCompileApp');
    expect(ets.ERROR_COMPILE_APP).toBe('errorCompileApp');
    expect(ets.START_MOUNT_APP).toBe('startMountApp');
    expect(ets.END_MOUNT_APP).toBe('endMountApp');
    expect(ets.START_UNMOUNT_APP).toBe('startUnmountApp');
    expect(ets.END_UNMOUNT_APP).toBe('endUnmountApp');
    expect(ets.ERROR_MOUNT_APP).toBe('errorMountApp');
    expect(ets.ERROR_UNMOUNT_APP).toBe('errorUnmountApp');

    // 允许增加，不允许删除
    expect(Object.keys(ets).length >= 17).toBe(true);
  });
});
