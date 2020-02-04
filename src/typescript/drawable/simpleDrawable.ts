namespace KIP {

    /**----------------------------------------------------------------------------
	 * @class	SimpleDrawable
	 * ----------------------------------------------------------------------------
	 * Very basic implementation of the Drawable class that contains just a 
	 * single element.
	 * @version 1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class SimpleDrawable extends Drawable {

		//.....................
		//#region PROPERTIES

		/** Simple Drawables only have a base element */
		protected _elems: {
			base: HTMLElement;
		}

		//#endregion
		//.....................

		/**
		 * SimpleDrawable
		 * ----------------------------------------------------------------------------
		 * create a simple Drawable element 
		 * @param	obj		The details about the element we should draw
		 */
		constructor(obj: IElemDefinition) { super(obj); }

		/**
		 * _createElements
		 * ----------------------------------------------------------------------------
		 * Do nothing, since we will create the base element in the construtor
		 */
		protected _createElements(): void { }
    }
    
}