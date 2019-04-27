namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class NumberField
     * ----------------------------------------------------------------------------
     * create a number element for a form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class NumberField extends Field<number> {
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.NUMBER; }
        protected get _defaultValue(): number { return 0; }
        protected get _defaultCls(): string { return "number"; }

        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        protected _getValueFromField(): number {
            let value: number = +this._elems.input.value;
            return value;
        }

        protected _createClonedElement(appendToID: string): NumberField {
            return new NumberField(this._id + appendToID, this);
        }
    }
}