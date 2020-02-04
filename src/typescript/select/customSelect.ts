///<reference path="../drawable/drawable.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class CustomSelect
     * ----------------------------------------------------------------------------
     * Create a select element that renders custom styles
     * // TODO: fix drawer bugs (keyboard input, flicker)
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class CustomSelect<T> extends Drawable {

        //.....................
        //#region PROPERTIES

        protected get _addlCls() { return ""; }

        /** keep track of the options that are available for this select field */
        protected _availableOptions: Collection<CustomOption<T>>;

        /** keep track of elements needed for the select element */
        protected _elems: {
            base: HTMLElement;
            currentSelection: HTMLElement;
            drawer: HTMLElement;
            optionContainer: HTMLElement;
            innerOptions: HTMLElement;
        };

        protected _value: T;
        public get value(): T { return this._value; }

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
        constructor(opts?: ICustomOption<T>[]) {
            super();

            // initialize our collection
            this._availableOptions = new Collection();
            this._availableOptions.addType = CollectionTypeEnum.ReplaceDuplicateKeys;

            this.addOptions(opts);
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

            this._elem({
                key: "base",
                cls: "customSelect " + this._addlCls,
                children: [
                    { key: "currentSelection", cls: "currentSelection" },
                    { key: "drawer", cls: "drawer collaped", children: [
                        { key: "innerOptions", cls: "innerOptions" }
                    ]}
                ]
            });
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


        //..........................................
        //#region EVENT HANDLERS
        
        /**
         * _onKeyUp
         * ----------------------------------------------------------------------------
         * Check if we need to handle an enter press in the text field
         * 
         * @param   e   The keyboard event fired
         */
        protected _onKeyEvent(e: KeyboardEvent): void {
            switch (e.keyCode) {

                // enter
                case 13:    return this._handleEnter();

                // up arrow
                case 38:    return this._moveUp();

                // down arrow
                case 40:    return this._moveDown();
            }
        }

        protected _handleEnter() {
            let pair = this._availableOptions.getCurrent();
            if (pair) { this.select(pair.value); } 
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region MOVE UP AND DOWN IN THE DRAWER
        
        protected _moveUp(): void {
            let pair = this._availableOptions.getCurrent();

            let foundNext = false;
            while (foundNext === false && this._availableOptions.hasNext(true)) {
                let opt: CustomOption<T> = this._availableOptions.getNext(true).value;
                foundNext = opt.hilite();
            }

            if (foundNext && pair) { pair.value.unhilite(); }
        }


        protected _moveDown(): void {
            let pair = this._availableOptions.getCurrent();

            let foundNext = false;
            while (foundNext === false && this._availableOptions.hasNext()) {
                let opt: CustomOption = this._availableOptions.getNext().value;
                foundNext = opt.hilite();
            }

            if (foundNext && pair) { pair.value.unhilite() }
        }
        
        //#endregion
        //..........................................

        //........................
        //#region AUGMENT OPTIONS

        /**
         * addOption
         * ----------------------------------------------------------------------------
         * Adds an option to our select field
         * 
         * @param   opt     The option to add
         */
        public addOption(opt: ICustomOption<T>): void {

            // add to the collection
            let option: CustomOption = this._createOption(opt);
            this._availableOptions.add(option.display, option);

            // add to the UI
            this._elems.innerOptions.appendChild(option.base);

            // make sure we hear when this option will be selected
            OptionSelectedCodeEvent.addEventListener<T>((ev) => this.select(ev), option);
        }

        /**
         * addOptions
         * ----------------------------------------------------------------------------
         * Add a set of options to the select element
         * @param   opts    The options to add
         */
        public addOptions(opts: ICustomOption<T>[]): void {
            if (!opts) { return; }
            for (let opt of opts) {
                this.addOption(opt);
            }
        }

        //#endregion
        //........................

        //........................
        //#region HANDLE SELECTION

        /**
         * select
         * ----------------------------------------------------------------------------
         * Handle selecting an element in the search field
         * @param   selectedOption  The option that was selected
         */
        public select(selectedOption: ICustomOption<T>): void {
            this._collapseDrawer();
            this._value = selectedOption.value;
            OptionSelectedCodeEvent.dispatch(this, selectedOption);
        }

        /**
         * _addEventListener
         * ----------------------------------------------------------------------------
         * @deprecated
         * in place for legacy code that calls event listeners manually; preferred 
         * method is to use the codeEvent directly
         */
        protected _addEventListener(cb: Function, listeners: Function[]) {
            OptionSelectedCodeEvent.addEventListener(cb as any, this);
        }

        //#endregion
        //........................

        //..........................................
        //#region CONSTRUCTOR METHODS
        
        protected _createOption(data: ICustomOption<T>): CustomOption<T> {
            return new CustomOption(data);
        }
        
        //#endregion
        //..........................................
    }

    
}