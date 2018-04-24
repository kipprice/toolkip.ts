///<reference path="../drawable.ts" />
namespace KIP.SVG {

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

	/**...........................................................................
	 * @class 	SVGDrawable
	 * ...........................................................................
	 * Create a drawable SVG canvas
	 * @version 1.1
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export class SVGDrawable extends Drawable {

		//#region ID TRACKING
		protected static _lastId: number = 0;

		protected static get _nextId(): string {
			SVGDrawable._lastId += 1;
			return SVGDrawable._lastId.toString();
		}
		//#endregion

		//#region PROPERTIES

		/** The base element of the SVG canvas */
		public base: SVGElement;

		/** Definitions for the SVG canvas */
		private _definitionsElement: SVGElement;

		/** gradients available in this canvas */
		private __gradients: SVGGradientElement[];

		/** The rectangle that defines the bounds of the canvas */
		private _view: IBasicRect;
		public get view(): IBasicRect { return this._view; }

		/** The maximum and minimum values of the SVG canvas */
		private _extrema: IExtrema;

		/** All elements that are drawn in the canvas */
		protected _svgElems: Collection<SVGElement>;

		protected _nonScaled: SVGElement[];

		/** Any options that should be used for this canvas */
		private _options: ISVGOptions;

		/** The bounds of the SVG element in the actual window */
		private _bounds: IBasicRect;

		/** The path that is currently being drawn in the canvas */
		private _currentPath: SVGPathElement;

		/** styles for the SVG element */
		private _style: SVGStyle;
		public get style(): SVGStyle { return this._style; }

		private _elemCollections: Collection<SVGElem>;

		//#endregion

		/**...........................................................................
		 * Constructs a basic SVG canvas
		 * @param 	id     The ID of the canvas
		 * @param 	bounds The real-world (e.g. in window) bounds of the canvas
		 * @param 	opts   Any options that should be applied to the canvas
		 * ...........................................................................
		 */
		constructor(id?: string, bounds?: IBasicRect, opts?: ISVGOptions) {
			super({id: id});
			this._bounds = bounds;
			this._nonScaled = [];

			// Initialize the default maxima / minima
			this._initializeInternalSizing();

			// Reconcile options
			let defaults: ISVGOptions = this._createDefaultOptions();
			this._options = reconcileOptions<ISVGOptions>(opts, defaults);

			// Initiate collections
			this._svgElems = new Collection<SVGElement>();
			this._nonScaled = new Array<SVGElement>();

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
				gutter: 1,
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
			this.base  = createSVG(this._id, this._bounds.w, this._bounds.h);

			// Create the definitions element
			this._definitionsElement = createSVGElem("defs");
			this.base.appendChild(this._definitionsElement);
		}

