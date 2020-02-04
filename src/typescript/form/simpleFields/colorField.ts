namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class   ColorField
     * ----------------------------------------------------------------------------
     * Creates a form element for collecting colors
     * @version 1.0.1
     * @author  Kip Price
     * ----------------------------------------------------------------------------
     */
    export class ColorField extends Field<string> {

        /** type of element */
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.COLOR; }

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
        protected _getValueFromField(): string {
            let value: string = this._elems.input.value;
            return value;
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Clone this element
         * @param   appendToID  Additional ID piece to use
         */
        protected _createClonedElement(appendToID: string): ColorField {
            return new ColorField(this._id + appendToID, this);
        }
    }
}