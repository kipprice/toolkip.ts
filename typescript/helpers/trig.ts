namespace KIP {

	//#region INTERFACES

	/**--------------------------------------------------------------------------
	 * @interface IPoint
	 * Defines a basic point in space
	 * --------------------------------------------------------------------------
	 */
	export interface IPoint {
		x: number; 	/** The x-coordinate of the point @type {number} */
		y: number; 	/** The y coordinate of the point @type {number} */
		z?: number;	/** The z-coordinate of the point, if available @type {number} */
	}

	/**--------------------------------------------------------------------------
	 * @interface IBasicRect
	 * Defines basic parameters for a rectangle
	 * --------------------------------------------------------------------------
	 */
	export interface IBasicRect {
		x: number; /** X-value of the rectangle @type {number} */
		y: number; /** Y-Value of the rectangle @type {number} */
		w: number; /** Width of the rectangle @type {number} */
		h: number; /** Height of the rectangle @type {number} */
	}

	/**...........................................................................
	 * @type IExtrema
	 * ...........................................................................
	 * Interface that stores a max point and a min point
	 * ...........................................................................
	 */
	export type IExtrema = IGenericExtrema<IPoint>;

	/**...........................................................................
	 * @class IGenericExtrema
	 * ...........................................................................
	 * Handle any type of extreema
	 * ...........................................................................
	 */
	export interface IGenericExtrema<T> {
		max: T,
		min: T
	};

	/**--------------------------------------------------------------------------
	 * @interface IVector
	 * Keeps track of a vector definition
	 * --------------------------------------------------------------------------
	 */
	export interface IVector {
		startPoint: IPoint;
		endPoint: IPoint;
		distance: number;
		angleInDegrees: number;
	}

	const DEBUG: boolean = true;
	//#endregion

	// Public namespace wrapper for this functionality
	export namespace Trig {

		//#region HELPER FUNCTIONS
		/**--------------------------------------------------------------------------
		 * debugPoint
		 * --------------------------------------------------------------------------
		 * Print the coordinates contained in a point
		 * 
		 * @param point 	the point to print for debugging
		 * --------------------------------------------------------------------------
		 */
		export function debugPoint(point: IPoint): void {
			if (!point.z) {
				console.log("2D POINT: (" + point.x + ", " + point.y + ")");
			} else {
				console.log("3D POINT: (" + point.x + ", " + point.y + ", " + point.z + ")");
			}
		}

		/**--------------------------------------------------------------------------
		 * degressToRadians
		 * --------------------------------------------------------------------------
		 * Convert degrees measure to the equivalent radians measure
		 * 
		 * @param 	deg 	The degree value to convert
		 * 
		 * @returns The approproate angle in radians
		 * --------------------------------------------------------------------------
		 */
		export function degreesToRadians(deg: number): number {
			let result: number = ((Math.PI * deg) / 180);
			return result;
		}

		/**--------------------------------------------------------------------------
		 * getEndPoint
		 * --------------------------------------------------------------------------
		 * Calculate where a particular vector will end, given the start point, distance, and angle
		 * 
		 * @param 	startPoint 	where the vector originates
		 * @param 	deg 		the degree of angle
		 * @param 	distance	how far the vector should extend
		 * --------------------------------------------------------------------------
		 */
		export function getEndPoint(startPoint: IPoint, deg: number, distance: number): IPoint {
			let rad: number = degreesToRadians(deg);
			let result: IPoint = {
				x: (Math.cos(rad) * distance) + startPoint.x,
				y: (Math.sin(rad) * distance) + startPoint.y
			};

			return result;
		}

		export function getCentralPoint(elem: HTMLElement): IPoint {
			return {
				x: elem.offsetLeft + (elem.offsetWidth / 2),
				y: elem.offsetTop + (elem.offsetWidth / 2)
			};
		}
		//#endregion

		//#region VISUAL CHANGES

		/**--------------------------------------------------------------------------
		 * arrangeRadially
		 * --------------------------------------------------------------------------
		 * Arrange a series of elements around a central element, making sure there is enough room for each element
		 * 
		 * @param 	centralELem 	the element to use as the center point
		 * @param 	fringeElems 	the elements to arrange around the central element
		 * @param 	minAngle 		the angle at which to start (in degrees)
		 * @param 	maxAngle 		the angle at which to stop (in degrees)
		 * --------------------------------------------------------------------------
		 */
		export function arrangeRadially(centralELem: HTMLElement, fringeElems: HTMLElement[], minAngle?: number, maxAngle?: number): void {

			// The calculation for this needs to be as follows:
			//		1. Each element gets an angle assigned
			// 		2. each element has its dimensions determined, then the distance of circle that would be neede to fit all X

			// set defaults for angles
			minAngle = minAngle || 0;
			maxAngle = maxAngle || 360;
			let availableAngle: number = maxAngle - minAngle;
			let deltaAngle: number = availableAngle / fringeElems.length;

			let maxDistance: number = 0;

			let centralPoint: IPoint = {
				x: centralELem.offsetWidth / 2,
				y: centralELem.offsetHeight / 2
			};

			let elem: HTMLElement;

			// First calculate the max distance we need to move elements away
			for (elem of fringeElems) {
				let elemRadius: number = Math.max(elem.offsetWidth, elem.offsetHeight);
				let centralAngle: number = availableAngle / fringeElems.length;
				let internalAngle: number = 180 - centralAngle;
				let appropriateDistance: number = (elemRadius * Math.sin(degreesToRadians(internalAngle))) / Math.sin(degreesToRadians(centralAngle));

				if (appropriateDistance > maxDistance) {
					maxDistance = appropriateDistance;
				}
			}

			if (DEBUG) {
				console.log("DISTANCE: " + maxDistance);
				console.log("CENTRAL POINT: " + "(" + centralPoint.x + ", " + centralPoint.y + ")");
			}

			// actually position the elements
			let i: number;
			for (i = 0; i < fringeElems.length; i += 1) {
				let pt: IPoint = getEndPoint(
					centralPoint,
					minAngle + (deltaAngle * i),
					maxDistance
				);

				console.log(pt);

				elem = fringeElems[i];
				elem.style.left = (pt.x - (elem.offsetWidth / 2)) + "px";
				elem.style.top = (pt.y - (elem.offsetHeight / 2)) + "px";
			}


		}
		/**--------------------------------------------------------------------------
		 * drawLine
		 * --------------------------------------------------------------------------
		 * Draws a line between two points
		 * 
		 * @param 	start       	The start point of the line
		 * @param 	end         	The end point of the line
		 * @param 	host        	The element to draw the line on
		 * @param 	lbl       		If included, what to label the line
		 * @param 	lblNoRotate 	If true, doesn't rotate the text to match the line angle
		 * 
		 * @returns The line that was drawn
		 * --------------------------------------------------------------------------
		 */
		export function drawLine(start: IPoint, end: IPoint, host: HTMLElement, lbl?: string, lblNoRotate?: boolean): HTMLElement {
			"use strict";
			let angle: number;
			let distance: number;
			let div: HTMLElement;
			let cls: IClassDefinition;
			let lblElem: HTMLElement;

			distance = getDistance(start, end);
			angle = getAngle(start, end);

			// Create a CSS class that can be overridden for general options
			cls = {
				"position": "absolute",
				"height": "1px",
				"transform-origin": "0px 0px"
			};
			createClass(".angledLine", cls);

			// Create the div and give it minimal styling to show the line
			div = createSimpleElement("", "angledLine");
			div.style.left = start.x + "px";
			div.style.top = start.y + "px";

			// Approriately assign the size of the element
			div.style.width = distance + "px";

			// Rotate to our specified degree
			div.style.transform = "rotate(" + angle + "deg)";

			// Add to the specified parent element
			host.appendChild(div);

			// If there is also a label, create that
			if (lbl) {
				lblElem = createSimpleElement("", "lbl", lbl);
				if (lblNoRotate) {
					lblElem.style.transform = "rotate(" + (-1 * angle) + "deg)";
					lblElem.style.transformOrigin = "(0, 0)";
				}
				div.appendChild(lblElem);
			}
			return div;
		};

		/**--------------------------------------------------------------------------
		 * connectElements
		 * --------------------------------------------------------------------------
		 * Draws a line between the two provided elements
		 *
		 * @param 	start_elem 	The element to start the line at
		 * @param 	end_elem   	The element to end the line at
		 *
		 * @return 	The line that gets drawn
		 * --------------------------------------------------------------------------
		 */
		export function connectElements(start_elem: HTMLElement, end_elem: HTMLElement, lbl?: string, lblNoRotate?: boolean): HTMLElement {
			"use strict";
			let start_point: IPoint;
			let end_point: IPoint;
			let x_1: number;
			let x_2: number;
			let y_1: number;
			let y_2: number;
			let parent: HTMLElement;

			// Set our parent to use when calculating the global offsets
			parent = findCommonParent(start_elem, end_elem);

			// Set the values to be the center of each element
			x_1 = globalOffsetLeft(start_elem, parent) + (start_elem.offsetWidth / 2);
			x_2 = globalOffsetLeft(end_elem, parent) + (end_elem.offsetWidth / 2);
			y_1 = globalOffsetTop(start_elem, parent) + (start_elem.offsetHeight / 2);
			y_2 = globalOffsetTop(end_elem, parent) + (end_elem.offsetHeight / 2);

			// Create the objects for these points
			start_point = { x: x_1, y: y_1 };
			end_point = { x: x_2, y: y_2 };

			return drawLine(start_point, end_point, parent, lbl, lblNoRotate);
		};

		//#endregion

		//#region CONVERSION FUNCTIONS

		/**--------------------------------------------------------------------------
		 * clientRectToShape
		 * --------------------------------------------------------------------------
		 * Converts a Client Rect to a basic shape
		 * 
		 * @param 	rect 	The rectangle to convert
		 * 
		 * @returns The array of points that make up this shape
		 * --------------------------------------------------------------------------
		 */
		export function clientRectToShape(rect: ClientRect): IPoint[] {
			let out: IPoint[];
			out = new Array<IPoint>();

			// Top-left corner
			out[0] = {
				x: rect.left,
				y: rect.top
			};

			// Top-right corner
			out[1] = {
				x: rect.left + rect.width,
				y: rect.top
			};

			// Bottom-right corner
			out[2] = {
				x: rect.left + rect.width,
				y: rect.top + rect.height
			};

			// Bottom-left corner
			out[3] = {
				x: rect.left,
				y: rect.top + rect.height
			};

			return out;
		}

		/**--------------------------------------------------------------------------
		 * svgRectToShape
		 * --------------------------------------------------------------------------
		 * Converts a SVG Rect to a basic shape
		 * 
		 * @param 	rect 	The rectangle to convert
		 * 
		 * @returns The array of points that make up this shape
		 * --------------------------------------------------------------------------
		 */
		export function svgRectToShape(rect: SVGRect): IPoint[] {
			let out: IPoint[];
			out = new Array<IPoint>();

			// Top-left corner
			out[0] = {
				x: rect.x,
				y: rect.y
			};

			// Top-right corner
			out[1] = {
				x: rect.x + rect.width,
				y: rect.y
			};

			// Bottom-right corner
			out[2] = {
				x: rect.x + rect.width,
				y: rect.y + rect.height
			};

			// Bottom-left corner
			out[3] = {
				x: rect.x,
				y: rect.y + rect.height
			};

			return out;
		}

		/**--------------------------------------------------------------------------
		 * svgRectToBasicRect
		 * --------------------------------------------------------------------------
		 * Convert a SVG rectangle to a basic rectangle
		 * 
		 * @param 	rect 	The rectangle to convert
		 * 
		 * @returns The resulting IBasicRect representation of the passed in rect
		 * --------------------------------------------------------------------------
		 */
		export function svgRectToBasicRect(rect: SVGRect): IBasicRect {
			let out: IBasicRect;

			out = {
				x: rect.x,
				y: rect.y,
				w: rect.width,
				h: rect.height
			};

			return out;
		};

		/**--------------------------------------------------------------------------
		 * clientRectToBasicRect
		 * --------------------------------------------------------------------------
		 * Convert a client rectangle to a basic rectangle
		 * 
		 * @param 	rect 	The rectangle to convert
		 * 
		 * @returns The resulting IBasicRect representation of the passed in rect
		 * --------------------------------------------------------------------------
		 */
		export function clientRectToBasicRect(rect: ClientRect): IBasicRect {
			let out: IBasicRect;

			out = {
				x: rect.left,
				y: rect.top,
				w: rect.width,
				h: rect.height
			};

			return out;
		}

		/**--------------------------------------------------------------------------
		 * toBasicRect
		 * --------------------------------------------------------------------------
		 * Converts any supported rectangle to a basic rectangle
		 * 
		 * @param 	rect 	The rectangle to convert
		 * 
		 * @returns The basic rect version of this client / svg rect
		 * -------------------------------------------------------------------------- 
		 */
		export function toBasicRect(rect: IBasicRect | ClientRect | SVGRect): IBasicRect {
			let r: IBasicRect;
			if (isIBasicRect(rect)) {
				r = rect;
			} else if (isClientRect(rect)) {
				r = clientRectToBasicRect(rect);
			} else if (isSVGRect(rect)) {
				r = svgRectToBasicRect(rect);
			}

			return r;
		};

		//#endregion

		//#region CALCULATION FUNCTIONS

		/**--------------------------------------------------------------------------
		 * getAngle
		 * --------------------------------------------------------------------------
		 * Finds the angle between two points
		 *
		 * @param {Object} start - The origin point of an angle
		 * @param {Number} start.x - The x position of the origin point
		 * @param {Number} start.y - The y position of the origin point
		 * @param {Object} end - The destination point of an angle
		 * @param {Number} end.x - The x position of the end point
		 * @param {Number} end.y - The y position of the end point
		 *
		 * @return {Number} The angle (in degrees) between the two points
		 * --------------------------------------------------------------------------
		 */
		export function getAngle(start: IPoint, end: IPoint): number {
			"use strict";
			let dx: number;
			let dy: number;
			let q_sign: number;
			let q_ang: number;
			let angle: number;

			dx = (end.x - start.x);
			dy = (end.y - start.y);

			// Don't divide by zero
			if (dx === 0) return (dy < 0) ? 270 : 90;

			// Handle horizontals too
			if (dy === 0) return (dx < 0) ? 180 : 0;

			// Atan requires that all elements are positive
			q_sign = ((dx * dy) > 0) ? 1 : -1;
			q_ang = (dx < 0) ? Math.PI : 0;


			angle = Math.atan(Math.abs(dy) / Math.abs(dx));
			angle = ((angle * q_sign) + q_ang);

			return (angle * (180 / Math.PI));
		};

		/**--------------------------------------------------------------------------
		 * getDistance
		 * --------------------------------------------------------------------------
		 * Finds the distance between the two provided points
		 *
		 * @param 	start 	The first endpoint of the segment we are measuring
		 * @param 	end 	The second enpoint of the segment we are measuring
		 *
		 * @return The distance between the two points
		 * --------------------------------------------------------------------------
		 */
		export function getDistance(start: IPoint, end: IPoint): number {
			"use strict";
			let distance: number;
			let dx: number;
			let dy: number;

			dx = (start.x - end.x);
			dy = (start.y - end.y);

			distance = Math.sqrt((dx * dx) + (dy * dy));
			return distance;
		};

		/**--------------------------------------------------------------------------
		 * calculatePolygonInternalAngle
		 * --------------------------------------------------------------------------
		 * calculate the internal angle for a given polygon
		 * 
		 * @param 	numberOfSides 	The number of sides that the polygon has
		 * 
		 * @returns the internal angle for this polygon, in radians
		 * --------------------------------------------------------------------------
		 */
		export function calculatePolygonInternalAngle(numberOfSides: number): number {
			return roundToPlace(degreesToRadians(360 / numberOfSides), 1000);
		}
		//#endregion

		//#region CONTAINMENT FUNCTIONS

		/**--------------------------------------------------------------------------
		 * isWithin
		 * --------------------------------------------------------------------------
		 * Checks whether a value is within a max/min range
		 * 
		 * @param 	val           	The value to check for inclusion
		 * @param 	min           	The max value
		 * @param 	max           	The min value
		 * @param 	non_inclusive 	True if we shouldn't include the end points
		 * 
		 * @returns True if the value is contained in the range
		 * --------------------------------------------------------------------------
		 */
		export function isWithin(val: number, min: number, max: number, non_inclusive?: boolean): boolean {
			"use strict";
			if (non_inclusive) return (val < max && val > min);
			return (val <= max && val >= min)
		}

		/**-------------------------------------------------------------------------
		 * isPointContained
		 * --------------------------------------------------------------------------
		 * Determines whether a point is contained within a particular rectangle
		 * 
		 * @param 	pt 		The point to check for containment	
		 * @param 	rect 	The rectangle to check
		 * 
		 * @returns True if the point is contained in the rectangle
		 ----------------------------------------------------------------------------*/
		export function isPointContained(pt: IPoint, rect: ClientRect | SVGRect | IBasicRect): boolean {
			"use strict";
			let r: IBasicRect = toBasicRect(rect);

			if (pt.x < r.x) { return false; }
			if (pt.x > (r.x + r.w)) { return false; }
			if (pt.y < r.y) { return false; }
			if (pt.y > r.y + r.h) { return false; }

			return true;
		}


		/**----------------------------------------------------------------------------
		 * isRectContained
		 * ----------------------------------------------------------------------------
		 * Checks whether a client rect is entirely contained within another
		 * 
		 * @param 	rect      	The element to check for containement
		 * @param 	container 	The element to check if the rect is contained within
		 * 
		 * @returns True if rect is completely contained by container
		 ------------------------------------------------------------------------------*/
		export function isRectContained(rect: IBasicRect | ClientRect | SVGRect, container: IBasicRect | ClientRect | SVGRect): boolean {
			let r: IBasicRect;
			let c: IBasicRect;

			// Convert the first rect to a basic rect
			r = toBasicRect(rect);

			// Convert the second rect to a basic rect
			c = toBasicRect(container);

			// Too far left
			if (r.x < c.x) return false;

			// Too far right
			if ((r.x + r.w) > (c.w + c.x)) return false;

			// Too far up
			if (r.y < c.y) return false;

			// Too far down
			if ((r.y + r.h) > (c.h + c.y)) return false;

			// Just right
			return true;
		}

		/**-----------------------------------------------------------------------------
		 * isElementContained
		 *------------------------------------------------------------------------------
		 * Checks if an element is completely contained by another element
		 * 
		 * @param 	elem      	The element to check for containment
		 * @param 	container 	The element to check if it contains the other elem
		 * 
		 * @returns True if the element is completely contained
		 -------------------------------------------------------------------------------
		 */
		export function isElementContained(elem: HTMLElement, container: HTMLElement): boolean {
			let rect: ClientRect = elem.getBoundingClientRect();
			let bounds: ClientRect = elem.getBoundingClientRect();

			return isRectContained(rect, bounds);
		};

		/**--------------------------------------------------------------------------
		 * isShapeContained
		 * --------------------------------------------------------------------------
		 * Checks if a given shape is contained within a given bounding box
		 * 
		 * @param 	shape 	The collection of points to check
		 * @param 	bounds 	The bounding box to be within
		 * 
		 * @returns True if the shape is completely contained in the bounding box
		 * --------------------------------------------------------------------------
		 */
		export function isShapeContained(shape: IPoint[], bounds: ClientRect | SVGRect): boolean {
			let pt: IPoint;
			for (pt of shape) {
				if (!isPointContained(pt, bounds)) { return false; }
			}
			return true;
		}
		//#endregion

		//#region OVERLAP FUNCTIONS

		/**--------------------------------------------------------------------------
		 * doElementsOverlap
		 * --------------------------------------------------------------------------
		 * Checks if two given elements overlap
		 * 
		 * @param 	elem1 	The first element to check
		 * @param 	elem2 	The second element to check
		 * 
		 * @returns True if the elements overlap, false otherwise
		 * --------------------------------------------------------------------------
		 */
		export function doElementsOverlap(elem1: HTMLElement, elem2: HTMLElement): boolean {
			"use strict";
			let rect1: ClientRect
			let rect2: ClientRect;

			rect1 = elem1.getBoundingClientRect();
			rect2 = elem2.getBoundingClientRect();

			return doRectsOverlap(rect1, rect2);
		};

		/**--------------------------------------------------------------------------
		 * doRectsOverlap
		 * --------------------------------------------------------------------------
		 * Checks if two rectangles overlap at all
		 * 
		 * @param 	rect1 	The first rectangle to check
		 * @param 	rect2 	The second rectangle to check
		 * 
		 * @returns True if there is any overlap between the rectangles
		 * --------------------------------------------------------------------------
		 */
		export function doRectsOverlap(rect1: IBasicRect | ClientRect | SVGRect, rect2: IBasicRect | ClientRect | SVGRect): boolean {
			let r1: IBasicRect = toBasicRect(rect1);
			let r2: IBasicRect = toBasicRect(rect2);

			return false;
		}

		/**--------------------------------------------------------------------------
		 * doBasicRectsOverlap
		 * --------------------------------------------------------------------------
		 * detect if two rectangles overlap 
		 * 
		 * @param 	rect1	the first rectangle to compare
		 * @param 	rect2	the second rectangle to compare
		 * 
		 * @returns true if the two rectangles do overlap
		 * --------------------------------------------------------------------------
		 */
		export function doBasicRectsOverlap(rect1: IBasicRect, rect2: IBasicRect): boolean {
			let x_overlap: boolean;
			let y_overlap: boolean;
			if (rect1.x >= rect2.x && rect1.x <= (rect2.w + rect2.x)) { x_overlap = true; }
			if (rect2.x >= rect1.x && rect2.x <= (rect1.w + rect1.x)) { x_overlap = true; }

			if (rect1.y >= rect2.y && rect1.y <= (rect2.h + rect2.y)) { y_overlap = true; }
			if (rect2.y >= rect1.y && rect2.y <= (rect1.h + rect1.y)) { y_overlap = true; }

			return (x_overlap && y_overlap);
		}
		//#endregion

		//#region INTERSECTION FUNCTIONS

		/**--------------------------------------------------------------------------
		 * findBasicRectIntersection
		 * --------------------------------------------------------------------------
		 * calculate the overlap section for 2 given basic rectangles 
		 * 
		 * @param rect1 - the first rectangle to check
		 * @param rect2 - the second rectangle to check
		 * 
		 * @returns The rectangle of overlap
		 * --------------------------------------------------------------------------
		 */
		export function findBasicRectIntersection(rect1: IBasicRect, rect2: IBasicRect): IBasicRect {
			let out: IBasicRect;

			let min_x = Math.max(rect1.x, rect2.x);
			let max_x = Math.min(rect1.x + rect1.w, rect2.x + rect2.w);

			let min_y = Math.max(rect1.y, rect2.y);
			let max_y = Math.min(rect1.y + rect1.h, rect2.y + rect2.h);

			out = {
				x: min_x,
				y: min_y,
				w: (max_x - min_x),
				h: (max_y - min_y)
			};

			return out;
		}

		//#endregion
	}


}
