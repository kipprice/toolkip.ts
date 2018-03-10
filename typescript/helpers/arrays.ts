namespace KIP {

	export interface IEqualityFunction<T> {
		(a: T, b: T) : boolean;
	}
	/**...........................................................................
	 * contains
	 * ...........................................................................
	 * Determine whether a particular element is contained in an array
	 * 
	 * @param 	arr		The array to check 
	 * @param 	value 	The value to check for
	 * 
	 * @returns	True if the value is contained in the array
	 * ...........................................................................
	 */
	export function contains<T> (arr: T[], value: T): boolean {
		return (indexOf(arr, value) !== -1);
	}

	/**...........................................................................
	 * indexOf
	 * ...........................................................................
	 * Find the index of a particular value in the array
	 * 
	 * @param	arr		The array to search
	 * @param	value	The value to look for
	 * 
	 * @returns	The first index of the value in the array or -1 if it doesn't exist
	 * ...........................................................................
	 */
	export function indexOf<T> (arr: T[], value: T, equalityFunction?: IEqualityFunction<T>): number {

		for (let idx = 0; idx < arr.length; idx += 1) {
			if (equalityFunction) {
				if (equalityFunction(arr[idx], value)) { return idx; }
			} else if (arr[idx] === value) {
				 return idx; 
			}
		}

		return -1;
	}

	/**...........................................................................
	 * remove
	 * ...........................................................................
	 * Remove a value (or all instances of a value) from the array
	 * 
	 * @param	arr			The array to remove from
	 * @param	value		The value to search for
	 * @param	removeAll	If true, finds all instances of the value in the array
	 * 
	 * @returns	The array with all instances of the value removed
	 * ...........................................................................
	 */
	export function remove<T> (arr: T[], value: T, removeAll?: boolean, equalityFunction?:IEqualityFunction<T>): T[] {
		let idx: number = indexOf(arr, value, equalityFunction);

		// loop until we've removed all of the elements we intend to
		while (idx !== -1) {
			arr.splice(idx, 1);

			if (removeAll) {
				idx = indexOf(arr, value);
			} else {
				idx = -1;
			}
		}

		// return the spliced array
		return arr;
	}
}