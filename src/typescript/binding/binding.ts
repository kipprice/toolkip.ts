/// <reference path="../async/promiseTypes.ts" />

namespace KIP {

	/**
	 * bind
	 * ---------------------------------------------------------------------------
	 * Ties a particular piece of data to an update function, so that if the 
	 * value changes, the update function can be executed
	 * 
	 * @param 	evalFunc 	Function to grab current state of the value
	 * @param 	updateFunc 	Function to call upon the value changing
	 * 
	 * @returns	The current state of the value
	 */
	export function bind<T>(evalFunc: BoundEvalFunction<T>, updateFunc: BoundUpdateFunction<T>, deleteFunc?: BoundDeleteFunction, equalsFunc?: EqualityFunction<T>): T {
		let id = Binder.bind(evalFunc, updateFunc, deleteFunc, equalsFunc);
		if (!id) { return null; }

		return evalFunc();
	}
	
}