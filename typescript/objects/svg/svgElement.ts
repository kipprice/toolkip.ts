namespace KIP.SVG {

    /**...........................................................................
     * ISVGElementElems
     * ...........................................................................
     * Keep track of elements on an SGVElem
     * ...........................................................................
     */
    export interface ISVGElementElems extends IDrawableElements {
        base: SVGElement;
    }

    /**...........................................................................
     * @class   SVGElem
     * ...........................................................................
     * Creates an element on an SVG Drawable
     * @version 1.1
     * @author  Kip Price
     * ...........................................................................
     */
    export abstract class SVGElem extends Drawable {
        
        //#region PROPERTIES
        protected _style: SVGStyle;
        public get style(): SVGStyle { return this._style; }

        protected _elems: ISVGElementElems;

        protected _preventScaling: boolean;
        public get preventScaling(): boolean { return this._preventScaling; }

        protected _extrema: IExtrema;
        public get extrema(): IExtrema { return this._extrema; }
        //#endregion

        /**...........................................................................
         * Creates an SVG element
         * @param   attributes  The attributes to create this element with
         * ...........................................................................
         */
        constructor(attributes: ISVGAttributes) {
            super();
            attributes = this._setAttributes(attributes);
            this._createElements(attributes);
        }

        protected _shouldSkipCreateElements(): boolean {
            return true;
        }

        /**
         * _createElements
         * 
         * Create the elements that make up this SVG Element
         * @param   attributes  Attributes for this element
         */
        protected _createElements (attributes: ISVGAttributes): void {

            if (!attributes) { 
                throw new Error("no attributes provided for SVG Element");
            }
        
            // determine the type of the SVG element
            let type: string = attributes.type;
            delete attributes.type; 

            // Throw an error if no data was provided
			if (type === "") {
				throw new Error("no SVG element type provided");
            }

            let elem: SVGElement = createSVGElem(type, attributes);
            this._elems = {} as any;
            this._elems.base = elem;

			// Add to the appropriate parent
			if (attributes.parent) {
                attributes.parent.appendChild(elem);
                delete attributes.parent;
			}

			// track that this element should be non-scaling
			this._preventScaling = attributes.unscalable;

        }

        protected abstract _setAttributes(attributes: ISVGAttributes): ISVGAttributes;
    }

    export class RectangleElement extends SVGElem {

        constructor(x: number, y: number, width: number, height: number, attributes: ISVGAttributes) {
            if (!attributes) { attributes = {}; }
            attributes.type = "rect";
            super(attributes);
        }

        protected _setAttributes

    }

    export class CircleElement extends SVGElem {

    }

    export class PathElement extends SVGElem {

    }

    export class GroupElement extends SVGElem {

    }
}