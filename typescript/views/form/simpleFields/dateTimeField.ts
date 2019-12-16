namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class DateTimeField
     * ----------------------------------------------------------------------------
     * create an element to collect date and time for a form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class DateTimeField extends Field<Date> {
        
        //.....................
        //#region PROPERTIES
        
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.DATE_TIME; }
        protected get _defaultValue(): Date { return null; }
        protected get _defaultCls(): string { return "dateTime"; }
        
        //#endregion
        //.....................

        //..........................................
        //#region STYLES
        
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem.dateTime .inputs": {
                display: "flex",
                width: "100%",
                alignItems: "center",
                flexWrap: "wrap",

                nested: {
                    ".dateWrapper": {
                        marginRight: "10px"
                    }
                }
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
        
        //#endregion
        //..........................................

        //..........................................
        //#region HTML ELEMENTS
        
        protected _elems: {
            base: HTMLElement;
            label: HTMLElement;
            inputWrapper: HTMLElement;
            timeInput: HTMLInputElement;
            dateInput: HTMLInputElement;
        }
        
        //#endregion
        //..........................................

        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.base);
            this._elems.inputWrapper = createSimpleElement("", "inputs", "", null, null, this._elems.base);

            // draw the date
            let dateWrapper = KIP.createElement({ cls: "dateWrapper", parent: this._elems.inputWrapper })
            let dateLbl: HTMLElement = createSimpleElement("", "lbl", "Date: ", null, null, dateWrapper);
            this._elems.dateInput = createInputElement("", "dateInput", "date", this._data, null, null, dateWrapper);
            this._elems.dateInput.addEventListener("change", () => {
                this._changeEventFired();
            });

            // draw the time
            let timeVal: string = (this._data ? Dates.shortTime(this._data) : "");
            let timeWrapper = KIP.createElement({ cls: "timeWrapper", parent: this._elems.inputWrapper })
            let timeLbl: HTMLElement = createSimpleElement("", "lbl", "Time: ", null, null, timeWrapper);
            this._elems.timeInput = createInputElement("", "timeInput", "time", timeVal, null, null, timeWrapper);
            this._elems.timeInput.addEventListener("change", () => {
                this._changeEventFired();
            });
        }

        protected _getValueFromField(): Date {
            let timeStr: string = this._elems.timeInput.value;
            let dateStr: string = this._elems.dateInput.value;
            let date: Date = Dates.inputToDate(dateStr, timeStr);

            return date;
        }

        protected _createClonedElement(appendToID: string): DateTimeField {
            return new DateTimeField(this._id + appendToID, this);
        }

        public update(data: Date, allowEvents: boolean): void {
            this.clear();

            this._data = data;

            if (!this._data) { return; }

            if (this._elems.dateInput) {
                this._elems.dateInput.value = Dates.inputDateFmt(data);
            }

            if (this._elems.timeInput) {
                this._elems.timeInput.value = Dates.inputTimeFmt(data);
            }
        }


    }
}