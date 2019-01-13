namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class NumberElement
     * ----------------------------------------------------------------------------
     * create a number element for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class NumberElement extends FormElement<number> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.NUMBER; }
        protected get _defaultValue(): number { return 0; }
        protected get _defaultCls(): string { return "number"; }

        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        protected _onChange(): boolean {
            let value: number = +this._elems.input.value;
            return this._standardValidation(value);
        }

        protected _createClonedElement(appendToID: string): NumberElement {
            return new NumberElement(this._id + appendToID, this);
        }
    }
}