		//#region EVENT HANDLING
		/**...........................................................................
		 * _addEventListeners
		 * ...........................................................................
		 * Adds the relevant event listeners for the SVG object 
		 * ...........................................................................
		 */
		private _addEventListeners () : void {

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
					}
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
				this._view.x += delta.x;
			}

			if (this._options.pan_y) {
				this._view.y += delta.y;
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
			if (this._view.w < 0) { this._view.w = 1; }
			if (this._view.h < 0) { this._view.h = 1; }

			// Generate the view box string
			v_box = this._view.x + " " + this._view.y + " " + this._view.w + " " + this._view.h;

			// Set the attribute if requested
			if (set) { this.base.setAttribute("viewbox", v_box); }

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
		protected _calculateView () : boolean {

			// If we shouldn't auto-resize,
			if (!this._options.auto_resize) { return false; }

			// Update to the extrema
			this._view.x = this._extrema.min.x;
			this._view.y = this._extrema.min.y;
			this._view.w = (this._extrema.max.x - this._extrema.min.x);
			this._view.h = (this._extrema.max.y - this._extrema.min.y);

			// Return that we successfully updated the view
			return true;
		}

		/**...........................................................................
		 * _updateExtrema
		 * ...........................................................................
		 * Updates the extreme points of this SVG element after adding an element
		 * @param 	extrema 	The extrema of the element just added
		 * ...........................................................................
		 */
		private _updateExtrema (extrema: IExtrema ): void {

			// Update the minima if appropriate
			if (extrema.min.x < this._extrema.min.x) { this._extrema.min.x = extrema.min.x; }
			if (extrema.min.y < this._extrema.min.y) { this._extrema.min.y = extrema.min.y; }

			// Update the maxima is appropriate
			if (extrema.max.x > this._extrema.max.x) { this._extrema.max.x = extrema.max.x; }
			if (extrema.max.y > this._extrema.max.y) { this._extrema.max.y = extrema.max.y; }
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
		public calculateSVGCoordinates (pt: IPoint) : IPoint {
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
			return this._convertCoordinates(pt, this._bounds, this._view);
		}

		/**...........................................................................
		 * _convertCoordinates
		 * ...........................................................................
		 * 
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

		private _convertDistance (measure: number, numerator: number, denominator: number) : number {
			let ratio: number = numerator / denominator;
			return (measure * ratio);
		}

		public calculateSVGWidth (width: number) : number {
			return this._convertDistance(width, this._view.w, this._bounds.w);
		}

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

		/**...........................................................................
		 * _addChild
		 * ...........................................................................
		 * @param 	type 
		 * @param 	attributes 
		 * @param 	parentGroup 
		 * @returns	The created SVG element
		 * ...........................................................................
		 */
		private _addChild (type: string, attributes?: ISVGAttributes, parentGroup?: SVGElement) : SVGElement {

			// Throw an error if no data was provided
			if (type === "") {
				throw new Error("no SVG element type provided");
			}

			let elem: SVGElement = createSVGElem(type, attributes);

			// Add to the appropriate parent
			if (parentGroup) {
				parentGroup.appendChild(elem);
			} else {
				this.base.appendChild(elem);
			}

			// Add to our collections
			if (attributes.unscalable) {
				this._nonScaled.push(elem);
			}

			if (attributes["id"]) {
				this._svgElems.addElement(attributes["id"] as string, elem);
			}

			return elem;
		}

		private _initializeAttributes(attr: ISVGAttributes, group?: SVGElement): ISVGAttributes {
			if (!attr) { attr = {}; }

			// initialize the appropriate parent
			if (group) { attr.parent = group; }
			else { attr.parent = this.base; }

			// initialize the ID of the child
			if (!attr.id) { attr.id = SVGDrawable._nextId; }

			return attr;
		}

		private _addChildElement(elem: SVGElem): void {
			//this._elems.addElement(elem.id, elem);

			if (elem.preventScaling) {
				//this._nonScaled.push(elem);
			}

			if (this._options.auto_resize) {
				this._updateExtrema(elem.extrema);
			}
		}

		//#region ADD PATH

		/**
		 * Adds a path to the SVG canvas
		 * @param   {IPathPoint[]} points   The points to add to the path
		 * @param   {IAttributes}  attr     Any attributes that should be applied
		 * @param   {SVGElement}   group    The group this path should be added to
		 * @param   {boolean}      noFinish True if we should finish the path without closing
		 * @returns {SVGElement}            The path that was created
		 */
		public addPath (points: IPathPoint[], attr?: IPathSVGAttributes, group?: SVGElement, noFinish?: boolean) : SVGElement {
			attr = this._initializeAttributes(attr, group) as IPathSVGAttributes;
			attr.noFinish = noFinish;

			let path: PathElement = new PathElement(points, attr);
			this._addChildElement(path);
			return path.base;
		}

		//#endregion

		//#region ADD RECTANGLE

		/**...........................................................................
		 * addRectangle
		 * ...........................................................................
		 * @param x 
		 * @param y 
		 * @param width 
		 * @param height 
		 * @param attr 
		 * @param group 
		 * ...........................................................................
		 */
		public addRectangle (x: number, y: number, width: number, height: number, attr?: ISVGAttributes, group?: SVGElement) : SVGElement {
			attr = this._initializeAttributes(attr, group);

			let rect: RectangleElement = new RectangleElement(x, y, width, height, attr);
			this._addChildElement(rect);
			return rect.base;
		}

		//#endregion

		//#region ADD CIRCLE

		/**...........................................................................
		 * addCircle
		 * ...........................................................................
		 * adds a circle to the SVG canvas 
		 * @param	centerPt
		 * @param	radius
		 * @param	attr
		 * @param	group
		 * @returns	The created circle
		 * ...........................................................................
		 */
		public addCircle (centerPt: IPoint, radius: number, attr?: IAttributes, group?: SVGElement) : SVGElement {
			attr = this._initializeAttributes(attr, group);

			let circle: CircleElement = new CircleElement(centerPt, radius, attr);
			this._addChildElement(circle);
			return circle.base;
		}

		//#endregion

		

		//#endregion

		//#region ADD POLYGON
		/**...........................................................................
		 * regularPolygon
		 * ...........................................................................
		 * creates a regular polygon to the SVG canvas
		 * @param   centerPt The central point of the polygon
		 * @param   sides    The number of sides of the polygon
		 * @param   radius   The radius of the polygon
		 * @param   attr     Any additional attributes
		 * @param   group    The group the polygon should be added to
		 * @returns The created polygon on the SVG Canvas
		 * ...........................................................................
		 */
		public regularPolygon (centerPt: IPoint, sides: number, radius: number, attr?: IPathSVGAttributes, group?: SVGElement) : SVGElement {
			attr = this._initializeAttributes(attr, group) as IPathSVGAttributes;

			let polygon: PolygonElement = new PolygonElement(centerPt, sides, radius, attr);
			this._addChildElement(polygon);
			return polygon.base;
		}
		//#endregion

		//#region ADD STAR
		/**...........................................................................
		 * addRegularStar
		 * ...........................................................................
		 * Creates a regular star on the SVG canvas
		 * @param   centerPt      	The point at the center of the star
		 * @param   numberOfPoints 	The number of points of this star
		 * @param   radius        	[description]
		 * @param   innerRadius   	[description]
		 * @param   attr          	[description]
		 * @param   group         	[description]
		 * @returns The created star
		 * ...........................................................................
		 */
		public addRegularStar (centerPt: IPoint, numberOfPoints: number, radius: number, innerRadius: number, attr?: IPathSVGAttributes, group?: SVGElement) : SVGElement {
			attr = this._initializeAttributes(attr, group) as IPathSVGAttributes;

			let star: StarElement = new StarElement(centerPt, numberOfPoints, radius, innerRadius, attr);
			this._addChildElement(star);
			return star.base;
		}
		//#endregion

		//#region ADD TEXT
		/**...........................................................................
		 * addtext
		 * ...........................................................................
		 * Adds a text element to the SVG canvas
		 * @param   text     The text to add
		 * @param   point    The point at which to add the point
		 * @param   originPt If provided, the origin point within the text element that defines where the text is drawn
		 * @param   attr     Any attributes that should be applied to the element
		 * @param   group    The group to add this element to
		 * @returns The text element added to the SVG
		 * ...........................................................................
		 */
		public addText (text: string, point: IPoint, originPt: IPoint, attr: IAttributes, group: SVGElement) : SVGElement {
			attr = this._initializeAttributes(attr, group);

			let txt: TextElement = new TextElement(attr);
			this._addChildElement(txt);
			return txt.base;
		}

		public addFlowableText (text: string, bounds: IBasicRect, attr: IAttributes, group: SVGElement) : SVGElement {
			//TODO: Add flowable text
			return null;
		}

		//#endregion

		//#region ADD GROUP

		/**...........................................................................
		 * addGroup
		 * ...........................................................................
		 * @param	attr 
		 * @param 	group 
		 * @returns	The created element
		 * ...........................................................................
		 */
		public addGroup (attr?: IAttributes, group?: SVGElement): SVGElement {
			attr = this._initializeAttributes(attr, group);

			let grp: GroupElement = new GroupElement(attr);
			this._addChildElement(grp);
			return grp.base;
		}
		//#endregion

		//#region ADD GRADIENTS
		/**...........................................................................
		 * addGradient
		 * ...........................................................................
		 * Adds a gradient to the SVG canvas
		 * @param   type       The type of gradient to add
		 * @param   points     What points describe the gradient
		 * @param   transforms 	 ???
		 * @returns he created gradient
		 * ...........................................................................
		 */
		public addGradient (type: SVGGradientTypeEnum, points: IGradientPoint[], transforms: {start: IPoint, end: IPoint}) : string {
			return "";
			//TODO: the real thing
		}
		//#endregion

		//#region ADD PATTERNS

		// TODO: add pattern
		// public addPattern () {
		// }

		// TODO: add stipple pattern
		//public addStipplePattern () {
		//}

		//#endregion

		//#region ADD SHAPES
		/**
		 * Adds a particular shape to the SVG canvas
		 * @param   shapeType The type of shape to add
		 * @param   scale     What scale the shape should be drawn at
		 * @param   attr      Any attributes that should be applied to the element
		 * @param   group     What group the element should be added to
		 * @returns The created shape
		 */
		public addShape (shapeType: SVGShapeEnum, scale?: number, attr?: IAttributes, group?: SVGElement) : SVGElement {

			// Use our default scale if one wasn't passed in
			if (!scale) { scale = 1; }

			// Draw the appropriate shape
			switch (shapeType) {
				case SVGShapeEnum.CHECKMARK:
					return this._addCheckShape(scale, attr, group);
				case SVGShapeEnum.X:
					return this._addExShape(scale, attr, group);
				case SVGShapeEnum.PLUS:
					return this._addPlusShape(scale, attr, group);
			}
		}

		/**
		 * Adds a checkmark to the canvas with the provided scale
		 */
		private _addCheckShape (scale: number, attr?: IPathSVGAttributes, group?: SVGElement): SVGElement {
			attr = this._initializeAttributes(attr, group) as IPathSVGAttributes;

			let checkmark: CheckElement = new CheckElement(null, attr);
			this._addChildElement(checkmark);
			return checkmark.base;
		}

		/**
		 * Adds an 'ex' to the canvas with the provided scale
		 */
		private _addExShape (scale: number, attr?: IPathSVGAttributes, group?: SVGElement): SVGElement {
			attr = this._initializeAttributes(attr, group) as IPathSVGAttributes;

			let exElem: ExElement = new ExElement(null, attr);
			this._addChildElement(exElem);
			return exElem.base;
		}

		/**
		 * Adds a plus to the canvas with the provided scale
		 */
		private _addPlusShape (scale: number, attr?: IPathSVGAttributes, group?: SVGElement): SVGElement {
			attr = this._initializeAttributes(attr, group) as IPathSVGAttributes;

			let plusSymbol: PlusElement = new PlusElement(null, attr);
			this._addChildElement(plusSymbol);
			return plusSymbol.base;
		}

		//#endregion

		/**...........................................................................
		 * _convertPointsToPathPoints
		 * ...........................................................................
		 * Helper function to turn an array of IPoint elements to IPathPoint elements
		 * @param   points 	The points to convert
		 * @param   scale  	The scale that should be applied to the IPoint before turning into a IPathPoint
		 * @returns Array of scaled IPathPoints
		 * ...........................................................................
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

		public assignStyle (element: SVGElement): void {
			this._style.assignStyle(element);
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
		public rotateElement (elem: SVGElement, degree: number, rotateAround?: IPoint) : SVGElement {

			let box: IBasicRect;

			// If we don't have a point around which to rotate, set it to be the center of the element
			if (!rotateAround) {
				box = this.measureElement(elem);
				rotateAround = {
					x: box.x + (box.w / 2),
					y: box.y + (box.h / 2)
				};
			}

			elem.setAttribute("transform", "rotate(" + degree + ", " + rotateAround.x + ", " + rotateAround.y + ")");
			return elem;
		}

		//TODO: add SVG ANIMATIONS
		public animateElement () {}

		/**...........................................................................
		 * measureElement
		 * ...........................................................................
		 * Measures an element in the SVG canvas
		 * @param   element 	The element to measure
		 * @returns The dimensions of the element, in SVG coordinates
		 * ...........................................................................
		 */
		public measureElement (element: SVGElement) : IBasicRect {

			let box: SVGRect;
			let addedParent: boolean;

			// Add our base element to the view if it doesn't have anything
			if (!this.base.parentNode) {
				document.body.appendChild(this.base);
				addedParent = true;
			}

			// Get the bounding box for element
			box = (element as any).getBBox();

			// If we had to add the base element to the document, remove it
			if (addedParent) {
				document.body.removeChild(this.base);
			}

			// Build our return rectangle
			let rect: IBasicRect = {
				x: box.x,
				y: box.y,
				w: box.width,
				h: box.height
			};

			return rect;

		}

		/**
		 * _saveOriginalView
		 */
		protected _saveOriginalView = function () {
			if (!this.originalView) {
				this.originalView = {
					x: this.viewX,
					y: this.viewY,
					w: this.viewW,
					h: this.viewH
				};
			}
		};
	}
}