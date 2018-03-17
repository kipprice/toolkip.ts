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
	 * @class ISVGAttributes
	 * ...........................................................................
	 * Additional attributes that can be applied 
	 * ...........................................................................
	 */
	export interface ISVGAttributes extends IAttributes {
        id?: string;
		unscalable?: boolean;
        svgStyle?: ISVGStyle;
        parent?: SVGElement;
        type?: string;
		[key: string]: any;
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

        /** unique identifier for the element */
        public get id(): string { return this._attributes.id; }
        public set id(id: string) { this._attributes.id = id; }

        /** keep track of how this element is styled */
        protected _style: SVGStyle;
        public get style(): SVGStyle { return this._style; }

        /** keep track of the elements in this SVGElement */
        protected _elems: ISVGElementElems;

        public get base(): SVGElement { return this._elems.base; }

        /** determine whether this element should be scalable */
        protected _preventScaling: boolean;
        public get preventScaling(): boolean { return this._preventScaling; }

        /** keep track of the extrema for this element */
        protected _extrema: IExtrema;
        public get extrema(): IExtrema { return this._extrema; }

        /** store the attributes */
        protected _attributes: ISVGAttributes;
        //#endregion

        /**...........................................................................
         * Creates an SVG element
         * @param   attributes  The attributes to create this element with
         * ...........................................................................
         */
        constructor(attributes: ISVGAttributes, ...addlArgs: any[]) {
            super();
            // initialize the attributes if they weren't included
            if (!attributes) { attributes = {}; }

            // send all arguments to the _setAttributes function
            addlArgs.splice(0, 0, attributes);
            this._attributes = this._setAttributes.apply(this, addlArgs);

            // create the elements
            this._createElements(this._attributes);

            // handle updating the extreme points of this element
            this._updateExtrema(this._attributes);
        }

        /**...........................................................................
         * _shouldSkipCreateElements
         * ...........................................................................
         * Determine whether we should allow elements to be drawn as part of the
         * constructor.
         *  
         * @returns True, since we always need attributes
         * ...........................................................................
         */
        protected _shouldSkipCreateElements(): boolean {
            return true;
        }

        /**...........................................................................
         * _createElements
         * ...........................................................................
         * Create the elements that make up this SVG Element
         * 
         * @param   attributes  Attributes for this element
         * ...........................................................................
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

        /**...........................................................................
         * _setAttributes
         * ...........................................................................
         * Set the appropriate set of attributes for this element
         * 
         * @param   attributes  The initial attributes
         * @param   addlArgs    Anything additional we should be passing to the setAttributes function
         * 
         * @returns The updated attributes
         * ...........................................................................
         */
        protected abstract _setAttributes(attributes: ISVGAttributes, ...addlArgs: any[]): ISVGAttributes;

        protected abstract _updateExtrema(attributes: ISVGAttributes): void;
    }

    
    

    

    

    
    
}