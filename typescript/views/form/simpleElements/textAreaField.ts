namespace KIP.Forms {
    
    /**----------------------------------------------------------------------------
     * @class TextAreaField
     * ----------------------------------------------------------------------------
     * create a text area element for a form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class TextAreaField extends Field<string> {
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.TEXTAREA; }
        protected get _defaultValue(): string { return ""; }
        protected get _defaultCls(): string { return "textarea"; }

        protected _onCreateElements(): void {
            let input: HTMLInputElement = createInputElement(this._id, "input", "textarea", this._data);
            if (this._config.useGhostText) { input.placeholder = this._config.label || ""; }
            this._elems.input = input;
            
            this._createStandardLabel();
            this._handleStandardLayout();
        }

        protected _getValueFromField(): string {
            let value: string = this._elems.input.value;
            value = value.replace(/\n/g, "<br>");
            value = value.replace(/    /g, "&nbsp;&nbsp;&nbsp;&nbsp;");
            return value;
        }

        protected _createClonedElement(appendToID: string): TextAreaField {
            return new TextAreaField(this._id + appendToID, this);
        }

        public update(data: string, allowEvents: boolean): void {
            if (isNullOrUndefined(data)) { data = ""; }
            this._data = data;
            
            let displayStr: string = data.replace(/<br>/g, "\n");
            displayStr = displayStr.replace(/\&nbsp;/g, " ");
            this._elems.input.value = displayStr;
        }
    }
}