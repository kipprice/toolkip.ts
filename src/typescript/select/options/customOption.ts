namespace KIP {

    export class CustomOption<T = any> extends Drawable implements ICustomOption<T> {

        //.....................
        //#region PROPERTIES

        /** display string for the option */
        protected _display: string;
        public get display(): string { return this._display; }

        /** the data tied to this option */
        protected _value: T;
        public get value(): T { return this._value; }

        /** determine whether this option is selected */
        protected _isSelected: boolean;
        public get isSelected(): boolean { return this._isSelected; }

        protected get _addlCls(): string { return ""; }

        /** keep track of the elements */
        protected _elems: {
            base: HTMLElement;
            text: HTMLElement;
        }
        
        //#endregion
        //.....................

        //..................
        //#region STYLES
        
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".customOption": {
                overflow: "hidden",
                cursor: "pointer",
                padding: "5px",

                nested: {
                    "&:hover, &.hilite": {
                        backgroundColor: "{optionHilite}"
                    }
                }
            }
        }
        
        //#endregion
        //..................

        /**
         * DynamicOption
         * ----------------------------------------------------------------------------
         * Create the dynamic option
         * @param   opt     Details of the option we are creating
         */
        constructor(opt: ICustomOption<T>) {
            super();

            this._display = opt.display;
            this._value = opt.value;

            this._createElements();
        }

        //........................
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

            // create the base element
            this._elems.base = createElement({
                id: "opt|" + this._id,
                cls: "dynamicOption " + this._addlCls,
                eventListeners: {
                    click: () => this.select()
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
        //........................

        //..........................................
        //#region INTERACTION

        public select(): boolean {
            OptionSelectedCodeEvent.dispatch(this, { value: this._value, display: this._display });
            return true;
        }
        
        /**
         * hilite
         * ----------------------------------------------------------------------------
         * Hilite the current selected element
         */
        public hilite(): boolean {
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
        
        //#endregion
        //..........................................
    }
}