namespace KIP {
    export interface ITooltipElements extends IDrawableElements {
        base: HTMLElement;
    }

    const TOOLTIP_MARGIN: number = 2;

    /**----------------------------------------------------------------------------
     * @class   Tooltip
     * ----------------------------------------------------------------------------
     * Render a dynamic HTML version of a tooltip for an element
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class Tooltip extends Drawable {

        //.....................
        //#region PROPERTIES

        /** the source element associated with this tooltip */
        protected _sourceElement: HTMLElement;
        public set sourceElement (elem: HTMLElement) { 
            this._sourceElement = elem;
            this._addEventListeners();
            window.setTimeout(() => {
                this._positionAppropriately();
            }, 100);
        }

        /** internal tracker for the timeout event that will hide the tooltip */
        protected _hideTimeout: number;

        /** associated elements with this tooltip */
        protected _elems: ITooltipElements;

        /** positioning of the tooltip */
        protected _tooltipRect: IBasicRect;

        /** positioning of source element */
        protected _sourceRect: IBasicRect;

        /** optional offset for the tooltip */
        protected _offset: IPoint;
        //#endregion
        //.....................

        //...............
        //#region STYLES
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".tooltip": {
                position: "absolute",
                left: "0",
                top: "0",
                maxWidth: "300px",
                padding: "3px",
                boxSizing: "border-box",
                boxShadow: "1px 1px 4px 2px rgba(0,0,0,.2)",
                opacity: "1",
                transition: "all 0.1s ease-in-out",
                backgroundColor: "#FFF",
                borderRadius: "3px",
                fontSize: "0.8em",
                lineHeight: "120%",

                nested: {
                    "&.hidden": {
                        opacity: "0"
                    }
                }
            },

