///<reference path="../../helpers/html.ts" />
///<reference path="../drawable.ts" />
namespace KIP {

	//#region INTERFACES

	/**...........................................................................
	 * IDimensions
	 * ...........................................................................
	 * Dimensions for a rectangle
	 * ...........................................................................
	 */
	export interface IDimensions {
		width: number;
		height: number;
	};

	/**...........................................................................
	 * ZoomDeltaFunction
	 * ...........................................................................
	 * How to handle a zoom event
	 * ...........................................................................
	 */
	export interface ZoomDeltaFunction {
		() : IPoint;
	}

	/**...........................................................................
	 * IHTML5CanvasOptions
	 * ...........................................................................
	 * Options for the canvas
	 * ........................................................................... 
	 */
	export interface IHTML5CanvasOptions {
		RENDER_RATE?: number;
		ZOOM_DELTA?: ZoomDeltaFunction;
		BACKGROUND_COLOR?: string;
		SIZE?: IDimensions;
		MAX_ZOOM?: IPoint;
		MIN_ZOOM?: IPoint;
	}

	/**...........................................................................
	 * IHTML5CanvasElems
	 * ...........................................................................
	 * Keep track of the elements that can be in a canvas
	 * ...........................................................................
	 */
	export interface IHTML5CanvasElems extends IDrawableElements {
		base: HTMLCanvasElement;
		effectCanvas: HTMLCanvasElement;
	}
	//#endregion
	
	/**...........................................................................
	 * @class HTML5Canvas
	 * ...........................................................................
	 * class that represents a set of tools around the HTML5 canvas 
	 * @version 1.1
	 * ...........................................................................
	 */
	export class HTML5Canvas extends Drawable {
	
		//#region PROPERTIES

		/** unique ID for the canvas */
		protected _id: string;

		/** all points that are represented in the canvas */
		private _absoluteDimensions: IBasicRect;

		/** The current visible portion of the canvas */
		protected _relativeView: IBasicRect;
		public get relativeView (): IBasicRect { return this._relativeView; }

		/** any options to configure this canvas */
		protected _options: IHTML5CanvasOptions;

		/** how much the canvas is currently zoomed */
		protected _zoomFactor: IPoint;
		public get zoomFactor (): IPoint { return this._zoomFactor; }
		public set zoomFactor (zoom: IPoint) { this._zoomFactor = zoom; }

		/** tracking points for determining how much to move the canvas */
		private _startDragPoint: IPoint;
		private _deltaDragPoint: IPoint;

		/** determine if there is something we need to redraw */
		protected _needsRedraw: boolean;
		public get needsRedraw (): boolean { return this._needsRedraw; }
		public set needsRedraw( value: boolean) { this._needsRedraw = value; }

		/** elements for the canvas */
		protected _elems: IHTML5CanvasElems;

		/** public getter for canvas element */
		public get canvas (): HTMLCanvasElement { return this._elems.base; }

		/** public getter for effects canvas */
		public get effectCanvas(): HTMLCanvasElement { return this._elems.effectCanvas; }

		/** rendering context for the canvas */
		protected _context: CanvasRenderingContext2D;
		public get context (): CanvasRenderingContext2D { return this._context; }

		/** rendering context for the effects canvas */
		protected _effectContext: CanvasRenderingContext2D;
		public get effectContext (): CanvasRenderingContext2D { return this._effectContext; }

		/** create groups for each of the layers we need */
		protected _layers: CanvasGroup[];
		public get layers(): CanvasGroup[] { return this._layers; }

		/** overridable function for what should happen when the canvas is in the process of rendering */
		protected _onPreRender: Function;
		public set onPreRender (preRender: Function) { this._onPreRender = preRender; }

		/** internal variable to track whether this canvas has found iniital dimensions yet */
		private _needsInitialDimensions: boolean

		//#endregion

		//#region CONSTRUCTOR

		/**...........................................................................
		 * Create a HTML5 canvas element 
		 * 
		 * @param	id			Unqiue ID to use for the canvas
		 * @param	options		Options to create the canvas with
		 * ...........................................................................
		 */
		public constructor(id?: string, options?: IHTML5CanvasOptions) {
			super();
			if (id) { this._id = id; }
			else { this._id = "canvas"; }

			// initialize the layers property
			this._layers = [];

			this._needsInitialDimensions = true;
			
			this._reconcileOptions(options);	// Pull in user options
			this._initializeRectangles();		// Initialize the viewing rectangles
			this._createElements();				// Create elements
			this._addEventListeners();			// Add all relevant event listeners
		}
		//#endregion

