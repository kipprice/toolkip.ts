///<reference path="../drawable/drawable.ts" />
namespace KIP.SVG {

	export interface ISVGElems extends IDrawableElements {
		base: SVGElement;
		definitions: SVGElement;
		coreGroup: SVGElement;
	}

	/**...........................................................................
	 * @class ISVGOptions
	 * ...........................................................................
	 * Interface for all options that apply to SVG Drawables
	 * ...........................................................................
	 */
	export interface ISVGOptions {

		/** how big the svg element should be padded */
		gutter?: number;

		/** whether we should resize the SVG canvas to the viewport */
		auto_resize?: boolean;

		/** how much we should zoom horizontally */
		zoom_x?: number;

		/** how much we should zoom vertically */
		zoom_y?: number;

		/** how much we should move horizontally */
		pan_x?: boolean;

		/** how much we should move vertically */
		pan_y?: boolean;

		/** true if we should ignore events like pan/zoom on the canvas */
		prevent_events?: boolean;
	};

	/**----------------------------------------------------------------------------
	 * @class 	SVGDrawable
	 * ----------------------------------------------------------------------------
	 * Create a drawable SVG canvas
	 * @author	Kip Price
	 * @version 1.1.0
	 * ----------------------------------------------------------------------------
	 */
	export class SVGDrawable extends Drawable {

		//#region PROPERTIES

		/** elements within the SVG drawable */
		protected _elems: ISVGElems;

		/** The base element of the SVG canvas */
		public base: SVGElement;

		/** the group upon which everything is drawn */
		protected _group: GroupElement;

		/** The rectangle that defines the bounds of the canvas */
		private _view: IBasicRect;
		public get view(): IBasicRect {
			window.setTimeout(() => { this._verifyViewMeetsAspectRatio(); }, 0);
			return this._view; 
		}
		public set view(rect: IBasicRect) { 
			this._view.x = rect.x;
			this._view.y = rect.y;
			this._view.w = rect.w;
			this._view.h = rect.h;
		 }

		/** The maximum and minimum values of the SVG canvas */
		private _extrema: IExtrema;

		/** Any options that should be used for this canvas */
		private _options: ISVGOptions;
		public get options(): ISVGOptions { return this._options; }

		/** The bounds of the SVG element in the actual window */
		private _bounds: IBasicRect;

		/** styles for the SVG element */
		public get style(): SVGStyle { return this._group.style; }

		private _elemCollections: Collection<SVGElem>;

		protected _shouldSkipCreateElements(): boolean { return true; }

		//#endregion

		/**...........................................................................
		 * Constructs a basic SVG canvas
		 * @param 	id     The ID of the canvas
		 * @param 	bounds The real-world (e.g. in window) bounds of the canvas
		 * @param 	opts   Any options that should be applied to the canvas
		 * ...........................................................................
		 */
		constructor(bounds?: IBasicRect, opts?: ISVGOptions) {
			super();
			this._bounds = bounds || { x: 0, y: 0, w: 0, h: 0 };

			// Initialize the default maxima / minima
			this._initializeInternalSizing();

			// Reconcile options
			let defaults: ISVGOptions = this._createDefaultOptions();
			this._options = reconcileOptions<ISVGOptions>(opts, defaults);

			// create elements needed by this drawable
			this._createElements();

			// Add event listeners
			this._addEventListeners();

		}

		/**...........................................................................
		 * _initializeInternalSizing
		 * ...........................................................................
		 * Make sure we have default values for extrema
		 * ...........................................................................
		 */
		private _initializeInternalSizing (): void {
			this._extrema = {
				min : {
					x: 1000000,
					y: 1000000
				},

				max : {
					x: 0,
					y: 0
				}
			}

			// Initialize the viewport
			this._view = {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			}
		}

