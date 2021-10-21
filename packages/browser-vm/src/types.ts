import { Sandbox } from './sandbox';
import type { LoaderOptions } from '@garfish/loader';

export type FakeWindow = Window & Record<PropertyKey, any>;
export type Module = (sandbox: Sandbox) => OverridesData;

export interface OverridesData {
  recover?: () => void;
  prepare?: () => void;
  created?: (context: Sandbox['global']) => void;
  override?: Record<PropertyKey, any>;
}
export interface ReplaceGlobalVariables {
  recoverList: Array<OverridesData['recover']>;
  prepareList: Array<OverridesData['prepare']>;
  createdList: Array<OverridesData['created']>;
  overrideList: Record<PropertyKey, any>;
}

export interface SandboxOptions {
  namespace: string;
  baseUrl?: string;
  disableWith?: boolean;
  openSandbox?: boolean;
  strictIsolation?: boolean;
  modules?: Array<Module>;
  sourceList?: Array<{ tagName: string; url: string }>;
  loaderOptions?: LoaderOptions;
  el?: () => Element | ShadowRoot | null;
  protectVariable?: () => Array<PropertyKey>;
  protectStorage?: () => Array<string>;
  insulationVariable?: () => Array<PropertyKey>;
}

export interface ExecScriptOptions {
  async?: boolean;
  noEntry?: boolean;
}
