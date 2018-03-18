///<reference path="formElement.ts" />

namespace KIP.Forms {
    
    export interface IToggleButtonElem<T> {
        key: T;
        btn: HTMLElement;
    }

    /**...........................................................................
     * @class   ToggleButtonElement
     * ...........................................................................
     * template for toggle buttons
     * @version 1.0
     * @author  Kip Price
     * ...........................................................................
     */
    export abstract class ToggleButtonElement<T> extends FormElement<T> {

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

        /** static styles for the toggle buttons */
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
        
            ".toggleBtns": {
                width: "800px"
            },

            ".toggleBtns .formChildren": {
                display: "flex",
                flexWrap: "wrap"
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
                border: "1px solid <0>",
                transform: "scale(1.08)"
            },

            ".toggleBtn.selected": {
                opacity: "1"
            }
        };

        /**...........................................................................
         * Create a toggle button class
         * @param   id          The ID to use for the toggle button
         * @param   template    The template for this element
         * ...........................................................................
         */
        constructor(id: string, template: IFormToggleButtonTemplate<any> | ToggleButtonElement<any>) {
            super(id, template);
        }

        /**...........................................................................
         * _parseElemTemplate
         * ...........................................................................
         * Parse data in the element template
         * @param   template    Handle the element
         * ...........................................................................
         */
        protected _parseElemTemplate(template: IFormToggleButtonTemplate<any>): void {
            super._parseElemTemplate(template);
            this._options = template.options;
        }

        /**...........................................................................
         * _cloneFromFormElement
         * ...........................................................................
         * handle cloning an additional element 
         * @param   data    The form element to clone from
         * ...........................................................................
         */
        protected _cloneFromFormElement(data: ToggleButtonElement<T>): void {
            super._cloneFromFormElement(data);
            this._options = data._options;
        }

