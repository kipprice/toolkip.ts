namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class TextElement
     * ----------------------------------------------------------------------------
     * create a text element for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class TextElement extends FormElement<string> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.TEXT; }
        protected get _defaultValue(): string { return ""; }
        protected get _defaultCls(): string { return "text"; }

        protected _onCreateElements(): void {
            this._createStandardLabeledInput(false);
            this._handleStandardLayout();
        }

        protected _onChange(fieldStillHasFocis: boolean): boolean {
            let value: string = this._elems.input.value;
            return this._standardValidation(value);
        }

        protected _createClonedElement(appendToID: string): TextElement {
            return new TextElement(this._id + appendToID, this);
        }
    }
}