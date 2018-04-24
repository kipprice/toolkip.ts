///<reference path="canvasElement.ts" />
namespace KIP {

	/** class that stores collections of other canvas elements */
	export class CanvasGroup extends CanvasElement {

		//#region PROPERTIES

		/** keep track of the elements in this group */
		protected _elements: Collection<CanvasElement>;

		/** the type of element this is */
		public get type(): ElementType { return ElementType.Group; }

		/** keep track of the reference point for the group */
		protected _referencePoint: IPoint;
		public set referencePoint (refPt: IPoint) { 
			this.adjustDimensions({
				x: (refPt.x - this._referencePoint.x),
				y: (refPt.y - this._referencePoint.y)
			});
		}

		/** the point for reference for display */
		protected _displayReferencePoint: IPoint;

		/** if true, scales with the rest of the canvas */
		protected _respondToScale: boolean = false;

		/** true if we haven't yet set the dimensions for the group */
		private _needsInitialDimensions: boolean;

		/**...........................................................................
		 * isHoverTarget
		 * ...........................................................................
		 * groups handle whether they are a hover target a little differently 
		 * 
		 * @returns	True if this element is a target for hover
		 * ...........................................................................
		 */
		public get isHoverTarget(): boolean {
			let isHoverTarget: boolean = false;
			this._elements.map((elem: CanvasElement) => {
				if (elem.isHoverTarget) { 
					isHoverTarget = true; 
					return;
				}
			});

			return isHoverTarget;
		}

		//#endregion

		/**...........................................................................
		 * create a group element that joins other elements together 
		 * 
		 * @param	id			The unique ID for the element
		 * @param	refPoint	The reference point to use
		 * ...........................................................................
		 */
		constructor (id: string, refPoint?: IPoint) {
			super(id);
			this._elements = new Collection<CanvasElement>();
			
			if (refPoint) {
				this._referencePoint = {
					x: refPoint.x,
					y: refPoint.y
				};
			} else {
				this._referencePoint = {
					x: 0,
					y: 0
				};
			}

			this._initializeRects();
		}

		/**...........................................................................
		 * _initializeRects
		 * ...........................................................................
		 * handle the initial rects needed by the group 
		 * ...........................................................................
		 */
		protected _initializeRects(): void {
			this._dimensions = {
				x: this._referencePoint.x,
				y: this._referencePoint.y,
				w: 0,
				h: 0
			};
			this._needsInitialDimensions = true;

			super._initializeRects();
		}

		/**...........................................................................
		 * _onDraw
		 * ...........................................................................
		 * handle drawing the group 
		 * 
		 * @param	context		The context upon which to draw this element
		 * ...........................................................................
		 */
		protected _onDraw (context: CanvasRenderingContext2D): void {
			
			// draw the elements relative to the group
			this._elements.map((elem: CanvasElement) => {
				elem.draw();
			});

		}

		/**...........................................................................
		 * updateDimensions
		 * ...........................................................................
		 * update the space occupied by this group 
		 * 
		 * @param	visibleWindow	The visible view into the canvas
		 * ...........................................................................
		 */
		public updateDimensions(visibleWindow: IBasicRect): void {
			super.updateDimensions(visibleWindow);

			// No need to update if elems will be offscreen
			if (this._isOffScreen) { 
				return; 
			}

			// Add to each of the elements
			let elem: CanvasElement;
			this._elements.map((elem) => {
				elem.updateDimensions(visibleWindow);
			});

		}

		/**...........................................................................
		 * addElement
		 * ...........................................................................
		 * add an element to this group  
		 * 
		 * @param	The element to add to the group
		 * ...........................................................................
		 */
		public addElement(elem: CanvasElement) : void {

			// Make sure each element is appropriately shifted
			elem.adjustDimensions(this._referencePoint);

			// Add the element to our internal array, and ensure it has a way to get back to us
			this._elements.addElement(elem.id, elem);
			elem.parent =  this;

			// If we have a canvas assigned, also add it to this element
			if (this._canvas) { 
				elem.canvas = this._canvas; 
				this._canvas.needsRedraw = true;
			}

			// make sure we know how big this group is
			this._updateInternalDimensionsFromElement(elem);

		}

		/**...........................................................................
		 * _updateInternalDinensionsFromElement
		 * ...........................................................................
		 * make sure our internal dimensions match what our elements 
		 * 
		 * @param	elem	THe element we're adding to update dimensions for
		 * ...........................................................................
		 */
		private _updateInternalDimensionsFromElement (elem: CanvasElement): void {

			let relDim: IBasicRect = {
				x: this._dimensions.x,
				y: this._dimensions.y,
				w: this._dimensions.w,
				h: this._dimensions.h
			};

			// Check if x extrema need updated
			if (elem.dimensions.x < relDim.x) { relDim.x = elem.dimensions.x; }
			if ((elem.dimensions.x + elem.dimensions.w) > (relDim.x + relDim.w)) { relDim.w = ((elem.dimensions.x + elem.dimensions.w) - relDim.x); }

			// Check if y extrema need updated
			if (elem.dimensions.y < relDim.y) { relDim.y = elem.dimensions.y; }
			if ((elem.dimensions.y + elem.dimensions.h) > (relDim.y + relDim.h)) { relDim.h = ((elem.dimensions.y + elem.dimensions.h) - relDim.y); }

			// Update the real dimensions
			this._dimensions = {
				x: relDim.x,
				y: relDim.y,
				w: relDim.w,
				h: relDim.h
			};

			// Don't set these dimensions as default again
			this._needsInitialDimensions = false;
		}

