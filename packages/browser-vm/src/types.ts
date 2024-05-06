import { Sandbox } from './sandbox';
import type { LoaderOptions } from '@garfish/loader';

export type FakeWindow = Window & Record<PropertyKey, any>;
export type Module = (sandbox: Sandbox) => OverridesData | void;

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
  fixBaseUrl?: boolean;
  fixOwnerDocument?: boolean;
  fixStaticResourceBaseUrl?: boolean;
  disableWith?: boolean;
  strictIsolation?: boolean;
  disableElementtiming?: boolean;
  disableLinkTransformToStyle?: boolean;
  disableCollect?: boolean;
  modules?: Array<Module>;
  addSourceList?: (
    sourceInfo:
      | Array<{ tagName: string; url: string | URL | Request }>
      | { tagName: string; url: string | URL | Request },
  ) => void;
  loaderOptions?: LoaderOptions;
  styleScopeId?: () => string;
  el?: () => Element | ShadowRoot | null;
  protectVariable?: () => Array<PropertyKey>;
  insulationVariable?: () => Array<PropertyKey>;
}

export type StyledComponentCSSRulesData = Array<string>;
