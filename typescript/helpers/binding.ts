namespace KIP {

	export interface BoundEvalFunction<T> {
		(): T
	}

	export interface BoundUpdateFunction<T> {
		(newVal: T): void;
	}

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
	export function bind<T>(evalFunc: BoundEvalFunction<T>, updateFunc: BoundUpdateFunction<T>): T {
		if (!evalFunc || !updateFunc) { return; }

		let originalValue: T = evalFunc();
		
		let bindingHelper: Function = () => {
			let newVal = evalFunc();
			if (newVal !== originalValue) { 
				originalValue = newVal;
				updateFunc(newVal);
			}
				
			window.requestAnimationFrame(() => { bindingHelper(); });

		}

		bindingHelper();

		return originalValue;
	}
}