		/**...........................................................................
		 * handleEvent
		 * ...........................................................................
		 * groups need some special handling since they need to pass on their events 
		 * 
		 * @param	eventType	
		 * @param	pt			The point 
		 * @param	e			The actual event we are handling
		 * ...........................................................................
		 */
		public handleEvent (eventType: EventTypeEnum, pt: IPoint, e: Event): void {

			// Run any event-handling that directly applies to me
			super.handleEvent(eventType, pt, e);

			// Quit if there's no point specified
			if (!pt) { return; }

			// clear any hover effects that may be happening
			if ((eventType === EventTypeEnum.LEAVE) || (eventType === EventTypeEnum.HOVER)) { this._clearHover(pt, e as MouseEvent); }

			// Find the affected elements
			let elems: CanvasElement[] = this._findElementsAtPoint(pt);

			// Loop through affected elements to apply the event to them
			let elem: CanvasElement;
			for (elem of elems) {
				elem.handleEvent(eventType, pt, e);
			}
			
			// TODO: apply a group event to all child elements
		}

		/**...........................................................................
		 * _clearHover
		 * ...........................................................................
		 * clear hover styles that may have been applied already 
		 * ...........................................................................
		 */
		private _clearHover (relativePoint: IPoint, e: MouseEvent): void {
		
			// loop through all of our elements and apply the unhover class
			this._elements.map((el: CanvasElement) => {
				if (!el.isHoverTarget) { return; }
				el.leave(relativePoint, e);
			});
		}

		/** find the elements that are located at the provided point */
		private _findElementsAtPoint(pt: IPoint): CanvasElement[] {
			let out: CanvasElement[] = [];
			this._elements.map((elem: CanvasElement) => {
				if (elem.isOffScreen) { return; }

				// if the point is contained, consider it an 
				if (!Trig.isPointContained(pt, elem.displayDimensions)) { return; }

				// If the event happened at this element, add it to the array
				out.push(elem);
			});

			return out;
		}

		/** remove elements from layers */
		public removeElement (id: string): boolean {
			let tmp: ICollectionElement<CanvasElement> = this._elements.removeElement(id);
			if (!tmp) { return false; }

			this._canvas.needsRedraw = true;
			return true;
		}
		
		// cloning a group requires cloning its innards
		protected _cloneForEffect (id: string): CanvasGroup {
			let refPt: IPoint = clonePoint(this._referencePoint);

			let clonedGrp: CanvasGroup = new CanvasGroup(id);

			// Loop through children & clone
			this._elements.map((elem: CanvasElement) => {
				let clone: CanvasElement = (elem as any)._cloneForEffect(elem.id + "|e");
				clonedGrp.addElement(clone);
			});

			return clonedGrp;
		}

		/**...........................................................................
		 * _scale
		 * ...........................................................................
		 * groups scale by each of their parts scaling
		 * 
		 * @param	scaleAmt	The amount to scale by
		 * ...........................................................................
		 */
		protected _scale(scaleAmt: number): void {
			if (!this._isEffect) { return; }
			this._elements.map((elem: CanvasElement) => {
			 	(elem as any)._scale(scaleAmt);
			});

			return;
		}

		/**...........................................................................
		 * adjustDimensions
		 * ...........................................................................
		 * adjust the dimensions of this group + its children 
		 * 
		 * @param	adjustPt	The point we're adjusting to
		 * ...........................................................................
		 */
		public adjustDimensions(adjustPt: IPoint): void {

			super.adjustDimensions(adjustPt);
			this._referencePoint.x += adjustPt.x;
			this._referencePoint.y += adjustPt.y;

			this._elements.map((elem: CanvasElement) => {
				elem.adjustDimensions(adjustPt);
			});
		}

		/**...........................................................................
		 * _setCanvas
		 * ...........................................................................
		 * Set our internal canvas
		 * 
		 * @param 	canvas	The canvas to set internally
		 * ........................................................................... 
		 */
		protected _setCanvas (canvas: HTML5Canvas) : void {
			super._setCanvas(canvas);

			this._elements.map((elem: CanvasElement) => {
				elem.canvas = this._canvas;
				this._updateInternalDimensionsFromElement(elem);
			});
		}

	}
}