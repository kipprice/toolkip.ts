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

        //#region DELEGEATES

        /** keep track of the last listener ID used */
        protected _lastListenerId: number = 0;

        /** generate the next listener ID */
        protected get _nextListenerId(): string {
            this._lastListenerId += 1;
            return this._lastListenerId.toString();
        }

        /** keep track of listeners */
        protected _onUpdateListeners: Collection<SVGUpdateListener>;

        /** add a new listener */
        public addUpdateListener(listener: SVGUpdateListener, id?: string): void {
            if (!this._onUpdateListeners) {
                this._onUpdateListeners = new Collection<SVGUpdateListener>();
            }

            if (!id) {
                id = this._nextListenerId;
            }

            this._onUpdateListeners.addElement(id, listener);
        }

        /** notify listeners of a change */
        protected _notifyUpdateListeners(): void {
            window.setTimeout(() => {
                if (!this._onUpdateListeners) { return; }
                if (!this.extrema) { return; }
                this.scale(1);
                this._onUpdateListeners.map((value: SVGUpdateListener) => {
                    if (!value) { return; }
                    value();
                });
            }, 0);
        }
        //#endregion

        
        //#region PROPERTIES

        /** unique identifier for the element */
        public get id(): string { return this._attributes.id; }
        public set id(id: string) { this._attributes.id = id; }

        /** keep track of how this element is styled */
        protected _style: SVGStyle;
        public get style(): SVGStyle { 
            window.setTimeout(() => { 
                this._style.assignStyle(this._elems.base);
            }, 0); 
            
            return this._style; 
        }

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

            // initialize the style
            this._style = new SVGStyle();

            // send all arguments to the _setAttributes function
            addlArgs.splice(0, 0, attributes);
            this._attributes = this._setAttributes.apply(this, addlArgs);

            // create the elements
            this._createElements(this._attributes);

            // handle updating the extreme points of this element
            this._updateExtremaAndNotifyListeners(this._attributes);
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

            // if a class was provided, use it
            let cls: string = attributes.cls || "";
            delete attributes.cls;

            // Throw an error if no data was provided
			if (type === "") {
				throw new Error("no SVG element type provided");
            }

            let parent: SVGElement = attributes.parent;
            delete attributes.parent;

            // TODO: take full advantage of the create method
            let elem: SVGElement = createSVGElem({ type: type, attr: attributes });
            if (cls) {addClass(elem,cls);}
            this._elems = {} as any;
            this._elems.base = elem;

			// Add to the appropriate parent
			if (parent) {
                parent.appendChild(elem);
			}

			// track that this element should be non-scaling
			this._preventScaling = attributes.unscalable;

        }

        /**...........................................................................
		 * measureElement
		 * ...........................................................................
		 * Measures an element in the SVG canvas
		 * @param   element 	The element to measure
		 * @returns The dimensions of the element, in SVG coordinates
		 * ...........................................................................
		 */
		public measureElement () : IBasicRect {

			let box: SVGRect;
            let addedParent: boolean;
            
            //TODO: determine if we need to be smarter about this

			// Add our base element to the view if it doesn't have anything
			// if (!this.base.parentNode) {
			// 	document.body.appendChild(this.base);
			// 	addedParent = true;
			// }

			// Get the bounding box for element
			box = (this._elems.base as any).getBBox();

			// If we had to add the base element to the document, remove it
			// if (addedParent) {
			// 	document.body.removeChild(this.base);
			// }

			// Build our return rectangle
			let rect: IBasicRect = {
				x: box.x,
				y: box.y,
				w: box.width,
				h: box.height
			};

			return rect;

        }
        
        protected _updateExtremaAndNotifyListeners(attributes: ISVGAttributes): void {
            this._updateExtrema(attributes);
            this._notifyUpdateListeners();
        } 

        public addEventListener(event: keyof WindowEventMap, listener: EventListenerObject): void {
            this._elems.base.addEventListener(event, listener);
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

        public scale(scaleAmt: number): void {
            let box = this.measureElement();
            this.style.transform = format(
                "translate({0},{1}) scale({2}) translate(-{0},-{1})",
                box.x + (box.w / 2),
                box.y + (box.h / 2),
                scaleAmt
            );
        }
    }

    
    

    

    

    
    
}