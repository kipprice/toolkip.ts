namespace KIP {
	/**...........................................................................
	 * IComparable
	 * ...........................................................................
	 * Interface for objects that can be compared to like objects
	 * ...........................................................................
	 */
	export interface IComparable<T> extends IEquatable<T> {

		/**...........................................................................
		 * lessThan
		 * ...........................................................................
		 * Determines if this element is lesser than the other passed in
		 * 
		 * @param	other	The element to compare to
		 * 
		 * @returns	True if this object should be considered lesser
		 * ...........................................................................
		 */
		lessThan(other: T): boolean;

		/**...........................................................................
		 * greaterThan
		 * ...........................................................................
		 * Determines if this element is greater than the other passed in
		 * 
		 * @param	other	The element to compare to
		 * 
		 * @returns	True if this object should be considered greater
		 * ...........................................................................
		 */
		greaterThan(other: T): boolean;
	}

	/**...........................................................................
	 * IEquatable
	 * ...........................................................................
	 * Interface for objects that can be equal to one another
	 * ...........................................................................
	 */
	export interface IEquatable<T> {

		/**...........................................................................
		 * equals
		 * ...........................................................................
		 * Determines whether this element is equal to the other passed in
		 * 
		 * @param	other	The element to compare to
		 * 
		 * @returns	True if the objects should be considered the same
		 * ...........................................................................
		 */
		equals(other: T): boolean;
	}

	//#endregion

	//#region HELPER FUNCTIONS
	/**...........................................................................
   * equals
   * ...........................................................................
   * Determines if two elements of the same type can be considered equal
   * 
   * @param   orig        The first elem to examine
   * @param   comparison  The second elem to examine
   * 
   * True if the two elements can be considered equal
   * ...........................................................................
   */
	export function equals<T>(orig: T, comparison: T): boolean {

		// Handle the equatable case
		if ((orig as any).equals) {
			return (orig as any).equals(comparison);
		}

		// otherwise directly compare the values
		return orig === comparison;
	}

	/**...........................................................................
	 * lesserThan
	 * ...........................................................................
	 * @param 	orig 		The element to check for being less than the other
	 * @param 	comparison 	The element to check for being greater than the other
	 * 
	 * @returns True if the first element is lesser than the second
	 * ...........................................................................
	 */
	export function lesserThan<T>(orig: T, comparison: T): boolean {
		if ((orig as any).lesserThan) {
			return (orig as any).lesserThan(comparison);
		}

		return orig < comparison;
	}

	/**...........................................................................
	 * greatherThan
	 * ...........................................................................
	 * @param 	orig 		The element to check for being greater than the other
	 * @param 	comparison 	The element to check for being lesser than the other
	 * 
	 * @returns True if the first element is greater than the second
	 * ...........................................................................
	 */
	export function greaterThan<T>(orig: T, comparison: T): boolean {
		if ((orig as any).greaterThan) {
			return (orig as any).greaterThan(comparison);
		}

		return orig > comparison;
	}

	//#endregion
}