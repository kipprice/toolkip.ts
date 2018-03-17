///<reference path="svgElement.ts" />
namespace KIP.SVG {

	/**...........................................................................
     * @class   GroupElement
     * ...........................................................................
     * @version 1.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class GroupElement extends SVGElem {

        protected _setAttributes(attributes: ISVGAttributes): ISVGAttributes {
            attributes.type = "g";

            return attributes;
        }

        protected _updateExtrema(attributes: ISVGAttributes): void {}
    }
}