		//#region HANDLE INITIALIZATION

		/**...........................................................................
		 * _reconcileOptions
		 * ...........................................................................
		 * pull in default options 
		 *
		 * @param	userOptions		The options to reconcile
		 * ...........................................................................
		 */
		protected _reconcileOptions (userOptions: IHTML5CanvasOptions): void {
			if (!userOptions) { userOptions = {}; }
			let defaults: IHTML5CanvasOptions = this._createDefaultOptions();
			this._options = reconcileOptions(userOptions, defaults);
		}

		/**...........................................................................
		 * _createDefaultOptions
		 * ...........................................................................
		 * set our default options 
		 * 
		 * @returns	The set of default options for canvases
		 * ...........................................................................
		 */
		protected _createDefaultOptions () : IHTML5CanvasOptions {
			let defaults: IHTML5CanvasOptions = {
				RENDER_RATE: 30,
				ZOOM_DELTA: () => {

					let out: IPoint = {
						x: 0.03 * this._zoomFactor.x, 
						y: 0.03 * this._zoomFactor.y 
					};

					return out;
				},

				SIZE: {
					width: 600,
					height: 450
				},

				MAX_ZOOM:  {
					x: 15,
					y: 15
				},
				MIN_ZOOM: {
					x: 0.1,
					y: 0.1
				}
			};
			return defaults;
		}

		/**...........................................................................
		 * _initializeRectangles
		 * ...........................................................................
		 * create the rectangles that the canvas needs to care about 
		 * ...........................................................................
		 */
		protected _initializeRectangles () : void {

			// ABSOLUTE
			this._absoluteDimensions = {
				x: 0,
				y: 0,
				w: this._options.SIZE.width,
				h: this._options.SIZE.height
			};

			// RELATIVE
			this._relativeView = {
				x: 0,
				y: 0,
				w: this._options.SIZE.width,
				h: this._options.SIZE.height
			};

			// ZOOM SCALE
			this._zoomFactor = {
				x: 1,
				y: 1
			}

		}

		/**...........................................................................
		 * _shouldSkipCreateElements
		 * ...........................................................................
		 * Don't let the constructor create elements
		 * ...........................................................................
		 */
		protected _shouldSkipCreateElements(): boolean { return true; }

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 * create the canvas element 
		 * ...........................................................................
		 */
		protected _createElements () : void {
			
			// create the canvas elements
			this._elems = {
				base: this._createCanvas(),
				effectCanvas: this._createCanvas(true)
			};

			// create the contexts for each
			this._context = this._elems.base.getContext("2d");
			this._effectContext = this._elems.effectCanvas.getContext("2d");
		}

		/**...........................................................................
		 * _createCanvas
		 * ...........................................................................
		 * create an actual canvas element and assigns it to our element
		 * 
		 * @param 	isForEffects 	If true, creates an effect canvas instead
		 * 
		 * @returns	The canvas that is created
		 * ...........................................................................
		 */
		protected _createCanvas (isForEffects?: boolean): HTMLCanvasElement {

			let canvas: HTMLCanvasElement;

			// Create a canvas of the right size
			canvas = document.createElement("canvas");
			canvas.setAttribute("width", this._options.SIZE.width.toString());
			canvas.setAttribute("height", this._options.SIZE.height.toString());

			// give the canvas the right class
			let cls: string = "canvas";
			if (isForEffects) { cls += " effects"; }
			addClass(canvas, cls);

			return canvas;
		}
		//#endregion

		//#region DRAWING COMMANDS

		/**...........................................................................
		 * draw
		 * ...........................................................................
		 * draws the canvas element 
		 * 
		 * @param	parent	The parent element to draw on
		 * ...........................................................................
		 */
		public draw(parent?: HTMLElement): void {
			super.draw(parent);
			parent.appendChild(this._elems.effectCanvas);

			// flag that we need to redraw instead of calling it directly
			this._needsRedraw = true;
		}

