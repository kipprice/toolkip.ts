namespace KIP {

    /**----------------------------------------------------------------------------
     * @class DynamicOption
     * ----------------------------------------------------------------------------
     * Create an option for a dynamic select field
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class DynamicOption<T = any> extends CustomOption<T> {

        //.....................
        //#region PROPERTIES

        protected get _addlCls() { return "filtered dynamicOption"; }

        /** determine whether this option is currently filtered */
        protected _isFiltered: boolean;
        public get isFiltered(): boolean { return this._isFiltered; }

        //#endregion
        //..................

        //...............
        //#region STYLES

        /** track styles for the option field */
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".dynamicOption": {

                nested: {
                    "&.filtered": {
                        maxHeight: "0",
                        padding: "0"
                    }
                }
            }
        }

        protected _getUncoloredStyles() {
            return this._mergeThemes(
                DynamicOption._uncoloredStyles,
                CustomOption._uncoloredStyles
            )
        }

        //#endregion
        //...............

        //.....................
        //#region INTERACTION

        /**
         * select
         * ----------------------------------------------------------------------------
         * Select this particular element
         */
        public select(): boolean {
            if (this._isFiltered) { return false; }
            return super.select();
        }

        /**
         * hilite
         * ----------------------------------------------------------------------------
         * handle highlighting 
         */
        public hilite(): boolean {
            if (this._isFiltered) { return false; }
            return super.hilite();
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
        //.....................
    }
}