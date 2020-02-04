namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class Password
     * ----------------------------------------------------------------------------
     * create a  password element for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class PasswordField extends Field<string> {
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.PASSWORD; }
        protected get _defaultValue(): string { return ""; }
        protected get _defaultCls(): string { return "password"; }

        protected _onCreateElements(): void {
            this._createStandardLabeledInput(false);
            this._handleStandardLayout();
        }

        protected _getValueFromField(): string {
            let value: string = this._elems.input.value;
            return value;
        }

        protected _createClonedElement(appendToID: string): PasswordField {
            return new PasswordField(this._id + appendToID, this);
        }
    }
}