namespace KIP {

	/**...........................................................................
	 * IUpdatable
	 * ...........................................................................
	 * Keep track of classes that allow for updating
	 * @version 1.0.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export interface IUpdatable {
		update(...args: any[]): void;
	}
}