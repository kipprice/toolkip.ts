/// <reference path="../formElement.ts" />

namespace KIP.Forms {

    //.....................
    //#region INTERFACES
    export interface IToggleButtonElem<T> {
        key: T;
        btn: HTMLElement;
    }

    export interface IToggleButtonElems extends IFormHTMLElements {
        postChildrenContainer: HTMLElement;
    }  

    export interface IFormToggleButtonTemplate<T> extends IFormElemTemplate<any> {
        options?: IToggleBtnOption<any>[];
    }
    //#endregion
    //.....................

    /**----------------------------------------------------------------------------
     * @class   ToggleButtonElement
     * ----------------------------------------------------------------------------
     * template for toggle buttons
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class ToggleButtonElement<T> extends FormElement<T> {

        //.....................
        //#region PROPERTIES

        /** keep track of elements for this element */
        protected _elems: IToggleButtonElems;

        /** the button options toggle button type */
        protected _options: IToggleBtnOption<any>[];

        /** handle whether this is a multi-select function */
        protected _multiSelect: boolean;

        /** keep track of our buttons */
        protected _buttons: IToggleButtonElem<T>[];

        /** type for the toggle buttons */
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.TOGGLE_BUTTON; }

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
                marginLeft: "0"
            },

            ".toggleBtns.flex .formChildren": {
            },

            ".toggleBtn": {
                borderRadius: "2px",
                boxShadow: "1px 1px 4px 2px rgba(0,0,0,.1)",
                padding: "4px",
                margin: "4px",
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

        //#endregion
        //..................

        /**
         * ToggleButtonElement
         * ----------------------------------------------------------------------------
         * Create a toggle button class
         * @param   id          The ID to use for the toggle button
         * @param   template    The template for this element
         */
        constructor(id: string, template: IFormToggleButtonTemplate<any> | ToggleButtonElement<any>) {
            super(id, template);
        }

        /**
         * _parseElemTemplate
         * ----------------------------------------------------------------------------
         * Parse data in the element template
         * @param   template    Handle the element
         */
        protected _parseElemTemplate(template: IFormToggleButtonTemplate<any>): void {
            super._parseElemTemplate(template);
            this._options = template.options;
        }

        /**
         * _cloneFromFormElement
         * ----------------------------------------------------------------------------
         * handle cloning an additional element 
         * @param   data    The form element to clone from
         */
        protected _cloneFromFormElement(data: ToggleButtonElement<T>): void {
            super._cloneFromFormElement(data);
            this._options = data._options;
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
            addClass(this._elems.core, "flex");
            this._createStandardLabel(this._elems.core);
            this._appendChildren();
        }

        protected _multiLineLayout(): void {
            addClass(this._elems.core, "multiline");
            this._createStandardLabel(this._elems.core);
            this._appendChildren();
        }

        protected _tableLayout(): void {
            this._multiLineLayout();
            //TODO: do a real table layout
        }

        //#endregion
        //........................

        protected _appendChildren(): void {
            this._elems.core.appendChild(this._elems.childrenContainer);
            if (this._elems.postChildrenContainer) { 
                this._elems.core.appendChild(this._elems.postChildrenContainer); 
            }
        }

        protected _labelAfterLayout(): void {
            addClass(this._elems.core, "labelLast");
            this._appendChildren();
            this._createStandardLabel(this._elems.core);
        }

        /**
         * _createOptionsElements
         * ----------------------------------------------------------------------------
         */
        protected _createOptionsElements(): void {
            map(this._options, (elem: IToggleBtnOption<T>) => {
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
         */
        protected _onChange(): boolean {
            let value: T = this._data;
            return this._standardValidation(value);
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * @param data 
         */
        public update(data: T): void {
            if (this._data === data) { return; }
            this._data = data;
            let btn: HTMLElement = this._getButtonToUpdate(data);
            window.setTimeout(() => {
                if (!this._selectBtn) { 
                    console.log("missing _selectBtn: " + this._selectBtn); 
                    throw new Error("missing _select function"); 
                }
                this._selectBtn(btn, data);
            }, 100);
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
                (a: IToggleButtonElem<T>, b: IToggleButtonElem<T>) => {
                    return this._equalityTest(a, b);
                }
            );
            if (idx === -1) { return; }
            let btn: HTMLElement = this._buttons[idx].btn;
            return btn;
        }

        protected _equalityTest(a: IToggleButtonElem<T>, b: IToggleButtonElem<T>): boolean {
            return (a.key === b.key);
        }

        public _onClear(): void { }

        //..............................
        //#region ABSTRACT FUNCTIONS

        protected abstract _selectBtn(btn: HTMLElement, value: any): void;
        protected abstract _shouldBeSelected(elem: IToggleBtnOption<any>): boolean;

        //#endregion
        //..............................
    }
}