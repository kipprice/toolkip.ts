namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class HiddenElement
     * ----------------------------------------------------------------------------
     * handle a data element that will be set, but not displayed to the user 
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
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