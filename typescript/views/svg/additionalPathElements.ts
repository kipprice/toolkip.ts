///<reference path="svgElement.ts" />
///<reference path="pathElement.ts" />

namespace KIP.SVG {

	/**...........................................................................
	 * @class	PathExtensionElement
	 * ...........................................................................
	 * @version 1.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export abstract class PathExtensionElement extends PathElement {

		protected _setAttributes(attr: IPathSVGAttributes, ...addlArgs: any[]): IPathSVGAttributes {

			let pts = this._generatePoints.apply(this, addlArgs);
			return super._setAttributes(attr, pts);
		}

		protected abstract _generatePoints(...addlArgs: any[]): IPathPoint[];
	}

	/**...........................................................................
	 * @class	ArcElement
	 * ...........................................................................
	 * @version	1.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export class ArcElement extends PathExtensionElement {

		protected _generatePoints(attr: IPathSVGAttributes): IPathPoint[] {
			return [];
		}

		//#region ADD ARC
		/**...........................................................................
		 * addPerfectArc
		 * ...........................................................................
		 * Adds a perfect arc to the SVG canvas 
		 * //TODO: make real
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
			let path: SVGElement = this._startPath(attr);

			this.moveTo(start);
			this.arcTo({

				x: end.x,
				y: end.y, 
				largeArc: (angleDiff > 180)? 1: 0,
				radius:{x: radius, y: radius},
				sweepFlag: direction,
				xRotation: 0,
			});

			//TODO: doublecheck


			// // auto-resize if appropriate
			// if (this._options.auto_resize) {
			// 	let extrema: IExtrema = this._arcToExtrema(start, end, centerPt, radius, startDegree, endDegree);
			// 	this._updateExtrema(extrema);
			// }

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
	}

	/**...........................................................................
	 * @class	PolygonElement
	 * ...........................................................................
	 * @version	1.0
	 * @author	Kip Price
	 * ...........................................................................
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