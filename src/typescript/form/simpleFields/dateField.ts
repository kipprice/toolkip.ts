namespace KIP.Forms {
    
     /**----------------------------------------------------------------------------
     * @class DateField
     * ----------------------------------------------------------------------------
     * create a date element for a form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class DateField extends Field<Date> {
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.DATE; }
        protected get _defaultValue(): Date { return null; }
        protected get _defaultCls(): string { return "date"; }

        /** create the display for the date element */
        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        protected _getValueFromField(): Date {

            // first convert the string value to a date
            let value: string = this._elems.input.value;
            let dateValue: Date = Dates.inputToDate(value);

            // run standard validations
            return dateValue;
        }

        protected _createClonedElement(appendToID: string): DateField {
            return new DateField(this._id + appendToID, this);
        }

        public update(data: Date, allowEvents: boolean): void {
            this._data = data;
            if (!this._elems.input) { return; }
            if (!this._data) { return; }
            this._elems.input.value = Dates.inputDateFmt(data);
        }

        protected _testEquality(newDate: Date): boolean {
            return (KIP.Dates.dateDiff(newDate, this._data) === 0);
        }
    }
}