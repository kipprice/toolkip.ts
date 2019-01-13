namespace KIP.Forms {
    
     /**----------------------------------------------------------------------------
     * @class DateElement
     * ----------------------------------------------------------------------------
     * create a date element for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class DateElement extends FormElement<Date> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.DATE; }
        protected get _defaultValue(): Date { return null; }
        protected get _defaultCls(): string { return "date"; }

        /** create the display for the date element */
        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        protected _onChange(): boolean {

            // first convert the string value to a date
            let value: string = this._elems.input.value;
            let dateValue: Date = Dates.inputToDate(value);

            // run standard validations
            return this._standardValidation(dateValue);
        }

        protected _createClonedElement(appendToID: string): DateElement {
            return new DateElement(this._id + appendToID, this);
        }

        public update(data: Date): void {
            this._data = data;
            if (!this._elems.input) { return; }
            if (!this._data) { return; }
            this._elems.input.value = Dates.inputDateFmt(data);
        }
    }
}