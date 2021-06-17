import { warn, hasOwn } from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { __windowBind__, __garfishGlobal__ } from '../symbolTypes';
import {
  bind,
  isEsMethod,
  isConstructor,
  verifyDescriptor,
  verifySetDescriptor,
} from '../utils';

// window proxy getter
export function createGetter(sandbox: Sandbox) {
  return function (target: Window, p: PropertyKey, receiver: any) {
    let value;
    const overrides = sandbox.overrideContext.overrides;

    if (sandbox.isProtectVariable(p)) {
      // Don't pass the "receiver", otherwise it will cause the wrong point of this
      return Reflect.get(window, p);
    } else if (sandbox.isInsulationVariable(p)) {
      value = Reflect.get(target, p, receiver);
    } else {
      value = hasOwn(target, p)
        ? Reflect.get(target, p, receiver)
        : Reflect.get(window, p);
    }

    if (typeof value === 'function') {
      // The following situations do not require "bind"
      //  1. The global method on the native es standard
      //  2. Methods internal to the sandbox or rewritten by the user
      //  3. Constructor
      // After filtering out custom and native es functions, only bom and dom functions are left
      // Make judgments such as constructors for these environment-related functions to further narrow the scope of bind
      if (
        isEsMethod(p) ||
        hasOwn(overrides, p) ||
        isConstructor(value) ||
        this.isExternalGlobalVariable.has(p)
      ) {
        return value;
      }
    } else {
      return value;
    }

    const newValue = hasOwn(value, __windowBind__)
      ? value[__windowBind__]
      : bind(value, window);
    const verifyResult = verifyDescriptor(target, p, newValue);
    if (verifyResult > 0) {
      if (verifyResult === 1) return value;
      if (verifyResult === 2) return undefined;
    }
    value[__windowBind__] = newValue;
    return newValue;
  };
}

// window proxy setter
export function createSetter(sandbox: Sandbox) {
  return (target: Window, p: PropertyKey, value: unknown, receiver: any) => {
    const verifyResult = verifySetDescriptor(
      // prettier-ignore
      sandbox.isProtectVariable(p)
        ? window
        : receiver
          ? receiver
          : target,
      p,
      value,
    );
    // If the value is the same, the setting success will be returned directly. Cannot be set and return to failure directly.
    // "Reflect.set" does not perform this part of processing by default in safari
    if (verifyResult > 0) {
      if (verifyResult === 1 || verifyResult === 2) return false;
      if (verifyResult === 3) return true;
    }

    if (sandbox.isProtectVariable(p)) {
      return Reflect.set(window, p, value);
    } else {
      const success = Reflect.set(target, p, value, receiver);
      if (success) {
        if (sandbox.initComplete) {
          sandbox.isExternalGlobalVariable.add(p);
        }

        // Update need optimization variables
        if (sandbox.context) {
          const { $optimizeMethods, $optimizeUpdateStack } = sandbox.context;
          if (Array.isArray($optimizeMethods)) {
            if ($optimizeMethods.indexOf(p) > -1) {
              $optimizeUpdateStack.forEach((fn) => fn(p, value));
            }
          }
        }
      }
      return success;
    }
  };
}

// window proxy defineProperty
export function createDefineProperty(sandbox: Sandbox) {
  return (target: Window, p: PropertyKey, descriptor: PropertyDescriptor) => {
    if (sandbox.isProtectVariable(p)) {
      return Reflect.defineProperty(window, p, descriptor);
    } else {
      const success = Reflect.defineProperty(target, p, descriptor);
      if (sandbox.initComplete && success) {
        sandbox.isExternalGlobalVariable.add(p);
      }
      return success;
    }
  };
}

// window proxy deleteProperty
export function createDeleteProperty(sandbox: Sandbox) {
  return (target: Window, p: PropertyKey) => {
    if (hasOwn(target, p)) {
      delete target[p as any];
      if (sandbox.initComplete && sandbox.isExternalGlobalVariable.has(p)) {
        sandbox.isExternalGlobalVariable.delete(p);
      }
    } else if (__DEV__) {
      if (hasOwn(window, p) && sandbox.isProtectVariable(p)) {
        warn(`The "${String(p)}" is global protect variable."`);
      }
    }
    return true;
  };
}

// window proxy has
export function createHas(sandbox: Sandbox) {
  return (_target: Window, p: PropertyKey) => {
    return sandbox.isProtectVariable(p) ? false : true;
  };
}
