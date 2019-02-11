namespace KIP.Forms {
    
     /**----------------------------------------------------------------------------
     * @class CheckElement
     * ----------------------------------------------------------------------------
     * create a checkbox form element
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class CheckElement extends FormElement<boolean> {

        //.....................
        //#region PROPERTIES
        
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.CHECKBOX; }
        protected get _defaultValue(): boolean { return false; }
        protected get _defaultCls(): string { return "check"; }
        protected get _layout(): FormElementLayoutEnum { return FormElementLayoutEnum.LABEL_AFTER; }

        protected _elems: {
            core: HTMLElement;
            error?: HTMLElement;
            lbl?: HTMLElement;
            input?: HTMLInputElement;
            inputBox?: HTMLElement;
            inputInnerBox?: HTMLElement;
            innerLbl?: HTMLElement;
        }
        
        //#endregion
        //.....................

        //...................................................
        //#region STYLES
        
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            '.kipFormElem input[type="checkbox"]': {
                display: "none",
                zoom: "1.5",
                width: "18px",
                height: "18px",
                margin: "0",
                marginRight: "5px",
                border: "1px solid <formTheme>"
            },

            ".kipFormElem input[type='checkbox'] + label": {
                display: "flex"
            },

            '.kipFormElem input[type="checkbox"] + label .inputBox': {
                width: "18px",
                height: "18px",
                margin: "0",
                marginRight: "5px",
                border: "1px solid <formTheme>",
                position: "relative",
                boxSizing: "content-box",
                flexShrink: "0",
                marginTop: "4px"
            },

            ".kipFormElem input[type='checkbox'] + label .inputBox .innerInputBox": {
                position: "absolute",
                width: "0",
                height: "0",
                left: "9px",
                top: "9px",
                backgroundColor: "<formTheme>",
                transition: "all ease-in-out .1s"
            },

            ".kipFormElem input[type='checkbox']:checked + label .inputBox .innerInputBox, .kipFormElem input[type='checkbox']:checked + label:hover .inputBox .innerInputBox": {
                left: "2px",
                top: "2px",
                width: "14px",
                height: "14px"
            },

            ".kipFormElem input[type='checkbox'] + label:hover .inputBox .innerInputBox": {
                left: "4px",
                top: "4px",
                width: "10px",
                height: "10px",
                opacity: "0.7"
            },

            ".kipFormElem.check input[type='checkbox'] + label .innerLbl": {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                fontSize: "0.9em",
                paddingTop: "3px"
            }
        };

        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(CheckElement._uncoloredStyles, FormElement._uncoloredStyles);
        }
        
        //#endregion
        //...................................................

        /** create the check elements */
        protected _onCreateElements(): void {
            this._createStandardInput();

            // Create the custom UI for the checkbox
            this._elems.lbl = createLabelForInput("", this._id + "|input", "", this._elems.core);
            this._elems.inputBox = createElement({
                cls: "inputBox", 
                parent: this._elems.lbl,  
                attr: {tabindex: 0},
                eventListeners: {
                    keypress: (event: KeyboardEvent) => {
                        if (event.keyCode !== 13 && event.keyCode !== 32) { return; }

                        this._elems.input.checked = !this._elems.input.checked;
                    }
                }
            });

            this._elems.inputInnerBox = createElement({ 
                cls: "innerInputBox", 
                parent: this._elems.inputBox
            });

            this._elems.innerLbl = createSimpleElement("", "innerLbl", this._label, null, null, this._elems.lbl);

            this._handleStandardLayout();
        }

        /** handle when the checkbox is clicked */
        protected _onChange(): boolean {
            let value: boolean = (this._elems.input as HTMLInputElement).checked;
            return this._standardValidation(value);
        }

        /** 
         * _createClonedElement
         * ---------------------------------------------------------------------------
         * clone the appropriate element 
         */
        protected _createClonedElement(appendToID: string): CheckElement {
            return new CheckElement(this._id + appendToID, this);
        }

        /** 
         * update
         * ---------------------------------------------------------------------------
         * update the contents of the element 
         * */
        public update(data: boolean): void {
            this._data = data;
            this._elems.input.checked = data;
        }
    }
}