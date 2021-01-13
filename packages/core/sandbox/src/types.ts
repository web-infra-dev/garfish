import { Sandbox } from './context';

export type FakeWindow = Window & Record<PropertyKey, any>;

export interface OverridesData {
  recover?: () => void;
  override?: Record<string, any>;
  created?: (context: Sandbox['context']) => void;
}

export type Module = (sandbox: Sandbox) => OverridesData;

export interface SandboxOptions {
  hooks?: Hooks;
  baseUrl?: string;
  namespace: string;
  proxyBody?: boolean;
  useStrict?: boolean;
  openSandBox?: boolean;
  modules?: Record<string, Module>;
  disabled?: Record<string, boolean>;
  el?: () => Element;
  protectVariable?: () => Array<PropertyKey>;
  insulationVariable?: () => Array<PropertyKey>;
}

interface InvokeBeforeRefs {
  code: string;
  params: Array<string>;
  global: FakeWindow;
  onerror: Function | onerror;
  recovers: OverridesData['override'];
  overrides: OverridesData['recover'];
}

// hooks
type onclose = (sandbox: Sandbox) => void;
type onstart = (sandbox: Sandbox) => void;
type onerror = (err: Error | string) => void;
type onClearEffect = (sandbox: Sandbox) => void;
type onCreateContext = (sandbox: Sandbox) => void;
type onInvokeAfter = (sandbox: Sandbox) => void;
type onInvokeBefore = (sandbox: Sandbox, refs: InvokeBeforeRefs) => void;
type onAppendNode = (
  sandbox: Sandbox,
  rootEl: Element,
  el: Element,
  tag: string,
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
