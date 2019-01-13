/// <reference path="./arrayElement.ts" />
/// <reference path="./arrayChildElement.ts" />

namespace KIP.Forms {
    export class TabledArrayElement<T> extends ArrayElement<T> {
        protected get _defaultCls(): string { return "tableArray"; }
        protected _emptyRow: HTMLTableRowElement;

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".tableArray": {
                width: "100%",

                nested: {
                    "table.formChildren": {
                        width: "100%"
                    },

                    "tr + tr": {
                        nested: {
                            ".labelContainer": {
                                display: "none"
                            },

                            ".kipFormElem": {
                                marginTop: "0"
                            }
                        }
                    }
                }
            }
        }

        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(
                TabledArrayElement._uncoloredStyles,
                ArrayElement._uncoloredStyles
            );
        }

        protected _generateChildElement(): TableRowElement<T> {
            let idx: number = this._children.length;
            let elem: TableRowElement<T>;
            
            // if this is already an element, just clone it
            if (isArrayChildElement(this._childTemplate)) {
                elem = this._cloneFormElement(this._childTemplate, this._id + "|" + idx.toString()) as TableRowElement<T>;
            
            // otherwise, spin up a new child altogether
            } else {
                elem = new TableRowElement(this._id + "|" + idx.toString(), this._childTemplate);
            }
            return elem;
        }

        /** create the elements for the array */
        protected _onCreateElements(): void {

            // show the title
            this._createCollapsibleTitle();

            // handle showing the children
            this._elems.childrenContainer = createElement({type: "table", cls: "formChildren", parent: this._elems.core});
            window.setTimeout(() => { this._createEmptyRow(); }, 100);
            
            // add a new row that can be added to
            this._createStyles();
        }

        public update(data: T[]): void {
            super.update(data);
            this._createEmptyRow();
        }

        protected _createEmptyRow(): void {
            let row: HTMLTableRowElement = (this._elems.childrenContainer as HTMLTableElement).insertRow();
            let cellCnt: number;

            // if this is already an element, only spin up a single new input
            if (isFormElement(this._childTemplate)) {
                this._createEmptyCell(row, this._childTemplate);
                this._addEnterListener(this._childTemplate.input, row);
            
            // otherwise, spin up a new set of inputs
            } else {
                let lastValue: FormElement<any>;
                map(this._childTemplate, (value: FormElement<any>) => {
                    this._createEmptyCell(row, value);
                    lastValue = value;
                });
                this._addEnterListener(lastValue.input, row);
            }

            this._emptyRow = row;
        }

        protected _addEnterListener(input: EvaluableElem, row: HTMLTableRowElement): void {
            input.addEventListener("keypress", (event: KeyboardEvent) => {
                if (event.keyCode !== 13) { return; }
                this._handleEmptyCellSelect(row);
            })
        }

        protected _handleEmptyCellSelect(row: HTMLTableRowElement): void {
            this._removeEmptyRow(row);
            let elem = this._createNewChild();
            this._createEmptyRow();
            window.setTimeout(() => {this._addEnterListener(elem.input, this._emptyRow); }, 101);
            elem.focus();
        }

        protected _createEmptyCell(row: HTMLTableRowElement, value: FormElement<any>): HTMLTableCellElement {
            let cell: HTMLTableCellElement = row.insertCell();
            if (!value.input) { return; }
            let input = value.input.cloneNode();
            cell.appendChild(input);

            input.addEventListener("focus", () => {
                this._handleEmptyCellSelect(row);
            });
        }

        protected _removeEmptyRow(row: HTMLTableRowElement): void {
            if (!row.parentNode) { return; }
            row.parentNode.removeChild(row);
        }

        protected _createClonedElement(appendToID: string): TabledArrayElement<T> {
            return new TabledArrayElement<T>(this._id + appendToID, this);
        }
    }

    export class TableRowElement<T> extends ArrayChildElement<T> {
        protected get _defaultCls(): string { return "tableRow"; }
        protected _currentRow: HTMLTableRowElement;

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            
        }

        protected _createClonedElement(appendToID: string): TableRowElement<T> {
            return new TableRowElement<T>(this._id + appendToID, this);
        }

        protected _onCreateElements(): void {
            this._elems.core = createElement({type: "tr", cls: "formChildren", parent: this._elems.core});
        }

        /**...........................................................................
         * parseChild
         * ...........................................................................
         * Go through our children array and create the individual children
         * 
         * @param   child   The element to parse
         * ...........................................................................
         */
        protected _parseChild(child: FormElement<any>): FormElement<any> {
            let elem: FormElement<any> = this._cloneFormElement(child);

            this._applyColors(elem);

            // draw into the appropriate cell
            let cell: HTMLTableCellElement = (this._elems.core as HTMLTableRowElement).insertCell();
            elem.render(cell);

            // add the appropriate listeners
            Events.addEventListener(FORM_ELEM_CHANGE, {
                func: (event: FormElemChangeEvent<any>) => {
                    let key: string = event.context.key;
                    if (key !== elem.id) { return; }

                    window.setTimeout(() => {
                        this._updateInternalData(true);
                        this._dispatchChangeEvent();
                    }, 0);
                },
                uniqueId: this._id + "|" + elem.id
            });

            return elem;
        }

        public isEmpty(): boolean {
            let isEmpty: boolean = false;
            // TODO: actually check for empty elements
            return isEmpty;
        }
    }
}