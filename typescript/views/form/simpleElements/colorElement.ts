namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class   ColorElement
     * ----------------------------------------------------------------------------
     * Creates a form element for collecting colors
     * @version 1.0.0
     * @author  Kip Price
     * ----------------------------------------------------------------------------
     */
    export class ColorElement extends FormElement<string> {

        /** type of element */
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.COLOR; }

        /** default value to use */
        protected get _defaultValue(): string { return "#000000"; }

        /** default CSS class to use */
        protected get _defaultCls(): string { return "color"; }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * Create elements for this form element
         */
        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * Handle the change event for this input
         */
        protected _onChange(): boolean {
            let value: string = this._elems.input.value;
            return this._standardValidation(value);
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Clone this element
         * @param   appendToID  Additional ID piece to use
         */
        protected _createClonedElement(appendToID: string): ColorElement {
            return new ColorElement(this._id + appendToID, this);
        }
    }
}