import { warn, hasOwn } from '@garfish/utils';
import { Sandbox } from '../sandbox';
import { isEsGlobalMethods, isNativeCodeMethods } from '../utils';
import { __windowBind__, GARFISH_OPTIMIZE_NAME } from '../symbolTypes';
import {
  bind,
  isConstructor,
  verifyGetterDescriptor,
  verifySetterDescriptor,
} from './shared';

// window proxy getter
export function createGetter(sandbox: Sandbox) {
  return (target: Window, p: PropertyKey, receiver: any) => {
    if (p === Symbol.unscopables) return undefined;
    let value;
    const { overrideList } = sandbox.replaceGlobalVariables;

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
        isEsGlobalMethods(p) ||
        isNativeCodeMethods(p) ||
        hasOwn(overrideList, p) ||
        isConstructor(value) ||
        sandbox.isExternalGlobalVariable.has(p)
      ) {
        return value;
      }
    } else {
      return value;
    }

    const newValue = hasOwn(value, __windowBind__)
      ? value[__windowBind__]
      : bind(value, window);
    const verifyResult = verifyGetterDescriptor(target, p, newValue);
    if (verifyResult > 0) {
      if (verifyResult === 1) return value;
      if (verifyResult === 2) return undefined;
    }
    value[__windowBind__] = newValue;
    return newValue;
  };
}

// Reflect.set will be called in the set callback, and the DefineProperty callback will be triggered after Reflect.set is called.
// but the descriptor values ​​writable, enumerable, and configurable on safari 13.x version are set to false for the second time
// set and defineProperty callback is async Synchronize back
// Set the default when calling defineProperty through set ​​writable, enumerable, and configurable default to true
// safari 13.x default use strict mode，descriptor's ​​writable is false can't set again
let fromSetFlag = false;

// window proxy setter
export function createSetter(sandbox: Sandbox) {
  return (target: Window, p: PropertyKey, value: unknown, receiver: any) => {
    const verifyResult = verifySetterDescriptor(
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
      // current is setting
      fromSetFlag = true;
      const success = Reflect.set(target, p, value, receiver);
      if (success) {
        if (sandbox.initComplete) {
          sandbox.isExternalGlobalVariable.add(p);
        }

        // Update need optimization variables
        if (sandbox.global) {
          const methods = sandbox.global[`${GARFISH_OPTIMIZE_NAME}Methods`];
          if (Array.isArray(methods)) {
            if (methods.includes(p)) {
              const updateStack =
                sandbox.global[`${GARFISH_OPTIMIZE_NAME}UpdateStack`];
              updateStack.forEach((fn) => fn(p, value));
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
    // reason: Reflect.set
    // Object.defineProperty is used to implement, so defineProperty is triggered when set is triggered
    // but the descriptor values ​​writable, enumerable, and configurable on safari 13.x version are set to false for the second time
    if (fromSetFlag) {
      fromSetFlag = false;
      descriptor.writable = true;
      descriptor.enumerable = true;
      descriptor.configurable = true;
    }

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
    if (sandbox.isProtectVariable(p)) return false;
    if ((sandbox as any).tempVariable === p) return false;
    return true;
  };
}
