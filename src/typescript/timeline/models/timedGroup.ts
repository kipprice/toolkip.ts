namespace KIP.Timeline {

	export interface ITimedGroup extends ITimedElement {
		elements: ITimedElement[];
	}

	/**----------------------------------------------------------------------------
	 * @class	TimedGroup
	 * ----------------------------------------------------------------------------
	 * Keep track of a group of timed elements
	 * @author	Kip Price
	 * @version 1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class TimedGroup extends TimedElement implements ITimedGroup {

		//#region PROPERTIES

		/** track the different elements that belong to this group */
		protected _elements: ITimedElement[];
		public get elements(): ITimedElement[] { return this._elements; }
		public set elements(data: ITimedElement[]) { this._elements = data; }
		//#endregion

		/**...........................................................................
		 * Create the timed group
		 * @param 	dataToCopy	If available, the data that should make up this group
		 * ........................................................................... 
		 */
		constructor(dataToCopy?: ITimedGroup) {
			super(dataToCopy);
		}

	}
}