		/**...........................................................................
		 * clear
		 * ...........................................................................
		 * clear the canvases 
		 * ...........................................................................
		 */
		public clear(): void {
			this._context.clearRect(0, 0, this._options.SIZE.width, this._options.SIZE.height);
			this._effectContext.clearRect(0, 0, this._options.SIZE.width, this._options.SIZE.height);
		}

		/**...........................................................................
		 * _drawEachElement
		 * ...........................................................................
		 * loop through every element in the canvas 
		 * ...........................................................................
		 */
		private _drawEachElement(): void {

			// first clear the canvas
			this.clear();

			// then loop through each of the layers in order
			let layer: CanvasGroup;
			for (layer of this._layers) {
				if (!layer) { continue; }
				layer.updateDimensions(this._relativeView);
				layer.draw();
			}
		}

		/**...........................................................................
		 * _renderFrame
		 * ...........................................................................
		 * make sure we actually draw something 
		 * ...........................................................................
		 */
		protected _renderFrame() : void {

			// Make sure we only do this kind of stuff if something changed
			if (this._needsRedraw) {
				if (this._onPreRender) { this._onPreRender(); }	// Call pre-render code
				this._drawEachElement();						// actually draw elements
				this._needsRedraw = false;						// Set that we no longer need to redraw
			}

			// Add animation listeners
			window.requestAnimationFrame(() => { this._renderFrame(); });
		}
		//#endregion

		//#region ADD/REMOVE ELEMENTS

		/**...........................................................................
		 * addElement
		 * ...........................................................................
		 * add an element to the canvas 
		 * 
		 * @param	elem	The element to add to the canvas
		 * ...........................................................................
		 */
		public addElement(elem: CanvasElement): void {

			// grab the appropriate layer to add to (or create it if it doesn't yet exist)
			let layer: CanvasGroup = this._getOrCreateLayer(elem.layer);

			// Add the element to the appropriate layer
			layer.addElement(elem);

			// Update the absolute dimensions
			this._updateAbsoluteDimensionsFromElem(elem.dimensions)

			// Mark that we need to redraw
			this._needsRedraw = true;
		}

		/**...........................................................................
		 * removeElement
		 * ...........................................................................
		 * remove an element from our internal collection 
		 * 
		 * @param	id		The id of the element to remove
		 * 
		 * @returns	True if the element was removed
		 * ...........................................................................
		 */
		public removeElement(id: string): boolean {
			let success: boolean;

			// rely on the layers to remove their own elements
			let layer: CanvasGroup;
			for (layer of this._layers) {
				if (!layer) { continue; }
				success = layer.removeElement(id)
				if (success) { break; }
			}

			return success;
		}

		/**...........................................................................
		 * _updateAbsoluteDimensionsFromElem
		 * ...........................................................................
		 * Update how big the canvas is based on the elements that exist on the canvas
		 * 
		 * @param	addedDimensions		The dimensions of the element we are adding
		 * ...........................................................................
		 */
		// TODO: Does this need to exist?
		private _updateAbsoluteDimensionsFromElem (addedDimensions: IBasicRect) : void {

			// Check for x extrema changes
			if (this._needsInitialDimensions || addedDimensions.x < this._absoluteDimensions.x) { this._absoluteDimensions.x = addedDimensions.x; }
			if ((addedDimensions.x + addedDimensions.w) > (this._absoluteDimensions.x + this._absoluteDimensions.w)) { this._absoluteDimensions.w = ((addedDimensions.x + addedDimensions.w) - this._absoluteDimensions.x); }

			// Check for y extrema changes
			if (this._needsInitialDimensions || addedDimensions.y < this._absoluteDimensions.y) { this._absoluteDimensions.y = addedDimensions.y; }
			if ((addedDimensions.y + addedDimensions.h) > (this._absoluteDimensions.y + this._absoluteDimensions.h)) { this._absoluteDimensions.h = ((addedDimensions.y + addedDimensions.h) - this._absoluteDimensions.y); }

			this._needsInitialDimensions = false;
		}

		/**...........................................................................
		 * _getOrCreateLayer
		 * ...........................................................................
		 * find the existing layer or create it if it doesn't exist 
		 * 
		 * @param	layerIdx	The index of the layer
		 * 
		 * @returns	The group for the layer
		 * ...........................................................................
		 */
		protected _getOrCreateLayer (layerIdx: number) : CanvasGroup {
			let layer: CanvasGroup = this._layers[layerIdx];
			if (!layer) {
				layer = new CanvasGroup("layer" + layerIdx);
				this._layers[layerIdx] = layer;
				layer.canvas = this;
			}
			return layer;
		}