            ".tooltipSource": {
                cursor: "pointer"
            }

        }
        //#endregion
        //...............

        //.................................
        //#region INITIALIZE THE TOOLTIP

        /**
         * Tooltip
         * ----------------------------------------------------------------------------
         * Creates an HTML tooltip to show for a particular source element
         * @param   template        The template to use to create the tooltip
         * @param   sourceElem      The element to attach this tooltip to
         * @param   offset          Any offset that should be applied to this tooltip
         */
        constructor (template?: IElemDefinition, sourceElem?: HTMLElement, offset?: IPoint) {

            // create the elements
            if (!template) { template = {}; }
            template.cls = "tooltip hidden" + (template.cls? " " + template.cls : "");
            super(template);

            // assign the offset point
            this._offset = offset || {x: 0, y: 0};

            // handle the source element (which also assigns listeners and positioning)
            this.sourceElement = sourceElem;
        }

        /**
         * _addEventListeners
         * ----------------------------------------------------------------------------
         * Listen to mouse events about the source element in order to show the 
         * tooltip associated with it
         */
        protected _addEventListeners() {
            if (!this._sourceElement) { return; }

            // add listeners to the source elements
            this._sourceElement.addEventListener("mouseover", () => {
                if (!isNullOrUndefined(this._hideTimeout)) {
                    window.clearTimeout(this._hideTimeout);
                }
                this._positionAppropriately();
                window.setTimeout(() => {this.draw(document.body); }, 100);
            });

            this._sourceElement.addEventListener("mouseout", (event: MouseEvent) => {
                if (event.target === this._elems.base) { return; }
                this._hideTimeout = window.setTimeout(() => { this.erase(); }, 100);
            });

            // add listeners to the tooltip itself
            this._elems.base.addEventListener("mouseover", () => {
                if (!isNullOrUndefined(this._hideTimeout)) {
                    window.clearTimeout(this._hideTimeout);
                }
            });

            this._elems.base.addEventListener("mouseout", () => {
                if (event.target === this._sourceElement) { return; }
                this._hideTimeout = window.setTimeout(() => { this.erase(); }, 100);
            });

            addClass(this._sourceElement, "tooltipSource");

            window.addEventListener("resize", () => { this._positionAppropriately(); })
        }

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * (Does nothing by default)
         */
        protected _createElements(): void {
            // Nothing to do here because we use the template in the constructor
        }

        //#endregion
        //.................................

        //..............................
        //#region POSITION THE TOOLTIP

        /**
         * _positionAppropriately
         * ----------------------------------------------------------------------------
         * Move the tooltip to the appropriate position for its source element
         */
        protected _positionAppropriately(): void {
            if (!this._sourceElement) { return; }

            // measure the elements we care about
            this._tooltipRect = Trig.clientRectToBasicRect(measureElement(this._elems.base));
            this._sourceRect = Trig.clientRectToBasicRect(measureElement(this._sourceElement));

            // loop through possible positions
            let foundSuccessfulPosition: boolean;
            for (let i = TooltipPositionType.TOP; i <= TooltipPositionType.RIGHT; i += 1) {
                foundSuccessfulPosition = this._assignPosition(i);
                if (foundSuccessfulPosition) { break; }
            }

            // reset our rects
            this._tooltipRect = null;
            this._sourceRect = null;
        }

        /**
         * _assignPosition
         * ----------------------------------------------------------------------------
         * Try to assign a position for the tooltip
         * @param   position    The position to try
         * 
         * @returns True if the tooltip fits at the current position 
         */
        protected _assignPosition(position: TooltipPositionType): boolean {
           let foundSuccessfulPosition: boolean = false;

           let rect: IBasicRect = {
               x: this._setXPosition(position),
               y: this._setYPosition(position),
               w: this._tooltipRect.w,
               h: this._tooltipRect.h
           };

           // if we couldn't find onscreen positions, we need to try the next config
           if ((rect.x === -1) || (rect.y === -1)) { return false; }

           // otherwise, we can assign positions based on this rect
           this._elems.base.style.left = rect.x + "px";
           this._elems.base.style.top = rect.y + "px";
           return true;
        }

        /**
         * _setYPosition
         * ----------------------------------------------------------------------------
         * Finds the appropriate Y position for an element given the current placement
         * @param   position    The current placement of the tooltip
         * 
         * @returns The y position associated with this placement 
         */
        protected _setYPosition(position: TooltipPositionType): number {
            switch (position) {
                case TooltipPositionType.TOP:
                    return (this._sourceRect.y - this._tooltipRect.h - TOOLTIP_MARGIN + this._offset.y);

                case TooltipPositionType.BOTTOM:
                    return (this._sourceRect.y + this._sourceRect.h + TOOLTIP_MARGIN + this._offset.y);

                case TooltipPositionType.LEFT:
                case TooltipPositionType.RIGHT:
                    return this._normalizeY(this._sourceRect.y, this._tooltipRect.h);
            }
            return -1;
        }

        /**
         * _setXPosition
         * ----------------------------------------------------------------------------
         * Finds the appropriate X position for an element given the current placement
         * @param   position    The current placement of the tooltip
         * 
         * @returns The x position associated with this placement 
         */
        protected _setXPosition(position: TooltipPositionType): number {
            switch (position) {
                case TooltipPositionType.TOP:
                case TooltipPositionType.BOTTOM:
                    return this._normalizeX(this._sourceRect.x, this._tooltipRect.w);

                case TooltipPositionType.LEFT:
                    return (this._sourceRect.x - this._tooltipRect.w - TOOLTIP_MARGIN + this._offset.x);

                case TooltipPositionType.RIGHT:
                    return (this._sourceRect.x + this._sourceRect.w + TOOLTIP_MARGIN + this._offset.x);
            }
            return -1;
        }

        protected _normalizeX(x: number, width: number): number {
            return this._normalize(x + this._offset.x, width, 0, window.innerWidth);
        }

        protected _normalizeY(y: number, height: number): number {
            return this._normalize(y + this._offset.y, height, 0, window.innerHeight);
        }

        /**
         * _normalize
         * ----------------------------------------------------------------------------
         * Normalize the partiuclar position to be within the screen
         * @param   pos     The position to normalize
         * @param   dim     The dimension to compare against
         * @param   min     The minimum value that is still on screen
         * @param   max     The maximum value that is still on screen
         * 
         * @returns The normalized value
         */
        protected _normalize(pos: number, dim: number, min: number, max: number): number {
            // make sure we're on screen from the min-side
            if (pos < min) { pos = TOOLTIP_MARGIN; }

            // and the max
            if ((pos + dim) > max) { pos = max - dim - TOOLTIP_MARGIN; }

            // if the min-side is now off screen, this isn't a valid position
            if (pos < min) { return -1; }

            // otherwise return the adjusted value
            return pos;
        }

        //#endregion

        //#region DRAW AND ERASE

        public draw(parent: HTMLElement): void {
            if (!this._elems.base.parentNode) super.draw(parent);
            removeClass(this._elems.base, "hidden");
        }

        public erase(): void {
            addClass(this._elems.base, "hidden");
            setTimeout(() => { super.erase(); }, 110);
        }

        //#endregion
    }

    

    export enum TooltipPositionType {
        TOP = 0,
        BOTTOM = 1,
        LEFT = 2,
        RIGHT = 3
    }
}