/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
	Copy from https://github.com/webpack/tapable
*/

import Hook from "./Hook";
import HookCodeFactory from "./HookCodeFactory";

class AsyncSeriesHookCodeFactory extends HookCodeFactory {
	content({ onError, onDone }) {
		return this.callTapsSeries({
			onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),
			onDone,
		});
	}
}

const factory = new AsyncSeriesHookCodeFactory();

const COMPILE = function (options) {
	factory.setup(this, options);
	return factory.create(options);
};

export function AsyncSeriesHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = AsyncSeriesHook;
	hook.compile = COMPILE;
	hook._call = undefined;
	hook.call = undefined;
	return hook;
}

AsyncSeriesHook.prototype = null;
