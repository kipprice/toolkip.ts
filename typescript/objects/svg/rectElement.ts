///<reference path="svgElement.ts" />
namespace KIP.SVG {
	/**...........................................................................
	 * @class IRectSVGAttributes
	 * ...........................................................................
	 * Rectangle attributes
	 * ...........................................................................
	 */
	export interface IRectSVGAttributes extends ISVGAttributes {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    }
    
    /**...........................................................................
     * @class   RectangleElement
     * ...........................................................................
     * Draw a rectangle on the SVG element
     * @version 1.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class RectangleElement extends SVGElem {

        protected _attributes: IRectSVGAttributes;

        /**...........................................................................
         * Create a rectangle element
         * @param   x           The horizontal position of the rectangle
         * @param   y           The vertical position of the rectangle
         * @param   width       The width of the rectangle
         * @param   height      The height of the rectangle
         * @param   attributes  Attributes to start with
         * ...........................................................................
         */
        constructor(x: number, y: number, width: number, height: number, attributes: IRectSVGAttributes) {
            super(attributes, x, y, width, height);
        }

        /**...........................................................................
         * _setAttributes
         * ...........................................................................
         * Set the appropriate attributes for this element
         * 
         * @param   attributes  Initial set of attributes
         * @param   x           The horizontal coordinate
         * @param   y           The vertical coordinate
         * @param   width       The width of the rectangle
         * @param   height      The height of the rectangle
         * 
         * @returns The updated attributes 
         * ...........................................................................
         */
        protected _setAttributes(attributes: IRectSVGAttributes, x: number, y: number, width: number, height: number ): IRectSVGAttributes {
            attributes.type = "rect";

            attributes.x = x;
            attributes.y = y;
            attributes.width = width;
            attributes.height = height;

            return attributes;
        }

        protected _updateExtrema(attributes: IRectSVGAttributes): void {
            let rect: IBasicRect = {
                x: attributes.x,
                y: attributes.y,
                w: attributes.width,
                h: attributes.height
            };

            this._extrema = this._basicRectToExtrema(rect);
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

    }

}