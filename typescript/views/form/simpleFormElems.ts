///<reference path="formElement.ts" />

namespace KIP.Forms {

    /**...........................................................................
     * @class CheckElement
     * ...........................................................................
     * create a checkbox form element
     * @version 1.0
     * ...........................................................................
     */
    export class CheckElement extends FormElement<boolean> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.CHECKBOX; }
        protected get _defaultValue(): boolean { return false; }
        protected get _defaultCls(): string { return "check"; }
        protected get _layout(): FormElementLayoutEnum { return FormElementLayoutEnum.LABEL_AFTER; }

        protected _elems: {
            core: HTMLElement;
            error?: HTMLElement;
            lbl?: HTMLElement;
            input?: HTMLInputElement;
            inputBox?: HTMLElement;
            inputInnerBox?: HTMLElement;
            innerLbl?: HTMLElement;
        }

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            '.kipFormElem input[type="checkbox"]': {
                display: "none",
                zoom: "1.5",
                width: "18px",
                height: "18px",
                margin: "0",
                marginRight: "5px",
                border: "1px solid <0>"
            },

            ".kipFormElem input[type='checkbox'] + label": {
                display: "flex"
            },

            '.kipFormElem input[type="checkbox"] + label .inputBox': {
                width: "18px",
                height: "18px",
                margin: "0",
                marginRight: "5px",
                border: "1px solid <0>",
                position: "relative",
                boxSizing: "content-box",
                flexShrink: "0",
                marginTop: "4px"
            },

            ".kipFormElem input[type='checkbox'] + label .inputBox .innerInputBox": {
                position: "absolute",
                width: "0",
                height: "0",
                left: "9px",
                top: "9px",
                backgroundColor: "<0>",
                transition: "all ease-in-out .1s"
            },

            ".kipFormElem input[type='checkbox']:checked + label .inputBox .innerInputBox, .kipFormElem input[type='checkbox']:checked + label:hover .inputBox .innerInputBox": {
                left: "2px",
                top: "2px",
                width: "14px",
                height: "14px"
            },

            ".kipFormElem input[type='checkbox'] + label:hover .inputBox .innerInputBox": {
                left: "4px",
                top: "4px",
                width: "10px",
                height: "10px",
                opacity: "0.7"
            },

            ".kipFormElem.check input[type='checkbox'] + label .innerLbl": {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                fontSize: "0.9em",
                paddingTop: "3px"
            }
        };

        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(CheckElement._uncoloredStyles, FormElement._uncoloredStyles);
        }

        /** create the check elements */
        protected _onCreateElements(): void {
            this._createStandardInput();

            // Create the custom UI for the checkbox
            this._elems.lbl = createLabelForInput("", this._id + "|input", "", this._elems.core);
            this._elems.inputBox = createSimpleElement("", "inputBox", "", null, null, this._elems.lbl);
            this._elems.inputInnerBox = createSimpleElement("", "innerInputBox", "", null, null, this._elems.inputBox);

            this._elems.innerLbl = createSimpleElement("", "innerLbl", this._label, null, null, this._elems.lbl);

            this._handleStandardLayout();
        }

        /** handle when the checkbox is clicked */
        protected _onChange(): boolean {
            let value: boolean = (this._elems.input as HTMLInputElement).checked;
            return this._standardValidation(value);
        }

        /** clone the appropriate element */
        protected _createClonedElement(appendToID: string): CheckElement {
            return new CheckElement(this._id + appendToID, this);
        }

        /** update the contents of the element */
        public update(data: boolean): void {
            this._data = data;
            this._elems.input.checked = data;
        }
    }

    /**...........................................................................
     * @class TextElement
     * ...........................................................................
     * create a text element for a form
     * @version 1.0
     * ...........................................................................
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

    /**...........................................................................
     * @class TextAreaElement
     * ...........................................................................
     * create a text area element for a form
     * @version 1.0
     * ...........................................................................
     */
    export class TextAreaElement extends FormElement<string> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.TEXTAREA; }
        protected get _defaultValue(): string { return ""; }
        protected get _defaultCls(): string { return "textarea"; }

        protected _onCreateElements(): void {
            let input: HTMLInputElement = createInputElement(this._id, "input", "textarea", this._data);
            this._elems.input = input;
            this._elems.lbl = createLabelForInput(this._label, this._id, "lbl");
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

    /**...........................................................................
     * @class DateElement
     * ...........................................................................
     * create a date element for a form
     * @version 1.0
     * ...........................................................................
     */
    export class DateElement extends FormElement<Date> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.DATE; }
        protected get _defaultValue(): Date { return null; }
        protected get _defaultCls(): string { return "date"; }

        /** create the display for the date element */
        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        protected _onChange(): boolean {

            // first convert the string value to a date
            let value: string = this._elems.input.value;
            let dateValue: Date = Dates.inputToDate(value);

            // run standard validations
            return this._standardValidation(dateValue);
        }

        protected _createClonedElement(appendToID: string): DateElement {
            return new DateElement(this._id + appendToID, this);
        }

        public update(data: Date): void {
            this._data = data;
            if (!this._elems.input) { return; }
            if (!this._data) { return; }
            this._elems.input.value = Dates.inputDateFmt(data);
        }
    }

    /**...........................................................................
     * @class TimeElement
     * ...........................................................................
     * create a time element for a form
     * @version 1.0
     * ...........................................................................
     */
    export class TimeElement extends FormElement<Date> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.TIME; }
        protected get _defaultValue(): Date { return null; }
        protected get _defaultCls(): string { return "time"; }

        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        protected _onChange(): boolean {
            let value: string = this._elems.input.value;
            let dateValue: Date = Dates.inputToDate("", value);

            return this._standardValidation(dateValue);
        }

        protected _createClonedElement(appendToID: string): TimeElement {
            return new TimeElement(this._id + appendToID, this);
        }

        public update(data: Date): void {
            this._data = data;
            if (!this._elems.input) { return; }
            if (!this._data) { return; }
            this._elems.input.value = Dates.shortTime(data);
        }
    }

    /**...........................................................................
     * @class DateTimeElement
     * ...........................................................................
     * create an element to collect date and time for a form
     * @version 1.0
     * ...........................................................................
     */
    export class DateTimeElement extends FormElement<Date> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.DATE_TIME; }
        protected get _defaultValue(): Date { return null; }
        protected get _defaultCls(): string { return "dateTime"; }

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem.dateTime .inputs": {
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap"
            },

            ".kipFormElem.dateTime .inputs input": {
                marginRight: "20px",
                flexGrow: "1",
                minWidth: "150px"
            },

            ".kipFormElem.dateTime .inputs .lbl": {
                flexShrink: "1",
                maxWidth: "50px",
                marginTop: "4px"
            }
        }

        protected _elems: {
            core: HTMLElement;
            label: HTMLElement;
            inputWrapper: HTMLElement;
            timeInput: HTMLInputElement;
            dateInput: HTMLInputElement;
        }

        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.core);
            this._elems.inputWrapper = createSimpleElement("", "inputs", "", null, null, this._elems.core);

            // draw the date
            let dateLbl: HTMLElement = createSimpleElement("", "lbl", "Date: ", null, null, this._elems.inputWrapper);
            this._elems.dateInput = createInputElement("", "dateInput", "date", this._data, null, null, this._elems.inputWrapper);
            this._elems.dateInput.addEventListener("change", () => {
                this._changeEventFired();
            });

            // draw the time
            let timeVal: string = (this._data ? Dates.shortTime(this._data) : "");
            let timeLbl: HTMLElement = createSimpleElement("", "lbl", "Time: ", null, null, this._elems.inputWrapper);
            this._elems.timeInput = createInputElement("", "timeInput", "time", timeVal, null, null, this._elems.inputWrapper);
            this._elems.timeInput.addEventListener("change", () => {
                this._changeEventFired();
            });
        }

        protected _onChange(): boolean {
            let timeStr: string = this._elems.timeInput.value;
            let dateStr: string = this._elems.dateInput.value;
            let date: Date = Dates.inputToDate(dateStr, timeStr);

            return this._standardValidation(date);
        }

        protected _createClonedElement(appendToID: string): DateTimeElement {
            return new DateTimeElement(this._id + appendToID, this);
        }

        public update(data: Date): void {
            this._onClear();

            this._data = data;

            if (!this._data) { return; }

            if (this._elems.dateInput) {
                this._elems.dateInput.value = Dates.inputDateFmt(data);
            }

            if (this._elems.timeInput) {
                this._elems.timeInput.value = Dates.shortTime(data);
            }
        }


    }

    /**...........................................................................
     * @class SelectElement
     * ...........................................................................
     * create a dropdown for a form
     * @version 1.0
     * ...........................................................................
     */
    export class SelectElement extends FormElement<number> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.SELECT; }
        protected get _defaultValue(): number { return 0; }
        protected get _defaultCls(): string { return "select"; }
        protected _options: ISelectOptions;

        protected _elems: {
            core: HTMLElement;
            input: HTMLSelectElement;
            lbl: HTMLElement;
        }

        /** create the select element */
        constructor(id: string, template: IFormSelectTemplate | SelectElement) {
            super(id, template);
        }

        /** handle cloning an additional element */
        protected _cloneFromFormElement(data: SelectElement): void {
            super._cloneFromFormElement(data);
            this._options = data._options;
        }

        protected _parseElemTemplate(template: IFormSelectTemplate): void {
            super._parseElemTemplate(template);
            this._options = template.options;
        }

        protected _onCreateElements(): void {
            this._elems.input = createSelectElement(this._id, "input", this._options);
            this._createStandardLabel();
            this._handleStandardLayout();
        }

        protected _onChange(): boolean {
            let value: number = +this._elems.input.value;
            return this._standardValidation(value);
        }

        protected _createClonedElement(appendToID: string): SelectElement {
            return new SelectElement(this._id + appendToID, this);
        }
    }

    /**...........................................................................
     * @class NumberElement
     * ...........................................................................
     * create a number element for a form
     * @version 1.0
     * ...........................................................................
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

    /**...........................................................................
     * @class   ColorElement
     * ...........................................................................
     * Creates a form element for collecting colors
     * @version 18.2.25
     * @author  Kip Price
     * ...........................................................................
     */
    export class ColorElement extends FormElement<string> {

        /** type of element */
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.COLOR; }

        /** default value to use */
        protected get _defaultValue(): string { return "#000000"; }

        /** default CSS class to use */
        protected get _defaultCls(): string { return "color"; }

        /**...........................................................................
         * _onCreateElements
         * ...........................................................................
         * Create elements for this form element
         * ...........................................................................
         */
        protected _onCreateElements(): void {
            this._createStandardLabeledInput();
            this._handleStandardLayout();
        }

        /**...........................................................................
         * _onChange
         * ...........................................................................
         * Handle the change event for this input
         * ...........................................................................
         */
        protected _onChange(): boolean {
            let value: string = this._elems.input.value;
            return this._standardValidation(value);
        }

        /**...........................................................................
         * _createClonedElement
         * ...........................................................................
         * Clone this element
         * @param   appendToID  Additional ID piece to use
         * ...........................................................................
         */
        protected _createClonedElement(appendToID: string): ColorElement {
            return new ColorElement(this._id + appendToID, this);
        }
    }

    /**...........................................................................
     * @class HiddenElement
     * ...........................................................................
     * handle a data element that will be set, but not displayed to the user 
     * @version 1.0
     * ...........................................................................
     */
    export class HiddenElement<T> extends FormElement<T> {
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            "kipFormElem.hidden": {
                display: "none"
            }
        }
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.HIDDEN; }
        protected get _defaultCls(): string { return "hidden"; }
        protected get _defaultValue(): T { return null; }

        protected _onCreateElements(): void { }
        protected _onChange(): boolean {
            return true;
        }

        protected _createClonedElement(appendToID: string): HiddenElement<T> {
            return new HiddenElement<T>(this.id + appendToID, this);
        }

        public save(): T {
            return this._data;
        }

    }

}