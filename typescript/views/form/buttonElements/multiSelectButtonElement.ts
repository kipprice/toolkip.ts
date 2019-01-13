namespace KIP.Forms {

    export interface IFormMultiSelectButtonTemplate<T> extends IFormToggleButtonTemplate<T[]> {
        options?: IToggleBtnOption<T>[];
    }
    
    /**----------------------------------------------------------------------------
     * @class   MultiSelectButtonElem
     * ----------------------------------------------------------------------------
     * toggle buttons as multi-select options
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class MultiSelectButtonElem<T> extends ToggleButtonElement<T[]> {

        //.....................
        //#region PROPERTIES
        
        protected _selectedBtns: HTMLElement[];
        protected get _multiSelect(): boolean { return true; }
        protected get _defaultValue(): T[] { return []; }
        protected _options: IToggleBtnOption<T>[];

        //#endregion
        //.....................

        /**
         * MultiSelectButtonElem
         * ----------------------------------------------------------------------------
         * Create the multi select form
         * @param id 
         * @param template 
         */
        constructor(id: string, template: IFormMultiSelectButtonTemplate<T> | MultiSelectButtonElem<T>) {
            super(id, template);
        }

        /**
         * _parseElemTemplate
         * ----------------------------------------------------------------------------
         * @param template 
         */
        protected _parseElemTemplate(template: IFormMultiSelectButtonTemplate<T>): void {
            super._parseElemTemplate(template);
            this._selectedBtns = [];
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * @param data 
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

        /**
         * _shouldBeSelected
         * ----------------------------------------------------------------------------
         * @param   elem    The element to potentially select
         * @returns True if a specified button should be selected
         */
        protected _shouldBeSelected(elem: IToggleBtnOption<T>): boolean {
            let dIdx: number = this._indexOf(elem.value);
            return (dIdx !== -1);
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * @param appendToID 
         */
        protected _createClonedElement(appendToID: string): MultiSelectButtonElem<T> {
            return new MultiSelectButtonElem(this.id + appendToID, this);
        }

        /**
         * _selectBtn
         * ----------------------------------------------------------------------------
         * @param btn 
         * @param value 
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

        /**
         * _indexOf
         * ----------------------------------------------------------------------------
         * @param value 
         * @returns The index of the element in the array, or -1 if it isn't found
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

        /**
         * _equalTo
         * ----------------------------------------------------------------------------
         * Determine whether the data in this element is equivalent t 
         * @param dataA 
         * @param dataB 
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

        /**
         * _onClear
         * ----------------------------------------------------------------------------
         * Handle clearing data from this element
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