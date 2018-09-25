///<reference path="svgElement.ts" />
///<reference path="pathElement.ts" />

namespace KIP.SVG {

	/**----------------------------------------------------------------------------
	 * @class	PathExtensionElement
	 * ----------------------------------------------------------------------------
	 * @author	Kip Price
	 * @version 1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export abstract class PathExtensionElement extends PathElement {

		/**
		 * _setAttributes
		 * ----------------------------------------------------------------------------
		 * Add a hook to allow child elements to generate their own set of points
		 * @param 	attr 		Attributes for the SVG element
		 * @param 	addlArgs 	Anything else this particular path cares about
		 */
		protected _setAttributes(attr: IPathSVGAttributes, ...addlArgs: any[]): IPathSVGAttributes {

			let pts = this._generatePoints.apply(this, addlArgs);
			return super._setAttributes(attr, pts);
		}

		/**
		 * _generatePoints [ABSTRACT]
		 * ----------------------------------------------------------------------------
		 * Overridable function for implementations to create the appropriate set of 
		 * points for its particular needs
		 * 
		 * @param	addlArgs	Any additional elements needed by this class
		 * 
		 * @returns	The points to render for this path
		 */
		protected abstract _generatePoints(...addlArgs: any[]): IPathPoint[];
	}

	/**----------------------------------------------------------------------------
	 * @class	ArcElement
	 * ----------------------------------------------------------------------------
	 * Create an arc to render on an SVG canvas
	 * @author	Kip Price
	 * @version	2.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class ArcElement extends PathExtensionElement {

		/**
		 * ArcElement
		 * ----------------------------------------------------------------------------
		 * @param centerPt 
		 * @param radius 
		 * @param startDegree 
		 * @param endDegree 
		 * @param direction 
		 * @param attr 
		 */
		constructor(centerPt: IPoint, radius: number, startDegree: number, endDegree: number, direction: number, attr?: IAttributes) {
			super(null, attr, centerPt, radius, startDegree, endDegree, direction);
		}

		/**
		 * _generatePoints
		 * ----------------------------------------------------------------------------
		 * Generate points for this particular arc
		 * @param 	centerPt 
		 * @param 	radius 
		 * @param 	startDegree 
		 * @param 	endDegree 
		 * @param 	direction 
		 * @param 	noRadii 
		 * 
		 * @returns	The created set of points for the arc
		 */
		protected _generatePoints(centerPt: IPoint, radius: number, startDegree: number, endDegree: number, direction: number): IPathPoint[] {

			// generate some values that we'll need later
			let adjustedPoint = this._getAdjustedPoint(centerPt);
			let angleDiff: number = (endDegree - startDegree);

			// start point is nice and simple: grab the point on the circle where we should be rendering
			let start: IPoint = this._calculatePolygonPoint(adjustedPoint, Trig.degreesToRadians(startDegree), radius);

			// end point is trickier; this needs to account for the arc attributes
			let end: IPoint = this._calculatePolygonPoint(adjustedPoint, Trig.degreesToRadians(endDegree), radius);
			let endArc: IArcPoint = {
				x: end.x,
				y: end.y, 
				largeArc: (angleDiff > 180)? 1 : 0,
				radius: {x: radius, y: radius},
				sweepFlag: direction,
				xRotation: 0
			};

			// return the points on the arc
			let out: IPathPoint[] = [
				start, 
				endArc
			];

			// add the center point if we are a slice of a pie
			if (this._shouldShowRadii()) { out.push(centerPt); }

			return out;
		}

		/**
		 * _getAdjustedPoint
		 * ----------------------------------------------------------------------------
		 * Adjust the center point by a stroke offset so we render correctly
		 * @param 	centerPt 	The central point of the arc
		 * 
		 * @returns	The adjusted point
		 */
		protected _getAdjustedPoint(centerPt: IPoint): IPoint {

			// adjust by the width of the stroke
			let adjust: number = this._style.strokeWidth * Math.sqrt(2) || 0;
			let adjustedPoint: IPoint = {
				x: centerPt.x + adjust,
				y: centerPt.y + adjust
			};
			return adjustedPoint
		}

		/**
		 * _shouldShowRadii
		 * ----------------------------------------------------------------------------
		 * True if this should be rendered as a pie wedge, false otherwise
		 * @returns	False
		 */
		protected _shouldShowRadii(): boolean { return false; }

	}

	/**----------------------------------------------------------------------------
	 * @class	PieSliceElement
	 * ----------------------------------------------------------------------------
	 * Create a slice of a pie
	 * @author	Kip Price
	 * @version 1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class PieSliceElement extends ArcElement {

		/**
		 * _shouldShowRadii
		 * ----------------------------------------------------------------------------
		 * True if this should be rendered as a pie wedge, false otherwise
		 * @returns	True
		 */
		protected _shouldShowRadii(): boolean { return true; }
	}

	/**----------------------------------------------------------------------------
	 * @class	CurveElement
	 * ----------------------------------------------------------------------------
	 * Render a curve as an SVG element
	 * @author	Kip Price
	 * @version 1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class CurveElement extends PathExtensionElement {

		protected _generatePoints(): IPathPoint[] {
			return [];
		}
	}

	/**----------------------------------------------------------------------------
	 * @class	PolygonElement
	 * ----------------------------------------------------------------------------
	 * @author	Kip Price
	 * @version	1.0
	 * ----------------------------------------------------------------------------
	 */
	export class PolygonElement extends PathExtensionElement {

		constructor(centerPt: IPoint, sides: number, radius: number, attr: IPathSVGAttributes, innerRadius?: number) {
			super(null, attr, centerPt, sides, radius, innerRadius);
		}

		protected _generatePoints(centerPt: IPoint, sides: number, radius: number, innerRadius?: number): IPathPoint[] {

			// Generate the point list for the polygon
			let points: IPathPoint[] = [];
			let curAngle: number = 0;
			let intAngle: number = Trig.calculatePolygonInternalAngle(sides);

			for (let i = 0; i < sides; i += 1) {
				let pt: IPoint = this._calculatePolygonPoint(centerPt, curAngle, radius);
				curAngle += intAngle;
				points.push(pt);
			}

			return points;
		}

		

	}

	/**...........................................................................
	 * @class	StarElement
	 * ...........................................................................
	 * @version 1.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
    export class StarElement extends PolygonElement {

		constructor(centerPt: IPoint, numberOfPoints: number, radius: number, innerRadius: number, attr: IPathSVGAttributes) {
			super(centerPt, numberOfPoints, radius, attr, innerRadius);
		}

		protected _generatePoints(centerPt: IPoint, numberOfPoints: number, radius: number, innerRadius: number): IPathPoint[] {
			let curAngle: number = 0;
			let intAngle: number = (Trig.calculatePolygonInternalAngle(numberOfPoints) / 2);

			let points: IPathPoint[] = [];

			for (let i = 0; i < numberOfPoints; i += 1) {
				let pt: IPoint;

				// Outer point
				pt = this._calculatePolygonPoint(centerPt, curAngle, radius);
				curAngle += intAngle;
				points.push(pt);

				// Inner point
				pt = this._calculatePolygonPoint(centerPt, curAngle, innerRadius);
				curAngle += intAngle;
				points.push(pt);
			}

			return points;
		}
	}

	/**...........................................................................
	 * @class	CheckElement
	 * ...........................................................................
	 */
    export class CheckElement extends PathExtensionElement {
		protected _generatePoints(centerPt: IPoint): IPathPoint[] {
			let pts: IPathPoint[] = [
				{x: -0.15, y: 2.95},
				{x: 1, y: 4},
				{x: 1.25, y: 4},

				{x: 3, y: 0.25},
				{x: 2.4, y: 0},

				{x: 1, y: 3},
				{x: 0.3, y: 2.3}
			];

			for (let pt of pts) {
				pt.x += centerPt.x;
				pt.y += centerPt.y;
			}

			return pts;
		}
	}

	/**...........................................................................
	 * @class	ExElement
	 * ...........................................................................
	 */
    export class ExElement extends PathExtensionElement {
		protected _generatePoints(centerPt: IPoint): IPathPoint[] {
			let pts: IPathPoint[] = [
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

			for (let pt of pts) {
				pt.x += centerPt.x;
				pt.y += centerPt.y;
			}

			return pts;
		}
	}

	/**...........................................................................
	 * @class	PlusElement
	 * ...........................................................................
	 */
    export class PlusElement extends PathExtensionElement {
		protected _generatePoints(centerPt: IPoint): IPathPoint[] {
			let pts: IPathPoint[] = [
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

			for (let pt of pts) {
				pt.x += centerPt.x;
				pt.y += centerPt.y;
			}

			return pts;
		}
	}
}