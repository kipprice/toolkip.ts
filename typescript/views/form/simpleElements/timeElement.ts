namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class TimeElement
     * ----------------------------------------------------------------------------
     * create a time element for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class TimeElement extends FormElement<Date> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.TIME; }
        protected get _defaultValue(): Date { return null; }
        protected get _defaultCls(): string { return "time"; }

        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        protected _onChange(): boolean {
            let value: string = this._elems.input.value;
            let dateValue: Date = Dates.inputToDate("", value);

            return this._standardValidation(dateValue);
        }

        protected _createClonedElement(appendToID: string): TimeElement {
            return new TimeElement(this._id + appendToID, this);
        }

        public update(data: Date): void {
            this._data = data;
            if (!this._elems.input) { return; }
            if (!this._data) { return; }
            this._elems.input.value = Dates.shortTime(data);
        }
    }
}