		/**...........................................................................
		 * _createDefaultOptions
		 * ...........................................................................
		 * Get the set of default options
		 * @returns	The created default options
		 * ...........................................................................
		 */
		private _createDefaultOptions(): ISVGOptions {
			let defaults: ISVGOptions = {
				gutter: 2,
				auto_resize: true,

				zoom_x: 0.08,
				zoom_y: 0.08,
				pan_x: true,
				pan_y: true,

				prevent_events: false
			};

			return defaults;
		}

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 * Create the elements needed for this SVG drawable
		 * ...........................................................................
		 */
		protected _createElements(): void {
			// Create the base element
			this._elems.base = createSVG(
				{
					id: this._id, 
					attr: {
						width: this._bounds.w, 
						height: this._bounds.h
					}
				}
			);

			// Create the definitions element
			let defs = new SVGDefinitionsElement();
			this._elems.definitions = defs.base;
			this._elems.base.appendChild(this._elems.definitions);

			// add the group that contains everything
			this._group = new GroupElement({parent: this._elems.base});
			this._elems.coreGroup = this._group.base;
			this._elems.base.appendChild(this._group.base);
		}

		//#region EVENT HANDLING
		/**...........................................................................
		 * _addEventListeners
		 * ...........................................................................
		 * Adds the relevant event listeners for the SVG object 
		 * ...........................................................................
		 */
		private _addEventListeners () : void {

			// don't listen for events if asked not to
			if (this._options.prevent_events) { return; }

			// Add the wheel listener to the SVG element
			this.base.addEventListener("wheel", (e) => {
				let delta: number = e.deltaY;
				delta = (delta > 0) ? 1 : -1;
				this._onZoom(delta);
			});

			// Add the drag listeners
			makeDraggable(
				this.base as any as HTMLElement,
				{ 
					target: document.body,
					onMove: (delta: IPoint) => {
						this._onPan(delta);
					},
					isNonStandard: true
				}
			);

		}

		/**...........................................................................
		 * _onZoom
		 * ...........................................................................
		 * handle zooming in & out
		 * @param	direction	If positive, zooms in. If negative, zooms out
		 * ........................................................................... 
		 */
		protected _onZoom (direction: number) : void {
			let xAmt: number = this._options.zoom_x * direction;
			let yAmt: number = this._options.zoom_y * direction;

			let xUnit : number = this._view.w * xAmt;
			let yUnit: number = this._view.h * yAmt;

			// Resize appropriately in the x-dimension
			if (this._options.zoom_x) {
				this._view.x -= xUnit;
				this._view.w += (2 * xUnit);
			}

			// Resive appropriately in the y-dimension
			if (this._options.zoom_y) {
				this._view.y -= yUnit;
				this._view.h += (2 * yUnit);
			}

			// refresh the viewbox attribute
			this.generateViewboxAttribute(true);
		}

		/**...........................................................................
		 * _onPan
		 * ...........................................................................
		 * handle panning the SVG canvas 
		 * @param	delta	The amount to pan by
		 * ...........................................................................
		 */
		protected _onPan(delta: IPoint) : void {
			if (this._options.pan_x) {
				this._view.x -= (this.calculateSVGWidth(delta.x));
			}

			if (this._options.pan_y) {
				this._view.y -= (this.calculateSVGHeight(delta.y));
			}

			// Update the view box
			this.generateViewboxAttribute(true);
		}

		//#endregion

		//#region WIDTH AND HEIGHT CALCULATION

		/**...........................................................................
		 * Sets the real-world width of the canvas
		 * @param 	w 	The width to set
		 * ...........................................................................
		 */
		public set width (w: number) {
			this._bounds.w = w;
			this._elems.base.setAttribute("width", w.toString());
		}

		/**...........................................................................
		 * Sets the real-world height of the canvas
		 * @param 	h 	The height to set
		 * ...........................................................................
		 */
		public set height (h: number) {
			this._bounds.h = h;
			this._elems.base.setAttribute("height", h.toString());
		}
		/**...........................................................................
		 * generateViewboxAttribute
		 * ...........................................................................
		 * Create a string that can be used in the viewbox attribute for the SVG
		 * @param  	set		True if we should also set the attribute after generating it
		 * @returns The viewbox attribute for the current view
		 * ...........................................................................
		 */
		public generateViewboxAttribute (set?: boolean) : string {
			let v_box: string = "";

			// Make sure we have no negative widths or heights
			if (this._view.w < 0) { this._view.w = 0; }
			if (this._view.h < 0) { this._view.h = 0; }

			// Generate the view box string
			v_box = this._view.x + " " + this._view.y + " " + this._view.w + " " + this._view.h;

			// Set the attribute if requested
			if (set) { 
				this.base.setAttribute("viewbox", v_box); 
				this.base.setAttribute("viewBox", v_box); 
			}

			// Return the viewbox value
			return v_box;
		}

