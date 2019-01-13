///<reference path="../drawable.ts" />
namespace KIP {

    /**
     * IDynamicOption
     * ----------------------------------------------------------------------------
     * Keep track of a choice for a dynamic selection
     */
    export interface IDynamicOption {
        id: string;
        display: string;
    }

    /**
     * IDynamicSelectElems
     * ----------------------------------------------------------------------------
     * Keep track of the elements used in the Dynamic Select field
     */
    export interface IDynamicSelectElems extends IDrawableElements {
        input: HTMLInputElement;
        drawer: HTMLElement;
        optionContainer: HTMLElement;
        loadingIcon: HTMLElement;
        innerOptions: HTMLElement;
        clearBtn: HTMLElement;
    }

    /**----------------------------------------------------------------------------
     * @class DynamicSelect
     * ----------------------------------------------------------------------------
     * Create a select element that can load dynamic options
     * // TODO: support more than just an ID being retrieved
     * // TODO: fix drawer bugs (keyboard input, flicker)
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export abstract class DynamicSelect extends Drawable {

        //.....................
        //#region PROPERTIES

        /** keep track of the options that are available for this select field */
        protected _availableOptions: Collection<DynamicOption>;

        /** keep track of whether we are currently running a query */
        protected _isQuerying: boolean;

        /** keep track of the next query we need to run if we're already querying */
        protected _nextQuery: string;

        /** keep track of the current query we're running */
        protected _currentQuery: string;

        /** keep track of elements needed for the select element */
        protected _elems: IDynamicSelectElems;

        /** make sure we can let listeners know about changes in this element*/
        protected _selectListeners: Function[];

        /** keep track of general change listeners */
        protected _changeListeners: Function[];

        /** keep track of the listeners for searching */
        protected _searchListeners: Function[];

        protected _value: string;
        public get value(): string { return this._value; }
        
        

        //#endregion
        //.....................

        //...............
        //#region STYLES

        /** keep track of the styles associated with this select field */
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            "@keyframes rotate": {
                "from": { transform: "rotate(0deg)" },
                "to": { transform: "rotate(360deg)" }
            },

