import type { ModuleManager } from '@garfish/loader';
import {
  PluginSystem,
  SyncHook,
  SyncWaterfallHook,
  AsyncWaterfallHook,
} from '@garfish/hooks';
import type { Actuator } from './actuator';

export const hooks = new PluginSystem({
  preloaded: new SyncHook<[ModuleManager], any>(),
  initModule: new SyncHook<[Actuator], any>('initModule'),
  beforeLoadModule: new SyncWaterfallHook<Record<PropertyKey, any>>(
    'beforeLoadModule',
  ),
  asyncBeforeLoadModule: new AsyncWaterfallHook<Record<PropertyKey, any>>(
    'beforeLoadModule',
  ),
  afterLoadModule: new SyncWaterfallHook<Record<PropertyKey, any>>(
    'afterLoadModule',
  ),
});