		/**...........................................................................
		 * _calculateView
		 * ...........................................................................
		 * Calculate what the view of the SVG should be, based on the extrema
		 * @returns True if the extrema were appropriately calculated
		 * ...........................................................................
		 */
		protected _calculateView() : boolean {

			// Update to the extrema
			this._view.x = this._extrema.min.x - this._options.gutter;
			this._view.y = this._extrema.min.y - this._options.gutter;
			this._view.w = (this._extrema.max.x - this._extrema.min.x) + (2 * this._options.gutter);
			this._view.h = (this._extrema.max.y - this._extrema.min.y) + (2 * this._options.gutter);

			// check that this meets the expected dimensions
			this._verifyViewMeetsAspectRatio();

			// refresh the viewbox attribute
			this.generateViewboxAttribute(true);

			// Return that we successfully updated the view
			return true;
		}

		protected _verifyViewMeetsAspectRatio(): void {
			let expectedRatio: number = this._bounds.w / this._bounds.h;
			let currentRatio: number = this._view.w / this._view.h;

			if (currentRatio < expectedRatio) {
				this._view.w = this._view.h * expectedRatio;
			} else if (currentRatio > expectedRatio) {
				this._view.h = this._view.w / expectedRatio;
			}
		}

		/**...........................................................................
		 * _updateExtrema
		 * ...........................................................................
		 * Updates the extreme points of this SVG element after adding an element
		 * @param 	extrema 	The extrema of the element just added
		 * ...........................................................................
		 */
		private _updateExtrema(extrema: IExtrema ): void {

			// Update the minima if appropriate
			if (extrema.min.x < this._extrema.min.x) { this._extrema.min.x = extrema.min.x; }
			if (extrema.min.y < this._extrema.min.y) { this._extrema.min.y = extrema.min.y; }

			// Update the maxima is appropriate
			if (extrema.max.x > this._extrema.max.x) { this._extrema.max.x = extrema.max.x; }
			if (extrema.max.y > this._extrema.max.y) { this._extrema.max.y = extrema.max.y; }

			if (this._options.auto_resize) {
				this._calculateView(); 
			}
		}
		//#endregion

		//#region CONVERSIONS

		/**...........................................................................
		 * calculateSVGCoordinates
		 * ...........................................................................
		 * Calculates the SVG coordinates from real coordinates
		 * @param   pt	The real coordinates to convert
		 * @returns The SVG coordinates for this real point
		 * ...........................................................................
		 */
		public calculateSVGCoordinates(pt: IPoint) : IPoint {
			return this._convertCoordinates(pt, this._view, this._bounds);
		}

		/**...........................................................................
		 * calculateScreenCoordinates
		 * ...........................................................................
		 * Calculate the real coordinates from SVG coordinates
		 * @param 	pt 	The point to convert to real coordinates
		 * @returns	The real coordinates for this SVG point
		 * ...........................................................................
		 */
		public calculateScreenCoordinates (pt: IPoint) : IPoint {
			let outPt = this._convertCoordinates(pt, this._bounds, this._view);
			return outPt;
		}

		/**...........................................................................
		 * _convertCoordinates
		 * ...........................................................................
		 * Convert one set of coordinates to another
		 * @param	pt			The point to convert
		 * @param	numerator	The ratio to consider the numerator
		 * @param	denominator	The ratio to consider the denominator
		 * @returns	The converted point
		 * ...........................................................................
		 */
		private _convertCoordinates (pt: IPoint, numerator: IBasicRect, denominator: IBasicRect) : IPoint {
			let out: IPoint;

			let x_ratio: number = (numerator.w / denominator.w);
			let y_ratio: number = (numerator.h / denominator.h);

			out = {
				x: (x_ratio * (pt.x - denominator.x)) + numerator.x,
				y: (y_ratio * (pt.y - denominator.y)) + numerator.y
			};

			return out;
		}

