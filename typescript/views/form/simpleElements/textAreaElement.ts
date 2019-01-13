namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class TextAreaElement
     * ----------------------------------------------------------------------------
     * create a text area element for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class TextAreaElement extends FormElement<string> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.TEXTAREA; }
        protected get _defaultValue(): string { return ""; }
        protected get _defaultCls(): string { return "textarea"; }

        protected _onCreateElements(): void {
            let input: HTMLInputElement = createInputElement(this._id, "input", "textarea", this._data);
            this._elems.input = input;
            this._createStandardLabel();
            this._handleStandardLayout();
        }

        protected _onChange(): boolean {
            let value: string = this._elems.input.value;
            value = value.replace(/\n/g, "<br>");
            value = value.replace(/    /g, "&nbsp;&nbsp;&nbsp;&nbsp;");
            return this._standardValidation(value);
        }

        protected _createClonedElement(appendToID: string): TextAreaElement {
            return new TextAreaElement(this._id + appendToID, this);
        }

        public update(data: string): void {
            this._data = data;
            if (!this._data) { return; }
            let displayStr: string = data.replace(/<br>/g, "\n");
            displayStr = displayStr.replace(/\&nbsp;/g, " ");
            this._elems.input.value = displayStr;
        }
    }
}