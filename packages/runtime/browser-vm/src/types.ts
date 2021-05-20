import { Sandbox } from './sandbox';

export type FakeWindow = Window & Record<PropertyKey, any>;

export interface OverridesData {
  recover?: () => void;
  override?: Record<string, any>;
  created?: (context: Sandbox['context']) => void;
  prepare?: () => void;
}

export type Module = (sandbox: Sandbox) => OverridesData;

export interface SandboxOptions {
  hooks?: Hooks;
  baseUrl?: string;
  namespace: string;
  strictIsolation?: boolean;
  useStrict?: boolean;
  openSandbox?: boolean;
  modules?: Record<string, Module>;
  disabled?: Record<string, boolean>;
  el?: () => Element | ShadowRoot;
  protectVariable?: () => Array<PropertyKey>;
  insulationVariable?: () => Array<PropertyKey>;
  requestConfig?: RequestInit | ((url: string) => RequestInit);
}

export interface ExecScriptOptions {
  async?: boolean;
  noEntry?: boolean;
}

interface InvokeBeforeRefs {
  url: string;
  code: string;
  context: FakeWindow;
}

// hooks
type onclose = (sandbox: Sandbox) => void;
type onstart = (sandbox: Sandbox) => void;
type onerror = (err: Error | string) => void;
type onClearEffect = (sandbox: Sandbox) => void;
type onCreateContext = (sandbox: Sandbox) => void;
type onInvokeAfter = (sandbox: Sandbox, refs: InvokeBeforeRefs) => void;
type onInvokeBefore = (sandbox: Sandbox, refs: InvokeBeforeRefs) => void;
type onAppendNode = (
  sandbox: Sandbox,
  rootEl: Element,
  newEl: Element,
  tag: string,
  oldEl: Element,
) => void;

export interface Hooks {
  onstart?: onstart | Array<onstart>;
  onclose?: onclose | Array<onclose>;
  onerror?: onerror | Array<onerror>;
  onAppendNode?: onAppendNode | Array<onAppendNode>;
  onClearEffect?: onClearEffect | Array<onClearEffect>;
  onInvokeAfter?: onInvokeAfter | Array<onInvokeAfter>;
  onInvokeBefore?: onInvokeBefore | Array<onInvokeBefore>;
  onCreateContext?: onCreateContext | Array<onCreateContext>;
}
