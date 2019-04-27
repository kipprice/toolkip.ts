namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class TextField
     * ----------------------------------------------------------------------------
     * create a text element for a form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class TextField extends Field<string> {
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.TEXT; }
        protected get _defaultValue(): string { return ""; }
        protected get _defaultCls(): string { return "text"; }

        protected _onCreateElements(): void {
            this._createStandardLabeledInput(false);
            this._handleStandardLayout();
        }

        protected _getValueFromField(): string {
            let value: string = this._elems.input.value;
            return value;
        }

        protected _createClonedElement(appendToID: string): TextField {
            return new TextField(this._id + appendToID, this);
        }
    }
}