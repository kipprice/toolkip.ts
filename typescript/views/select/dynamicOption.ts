namespace KIP {
    /**
     * IDynamicOptionElems
     * 
     * 
     * 
     */
    export interface IDynamicOptionElems extends IDrawableElements {
        base: HTMLElement;
        text: HTMLElement;
    }


    /**----------------------------------------------------------------------------
     * @class DynamicOption
     * ----------------------------------------------------------------------------
     * Create an option for a dynamic select field
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class DynamicOption extends Drawable implements IDynamicOption {

        //.....................
        //#region PROPERTIES

        /** unique ID for the option */
        protected _id: string;
        public get id(): string { return this._id; }

        /** display string for the option */
        protected _display: string;
        public get display(): string { return this._display; }

        /** determine whether this option is currently filtered */
        protected _isFiltered: boolean;
        public get isFiltered(): boolean { return this._isFiltered; }

        /** determine whether this option is selected */
        protected _isSelected: boolean;
        public get isSelected(): boolean { return this._isSelected; }

        /** keep track of the elements */
        protected _elems: IDynamicOptionElems;

        /** keep track of the dynamic select element for this option */
        protected _selectParent: DynamicSelect;

        //#endregion
        //..................

        //...............
        //#region STYLES

        /** track styles for the option field */
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".dynamicOption": {
                overflow: "hidden",
                cursor: "pointer",
                padding: "5px",

                nested: {
                    "&.filtered": {
                        maxHeight: "0",
                        padding: "0"
                    },

                    "&:hover, &.hilite": {
                        backgroundColor: "#eee"
                    }
                }
            }
        }

        //#endregion
        //...............

        /**
         * DynamicOption
         * ----------------------------------------------------------------------------
         * Create the dynamic option
         * @param   opt     Details of the option we are creating
         */
        constructor(opt: IDynamicOption, parent: DynamicSelect) {
            super();

            this._id = opt.id;
            this._display = opt.display;
            this._selectParent = parent;

            this._createElements();
        }

        //#region CREATE ELEMENTS

        /**
         * _shouldSkipCreateElements
         * ----------------------------------------------------------------------------
         * Determine if we should avoid creating elements in the constructor
         * @returns True if we should skip the create elements
         */
        protected _shouldSkipCreateElements(): boolean { return true; }

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * Create elements for this option
         */
        protected _createElements(): void {

            this._elems = {} as any;
            this._isFiltered = true;

            // create the base element
            this._elems.base = createElement({
                id: "opt|" + this._id,
                cls: "dynamicOption filtered",
                eventListeners: {
                    click: () => { 
                        console.log("click processed");
                        this._selectParent.select(this); 
                    }
                }
            });

            // create the text element
            this._elems.text = createElement({
                content: this._display,
                cls: "optText",
                parent: this._elems.base
            });


        }
        //#endregion

        //#region INTERACTION

        /**
         * select
         * ----------------------------------------------------------------------------
         * Select this particular element
         */
        public select(): boolean {
            if (this._isFiltered) { return false; }
        }

        /**
         * hilite
         * ----------------------------------------------------------------------------
         * Hilite the current selected element
         */
        public hilite(): boolean {
            if (this._isFiltered) { return false; }
            addClass(this._elems.base, "hilite");
            this._elems.base.scrollIntoView();
            return true;
        }

        /**
         * unhilite
         * ----------------------------------------------------------------------------
         * remove hiliting of the current selected element
         */
        public unhilite(): boolean {
            removeClass(this._elems.base, "hilite");
            return true;
        }

        /**
         * _filter
         * ----------------------------------------------------------------------------
         * Filter out this option if appropriate
         */
        protected _filter(): void {
            if (this._isFiltered) { return; }
            this._isFiltered = true;
            transition(this._elems.base, { maxHeight: "<height>", padding: "5px" }, { maxHeight: "0", padding: "0" }, 200).then(() => {
                addClass(this._elems.base, "filtered");
            });
        }

        /**
         * _unfilter
         * ----------------------------------------------------------------------------
         * Remove filtering for this option if appropriate
         */
        protected _unfilter(): void {
            if (!this._isFiltered) { return; }
            this._isFiltered = false;
            removeClass(this._elems.base, "filtered");
            transition(this._elems.base, { maxHeight: "0", padding: "0" }, { maxHeight: "<height>", padding: "5px" }, 200).then;
        }

        /**
         * tryFilter
         * ----------------------------------------------------------------------------
         * Asynchronous call to ensure that options that don't match the current 
         * select string are filtered out of the results
         * 
         * @param   words   The words required in a relevant string for the option 
         *                  in order to not filter
         * 
         * @returns Promise that will run the filtering logic
         */
        public async tryFilter(words: string[]): Promise<void> {
            // wait til the next frame render
            await nextRender();
            let word: string;
            let notFound: boolean = false;

            let display = this._display.toLowerCase();
            let id = this._id.toLowerCase();

            // loop through the words that were passed in and ensure all are there
            for (word of words) {
                if (display.indexOf(word) === -1) {
                    if (id.indexOf(word) === -1) {
                        notFound = true;
                        break;
                    }
                }
            }

            // if a word was missing, filter this element
            if (notFound) {
                this._filter();
            } else {
                this._unfilter();
            }

        }

        //#endregion
    }
}