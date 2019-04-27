namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class TimeField
     * ----------------------------------------------------------------------------
     * create a time element for a form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class TimeField extends Field<Date> {
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.TIME; }
        protected get _defaultValue(): Date { return null; }
        protected get _defaultCls(): string { return "time"; }

        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        protected _getValueFromField(): Date {
            let value: string = this._elems.input.value;
            let dateValue: Date = Dates.inputToDate("", value);

            return dateValue;
        }

        protected _createClonedElement(appendToID: string): TimeField {
            return new TimeField(this._id + appendToID, this);
        }

        public update(data: Date, allowEvents: boolean): void {
            this._data = data;
            if (!this._elems.input) { return; }
            if (!this._data) { return; }
            this._elems.input.value = Dates.shortTime(data);
        }
    }
}