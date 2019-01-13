namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class DateTimeElement
     * ----------------------------------------------------------------------------
     * create an element to collect date and time for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
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
}