		/**...........................................................................
		 * _convertDistance
		 * ...........................................................................
		 * 
		 * ...........................................................................
		 */
		private _convertDistance (measure: number, numerator: number, denominator: number) : number {
			let ratio: number = numerator / denominator;
			return (measure * ratio);
		}

		/**...........................................................................
		 * calculateSVGWidth
		 * ...........................................................................
		 * Calculate how wide something is in SVG coordinates when measured in real
		 * coordinates.
		 * 
		 * @param	width	The width to convert
		 * 
		 * @returns	The SVG equivalent of the width
		 * ...........................................................................
		 */
		public calculateSVGWidth (width: number) : number {
			return this._convertDistance(width, this._view.w, this._bounds.w);
		}

		/**...........................................................................
		 * calculateSVGHeight
		 * ...........................................................................
		 * Calculate how high something is in SVG coordinates from the real 
		 * measurement.
		 * 
		 * @param	height	The height to convert
		 * 
		 * @returns	The converted height
		 * ........................................................................... 
		 */
		public calculateSVGHeight (height: number) : number {
			return this._convertDistance(height, this._view.h, this._bounds.h);
		}

		public calculateScreenWidth (width: number) : number {
			return this._convertDistance(width, this._bounds.w, this._view.w);
		}

		public calculateScreenHeight (height: number) : number {
			return this._convertDistance(height, this._bounds.h, this._view.h);
		}

		//#endregion

		//#region ADD CHILDREN

		/**
		 * addPath
		 * ----------------------------------------------------------------------------
		 * Add a path to our SVG canvas
		 * @param 	points 	The points in the path to add
		 * @param 	noFinish 	True if this path should be left unfinished
		 * @param 	attr 		Any attributes that should be set for the path
		 * 
		 * @returns	The created PathElement
		 */
		public addPath (points: IPathPoint[], noFinish?: boolean, attr?: IPathSVGAttributes) : PathElement {
			let path = this._group.addPath(points, noFinish, attr);
			this._addElementListener(path);
			return path;
		}

		/**
		 * addRectangle
		 * ----------------------------------------------------------------------------
		 * Add a rectangle to our SVG canvas
		 * @param 	x 		X coordinate for the rect
		 * @param 	y 		y coordinate for the rect
		 * @param 	width 	Width for the rect
		 * @param 	height 	Height for the rect
		 * @param 	attr 	Any attributes that should be set for the rect
		 * 
		 * @returns	The created rectangle
		 */
		public addRectangle (x: number, y: number, width: number, height: number, attr?: ISVGAttributes) : RectangleElement {
			let rect = this._group.addRectangle(x, y, width, height, attr);
			this._addElementListener(rect);
			return rect;
		}

		/**
		 * addCircle
		 * ----------------------------------------------------------------------------
		 * Add a circle to our SVG canvas
		 * @param 	centerPt	Central point for the circle
		 * @param 	radius		Radius for the circle 
		 * @param 	attr		Any attributes that should be set for the circle
		 * 
		 * @returns	The created circle 
		 */
		public addCircle (centerPt: IPoint, radius: number, attr?: ISVGAttributes) : CircleElement {
			let circle = this._group.addCircle(centerPt, radius, attr);
			this._addElementListener(circle);
			return circle;
		}

		/**
		 * addPerfectArc
		 * ----------------------------------------------------------------------------
		 * Add an arc to our SVG canvas
		 * @param centerPt 
		 * @param radius 
		 * @param startDeg 
		 * @param endDeg 
		 * @param direction 
		 * @param attr 
		 * 
		 * @returns	The created arc
		 */
		public addPerfectArc (centerPt: IPoint, radius: number, startDeg: number, endDeg: number, direction: number, attr?: IPathSVGAttributes): ArcElement {
			let arc = this._group.addPerfectArc(centerPt, radius, startDeg, endDeg, direction, attr);
			this._addElementListener(arc);
			return arc;
		}

		/**
		 * addPieSlice
		 * ----------------------------------------------------------------------------
		 * @param centerPt 
		 * @param radius 
		 * @param startDeg 
		 * @param endDeg 
		 * @param direction 
		 * @param attr 
		 * 
		 * @returns	The created pie slice
		 */
		public addPieSlice (centerPt: IPoint, radius: number, startDeg: number, endDeg: number, direction: number, attr?: IPathSVGAttributes): PieSliceElement {
			let pieSlice = this._group.addPieSlice(centerPt, radius, startDeg, endDeg, direction, attr);
			this._addElementListener(pieSlice);
			return pieSlice;
		}