		//#endregion

		//#region ZOOM HANDLING

		/**...........................................................................
		 * _onMouseWheel
		 * ...........................................................................
		 * handle the mousewheel event
		 * 
		 * @param	event	The actual event triggered by the mousewheel
		 * ...........................................................................
		 */
		private _onMouseWheel(event: MouseWheelEvent) : void {

			let delta: number = event.deltaY;
			delta = (Math.abs(delta) / delta);
			this.zoom(delta);
		}

		/**...........................................................................
		 * zoom
		 * ...........................................................................
		 * actually zoom the canvas an appropriate amount 
		 * 
		 * @param	delta	The amount to zoom by
		 * ...........................................................................
		 */
		public zoom(delta: number): void {

			// Get the standard zoom we should be applying
			let zoomDelta: IPoint = this._options.ZOOM_DELTA();

			// how much has the zoom value changed?
			let zoomXDelta: number = this._zoomFactor.x + (delta * zoomDelta.x);
			zoomXDelta = normalizeValue(zoomXDelta, this._options.MIN_ZOOM.x, this._options.MAX_ZOOM.x);

			let zoomYDelta: number = this._zoomFactor.y + (delta * zoomDelta.y);
			zoomYDelta = normalizeValue(zoomYDelta, this._options.MIN_ZOOM.y, this._options.MAX_ZOOM.y);
		

			// The actual width is equal to:
			//	physical dimension * (1 / zoom value)
			let physicalDim: IDimensions = this._options.SIZE;
			let newWidth: number = roundToPlace(physicalDim.width * (1 / zoomXDelta), 10);
			this._zoomFactor.x = zoomXDelta;

			let newHeight: number = roundToPlace(physicalDim.height * (1 / zoomYDelta),10);
			this._zoomFactor.y = zoomYDelta;

			// Now calculate how different that is from the current dimensions
			let widthDelta: number = newWidth - this._relativeView.w;
			let heightDelta: number = newHeight - this._relativeView.h;
			
			// Create the new view based on the appropriate deltas
			let newView: IBasicRect = {
				x: this._relativeView.x - (widthDelta / 2),
				y: this._relativeView.y - (heightDelta / 2),
				w: this._relativeView.w + widthDelta,
				h: this._relativeView.h + heightDelta
			};

			this._relativeView = newView;
			this._needsRedraw = true;

		}

		/**...........................................................................
		 * changeView
		 * ...........................................................................
		 * update the view being displayed on the canvas
		 * 
		 * @param	newDisplay	The dimensions of the new view
		 * ...........................................................................
		 */
		public changeView(newDisplay: IBasicRect): void {
			this._relativeView = newDisplay;
		}
		//#endregion

		//#region PAN HANDLING

		/**...........................................................................
		 * _onDrag
		 * ...........................................................................
		 * move the canvas around via a mouse drag 
		 * 
		 * @param	delta	The amount the mouse has dragged
		 * ...........................................................................
		 */
		private _onDrag(delta: IPoint): void {

			if (!delta) { return; }

			let newCorner: IPoint = this._calculateNewCornerFromDelta(delta);

			this.pan(newCorner);
		}

		/**...........................................................................
		 * _calculateNewCornerFromDelta
		 * ...........................................................................
		 * take zoom into account when calculating the new corner of the canvas 
		 * 
		 * @param	delta	The amount that has been dragged
		 * 
		 * @returns	The new corner for the canvas
		 * ...........................................................................
		 */
		private _calculateNewCornerFromDelta (delta: IPoint): IPoint {
			let newCorner: IPoint = {
				x: this._relativeView.x - (delta.x / this._zoomFactor.x),
				y: this._relativeView.y - (delta.y / this._zoomFactor.y)
			};

			return newCorner;
		}
		
		/**...........................................................................
		 * pan
		 * ...........................................................................
		 * handle a pan event 
		 * 
		 * @param	cornerPoint		The new corner for the canvas
		 * ...........................................................................
		 */
		public pan(cornerPoint: IPoint): void {
			this._relativeView.x = cornerPoint.x;
			this._relativeView.y = cornerPoint.y;
			this._needsRedraw = true;
		}
		//#endregion
	
