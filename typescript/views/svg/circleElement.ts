///<reference path="svgElement.ts" />
namespace KIP.SVG {

    export interface ICircleSVGAttributes extends ISVGAttributes {
        cx: number;
        cy: number;
        r: number;
    }

	/**...........................................................................
     * @class   CircleElement
     * ...........................................................................
     * @version 1.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class CircleElement extends SVGElem {

        /** keep track of attributes for this circle */
        protected _attributes: ICircleSVGAttributes;

        
        constructor(center: IPoint, radius: number, attributes: ISVGAttributes) {
            super(attributes, center, radius);
        }

        protected _setAttributes(attributes: ISVGAttributes, center: IPoint, radius: number): ISVGAttributes {
            attributes.type = "circle";
            attributes.cx = center.x;
            attributes.cy = center.y;
            attributes.r = radius;

            return attributes;
        }

        protected _updateExtrema(attributes: ISVGAttributes): void {
            this._extrema = this._extremaFromCenterPointAndRadius(
                {x: attributes.cx, y: attributes.cy},
                attributes.r
            );
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
    }
}