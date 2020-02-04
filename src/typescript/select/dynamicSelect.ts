namespace KIP {

    /**----------------------------------------------------------------------------
     * @class	DynamicSelect
     * ----------------------------------------------------------------------------
     * supports loading dynamically into a custom select field; useful for select
     * fields that load data or perform string matching
     * 
     * // TODO: cleanup
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class DynamicSelect<T> extends CustomSelect<T> {

        //.....................
        //#region PROPERTIES
        
        /** keep track of whether we are currently running a query */
        protected _queryMgr: {
            isQuerying: boolean;
            nextQuery: string;
            currentQuery: string;
        };

        /** make sure we can let listeners know about changes in this element*/
        protected _selectListeners: Function[];

        /** keep track of general change listeners */
        protected _changeListeners: Function[];

        /** keep track of the listeners for searching */
        protected _searchListeners: Function[];

        protected _elems: {
            base: HTMLElement;

            currentSelection: HTMLElement;
            input: HTMLInputElement;
            clearBtn: HTMLElement;

            drawer: HTMLElement;
            optionContainer: HTMLElement;
            loadingIcon: HTMLElement;
            innerOptions: HTMLElement;
        }
        
        //#endregion
        //.....................

        //..................
        //#region STYLES
        
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".dynamicSelect": {

                nested: {
                    "input": {
                        position: "relative",
                        fontSize: "2em",
                        zIndex: "3"
                    },

                    ".clearBtn": {
                        color: "#555",
                        transition: "all ease-in-out .1s",
                        position: "absolute",
                        left: "calc(100% - 25px)",
                        top: "0",
                        width: "20px",
                        height: "20px",
                        fontSize: "20px",
                        cursor: "pointer",
                        transformOrigin: "50% 100%",

                        nested: {
                            "&:hover": {
                                transform: "scale(1.1)"
                            }
                        }
                    },
                }
            }
        }

        protected _getUncoloredStyles() {
            return this._mergeThemes(
                DynamicSelect._uncoloredStyles,
                CustomSelect._uncoloredStyles
            )
        }
        
        //#endregion
        //..................

        public constructor() {
            super();

            this._queryMgr = {
                isQuerying: false,
                currentQuery: "",
                nextQuery: ""
            };

            this._searchListeners = [];
            this._selectListeners = [];
            this._changeListeners = [];
        }
        //..........................................
        //#region CREATE ELEMENTS
        
        protected _createElements() {
            super._createElements();
            
            this._elems.input = createElement({
                type: "input",
                parent: this._elems.currentSelection,
                eventListeners : {
                    input: (e: Event) => { this._onQueryTextChange(e); },
                    keydown: (e: KeyboardEvent) => { this._onKeyEvent(e); },
                    blur: (e: Event) => { this._onBlur(e); },
                    focus: (e: Event) => { this._onFocus(e); }
                }
            }) as HTMLInputElement;

            this._elems.clearBtn = createElement({
                cls: "clearBtn",
                content: "x",
                parent: this._elems.currentSelection,
                eventListeners: {
                    click: () => { this._elems.input.value = ""; }
                }
            });

            this._elems.loadingIcon = this._createElement({ 
                key: "loadingIcon", 
                cls: "hidden loading", 
                parent: this._elems.drawer
            });
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region AUGMENT OPTIONS
        
        public addOption(opt: ICustomOption<T>) {
            super.addOption(opt);
            this._updateFiltering(this._elems.input.value);
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region HANDLE EVENTS

        protected _handleEnter() {
            let pair = this._availableOptions.getCurrent();
            if (pair) { 
                this.select(pair.value); 
            } else { 
                this.search(this._elems.input.value); 
            }
        }

         /**
         * addEventListener
         * ----------------------------------------------------------------------------
         * Allow additional listeners on this select field
         */
        public addEventListener(type: "select" | "change" | "search" | keyof WindowEventMap, func: Function): void {
            switch (type) {
                case "select":  return this._addEventListener(func, this._selectListeners);
                case "search":  return this._addEventListener(func, this._searchListeners);
                case "change":  return this._addEventListener(func, this._changeListeners);

                default:        return super.addEventListener(type, func);
            }
        }

        protected _addEventListener(cb: Function, listeners: Function[]) {
            // TODO: use code events instead of listeners here
            listeners.push(cb);
        }

        /**
         * _notifyChangeListeners
         * ----------------------------------------------------------------------------
         * Notify any listeners that some content changed
         */
        protected _notifyChangeListeners(): void {
            this._notifyListeners(this._changeListeners);
        }

        /**
         * _notifySearchListeners
         * ----------------------------------------------------------------------------
         * @param search 
         */
        protected _notifySearchListeners(search: string) { 
            this._notifyListeners(this._searchListeners, search); 
        }

        protected _notifyListeners(listeners: Function[], data?: any) {
            if (!listeners) { return; }
            for (let l of listeners) {
                if (!l) { continue; }
                l(data);
            }
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * Handle when the text field changes
         * 
         * @param   e   Change event
         */
        protected _onQueryTextChange(e: Event): void {
            let curText: string = this._elems.input.value;

            // update which options are filtered
            this._updateFiltering(curText);

            // let listeners know that we have updates
            this._notifyChangeListeners();

            // run a new query if we can
            this._query(curText);
        }

        /**
         * _onBlur
         * ----------------------------------------------------------------------------
         * Handle when focus is lost on the search element
         * @param   event   The focus event
         */
        protected _onBlur(event: Event): void {
            this._collapseDrawer();
        }

        /**
         * _onFocus
         * ----------------------------------------------------------------------------
         * Handle when focus is given to the search element
         * @param   event   The focus event
         */
        protected _onFocus(event: Event): void {
            this._expandDrawer();
            this._availableOptions.resetLoop();
        }

        /**
         * search
         * ----------------------------------------------------------------------------
         * Handle searching for a string that wasn't an option in
         * our search results
         */
        public search(searchStr: string): void {
            this._collapseDrawer();
            this._elems.input.value = searchStr;
            this._elems.input.blur();
            this._notifySearchListeners(searchStr);
        }


        public select(selectedOption: ICustomOption<T>) {
            super.select(selectedOption);
            this._elems.input.value = selectedOption.display;
            this._elems.input.blur();
            
        }
        //#endregion
        //........................

        //...........................
        //#region HANDLE FILTERING

        /**
         * _updateFiltering
         * ----------------------------------------------------------------------------
         * make sure our filtered text reflects the most up-to-date value in the 
         * text field
         */
        public _updateFiltering(curText: string): void {
            // split the text by space for smarter filtering
            let words: string[] = curText.toLowerCase().split(" ");
            this._availableOptions.map((elem: DynamicOption) => {
                elem.tryFilter(words);
            });
        }

        //#endregion
        //...........................

        //........................
        //#region QUERY HANDLING

        /**
         * _query
         * ----------------------------------------------------------------------------
         * Handle querying for additional options to add
         * @param   queryText   The text to search
         */
        protected _query(queryText?: string): void {

            // quit if we're already running this query
            if (queryText === this._queryMgr.currentQuery) { return; }

            // if we're in the process of querying, just queue up a new query for next time
            if (this._queryMgr.isQuerying) {
                this._queryMgr.nextQuery = queryText;
                return;
            }

            // if we have nothing to query, quit
            if (!queryText) { return; }
            this._queryMgr.currentQuery = queryText;

            this._queryMgr.isQuerying = true;
            removeClass(this._elems.loadingIcon, "hidden");
            this._onQuery(queryText).then(() => {
                this._queryMgr.currentQuery = "";
                this._queryMgr.isQuerying = false;
                addClass(this._elems.loadingIcon, "hidden");

                // start the next query if appropriate
                if (this._queryMgr.nextQuery) {
                    this._query(this._queryMgr.nextQuery);
                    this._queryMgr.nextQuery = "";
                }
            });
        }
        //#endregion
        //........................

        //..................
        //#region CLEARING

        public clear(): void {
            this._elems.input.value = "";
            this._updateFiltering("");
            this._notifyChangeListeners();
        }

        //#endregion
        //..................

        //...........................
        //#region ABSTRACT FUNCTIONS

        /**
         * _onQuery
         * ----------------------------------------------------------------------------
         * Queries an appropriate source to find new values to add to the select. 
         * Expectation is that new queries get added to the available options through
         * addOption(s).
         * 
         * @param   queryText   Text that should be used to find new options
         * 
         * @returns A promise that will complete the query to the appropriate source
         */
        protected abstract _onQuery(queryText: string): Promise<any>;

        //#endregion
        //...........................

        //..........................................
        //#region CONSTRUCTOR METHODS
        
        protected _createOption(opt: ICustomOption<T>) {
            return new DynamicOption<T>(opt)
        }
        
        //#endregion
        //..........................................
    }
}