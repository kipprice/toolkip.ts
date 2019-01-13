namespace KIP.Forms {
    
    export interface IFormSingleSelectButtonTemplate<T> extends IFormToggleButtonTemplate<T> {
        options?: IToggleBtnOption<T>[];
    }

    /**----------------------------------------------------------------------------
     * @class   SingleSelectButtonElem
     * ----------------------------------------------------------------------------
     * toggle buttons as equivalent to radio buttons
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
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

    }
}