		//#region EVENT HANDLING

		/**...........................................................................
		 * _addEventListeners
		 * ...........................................................................
		 * add all event listeners for the canvas itself 
		 * ...........................................................................
		 */
		private _addEventListeners(): void {

			// Add zoom listeners
			window.addEventListener("mousewheel", (event: MouseWheelEvent) => {
				this._onMouseWheel(event);
			});

			// Add pan listeners
			window.addEventListener("mousedown", (event: MouseEvent) => {
				this._elems.base.style.cursor = "-webkit-grabbing";
				this._startDragPoint = {
					x: event.screenX,
					y: event.screenY
				};
			});

			window.addEventListener("mousemove", (event: MouseEvent) => {
				if (!this._startDragPoint) { return; }
				this._deltaDragPoint = {
					x: event.screenX - this._startDragPoint.x,
					y: event.screenY - this._startDragPoint.y
				};

				this._startDragPoint = {
					x: event.screenX,
					y: event.screenY
				};
				
				this._onDrag(this._deltaDragPoint);
			});

			window.addEventListener("mouseup", () => {
				this._startDragPoint = null;
				this._deltaDragPoint = {
					x: 0,
					y: 0
				};
				this._elems.base.style.cursor = "-webkit-grab";

			});

			this._elems.base.addEventListener("click", (e: MouseEvent) => {
				let pt: IPoint = {
					x: e.pageX,
					y: e.pageY
				};

				this._onClick(e, pt);
			});

			this._elems.base.addEventListener("mousemove", (e: MouseEvent) => {
				let pt: IPoint = {
					x: e.pageX,
					y: e.pageY
				};

				this._onHover(e, pt);
			});

			// Add animation listeners
			window.requestAnimationFrame(() => { 
				this._renderFrame(); 
			});
		}

		/**...........................................................................
		 * _onClick
		 * ...........................................................................
		 * handle clicks on the canvas 
		 * 
		 * @param	e		The event itself of the mouse click
		 * @param	point	The point that was clicked
		 * ...........................................................................
		 */
		private _onClick(e: MouseEvent, point: IPoint): void {
			this._handleEvent(EventTypeEnum.CLICK, point, e);
		}

		/**...........................................................................
		 * _onHover
		 * ...........................................................................
		 * handle hovering over elements on the canvas 
		 * 
		 * @param	e		The actual mouseover event
		 * @param	point	The point that's being hovered over
		 * ...........................................................................
		 */
		private _onHover(e: MouseEvent, point: IPoint): void {
			this._handleEvent(EventTypeEnum.HOVER, point, e);
		}

		/**...........................................................................
		 * _handleEvent
		 * ...........................................................................
		 * handle a general event 
		 * 
		 * @param	eventType	The type of event being handled
		 * @param	point		The point this event applies to 
		 * @param	e			The actual event data
		 * ...........................................................................
		 */
		private _handleEvent(eventType: EventTypeEnum, point: IPoint, e: Event): void {
			//let relativePt: IPoint = this.convertPhysicalPointToRelativePoint(point);

			let layer: CanvasGroup;
			for (layer of this._layers) {
				if (!layer) { continue; }
				layer.handleEvent(eventType, point, e);
			}
		}
		//#endregion

		//#region POINT CONVERSION FUNCTIONS
		
		/**...........................................................................
		 * convertRelativePointToAbsolutePoint
		 * ...........................................................................
		 * convert a point from our relative canvas frame (e.g. visible frame) and 
		 * the physical space 
		 * 
		 * @param	relativePt	The point to convert
		 * 
		 * @returns	The converted point
		 * ...........................................................................
		 */
		public convertRelativePointToPhysicalPoint (relativePt: IPoint): IPoint {
			let out: IPoint;

			// Grab dimensions of the canvas
			// TODO: make more versatile
			let canvasLeft: number = this._elems.base.offsetLeft;
			let canvasTop: number = this._elems.base.offsetTop;
			let canvasWidth: number = this._elems.base.offsetWidth;
			let canvasHeight: number = this._elems.base.offsetHeight;

			let x: number = (((relativePt.x - this._relativeView.x) * canvasWidth) / this._relativeView.w) + canvasLeft;
			let y: number = (((relativePt.y - this._relativeView.y) * canvasHeight) / this._relativeView.h) + canvasTop;

			out = {
				x: x,
				y: y
			};

			return out;
		}

