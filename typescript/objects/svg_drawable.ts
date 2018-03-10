namespace KIP {

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
	 * @class ISVGAttributes
	 * ...........................................................................
	 * Additional attributes that can be applied 
	 * ...........................................................................
	 */
	export interface ISVGAttributes extends IAttributes {
		unscalable?: boolean;
		svgStyle?: ISVGStyle;
		[key: string]: any;
	}

	/**...........................................................................
	 * @class ISVGStyle
	 * ...........................................................................
	 * Keep track of SVG styles
	 * ...........................................................................
	 */
	export interface ISVGStyle {
		fill: string;
		fillOpacity?: number;

		fontSize?: number;
		fontWeight?: string;
		fontFamily?: string;

		stroke: string;
		strokeWidth?: number;
		strokeOpacity?: number;
		strokeLinecap?: string;
		strokeLinejoin?: string;
	}

	export interface IPathPoint {
		point: IPoint,
		controls?: IPoint[],
		radius?: IPoint,
		xRotation?: number,
		largeArc?: number,
		sweepFlag?: number
	}

	/**
	 * @class IGradientPoint
	 * 
	 * Keep track of a point used for gradients
	 */
	export interface IGradientPoint {
		point: IPoint,
		color: string,
		offset: string,
		opacity: number
	}

	/**
	 * @class SVGGradientTypeEnum
	 * 
	 * Handle different types of gradients
	 */
	export enum SVGGradientTypeEnum {
		LINEAR = 1,
		RADIAL = 2
	}

	export enum SVGShapeEnum {
		CHECKMARK = 1,
		X = 2,
		PLUS = 3
	}

	/**
	 * @type IExtrema
	 * 
	 * Interface that stores a max point and a min point
	 */
	export type IExtrema = IGenericExtrema<IPoint>;

	/**
	 * @class IGenericExtrema
	 * 
	 * Handle any type of extreema
	 */
	export interface IGenericExtrema<T> {
		max: T,
		min: T
	};

	/**...........................................................................
	 * @class	SVGStyle
	 * ...........................................................................
	 * Keep track of style changes for SVG elements
	 * @version 1.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export class SVGStyle implements ISVGStyle {

		/** keep track of the last generated string */
		protected _generatedStyleString: string;

		/** inner tracking for our particular style selements */
		protected _innerStyle: ISVGStyle;

		/** keep track of whether we need to regenerate the string to use for the SVG style */
		protected _needsNewString: boolean

		/**...........................................................................
		 * _setStyle
		 * ...........................................................................
		 * Update a particular style
		 * @param 	key 	The key 
		 * @param 	value 	The value
		 * ...........................................................................
		 */
		protected _setStyle(key: keyof ISVGStyle, value: string | number) {
			this._innerStyle[key] = value;
			this._needsNewString = true;
		}

		/** fill color or "None" */
		public set fill(fill: string) { this._setStyle("fill", fill); }

		/** fill opacity */
		public set fillOpacity(opacity: number) { this._setStyle("fillOpacity", opacity); }

		/** font size */
		public set fontSize(size: number) { this._setStyle("fontSize", size); }

		/** font weight */
		public set fontWeight(weight: string) { this._setStyle("fontWeight", weight); }

		/** font family */
		public set fontFamily(family: string) { this._setStyle("fontFamily", family); }

		/** stroke color */
		public set stroke(stroke: string) { this._setStyle("stroke", stroke); }

		/** stroke width */
		public set strokeWidth(width: number) { this._setStyle("strokeWidth", width); }

		/** stroke opacity */
		public set strokeOpacity(opacity: number) { this._setStyle("strokeOpacity", opacity); }

		/** stroke linecap */
		public set strokeLinecap(linecap: string) { this._setStyle("strokeLinecap", linecap); }

		/** stroke linejoin */
		public set strokeLinejoin(linejoin: string) { this._setStyle("strokeLinejoin", linejoin); }

		/** keep track of how the line should be dashed */
		protected _strokeDashArray: string;
		public set strokeDashArray(dashArray: string) { this._strokeDashArray = dashArray; }

		/**...........................................................................
		 * Create a SVGStyle object
		 * ...........................................................................
		 */
		constructor() {
			this.clear();
			this._needsNewString = true;
		}

		/**...........................................................................
		 * clear
		 * ...........................................................................
		 * Clear out our inner styles to defaults
		 * ...........................................................................
		 */
		public clear(): void {
			this._innerStyle = {
				fill: "None",
				stroke: "None"
			};
		}

		/**...........................................................................
		 * assignStyle
		 * ...........................................................................
		 * @param 	element 	The element to set styles on
		 * ...........................................................................
		 */
		public assignStyle(element: SVGElement): void {
			if (this._needsNewString) { this._generateStyleString(); }

			element.setAttribute("style", this._generatedStyleString); 

			if (this._strokeDashArray) { 
				element.setAttribute
			}
		}

		/**...........................................................................
		 * _generateStyleString
		 * ...........................................................................
		 * Generate the appropriate string for the current style
		 * ...........................................................................
		 */
		protected _generateStyleString(): void {
			this._generatedStyleString = "";

			map(this._innerStyle, (propValue: any, propName: string) => {
				let formattedPropName: string = Styles.getPropertyName(propName);
				this._generatedStyleString += format("{0}: {1};", formattedPropName, propValue.toString());
			});
		}

	}

	/**...........................................................................
	 * @class 	SVGDrawable
	 * ...........................................................................
	 * Create a drawable SVG canvas
	 * @version 1.1
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export class SVGDrawable extends Drawable {

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
		 * Constructs a basic SVG canvas
		 * @param 	id     The ID of the canvas
		 * @param 	bounds The real-world (e.g. in window) bounds of the canvas
		 * @param 	opts   Any options that should be applied to the canvas
		 * ...........................................................................
		 */
		constructor(id?: string, bounds?: IBasicRect, opts?: ISVGOptions) {
			super();
			this._bounds = bounds;
			this._nonScaled = [];

			// Create the base element
			this.base  = createSVG(id, this._bounds.w, this._bounds.h);

			// Create the definitions element
			this._definitionsElement = createSVGElem("defs");
			this.base.appendChild(this._definitionsElement);

			// Initialize the default maxima / minima
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

			// Reconcile options
			let defaults: ISVGOptions = {
				gutter: 1,
				auto_resize: true,

				zoom_x: 0.08,
				zoom_y: 0.08,
				pan_x: true,
				pan_y: true,

				prevent_events: false
			};

			this._options = reconcileOptions<ISVGOptions>(opts, defaults);

			// Initiate collections
			this._svgElems = new Collection<SVGElement>();
			this._nonScaled = new Array<SVGElement>();

			// Add event listeners
			this._addEventListeners();

		}

		protected _createElements(): void {}

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
				document.body,
				true,
				null,
				null,
				null,
				(delta: IPoint) => {
					this._onPan(delta);
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

		//#region ADD PATH

		/**...........................................................................
		 * _checkForCurrentPath
		 * ...........................................................................
		 * 
		 * ...........................................................................
		 */
		private _checkForCurrentPath () : void {
			if (!this._currentPath) {
				throw new Error ("no path started");
			}
		}

		/**...........................................................................
		 * _constructPathAttribute
		 * ...........................................................................
		 * @param prefix 
		 * @param point 
		 * @returns	The appropriate path string
		 * ...........................................................................
		 */
		private _constructPathAttribute (prefix: string, point: IPoint) : string {
			let out: string = "";
			out = prefix + this._pointToAttributeString(point) + "\n";
			return out;
		}

		private _pointToAttributeString (point: IPoint) : string {
			let out: string = point.x + " " + point.y;
			return out;
		}

		private _addToPathAttribute (suffix: string) : boolean {
			this._checkForCurrentPath();
			let d: string = this._currentPath.getAttribute("d");
			d += suffix;
			this._currentPath.setAttribute("d", d);
			return true;
		}

		public startPath (attr?: ISVGAttributes, parentGroup?: SVGElement) : SVGElement {
			this._currentPath = this._addChild("path", attr, parentGroup) as SVGPathElement;
			return this._currentPath;
		}

		public lineTo (point: IPoint) : void {
			this._checkForCurrentPath();
			this._addToPathAttribute(this._constructPathAttribute("L", point));
		}

		public moveTo (point: IPoint) : void {
			this._checkForCurrentPath();
			this._addToPathAttribute(this._constructPathAttribute("M", point));
		}

		public curveTo (destination: IPoint, control1: IPoint, control2: IPoint) : void {
			this._checkForCurrentPath();
			let d: string;
			d = "C" + this._pointToAttributeString(control1) + ", ";
			d += this._pointToAttributeString(control2) + ", ";
			d += this._pointToAttributeString(destination) + "\n";
			this._addToPathAttribute(d);
		}

		public arcTo (destination: IPoint, radius: IPoint, xRotation: number, largeArc: number, sweepFlag: number) {
			let d: string;
			d = "A" + this._pointToAttributeString(radius) + " ";
			d += xRotation + " " + largeArc + " " + sweepFlag + " ";
			d += this._pointToAttributeString(destination) + "\n";
			this._addToPathAttribute(d);
		}

		/** closes the path so it creates an enclosed space */
		public closePath () : void {
			this._checkForCurrentPath();
			this._addToPathAttribute(" Z");
			this.finishPathWithoutClosing();
		}

		/** indicates the path is finished without closing the path */
		public finishPathWithoutClosing () : void {
			delete this._currentPath;
		}

		/**
		 * Adds a path to the SVG canvas
		 * @param   {IPathPoint[]} points   The points to add to the path
		 * @param   {IAttributes}  attr     Any attributes that should be applied
		 * @param   {SVGElement}   group    The group this path should be added to
		 * @param   {boolean}      noFinish True if we should finish the path without closing
		 * @returns {SVGElement}            The path that was created
		 */
		public addPath (points: IPathPoint[], attr?: IAttributes, group?: SVGElement, noFinish?: boolean) : SVGElement {

			if (!attr) { attr = {}; }

			let path: SVGElement = this.startPath(attr, group);

			let firstPt: boolean = true;
			for (let pathPt of points) {

				if (firstPt) {
					this.moveTo(pathPt.point);
					firstPt = false;
				}

				else if (pathPt.controls) {
					this.curveTo(pathPt.point, pathPt.controls[0], pathPt.controls[1]);
				}

				else if (pathPt.radius) {
					this.arcTo(pathPt.point, pathPt.radius, pathPt.xRotation, pathPt.largeArc, pathPt.sweepFlag);
				}

				else {
					this.lineTo(pathPt.point);
				}

				if (this._options.auto_resize) {
					this._updateExtrema({max: pathPt.point, min: pathPt.point});
				}

			}

			if (!noFinish) { this.closePath(); }
			else { this.finishPathWithoutClosing(); }

			return path;
		}

		//#endregion

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
			let rect: IBasicRect;
			rect = {
				x: x,
				y: y,
				w: width,
				h: height
			}

			return this._addRectangleHelper(rect, attr,group);
		}

		/**...........................................................................
		 * _addRectangleHelper
		 * ...........................................................................
		 * @param points 
		 * @param attr 
		 * @param group 
		 * ...........................................................................
		 */
		private _addRectangleHelper (points: IBasicRect, attr?: IAttributes, group?: SVGElement): SVGElement {

			this._checkBasicRectForBadData(points);

			if (!attr) {
				attr = {};
			}

			attr["x"] = points.x;
			attr["y"] = points.y;
			attr["width"] = points.w;
			attr["height"] = points.h;

			let elem: SVGElement = this._addChild("rect", attr, group);

			if (this._options.auto_resize) {
				this._updateExtrema(this._basicRectToExtrema(points));
			}

			return elem;
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
			if (!attr){
				attr = {};
			}

			// Set our appropriate attribute
			attr["cx"] = centerPt.x;
			attr["cy"] = centerPt.y;
			attr["r"] = radius;

			let elem: SVGElement = this._addChild("circle", attr, group);

			// Auto-resize if appropriate
			if (this._options.auto_resize) {
				this._updateExtrema(this._extremaFromCenterPointAndRadius(centerPt, radius));
			}

			// Add the child
			return elem;
		}

		//#endregion

		//#region ADD ARC
		/**...........................................................................
		 * addPerfectArc
		 * ...........................................................................
		 * Adds a perfect arc to the SVG canvas 
		 * ...........................................................................
		 */
		public addPerfectArc (centerPt: IPoint, radius: number, startDegree: number, endDegree: number, direction: number, noRadii: boolean, attr?: IAttributes, group?: SVGElement) {

			let padding: number = 0;	//TODO
			let angleDiff: number = (endDegree - startDegree);

			let adjust: number = this._style.strokeWidth * Math.sqrt(2);
			let adjustedPoint: IPoint = {
				x: centerPt.x + adjust,
				y: centerPt.y + adjust
			};

			let start: IPoint = this._calculatePolygonPoint(adjustedPoint, Trig.degreesToRadians(startDegree), radius);
			let end: IPoint = this._calculatePolygonPoint(adjustedPoint, Trig.degreesToRadians(endDegree), radius);

			if (!attr) { attr = {}; }
			let path: SVGElement = this.startPath(attr, group);

			this.moveTo(start);
			this.arcTo(end, {x: radius, y: radius}, 0, (angleDiff > 180)? 1: 0, direction);

			// auto-resize if appropriate
			if (this._options.auto_resize) {
				let extrema: IExtrema = this._arcToExtrema(start, end, centerPt, radius, startDegree, endDegree);
				this._updateExtrema(extrema);
			}

			// If we aren't showing the radius, quit now
			if (noRadii) {
				this.finishPathWithoutClosing();
				return path;
			}

			// Otherwise close the segment path
			this.lineTo(centerPt);
			this.closePath();

			return path;
		}

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
		public regularPolygon (centerPt: IPoint, sides: number, radius: number, attr?: IAttributes, group?: SVGElement) : SVGElement {

			// Generate the point list for the polygon
			let points: string;
			let curAngle: number = 0;
			let intAngle: number = Trig.calculatePolygonInternalAngle(sides);

			for (let i = 0; i < sides; i += 1) {
				let pt: IPoint = this._calculatePolygonPoint(centerPt, curAngle, radius);
				curAngle += intAngle;
				points += pt.x + "," + pt.y + " ";
			}

			// Set our attributes to include the points
			if (!attr) { attr = {}; }
			attr["points"] = points;

			let elem: SVGElement = this._addChild("polygon", attr, group);

			// Auto-resize if appropriate
			if (this._options.auto_resize) {
				this._updateExtrema(this._extremaFromCenterPointAndRadius(centerPt, radius));
			}

			return elem;
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
		public addRegularStar (centerPt: IPoint, numberOfPoints: number, radius: number, innerRadius: number, attr?: IAttributes, group?: SVGElement) : SVGElement {
			let curAngle: number = 0;
			let intAngle: number = (Trig.calculatePolygonInternalAngle(numberOfPoints) / 2);
			let points = "";
			for (let i = 0; i < numberOfPoints; i += 1) {
				let pt: IPoint;

				// Outer point
				pt = this._calculatePolygonPoint(centerPt, curAngle, radius);
				curAngle += intAngle;
				points += pt.x + "," + pt.y + " ";

				// Inner point
				pt = this._calculatePolygonPoint(centerPt, curAngle, innerRadius);
				curAngle += intAngle;
				points += pt.x + "," + pt.y + " ";
			}

			// Set the points value into our attributes
			if (!attr) { attr = {}; }
			attr["points"] = points;

			let elem: SVGElement = this._addChild("polygon", attr, group);

			// Auto-resize if appropriate
			if (this._options.auto_resize) {
				this._updateExtrema(this._extremaFromCenterPointAndRadius(centerPt, radius));
			}

			return elem;
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

			if (!attr) { attr = {}; }
			attr["x"] = point.x;
			attr["y"] = point.y;

			let textElem: SVGElement = this._addChild("text", attr, group);
			textElem.innerHTML = text;

			let box: IBasicRect;
			if (originPt) {
				box = this.measureElement(textElem);
				let newPt: IPoint = {
					x: box.w * originPt.x,
					y: (box.h * originPt.y) - box.h
				};

				textElem.setAttribute("x", newPt.x.toString());
				textElem.setAttribute("y", newPt.y.toString());

				box.x = newPt.x;
				box.y = newPt.y;
			}

			if (this._options.auto_resize) {
				if (!box) { this.measureElement(textElem); }
				this._updateExtrema({ min: {x: box.x, y: box.y}, max: {x: box.x + box.w, y: box.y + box.h} });
			}

			// Make sure we add the unselectable class
			addClass(textElem as any as HTMLElement, "unselectable");

			return textElem;
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
			return this._addChild("g", attr, group);
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
			let id: string = "gradient" + this.__gradients.length;
			let attr: IAttributes = {
				id: id
			}

			let gradient: SVGGradientElement;
			gradient = createSVGElem(SVGGradientTypeEnum[type] + "Gradient", attr) as SVGGradientElement;


			// Apply the points
			for (let point of points) {
				let ptElem: HTMLElement = createSVGElem("stop") as any as HTMLElement;
				ptElem.style.stopColor = point.color;
				ptElem.style.stopOpacity = point.opacity.toString();
				ptElem.setAttribute("offset", point.offset);
				gradient.appendChild(ptElem);
			}

			// Add to our element & our collection
			this._definitionsElement.appendChild(gradient);
			this.__gradients.push(gradient);

			// Add transform points (BROKEN?)
			if (transforms) {
				let tID: string = "gradient" + this.__gradients.length;
				let tGrad: SVGGradientElement = createSVGElem(type + "Gradient", {id: tID}) as SVGGradientElement;

				tGrad.setAttribute("x1", transforms.start.x.toString());
				tGrad.setAttribute("x2", transforms.end.x.toString());
				tGrad.setAttribute("y1", transforms.start.y.toString());
				tGrad.setAttribute("y2", transforms.end.y.toString());

				tGrad.setAttribute("xlink:href", "#" + id);

				this._definitionsElement.appendChild(tGrad);
				this.__gradients.push(tGrad);
				id = tID;
			}

			return id;
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
		private _addCheckShape (scale: number, attr?: IAttributes, group?: SVGElement): SVGElement {
			scale *= (1/4);
			let basePoints: IPoint[] = [
				{x: -0.15, y: 2.95},
				{x: 1, y: 4},
				{x: 1.25, y: 4},

				{x: 3, y: 0.25},
				{x: 2.4, y: 0},

				{x: 1, y: 3},
				{x: 0.3, y: 2.3}
			];

			let points: IPathPoint[] = this._convertPointsToPathPoints(basePoints, scale);

			return this.addPath(points, attr, group);
		}

		/**
		 * Adds an 'ex' to the canvas with the provided scale
		 */
		private _addExShape (scale: number, attr?: IAttributes, group?: SVGElement): SVGElement {
			scale *= (1/3.75);
			let basePoints: IPoint[] = [
				{x: 0.25, y: 0.6},
				{x: 1, y: 0},
				{x: 2, y: 1.1},
				{x: 3, y: 0},
				{x: 3.75, y: 0.6},

				{x: 2.66, y: 1.75},

				{x: 3.75, y: 2.9},
				{x: 3, y: 3.5},
				{x: 2, y: 2.5},
				{x: 1, y: 3.5},
				{x: 0.25, y: 2.9},

				{x: 1.33, y: 1.75}
			];

			let points: IPathPoint[] = this._convertPointsToPathPoints(basePoints, scale);

			return this.addPath(points, attr, group);
		}

		/**
		 * Adds a plus to the canvas with the provided scale
		 */
		private _addPlusShape (scale: number, attr?: IAttributes, group?: SVGElement): SVGElement {
			scale *= (1/5);

			let basePoints: IPoint[] = [
				{x: 2, y: 2},
				{x: 2, y: 0},
				{x: 3, y: 0},

				{x: 3, y: 2},
				{x: 5, y: 2},
				{x: 5, y: 3},

				{x: 3, y: 3},
				{x: 3, y: 5},
				{x: 2, y: 5},

				{x: 2, y: 3},
				{x: 0, y: 3},
				{x: 0, y: 2}
			];

			let points: IPathPoint[] = this._convertPointsToPathPoints(basePoints, scale);

			return this.addPath(points, attr, group);
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

				pathPoints.push({
					point: pt
				});
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

		/**...........................................................................
		 * _checkBasicRectForBadData
		 * ...........................................................................
		 * helper function to check that a rectangle is actually renderable 
		 * @param	rect	Determine if a rectangle is renderable
		 * ...........................................................................
		 */
		private _checkBasicRectForBadData (rect: IBasicRect) : void {
			let err: boolean = false;

			// check for null values first
			if (rect.x !== 0 && !rect.x) { err = true; }
			if (rect.y !== 0 && !rect.y) { err = true; }
			if (rect.w !== 0 && !rect.w) { err = true; }
			if (rect.h !== 0 && !rect.h) { err = true; }

			// Then for non-sensical
			if (rect.w < 0) { err = true; }
			if (rect.h < 0) { err = true; }

			if (err) {
				throw new Error("invalid basic rectangle values");
			}
		}

		/**...........................................................................
		 * _basicRectToExtrema
		 * ...........................................................................
		 * helper function to turn a basic rect to extrema 
		 * @param	rect	Rect to convert
		 * @returns	The extrema that correspond with the rect
		 * ...........................................................................
		 */
		private _basicRectToExtrema (rect: IBasicRect) : IExtrema {
			let extrema : IExtrema = {
				min: { x: rect.x, y: rect.y },
				max: {x: rect.x + rect.w, y: rect.y + rect.h}
			}
			return extrema;
		}

		/**...........................................................................
		 * _extremaFromCenterPointAndRadius
		 * ...........................................................................
		 * helper function to calculate extrema from a central point and radius 
		 * ...........................................................................
		 */
		private _extremaFromCenterPointAndRadius(center: IPoint, radius: number): IExtrema {
			let extrema: IExtrema = {
				max: { x: center.x + radius, y: center.y + radius},
				min:{ x: center.x - radius, y: center.y - radius}
			};
			return extrema;
		}

		/**...........................................................................
		 * _calculatePolygonPoint
		 * ...........................................................................
		 * helper function to calculate a polygon's point at a certain angle 
		 * ........................................................................... 
		 */
		private _calculatePolygonPoint (centerPt: IPoint, currentAngle: number, radius: number) : IPoint {
			let out: IPoint = {
				x: centerPt.x + roundToPlace(Math.sin(currentAngle) * radius, 10),
				y: centerPt.y + roundToPlace(-1 * Math.cos(currentAngle) * radius, 10)
			};

			return out;
		}

		/**...........................................................................
		 * _arcToExtrema
		 * ...........................................................................
		 * helper function to convert arc params to extrema 
		 * ...........................................................................
		 */
		private _arcToExtrema(startPt: IPoint, endPt: IPoint, centerPt: IPoint, radius: number, startDeg: number, endDeg: number) : IExtrema {

			let extrema: IExtrema = {
				max: {
					x: Math.max(startPt.x, endPt.x),
					y: Math.max(startPt.y, endPt.y)
				},
				min: {
					x: Math.min(startPt.x, endPt.x),
					y: Math.min(startPt.y, endPt.y)
				}
			};

			// O DEGREES : STRAIGHT UP
			if ( startDeg < 0 && endDeg > 0) {
				let maxY: number = centerPt.y - radius;
				if (maxY > extrema.max.y) { extrema.max.y = maxY; }
			}

			// 90 DEGREES : TO THE RIGHT
			if (startDeg < 90 && endDeg > 90) {
				let maxX: number = centerPt.x + radius;
				if (maxX > extrema.max.x) { extrema.max.x = maxX; }
			}

			// 180 DEGREES : STRAIGHT DOWN
			if (startDeg < 180 && endDeg > 180) {
				let minY: number = centerPt.y + radius;
				if (minY < extrema.min.y) { extrema.min.y = minY; }
			}

			// 270 DEGREES : TO THE LEFT
			if (startDeg < 270 && endDeg > 270) {
				let minX: number = centerPt.x - radius;
				if (minX < extrema.min.x) { extrema.min.x = minX; }
			}

			return extrema;
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