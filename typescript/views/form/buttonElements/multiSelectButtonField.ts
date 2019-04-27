namespace KIP.Forms {

    export interface IFormMultiSelectButtonTemplate<T> extends IFormToggleButtonTemplate<T[]> {
        options?: IToggleBtnOption<T>[];
    }
    
    /**----------------------------------------------------------------------------
     * @class   MultiSelectButtonField
     * ----------------------------------------------------------------------------
     * toggle buttons as multi-select options
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class MultiSelectButtonField<M, T extends IFormMultiSelectButtonTemplate<M> = IFormMultiSelectButtonTemplate<M>> extends ToggleButtonField<M[], T> {

        //.....................
        //#region PROPERTIES
        
        protected _selectedBtns: HTMLElement[];
        protected get _multiSelect(): boolean { return true; }
        protected get _defaultValue(): M[] { return []; }
        protected _options: IToggleBtnOption<M>[];

        //#endregion
        //.....................

        /**
         * MultiSelectButtonElem
         * ----------------------------------------------------------------------------
         * Create the multi select form
         * @param id 
         * @param template 
         */
        constructor(id: string, template: T | MultiSelectButtonField<M, T>) {
            super(id, template);
        }

        /**
         * _parseFieldTemplate
         * ----------------------------------------------------------------------------
         * @param template 
         */
        protected _parseFieldTemplate(template: T): void {
            super._parseFieldTemplate(template);
            this._selectedBtns = [];
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * @param data 
         */
        public update(data: M[], allowEvents: boolean): void {
            if (isNullOrUndefined(data)) { return; }

            this.clear();

            // map all of the elements
            data.map((elem: M) => {
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
        protected _shouldBeSelected(elem: IToggleBtnOption<M>): boolean {
            let dIdx: number = this._indexOf(elem.value);
            return (dIdx !== -1);
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * @param appendToID 
         */
        protected _createClonedElement(appendToID: string): MultiSelectButtonField<M, T> {
            return new MultiSelectButtonField(this.id + appendToID, this);
        }

        /**
         * _selectBtn
         * ----------------------------------------------------------------------------
         * @param btn 
         * @param value 
         */
        protected _selectBtn(btn: HTMLElement, value: M): void {
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
        protected _indexOf(value: M): number {
            let outIdx: number = -1;
            for (let idx = 0; idx < this._data.length; idx += 1) {
                let elem: M = this._data[idx];
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
        protected _equalTo(dataA: M, dataB: M): boolean {
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
        public clear(): void {
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