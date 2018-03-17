///<reference path="svgElement.ts" />
namespace KIP.SVG {

    function _isCurvePoint(pt: IPathPoint): pt is ICurvePoint {
        return (!!(pt as ICurvePoint).controls);
    }

    function _isArcPoint(pt: IPathPoint): pt is IArcPoint {
        return !isNullOrUndefined((pt as IArcPoint).radius);
    }

    export interface ICurvePoint extends IPoint{
		controls: IPoint[];
    }
    
    export interface IArcPoint extends IPoint {
        radius: IPoint;
		xRotation: number;
		largeArc: number;
		sweepFlag: number;
    }

    export type IPathPoint = IPoint | ICurvePoint | IArcPoint;

	export enum SVGShapeEnum {
		CHECKMARK = 1,
		X = 2,
		PLUS = 3
    }

    export interface IPathSVGAttributes extends ISVGAttributes {
        noFinish?: boolean;
    }

    export interface IPathElems extends ISVGElementElems {
        base: SVGPathElement;
    }
    
	/**...........................................................................
     * @class   PathElement
     * ...........................................................................
     * @version 1.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class PathElement extends SVGElem {

        //#region PROPERTIES

        /** keep track of elements in this path */
        protected _elems: IPathElems;

        /** keep track of points in this path */
        protected _points: IPathPoint[];

        //#endregion

        constructor(points: IPathPoint[], attr: IPathSVGAttributes, ...addlArgs: any[]) {
            addlArgs.splice(0, 0, points);
            super(attr, addlArgs);
        }

        protected _setAttributes(attributes: ISVGAttributes, points: IPathPoint[]): ISVGAttributes {
            this._points = points || [];
            return attributes;
        }

        protected _createElements(): void {
            let path: SVGPathElement = this._startPath(this._attributes);

            let firstPt: boolean = true;
            let points: IPathPoint[] = this._points;

			for (let pathPt of points) {

				if (firstPt) {
					this.moveTo(pathPt);
					firstPt = false;
				}

				else if (_isCurvePoint(pathPt)) {
					this.curveTo(pathPt);
				}

				else if (_isArcPoint(pathPt)) {
					this.arcTo(pathPt);
				}

				else {
					this.lineTo(pathPt);
				}

			}

			if (!this._attributes.noFinish) { this.closePath(); }
			else { this.finishPathWithoutClosing(); }
        }

        //#region HANDLE EXTREMA
        protected _updateExtrema(): void {
            this._extrema = {
                max: null,
                min: null
            };

            for (let pathPt of this._points) {
                this._updateExtremaFromPoint(pathPt);
            }
        }

        private _updateExtremaFromPoint(pt: IPoint): void {

            // handle the base case
            if (!this._extrema.max || !this._extrema.min) {
                this._extrema.max = pt;
                this._extrema.min = pt;
                return;
            }

            // if we're more extreme than the extrema, update
            if (pt.x < this._extrema.min.x) { this._extrema.min.x = pt.x; }
            if (pt.y < this._extrema.min.y) { this._extrema.min.y = pt.y; }

            if (pt.x > this._extrema.max.x) { this._extrema.max.x = pt.x; }
            if (pt.y > this._extrema.max.y) { this._extrema.max.y = pt.y; }
        }
        //#endregion

        /**...........................................................................
		 * _checkForCurrentPath
		 * ...........................................................................
		 * 
		 * ...........................................................................
		 */
		private _checkForCurrentPath () : void {
			if (!this._elems.base) {
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
            
			let d: string = this._elems.base.getAttribute("d");
            d += suffix;
            
			this._elems.base.setAttribute("d", d);
			return true;
		}

		protected _startPath (attr?: ISVGAttributes) : SVGPathElement {
			super._createElements(this._attributes);
			return this._elems.base;
		}

		public lineTo (point: IPoint) : void {
			this._checkForCurrentPath();
			this._addToPathAttribute(this._constructPathAttribute("L", point));
		}

		public moveTo (point: IPoint) : void {
			this._checkForCurrentPath();
			this._addToPathAttribute(this._constructPathAttribute("M", point));
		}

		public curveTo (point: ICurvePoint) : void {
			this._checkForCurrentPath();
			let d: string;
			d = "C" + this._pointToAttributeString(point.controls[0]) + ", ";
			d += this._pointToAttributeString(point.controls[1]) + ", ";
			d += this._pointToAttributeString(point) + "\n";
			this._addToPathAttribute(d);
		}

		public arcTo (point: IArcPoint) {
			let d: string;
			d = "A" + this._pointToAttributeString(point.radius) + " ";
			d += point.xRotation + " " + point.largeArc + " " + point.sweepFlag + " ";
			d += this._pointToAttributeString(point) + "\n";
			this._addToPathAttribute(d);
		}

		/** closes the path so it creates an enclosed space */
		public closePath () : void {
			this._addToPathAttribute(" Z");
			this.finishPathWithoutClosing();
		}

		/** indicates the path is finished without closing the path */
		public finishPathWithoutClosing () : void {
		}

		/**...........................................................................
		 * _calculatePolygonPoint
		 * ...........................................................................
		 * helper function to calculate a polygon's point at a certain angle 
		 * ........................................................................... 
		 */
		protected _calculatePolygonPoint (centerPt: IPoint, currentAngle: number, radius: number) : IPoint {
			
			let out: IPoint = {
				x: centerPt.x + roundToPlace(Math.sin(currentAngle) * radius, 10),
				y: centerPt.y + roundToPlace(-1 * Math.cos(currentAngle) * radius, 10)
			};

			return out;
		}

	}
	
	

}