		/**
		 * addRegularPolygon
		 * ----------------------------------------------------------------------------
		 * Add a multi-sided polygon to our SVG canvas
		 * @param 	centerPt 	Central point for the shape
		 * @param 	sides 		Number of sides for the polygon
		 * @param 	radius 		Radius for the polygon
		 * @param 	attr 		Any attributes that should be set for the circle
		 * 
		 * @returns	The created polygon
		 */
		public addRegularPolygon (centerPt: IPoint, sides: number, radius: number, attr?: IPathSVGAttributes) : PolygonElement {
			let polygon = this._group.addRegularPolygon(centerPt, sides, radius, attr);
			this._addElementListener(polygon);
			return polygon;
		}

		public addRegularStar (centerPt: IPoint, numberOfPoints: number, radius: number, innerRadius: number, attr?: IPathSVGAttributes) : StarElement {
			let star = this._group.addRegularStar(centerPt, numberOfPoints, radius, innerRadius, attr);
			this._addElementListener(star);
			return star;
		}

		public addText (text: string, point: IPoint, originPt: IPoint, attr?: ISVGAttributes) : TextElement {
			let txt = this._group.addText(text, point, originPt, attr);
			this._addElementListener(txt);
			return txt;
		}
		
		public addFlowableText (text: string, bounds: IBasicRect, attr: ISVGAttributes) : TextElement {
			let txt = this._group.addFlowableText(text, bounds, attr);
			this._addElementListener(txt);
			return txt;
		}

		public addGroup (attr?: ISVGAttributes): GroupElement {
			let group = this._group.addGroup(attr);
			this._addElementListener(group);
			return group;
		}

		public addShape (shapeType: SVGShapeEnum, scale?: number, centerPt?: IPoint, attr?: ISVGAttributes) : PathExtensionElement {
			let shape = this._group.addShape(shapeType, scale, centerPt, attr);
			this._addElementListener(shape);
			return shape;
		}

		protected _addElementListener (elem: SVGElem): void {
			elem.addUpdateListener(() => {
				this._updateExtrema(elem.extrema);
			});
		}
		//#endregion

		/**
		 * _convertPointsToPathPoints
		 * ----------------------------------------------------------------------------
		 * Helper function to turn an array of IPoint elements to IPathPoint elements
		 * @param   points 	The points to convert
		 * @param   scale  	The scale that should be applied to the IPoint before turning into a IPathPoint
		 * @returns Array of scaled IPathPoints
		 */
		private _convertPointsToPathPoints(points: IPoint[], scale?: number): IPathPoint[] {
			if (!scale) { scale = 1; }

			let pathPoints: IPathPoint[] = [];

			// Loop through each of the points
			for (let pt of points) {

				pt.x *= scale;			// Scale the x dimension
				pt.y *= scale;			// Scale the y dimension

				pathPoints.push(pt);
			}

			return pathPoints;
		}

		//
		/**...........................................................................
		 * rotateElement
		 * ...........................................................................
		 * Rotates an element around a particular point
		 * @param   elem         The element to rotate
		 * @param   degree       How many degrees to rotate the element
		 * @param   rotateAround What point to rotate around
		 * @returns The rotated SVG Element
		 * ...........................................................................
		 */
		public rotateElement (elem: SVGElem, degree: number, rotateAround?: IPoint) : SVGElem {

			let box: IBasicRect;

			// If we don't have a point around which to rotate, set it to be the center of the element
			if (!rotateAround) {
				box = elem.measureElement();
				rotateAround = {
					x: box.x + (box.w / 2),
					y: box.y + (box.h / 2)
				};
			}

			elem.base.setAttribute("transform", "rotate(" + degree + ", " + rotateAround.x + ", " + rotateAround.y + ")");
			return elem;
		}

		/**...........................................................................
		 * clear
		 * ...........................................................................
		 * Clear everything off the canvas
		 * ...........................................................................
		 */
		public clear(): void {
			this._group.clear();
		}


	}
}