namespace KIP {

	
	export interface IEqualityFunction<T> {

		/**
		 * IEqualityFunction<T>
		 * ----------------------------------------------------------------------------
		 * Given two values of T, determine whether they are equivalent
		 * @param	a	The first value to compare
		 * @param	b	The second value to compare
		 * 
		 * @returns	True if the two values are equivalent, false otherwise
		 */
		(a: T, b: T): boolean;
	}
	/**
	 * contains
	 * ----------------------------------------------------------------------------
	 * Determine whether a particular element is contained in an array
	 * @param 	arr		The array to check 
	 * @param 	value 	The value to check for
	 * 
	 * @returns	True if the value is contained in the array
	 */
	export function contains<T>(arr: T[], value: T, equalityFunction?: IEqualityFunction<T>): boolean {
		return (indexOf(arr, value, equalityFunction) !== -1);
	}

	/**
	 * indexOf
	 * ----------------------------------------------------------------------------
	 * Find the index of a particular value in the array
	 * @param	arr		The array to search
	 * @param	value	The value to look for
	 * 
	 * @returns	The first index of the value in the array or -1 if it doesn't exist
	 */
	export function indexOf<T>(arr: T[], value: T, equalityFunction?: IEqualityFunction<T>): number {
		if (!arr) { return -1; }
		for (let idx = 0; idx < arr.length; idx += 1) {
			if (equalityFunction) {
				if (equalityFunction(arr[idx], value)) { return idx; }
			} else if (arr[idx] === value) {
				return idx;
			}
		}

		return -1;
	}

	/**
	* removeElemFromArr
	* ----------------------------------------------------------------------------
	* Finds & removes an element from the array if it exists.
	* @param   arr     The array to remove from
	* @param   elem    The element to remove
	* @param   equal   The function that is used to test for equality
	* 
	* @returns The updated array
	*/
	export function removeElemFromArr<T>(arr: T[], elem: T, equal?: Function): T[] {
		let idx: number;
		let outArr: T[];
		// If we didn't get a function to test for equality, set it to the default
		if (!equal) {
			equal = function (a, b) { return (a === b); };
		}

		// Loop through the array and remove all equal elements
		for (idx = (arr.length - 1); idx >= 0; idx -= 1) {
			if (equal(arr[idx], elem)) {
				outArr = arr.splice(idx, 1);
			}
		}

		return outArr;
	};
}