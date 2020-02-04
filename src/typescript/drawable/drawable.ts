///<reference path="../styles/styles.ts" />
///<reference path="../styles/stylable.ts" />
///<reference path="../html/generalHelpers.ts" />

namespace KIP {

	/**----------------------------------------------------------------------------
	 * @class Drawable
	 * ----------------------------------------------------------------------------
	 * Creates a client-side representation of a particular DOM element
	 * @author	Kip Price
	 * @version	2.0.0
	 * ----------------------------------------------------------------------------
	 */
	export abstract class Drawable extends Styles.Stylable implements IDrawable {

		//.....................
		//#region PROPERTIES

		/** unique ID for this particular Drawable */
		protected _id: string;

		/** elements that make up this Drawable */
		protected _elems: IDrawableElements;

		/** expose the base element externally for anyone who needs it */
		public get base(): StandardElement { return this._elems.base; }

		/** the parent element upon which this Drawable will be added */
		protected _parent: StandardElement;

		//#endregion
		//..................

		/**
		 * Drawable
		 * ----------------------------------------------------------------------------
		 * Create a Drawable element
		 * @param	baseElemTemplate	If provided, the template upon which to create the base element
		 */
		constructor(baseElemTemplate?: IElemDefinition) {

			// Initialize both the stylable parts of this and the 
			super();
			this._addClassName("Drawable");

			// initialize our elements
			this._elems = {} as IDrawableElements;

			// Handle when we are passed an element to form the base of 
			if (baseElemTemplate) {
				this._elems.base = createElement(baseElemTemplate);
			}

			// check that we have enough data to create elements
			if (this._shouldSkipCreateElements()) { return; }

			// actually create the elements associated with this class
			this._createElements();

			window.setTimeout(() => {
				this._registerMediaListeners();
			}, 100);
		}

		/**
		 * _registerMediaListener
		 * ----------------------------------------------------------------------------
		 * Replace the stylable default registerMediaListener to try to apply first to 
		 * our base element, then the document as a whole
		 */
		protected _registerMediaListener(matchQuery: string, classToApply: string): void {
			super._registerMediaListener(matchQuery, classToApply, this._elems?.base);
			super._registerMediaListener(matchQuery, classToApply, document.body);
		}

		/**
		 * _createElements
		 * ----------------------------------------------------------------------------
		 * Function that will be overridden by child classes when they are creating
		 * the elements that make up a Drawable
		 */
		protected abstract _createElements(...args: any[]): void;

		/**
		 * _createElement
		 * ----------------------------------------------------------------------------
		 * wrapper around KIP.createElement that will always pass in the specific 
		 * elements for this drawable, so that keys can be easily used
		 * 
		 * @param	def		The element to create
		 * 
		 * @returns The created element
		 */
		protected _createElement(def: IElemDefinition): HTMLElement {
			if (!this._elems) { this._elems = {} as IDrawableElements; }
			return KIP.createElement(def, this._elems as any);
		}

		/**
		 * _elem
		 * ----------------------------------------------------------------------------
		 * wrapper around _createElement; shortened for ease of use
		 */
		protected _elem(def: IElemDefinition): HTMLElement {
			return this._createElement(def);
		}

		/**
		 * _shouldSkipCreateElements
		 * ----------------------------------------------------------------------------
		 * Function to determine whether we should skip the createElements. Useful in
		 * cases where data needs to be present in the class before elements can be 
		 * created.
		 * 
		 * @returns	True if we shouldn't create elements
		 */
		protected _shouldSkipCreateElements(): boolean { return false; }

		/**
		 * draw
		 * ----------------------------------------------------------------------------
		 * Draws the element of this Drawable & all children + siblings
		 * @param 	parent  	The element this Drawable should be added to
		 * @param 	force 		True if we need to remove & redraw this element
		 */
		public draw(parent?: StandardElement, force?: boolean): void {

			// Quit if we don't have anything to draw
			if (!this._elems || !this._elems.base) { return; }

			if (!this._hasCreatedStyles) {
				window.setTimeout(() => {
					this.draw(parent, force);
				}, 0);
				return;
			}

			// Refresh our contents
			this._refresh();

			// Save off this parent & quit if there is no parent
			this._parent = parent || this._parent;
			if (!this._parent) { return; }

			// Draw the base element
			this._drawBase();

			// Make sure we have a touchpoint for refreshing after the draw step
			this._afterDraw();
		};

		/**
		 * _drawBase
		 * ----------------------------------------------------------------------------
		 * Draws a Drawable or HTML Element
		 * @param	force	If true, erases and redraws the base element
		 */
		protected _drawBase(force?: boolean): void {

			// grab the base helper
			let base: StandardElement = this._elems.base;

			// If we are redrawing or have never drawn the element, do so
			if (force || (!base.parentNode)) {

				// Remove first from the parent if we need to
				if (force && base.parentNode) {
					base.parentNode.removeChild(base);
				}

				// If there's no parent, quit
				if (!this._parent) { return; }

				// Add back to the parent
				this._parent.appendChild(base);
			}
		}

		/**
		 * erase
		 * ----------------------------------------------------------------------------
		 * Remove this drawable from the canvas
		 */
		public erase() {
			let base: StandardElement = this._elems.base;
			if (!base || !base.parentNode) { return; }
			base.parentNode.removeChild(base);
		};

		/**
		 * _refresh
		 * ----------------------------------------------------------------------------
		 * Overridable function that refreshes the UI of this Drawable. Does not 
		 * guarantee that the element has been drawn.
		 */
		protected _refresh(): void { };

		/**
		 * _afterDraw
		 * ----------------------------------------------------------------------------
		 * @override
		 * Overridable function to make sure we can adjust sizes should we need to
		 */
		protected _afterDraw(): void { };


		/**
		 * _onResize
		 * ----------------------------------------------------------------------------
		 * Overridable function to adjust when the screen resizes
		 */
		protected _onResize(): void { };

		/**
		 * addEventListener
		 * ----------------------------------------------------------------------------
		 * Helper to add event listeners to the base element
		 * @param	type		Type of event to listen to
		 * @param	listener	The listener to apply upon this event
		 */
		public addEventListener(type: keyof WindowEventMap, listener: Function): void {
			this._elems.base.addEventListener(type, listener as EventListenerOrEventListenerObject);
		}

	}
	
}