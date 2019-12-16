/// <reference path="./arrayField.ts" />
/// <reference path="./arrayChildField.ts" />

namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class	TabledArrayField
     * ----------------------------------------------------------------------------
     * keep track of array data in a table in lieu of the standard cards
     * @author	Kip Price
     * @version	0.5.1
     * ----------------------------------------------------------------------------
     */
    export class TabledArrayField<M, T extends IFormArrayTemplate<M> = IFormArrayTemplate<M>> extends ArrayField<M,T> {
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
                TabledArrayField._uncoloredStyles,
                ArrayField._uncoloredStyles
            );
        }

        protected _generateChildElement(): TableRowField<M> {
            let idx: number = this._children.length;
            let elem: TableRowField<M>;
            
            // if this is already an element, just clone it
            if (isArrayChildElement(this._childTemplate)) {
                elem = this._cloneFormElement(this._childTemplate, this._id + "|" + idx.toString()) as TableRowField<M>;
            
            // otherwise, spin up a new child altogether
            } else {
                elem = new TableRowField(this._id + "|" + idx.toString(), this._childTemplate);
            }
            return elem;
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * generate the elements that make up the tabled element
         */
        protected _onCreateElements(): void {

            // show the title
            this._createCollapsibleTitle();

            // handle showing the children
            this._elems.childrenContainer = createElement({type: "table", cls: "formChildren", parent: this._elems.base});
            window.setTimeout(() => { this._createEmptyRow(); }, 100);
            
            // add a new row that can be added to
            this._createStyles();
        }

        public update(data: M[], allowEvents: boolean): void {
            super.update(data, allowEvents);
            this._createEmptyRow();
        }

        protected _createEmptyRow(): void {
            let row: HTMLTableRowElement = (this._elems.childrenContainer as HTMLTableElement).insertRow();
            let cellCnt: number;

            // if this is already an element, only spin up a single new input
            if (isField(this._childTemplate)) {
                this._createEmptyCell(row, this._childTemplate);
                this._addEnterListener(this._childTemplate.input, row);
            
            // otherwise, spin up a new set of inputs
            } else {
                let lastValue: Field<any>;
                map(this._childTemplate, (value: Field<any>) => {
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

        protected _createEmptyCell(row: HTMLTableRowElement, value: Field<any>): HTMLTableCellElement {
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

        protected _createClonedElement(appendToID: string): TabledArrayField<M,T> {
            return new TabledArrayField<M,T>(this._id + appendToID, this);
        }
    }

    /**----------------------------------------------------------------------------
     * @class	TableRowElement
     * ----------------------------------------------------------------------------
     * generate a row of a tabled array
     * @author	Kip Price
     * @version	0.5.1
     * ----------------------------------------------------------------------------
     */
    export class TableRowField<M, T extends IArrayChildTemplate<M> = IArrayChildTemplate<M>> extends ArrayChildField<M,T> {

        //.....................
        //#region PROPERTIES
        
        protected get _defaultCls(): string { return "tableRow"; }
        protected _currentRow: HTMLTableRowElement;
        
        //#endregion
        //.....................

        protected _createClonedElement(appendToID: string): TableRowField<M,T> {
            return new TableRowField<M,T>(this._id + appendToID, this);
        }

        protected _onCreateElements(): void {
            this._elems.base = createElement({type: "tr", cls: "formChildren", parent: this._elems.base});
        }

        /**
         * parseChild
         * ----------------------------------------------------------------------------
         * Go through our children array and create the individual children
         * 
         * @param   child   The element to parse
         */
        protected _parseChild(child: Field<any>): Field<any> {
            let elem: Field<any> = this._cloneFormElement(child);

            this._applyColors(elem);

            // draw into the appropriate cell
            let cell: HTMLTableCellElement = (this._elems.base as HTMLTableRowElement).insertCell();
            elem.draw(cell);

            // add the appropriate listeners
            formEventHandler.addEventListener(FORM_ELEM_CHANGE, {
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

        /**
         * isEmpty
         * ----------------------------------------------------------------------------
         * check if this row is considered empty
         */
        public isEmpty(): boolean {
            let isEmpty: boolean = false;
            // TODO: actually check for empty elements
            return isEmpty;
        }
    }
}