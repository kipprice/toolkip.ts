/// <reference path="../_field.ts" />

namespace KIP.Forms {

    //.....................
    //#region INTERFACES
    export interface IToggleButtonElem<T> {
        key: T;
        btn: HTMLElement;
    }

    export interface IToggleButtonElems extends IFieldElems {
        postChildrenContainer: HTMLElement;
    }  

    export interface IFormToggleButtonTemplate<T> extends IFieldConfig<any> {
        options?: IToggleBtnOption<any>[];
    }
    //#endregion
    //.....................

    /**----------------------------------------------------------------------------
     * @class   ToggleButtonField
     * ----------------------------------------------------------------------------
     * template for toggle buttons
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class ToggleButtonField<M, T extends IFormToggleButtonTemplate<M> = IFormToggleButtonTemplate<M>> extends Field<M, T> {

        //.....................
        //#region PROPERTIES

        /** keep track of elements for this element */
        protected _elems: IToggleButtonElems;

        /** the button options toggle button type */
        protected _options: IToggleBtnOption<any>[];

        /** handle whether this is a multi-select function */
        protected _multiSelect: boolean;

        /** keep track of our buttons */
        protected _buttons: IToggleButtonElem<M>[];

        /** type for the toggle buttons */
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.TOGGLE_BUTTON; }

        /** default class for the toggle buttons */
        protected get _defaultCls(): string { return "toggleBtns"; }

        //#endregion
        //.....................

        //..................
        //#region STYLES

        /** static styles for the toggle buttons */
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            
            ".toggleBtns .formChildren": {
                display: "flex",
                flexWrap: "wrap",
                marginLeft: "0",
                marginTop: "5px"
            },

            ".toggleBtns.flex .formChildren": {

            },

            ".toggleBtn": {
                borderRadius: "3px",
                boxShadow: "1px 1px 4px 2px rgba(0,0,0,.1)",
                padding: "4px",
                marginRight: "10px",
                cursor: "pointer",
                textAlign: "center",
                fontSize: "0.8em",
                border: "1px solid transparent",
                opacity: "0.7",
                transition: "all ease-in-out .1s"
            },


            ".toggleBtn.selected, .toggleBtn:hover": {
                border: "1px solid <formTheme>",
                transform: "scale(1.08)"
            },

            ".toggleBtn.selected": {
                opacity: "1"
            }
                
        };

        protected _getUncoloredStyles(): KIP.Styles.IStandardStyles {
            return this._mergeThemes(
                Field._uncoloredStyles,
                ToggleButtonField._uncoloredStyles
            );
        }

        //#endregion
        //..................

        /**
         * ToggleButtonElement
         * ----------------------------------------------------------------------------
         * Create a toggle button class
         * @param   id          The ID to use for the toggle button
         * @param   template    The template for this element
         */
        constructor(id: string, template: T | ToggleButtonField<M, T>) {
            super(id, template);
        }

        /**
         * _parseFieldTemplate
         * ----------------------------------------------------------------------------
         * Parse data in the element template
         * @param   template    Handle the element
         */
        protected _parseFieldTemplate(template: T): void {
            super._parseFieldTemplate(template);
            this._options = template.options;
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * create the elements needed for toggle buttons 
         */
        protected _onCreateElements(): void {
            
            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null);
            this._createOptionsElements();

            this._handleStandardLayout();
        }

        //........................
        //#region HANDLE LAYOUT

        protected _flexLayout(): void {
            addClass(this._elems.base, "flex");
            this._createStandardLabel(this._elems.base);
            this._appendChildren();
        }

        protected _multiLineLayout(): void {
            addClass(this._elems.base, "multiline");
            this._createStandardLabel(this._elems.base);
            this._appendChildren();
        }

        protected _tableLayout(): void {
            this._multiLineLayout();
            //TODO: do a real table layout
        }

        //#endregion
        //........................

        protected _appendChildren(): void {
            this._elems.base.appendChild(this._elems.childrenContainer);
            if (this._elems.postChildrenContainer) { 
                this._elems.base.appendChild(this._elems.postChildrenContainer); 
            }
        }

        protected _labelAfterLayout(): void {
            addClass(this._elems.base, "labelLast");
            this._appendChildren();
            this._createStandardLabel(this._elems.base);
        }

        /**
         * _updateOptions
         * ---------------------------------------------------------------------------
         * update the buttons that are presented as options to the user
         */
        protected _updateOptions(options: IToggleBtnOption<M>[]): void {
            
            // clear out any existing options
            this._clearOptions();
            
            // update the option arrays
            this._options = options;
            this._config.options = options;

            // regenerate the buttons
            this._createOptionsElements();
        }

        /**
         * _clearOptions
         * ---------------------------------------------------------------------------
         * clear out the current set of options
         */
        protected _clearOptions(): void {
            this._buttons = [];
            this._elems.childrenContainer.innerHTML = "";
        }

        /**
         * _createOptionsElements
         * ----------------------------------------------------------------------------
         */
        protected _createOptionsElements(): void {
            map(this._options, (elem: IToggleBtnOption<M>) => {
                this._createOptionElement(elem);
            });
        }

        /**
         * _createOptionElement
         * ----------------------------------------------------------------------------
         * @param elem 
         */
        protected _createOptionElement(elem: IToggleBtnOption<any>): HTMLElement {
            let btn: HTMLElement = createElement({
                id: this._id + "btn" + elem.value, 
                cls: "toggleBtn", 
                content: elem.label, 
                parent: this._elems.childrenContainer,
                eventListeners:{
                    click: () => {
                        this._selectBtn(btn, elem.value);
                        this._changeEventFired();
                    }
                }
            });

            // check if we already know that this button should be selected
            if (this._shouldBeSelected(elem)) {
                this._selectBtn(btn, elem.value);
            }

            // add this to our button arary as appropriate
            if (!this._buttons) { this._buttons = []; }
            this._buttons.push({ key: elem.value, btn: btn });

            return btn;
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * process when the user has changed their selection
         */
        protected _getValueFromField(): M {
            let value: M = this._data;
            return value;
        }

        public update(data: M, allowEvents: boolean): void {
            let changed = !this._testEquality(data);
            if (!changed) { return; }

            super.update(data, allowEvents);
        }
        /**
         * updateUI
         * ----------------------------------------------------------------------------
         * update the selected buttons based on the passed in information
         */
        protected _updateUI(data: M): void {
            let btn: HTMLElement = this._getButtonToUpdate(data);
            KIP.wait(100).then(() => {
                if (!this._selectBtn) { 
                    console.log("missing _selectBtn: " + this._selectBtn); 
                    throw new Error("missing _select function"); 
                }
                this._selectBtn(btn, data);
            });
        }

        /**
         * _getButtonToUpdate
         * ----------------------------------------------------------------------------
         * @param data 
         */
        protected _getButtonToUpdate(data: any): HTMLElement {
            let idx: number = indexOf(
                this._buttons, 
                {key: data, btn: null}, 
                (a: IToggleButtonElem<M>, b: IToggleButtonElem<M>) => {
                    return this._equalityTest(a, b);
                }
            );
            if (idx === -1) { return; }
            let btn: HTMLElement = this._buttons[idx].btn;
            return btn;
        }

        protected _equalityTest(a: IToggleButtonElem<M>, b: IToggleButtonElem<M>): boolean {
            return (a.key === b.key);
        }

        protected _testEquality(a: any) { return false; }

        public abstract clear(): void;

        //..............................
        //#region ABSTRACT FUNCTIONS

        protected abstract _selectBtn(btn: HTMLElement, value: any): void;
        protected abstract _shouldBeSelected(elem: IToggleBtnOption<any>): boolean;

        //#endregion
        //..............................
    }
}