            ".dynamicSelect": {
                position: "relative",
                fontFamily: "Segoe UI, Open Sans, Helvetica",

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

                    ".drawer": {
                        boxShadow: "1px 1px 5px 2px rgba(0,0,0,.2)",
                        color: "<0>",
                        backgroundColor: "#FFF",
                        minWidth: "200px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        position: "absolute",
                        left: "0",
                        top: "3em",
                        display: "inline-block",
                        zIndex: "2",

                        nested: {
                            ".loading": {
                                borderRadius: "100%",
                                border: "2px transparent solid",
                                borderTop: "2px #333 solid",
                                animation: "rotate 1s linear infinite",
                                width: "20px",
                                height: "20px",
                                marginLeft: "auto",
                                marginRight: "auto",
                                transition: "height ease-in-out .1s",
                                padding: "5px",

                                nested: {
                                    "&.hidden": {
                                        display: "none"
                                    }
                                }
                            },

                            "&.collapsed" : {
                                maxHeight: "0",
                                overflow: "hidden",
                                opacity: "0"
                            }
                        }
                    }
                }
            }
        }

        //#endregion
        //...............

        //.....................
        //#region CONSTRUCTOR

        /**
         * DynamicSelect
         * ----------------------------------------------------------------------------
         * Create the Dynamic Select element
         */
        constructor() {
            super();

            // initialize our collection
            this._availableOptions = new Collection<DynamicOption>();
            this._availableOptions.addType = CollectionTypeEnum.ReplaceDuplicateKeys;
        }

        //#endregion
        //.....................

        //........................
        //#region CREATE ELEMENTS

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * Generate the elements needed by the dynamic select field
         */
        protected _createElements(): void {
            this._elems = {} as any;

            this._elems.base = createElement({
                cls: "dynamicSelect"
            });

            this._elems.input = createElement({
                type: "input",
                parent: this._elems.base,
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
                parent: this._elems.base,
                eventListeners: {
                    click: () => { this._elems.input.value = ""; }
                }
            });

            this._elems.drawer = createElement({
                cls: "drawer collapsed",
                parent: this._elems.base
            });

            this._elems.innerOptions = createElement({
                cls: "innerOptions",
                parent: this._elems.drawer
            });

            this._elems.loadingIcon = createElement({ cls: "hidden loading", parent: this._elems.drawer });
        }

        //#endregion
        //........................

        //...........................
        //#region DRAWER FUNCTIONS

        /**
         * _expandDrawer
         * ----------------------------------------------------------------------------
         * Expand the drawer of options
         */
        protected _expandDrawer(): void {
            removeClass(this._elems.drawer, "collapsed");
            transition(this._elems.drawer, 
                { height: "0", opacity: "0" }, 
                { height: "<height>", opacity: "1" }, 
                300
            );
        }

        /**
         * _collapseDrawer
         * ----------------------------------------------------------------------------
         * Collapse the drawer of options
         */
        protected _collapseDrawer(): void {
            transition(this._elems.drawer, { height: "<height>", opacity: "1" }, { height: "0", opacity: "0" }, 300).then(() => {
              addClass(this._elems.drawer, "collapsed");  
            });
        }

        //#endregion   
        //...........................

        //........................
        //#region AUGMENT OPTIONS

        /**
         * addOption
         * ----------------------------------------------------------------------------
         * Adds an option to our select field
         * 
         * @param   opt     The option to add
         */
        public addOption(opt: IDynamicOption): void {
            let option: DynamicOption = new DynamicOption(opt, this);
            if (this._availableOptions.addElement(option.id, option) === -1) { return; };
            this._updateFiltering(this._elems.input.value);
            this._elems.innerOptions.appendChild(option.base);
        }

        /**
         * addOptions
         * ----------------------------------------------------------------------------
         * Add a set of options to the select element
         * @param   opts    The options to add
         */
        public addOptions(opts: IDynamicOption[]): void {
            let opt: IDynamicOption;
            for (opt of opts) {
                this.addOption(opt);
            }
        }
        //#endregion
        //........................

        //........................
        //#region EVENT LISTENERS

        /**
         * addEventListener
         * ----------------------------------------------------------------------------
         * Allow additional listeners on this select field
         */
        public addEventListener(type: "select" | "change" | "search" | keyof WindowEventMap, func: Function): void {
            switch (type) {
                case "select":
                    if (!this._selectListeners) { this._selectListeners = []; }
                    this._selectListeners.push(func);
                    break;
                case "search":
                    if (!this._searchListeners) { this._searchListeners = []; }
                    this._searchListeners.push(func);
                    break;
                case "change":
                    if (!this._changeListeners) { this._changeListeners = []; }
                    this._changeListeners.push(func);
                    break;
                default:
                    super.addEventListener(type, func);
                    break;
            }
        }

        /**
         * _notifyChangeListeners
         * ----------------------------------------------------------------------------
         * Notify any listeners that some content changed
         */
        protected _notifyChangeListeners(): void {
            let listener: Function;
            if (!this._changeListeners) { return; }
            for (listener of this._changeListeners) {
                if (!listener) { continue; }
                listener(this._elems.input.value);
            }
        }

        /**
         * _notifySelectListeners
         * ----------------------------------------------------------------------------
         * Notify any listeners that we have selected an element
         * @param   selectedOption  The option that was selected
         */
        protected _notifySelectListeners(selectedOption: DynamicOption): void {
            let listener: Function;
            if (!this._selectListeners) { return; }
            for (listener of this._selectListeners) {
                if (!listener) { continue; }
                listener(selectedOption);
            }
        }

        /**
         * _notifySearchListeners
         * ----------------------------------------------------------------------------
         * @param search 
         */
        protected _notifySearchListeners(search: string): void {
            let listener: Function;
            if (!this._searchListeners) { return; }
            for (listener of this._searchListeners){
                if (!listener) { continue; }
                listener(search);
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
         * _onKeyUp
         * ----------------------------------------------------------------------------
         * Check if we need to handle an enter press in the text field
         * 
         * @param   e   The keyboard event fired
         */
        protected _onKeyEvent(e: KeyboardEvent): void {
            let foundNext: boolean = false;
            let pair: ICollectionElement<DynamicOption>;
            switch (e.keyCode) {

                // enter
                case 13:
                    pair = this._availableOptions.getCurrent();
                    if (pair) {
                        this.select(pair.value);
                    } else {
                        this.search(this._elems.input.value);
                    }
                    break;

                // up arrow
                case 38:
                    pair = this._availableOptions.getCurrent();
                    

                    while (foundNext === false && this._availableOptions.hasNext(true)) {
                        let opt: DynamicOption = this._availableOptions.getNext(true).value;
                        foundNext = opt.hilite();
                    }

                    if (foundNext) { if (pair) { pair.value.unhilite(); } }

                    break;

                // down arrow
                case 40:
                    pair = this._availableOptions.getCurrent();

                    while (foundNext === false && this._availableOptions.hasNext()) {
                        
                        let opt: DynamicOption = this._availableOptions.getNext().value;
                        foundNext = opt.hilite();
                    }

                    if (foundNext) { if (pair) { pair.value.unhilite(); } }
                    
                    break;
            }

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
         * select
         * ----------------------------------------------------------------------------
         * Handle selecting an element in the search field
         * @param   selectedOption  The option that was selected
         */
        public select(selectedOption: DynamicOption): void {
            this._collapseDrawer();
            this._elems.input.value = selectedOption.display;
            this._value = selectedOption.id;
            this._elems.input.blur();
            this._notifySelectListeners(selectedOption);
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
            if (queryText === this._currentQuery) { return; }

            // if we're in the process of querying, just queue up a new query for next time
            if (this._isQuerying) {
                this._nextQuery = queryText;
                return;
            }

            // if we have nothing to query, quit
            if (!queryText) { return; }
            this._currentQuery = queryText;

            this._isQuerying = true;
            removeClass(this._elems.loadingIcon, "hidden");
            this._onQuery(queryText).then(() => {
                this._currentQuery = "";
                this._isQuerying = false;
                addClass(this._elems.loadingIcon, "hidden");

                // start the next query if appropriate
                if (this._nextQuery) {
                    this._query(this._nextQuery);
                    this._nextQuery = "";
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
        protected abstract _onQuery(queryText: string): KipPromise;

        //#endregion
        //...........................
    }

    
}