        /**...........................................................................
         * _onCreateElements
         * ...........................................................................
         * create the elements needed for toggle buttons 
         * ...........................................................................
         */
        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.core);
            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null, this._elems.core);
            this._createOptionsElements();
        }

        /**...........................................................................
         * _createOptionsElements
         * ...........................................................................
         * 
         * ...........................................................................
         */
        protected _createOptionsElements(): void {
            map(this._options, (elem: IToggleBtnOption<T>) => {
                this._createOptionElement(elem);
            });
        }

        /**...........................................................................
         * _createOptionElement
         * ...........................................................................
         * @param elem 
         * ...........................................................................
         */
        protected _createOptionElement(elem: IToggleBtnOption<any>): HTMLElement {
            let btn: HTMLElement = createElement({
                id: this._id + "btn" + elem.value, 
                cls: "toggleBtn", 
                content: elem.label, 
                parent: this._elems.childrenContainer
            });

            // check if we already know that this button should be selected
            if (this._shouldBeSelected(elem)) {
                this._selectBtn(btn, elem.value);
            }

            // deal with the select event
            btn.addEventListener("click", () => {
                this._selectBtn(btn, elem.value);
                this._changeEventFired();
            });

            // add this to our button arary as appropriate
            if (!this._buttons) { this._buttons = []; }
            this._buttons.push({ key: elem.value, btn: btn });

            return btn;
        }

        /**...........................................................................
         * _onChange
         * ...........................................................................
         * 
         * ...........................................................................
         */
        protected _onChange(): boolean {
            let value: T = this._data;
            return this._standardValidation(value);
        }

        /**...........................................................................
         * update
         * ...........................................................................
         * @param data 
         * ...........................................................................
         */
        public update(data: T): void {
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

        protected _getButtonToUpdate(data: any): HTMLElement {
            let idx: number = indexOf(
                this._buttons, 
                {key: data, btn: null}, 
                (a: IToggleButtonElem<T>, b: IToggleButtonElem<T>) => {
                    return (a.key === b.key);
                }
            );
            if (idx === -1) { return; }
            let btn: HTMLElement = this._buttons[idx].btn;
            return btn;
        }

        public _onClear(): void { }
        protected abstract _selectBtn(btn: HTMLElement, value: any): void;
        protected abstract _shouldBeSelected(elem: IToggleBtnOption<any>): boolean;

    }

    /**...........................................................................
     * @class   SingleSelectButtonElem
     * ...........................................................................
     * toggle buttons as equivalent to radio buttons
     * @version 1.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class SingleSelectButtonElem<T> extends ToggleButtonElement<T> {

        protected _selectedBtn: HTMLElement;
        protected _options: IToggleBtnOption<T>[];
        protected get _defaultValue(): T { return null; }
        protected get _multiSelect(): boolean { return false; }

        constructor(id: string, template: IFormSingleSelectButtonTemplate<T> | SingleSelectButtonElem<T>) {
            super(id, template);
        }

        protected _parseElemTemplate(template: IFormSingleSelectButtonTemplate<T>): void {
            super._parseElemTemplate(template);
        }

        /** handle a button being selected */
        protected _selectBtn(btn: HTMLElement, value: T): void {
            if (!btn) { return; }

            if (this._selectedBtn) {
                removeClass(this._selectedBtn, "selected");
            }

            if (this._selectedBtn === btn) {
                this._data = this._defaultValue;
                this._selectedBtn = null;
                return;
            }

            this._data = value;
            this._selectedBtn = btn;
            addClass(btn, "selected");
        }

        protected _createClonedElement(appendToID: string): SingleSelectButtonElem<T> {
            return new SingleSelectButtonElem<T>(this._id + appendToID, this);
        }

        protected _shouldBeSelected(elem: IToggleBtnOption<T>): boolean {
            return this._data === elem.value;
        }

        public _onClear(): void {
            if (this._selectedBtn) {
                removeClass(this._selectedBtn, "selected");
                this._selectedBtn = null;
            }
            this._data = this._defaultValue;
        }

        public setThemeColor(idx: number, color: string, noReplace?: boolean): void {
            super.setThemeColor(idx, color, noReplace);
        }

    }

    /**...........................................................................
     * @class   MultiSelectButtonElem
     * ...........................................................................
     * toggle buttons as multi-select options
     * @version 1.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class MultiSelectButtonElem<T> extends ToggleButtonElement<T[]> {
        protected _selectedBtns: HTMLElement[];
        protected get _multiSelect(): boolean { return true; }
        protected get _defaultValue(): T[] { return []; }
        protected _options: IToggleBtnOption<T>[];

        /**...........................................................................
         * Create the multi select form
         * @param id 
         * @param template 
         * ...........................................................................
         */
        constructor(id: string, template: IFormMultiSelectButtonTemplate<T> | MultiSelectButtonElem<T>) {
            super(id, template);
        }

        /**...........................................................................
         * _parseElemTemplate
         * ...........................................................................
         * @param template 
         * ...........................................................................
         */
        protected _parseElemTemplate(template: IFormMultiSelectButtonTemplate<T>): void {
            super._parseElemTemplate(template);
            this._selectedBtns = [];
        }

        /**...........................................................................
         * update
         * ...........................................................................
         * @param data 
         * ...........................................................................
         */
        public update(data: T[]): void {
            if (isNullOrUndefined(data)) { return; }

            this._onClear();

            // map all of the elements
            data.map((elem: T) => {
                let btn: HTMLElement = this._getButtonToUpdate(elem);
                this._selectBtn(btn, elem);
            });
        }

        /**...........................................................................
         * _shouldBeSelected
         * ...........................................................................
         * @param   elem    The element to potentially select
         * @returns True if a specified button should be selected
         * ...........................................................................
         */
        protected _shouldBeSelected(elem: IToggleBtnOption<T>): boolean {
            let dIdx: number = this._indexOf(elem.value);
            return (dIdx !== -1);
        }

        /**...........................................................................
         * _createClonedElement
         * ...........................................................................
         * @param appendToID 
         * ...........................................................................
         */
        protected _createClonedElement(appendToID: string): MultiSelectButtonElem<T> {
            return new MultiSelectButtonElem(this.id + appendToID, this);
        }

        /**...........................................................................
         * _selectBtn
         * ...........................................................................
         * @param btn 
         * @param value 
         * ...........................................................................
         */
        protected _selectBtn(btn: HTMLElement, value: T): void {
            if (!btn) { return; }

            // handle the case where the button was already selected
            let selectedIdx: number = this._selectedBtns.indexOf(btn);
            let dataIdx: number = this._indexOf(value);

            if ((dataIdx !== -1) && (selectedIdx === -1)) {
                return;

            } else if (selectedIdx != -1) {
                if (selectedIdx !== -1) {
                    removeClass(btn, "selected");
                    this._selectedBtns.splice(selectedIdx, 1);
                }
                if (dataIdx !== -1) { this._data.splice(dataIdx, 1); }
            }

            // handle the case where the button was unselected
            else {
                this._data.push(value);
                this._selectedBtns.push(btn);
                addClass(btn, "selected");
            }

        }

        /**...........................................................................
         * _indexOf
         * ...........................................................................
         * @param value 
         * @returns The index of the element in the array, or -1 if it isn't found
         * ...........................................................................
         */
        protected _indexOf(value: T): number {
            let outIdx: number = -1;
            for (let idx = 0; idx < this._data.length; idx += 1) {
                let elem: T = this._data[idx];
                if (this._equalTo(elem, value)) {
                    outIdx = idx;
                    break;
                }
            }

            return outIdx;
        }

        /**...........................................................................
         * _equalTo
         * ...........................................................................
         * Determine whether the data in this element is equivalent t 
         * @param dataA 
         * @param dataB 
         * ...........................................................................
         */
        protected _equalTo(dataA: T, dataB: T): boolean {
            switch (typeof dataA) {
                case "string":
                case "number":
                case "boolean":
                    return (dataA === dataB);
            }

            if (dataA instanceof Date) {
                return (Dates.shortDate(dataA) === Dates.shortDate(dataB as any as Date));
            }

            return (dataA === dataB);
        }

        /**...........................................................................
         * _onClear
         * ...........................................................................
         * Handle clearing data from this element
         * ...........................................................................
         */
        public _onClear(): void {
            this._data = [];

            // unselect everything
            for (let idx = (this._selectedBtns.length - 1); idx >= 0; idx -= 1) {
                let elem: HTMLElement = this._selectedBtns[idx];
                removeClass(elem, "selected");
                this._selectedBtns.splice(idx, 1);
            };
        }

    }
}