		/**...........................................................................
		 * convertPhysicalPointToRelativePoint
		 * ...........................................................................
		 * convert a physical point to one within the visible canvas frame 
		 * 
		 * @param	physicalPt	The point to convert
		 * 
		 * @returns	The converted relative point
		 * ...........................................................................
		 */
		public convertPhysicalPointToRelativePoint (physicalPt: IPoint) : IPoint {
			let out: IPoint;

			// Grab dimensions of the canvas
			// TODO: make more versatile
			let canvasLeft: number = this._elems.base.offsetLeft;
			let canvasTop: number = this._elems.base.offsetTop;
			let canvasWidth: number = this._elems.base.offsetWidth;
			let canvasHeight: number = this._elems.base.offsetHeight;

			// convert each aspect of the point
			let x: number = (((physicalPt.x - canvasLeft) * this._relativeView.w) / canvasWidth) + this._relativeView.x;
			let y: number = (((physicalPt.y - canvasTop) * this._relativeView.h) / canvasHeight) + this._relativeView.y;

			out = {
				x: x,
				y: y
			};
			return out;
		}

		/**...........................................................................
		 * convertAbsolutePointToRelativePoint
		 * ...........................................................................
		 * convert a point from absolute position to a visible point 
		 * ...........................................................................
		 */
		public convertAbsolutePointToRelativePoint (absolutePt: IPoint) : IPoint {
			let out: IPoint;

			// absolute position may exist outside of vsiible rect, but will be visible at some point in the canvas
			out = {
				x: roundToPlace((absolutePt.x - this._relativeView.x) * this._zoomFactor.x, 10),
				y: roundToPlace((absolutePt.y - this._relativeView.y) * this._zoomFactor.y, 10)
			};

			return out;
		}

		/**...........................................................................
		 * convertRelativePointToAbsolutePoint
		 * ...........................................................................
		 * convert a point from a visible point to an absolute point 
		 * 
		 * @param	relativePt	The point in relative dimensions
		 * 
		 * @returns	THe converted absolute point
		 * ...........................................................................
		 */
		public convertRelativePointToAbsolutePoint (relativePt: IPoint): IPoint {
			let out: IPoint;

			out = {
				x: roundToPlace(((relativePt.x / this._zoomFactor.x) + this._relativeView.x), 10),
				y: roundToPlace(((relativePt.y / this._zoomFactor.y) + this._relativeView.y), 10)
			};

			return out;
		}

		/**...........................................................................
		 * convertAbsoluteRectToRelativeRect
		 * ...........................................................................
		 * Turn a set of absolute dimensions to their relative counterpart
		 * 
		 * @param 	absoluteRect 	The absolute rect to convert to relative dimensions
		 * 
		 * @returns	The converted rectangle
		 * ...........................................................................
		 */
		public convertAbsoluteRectToRelativeRect (absoluteRect: IBasicRect): IBasicRect {

			// calculate the top left corner
			let leftTopCorner: IPoint = {
				x: absoluteRect.x,
				y: absoluteRect.y
			};
			let relLeftTopCorner: IPoint = this.convertAbsolutePointToRelativePoint(leftTopCorner);

			// calculate the bottom-right corner
			let rightBottomCorner: IPoint = {
				x: absoluteRect.x + absoluteRect.w,
				y: absoluteRect.y + absoluteRect.h
			};
			let relRightBottomCorner: IPoint = this.convertAbsolutePointToRelativePoint(rightBottomCorner);

			// return a rect based on the corners we calculated
			return {
				x: relLeftTopCorner.x,
				y: relLeftTopCorner.y,
				w: relRightBottomCorner.x - relLeftTopCorner.x,
				h: relRightBottomCorner.y - relLeftTopCorner.y
			};

		}
		//#endregion

		//#region HELPERS

		/**...........................................................................
		 * debugRelativeDimensions
		 * ...........................................................................
		 * debug the current view of the canvas 
		 * ...........................................................................
		 */
		public debugRelativeDimensions(): void {
			console.log("CANVAS DIMENSIONS:");
			console.log(Math.round(this.relativeView.x) + ", " + Math.round(this.relativeView.y));
			console.log(Math.round(this.relativeView.w) + " x " + Math.round(this.relativeView.h));
					
		}
		//#endregion

	}
}