namespace KIP {

	//.....................
	//#region INTERFACES
	
	/**
	 * IComparable
	 * ----------------------------------------------------------------------------
	 * Interface for objects that can be compared to like objects
	 */
	export interface IComparable extends IEquatable {

		/**
		 * lessThan
		 * ----------------------------------------------------------------------------
		 * Determines if this element is lesser than the other passed in
		 * 
		 * @param	other	The element to compare to
		 * 
		 * @returns	True if this object should be considered lesser
		 */
		lessThan(other: IComparable): boolean;

		/**
		 * greaterThan
		 * ----------------------------------------------------------------------------
		 * Determines if this element is greater than the other passed in
		 * 
		 * @param	other	The element to compare to
		 * 
		 * @returns	True if this object should be considered greater
		 */
		greaterThan(other: IComparable): boolean;
	}

	/**
	 * IEquatable
	 * ----------------------------------------------------------------------------
	 * Interface for objects that can be equal to one another
	 */
	export interface IEquatable {

		/**
		 * equals
		 * ----------------------------------------------------------------------------
		 * Determines whether this element is equal to the other passed in
		 * 
		 * @param	other	The element to compare to
		 * 
		 * @returns	True if the objects should be considered the same
		 */
		equals(other: IEquatable): boolean;
	}
	
	//#endregion
	//.....................

	//...........................
	//#region HELPER FUNCTIONS

	/**
	 * equals
	 * ----------------------------------------------------------------------------
	 * Determines if two elements of the same type can be considered equal
	 * 
	 * @param   orig        The first elem to examine
	 * @param   comparison  The second elem to examine
	 * 
	 * True if the two elements can be considered equal
	 */
	export function equals<T>(orig: T, comparison: T): boolean {
		// Handle the equatable case
		if (isEquatable(orig)) {
			return (orig as any).equals(comparison);
		}

		// otherwise directly compare the values
		return (orig === comparison);
	}

	/**
	 * lesserThan
	 * ----------------------------------------------------------------------------
	 * @param 	orig 		The element to check for being less than the other
	 * @param 	comparison 	The element to check for being greater than the other
	 * 
	 * @returns True if the first element is lesser than the second
	 */
	export function lesserThan<T>(orig: T, comparison: T): boolean {
		if (isComparable(orig)) {
			return (orig as any).lesserThan(comparison);
		}

		return (orig < comparison);
	}

	/**
	 * greatherThan
	 * ----------------------------------------------------------------------------
	 * @param 	orig 		The element to check for being greater than the other
	 * @param 	comparison 	The element to check for being lesser than the other
	 * 
	 * @returns True if the first element is greater than the second
	 */
	export function greaterThan<T>(orig: T, comparison: T): boolean {
		if (isComparable(orig)) {
			return (orig as any).greaterThan(comparison);
		}

		return (orig > comparison);
	}

	//#endregion
	//...........................

	//..........................................
	//#region TYPE GUARDS
	
	/**
	 * isEquatable
	 * ----------------------------------------------------------------------------
	 * determine if the specified object can be categorized as equatable
	 */
	export function isEquatable(obj: any): obj is IEquatable {
		if (isNullOrUndefined(obj)) { return false; }
		if ((obj as any).equals) { return true; }
		return false;
	}

	/**
	 * isComparable
	 * ----------------------------------------------------------------------------
	 * determine if the specified object can be categorized as comparable
	 */
	export function isComparable(obj: any): obj is IComparable {
		if (isNullOrUndefined(obj)) { return false; }
		let comp: IComparable = obj as IComparable;
		if (comp.lessThan && comp.greaterThan && comp.equals) { return true; }
		return false;
	}
	
	//#endregion
	//..........................................
}