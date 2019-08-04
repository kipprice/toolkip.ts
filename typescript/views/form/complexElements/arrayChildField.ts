/// <reference path="./sectionField.ts" />

namespace KIP.Forms {

    export interface IArrayChildHTMLElements extends ICollapsibleHTMLElements {
        title: HTMLElement;
        closeBtn: HTMLElement;
        nextBtn: HTMLElement;
        prevBtn: HTMLElement;
    }

    export interface IArrayChildTemplate<T> extends IFormCollapsibleTemplate<T> {
        allowReordering?: boolean;
    }

    /**----------------------------------------------------------------------------
     * @class   ArrayChildField
     * ----------------------------------------------------------------------------
     * Keep track of a child of an array in the form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class ArrayChildField<M, T extends IArrayChildTemplate<M> = IArrayChildTemplate<M>> extends SectionField<M,T> {

        //.....................
        //#region PROPERTIES
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.ARRAY_CHILD; }
        protected get _defaultValue(): M { return {} as M; }
        protected get _defaultCls(): string { return "arrayChild"; }

        protected _config: T;
        protected _orderlistener: ArrayField<M>;
        protected _elems: IArrayChildHTMLElements;

        //#endregion
        //.....................

        //..................
        //#region STYLES

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem.array .formChildren .kipFormElem.arrayChild": {
                maxWidth: "calc(33% - 20px)",
                backgroundColor: "#FFF",
                borderRadius: "5px",
                boxShadow: "1px 1px 5px 2px rgba(0,0,0,.1)",
                marginRight: "20px",
                marginBottom: "10px",
                padding: "15px",

                nested: {

                    ".mobile.large &": {
                        maxWidth: "calc(50% - 20px)"
                    },

                    ".mobile &": {
                        maxWidth: "calc(100% - 20px)"
                    },

                    ".arrayChild": {
                        maxWidth: "100%"
                    },

                    ".formChildren" : {
                        margin:"10px",
                        marginTop: "0"
                    },

                    ".kipBtn:not(.new)": {
                        position: "absolute",
                        cursor: "pointer",
                        
                        transition: "all ease-in-out .2",
                        padding: "2px",
                        boxShadow: "none",
                        backgroundColor: "none",
                        color: "#555",
                        opacity: "0.5",

                        nested: {
                            "&.close": {
                                top: "2px",
                                left: "calc(100% - 25px)"
                            },

                            "&.next, &.prev": {
                                color: "<formTheme>",
                                padding: "0",
                                width: "20px",
                                height: "20px",
                                borderRadius: "0",
                                boxShadow: "none",
                                top: "calc(50% - 8px)",
                            },

                            "&.next": {
                                left: "calc(100% - 20px)",
                            },

                            "&.prev": {
                                left: "0",
                            }, 

                            "&:hover": {
                                transform: "scale(1.1)",
                                opacity: "0.8"
                            }
                        }
                    }
                }
            },

            ".formChildren > div.arrayChild:first-child .prev.kipBtn": {
                display: "none"
            },

            ".formChildren > div.arrayChild:last-child .next.kipBtn": {
                display: "none"
            }

        }

        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(ArrayChildField._uncoloredStyles, CollapsibleField._uncoloredStyles, Field._uncoloredStyles);
        }
        //#endregion
        //..................

        //..........................................
        //#region CONSTRUCT AN ARRAY CHILD ELEMENT

        /** create an element of an array */
        constructor(id: string, children: IFields<M> | Field<M>, template?: T) {
            super(id? id.toString(): "", template || {} as any, children);
        }

        protected _onCreateElements(): void {

            if (this._config.allowReordering) {
                this._elems.nextBtn = createElement({
                    cls: "next kipBtn",
                    content: "&#x276F;",
                    parent: this._elems.base,
                    eventListeners: {
                        click: () => { this._changeOrder(DirectionType.FORWARD); }
                    }
                });

                this._elems.prevBtn = createElement({
                    cls: "prev kipBtn",
                    content: "&#x276E;",
                    parent: this._elems.base,
                    eventListeners: {
                        click: () => { this._changeOrder(DirectionType.BACKWARD); }
                    }
                });
            }

            this._elems.closeBtn = createElement({
                cls: "close kipBtn", 
                content: "&#x2715;", 
                parent: this._elems.base,
                eventListeners: {
                    click: () => { this._delete(); }
                }
            });

            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null, this._elems.base);
        }

        protected _createClonedElement(appendToID: string): ArrayChildField<M,T> {
            return new ArrayChildField<M,T>(this._id + appendToID, this._children);
        }

        protected _cloneFormElement(child: Field<any>): Field<any> {
            return super._cloneFormElement(child, "|" + this._id);
        }
        //#endregion
        //..........................................

        //...........................
        //#region HANDLE DELETION

        protected _delete(): void {
            this._elems.base.parentNode.removeChild(this._elems.base);
            this._data = null;
            this._dispatchChangeEvent();
        }

        /**
         * _updateInternalData
         * ----------------------------------------------------------------------------
         * handle updating parent elements with the details of this child
         */
        protected async _updateInternalData(internalOnly?: boolean): Promise<any> {

            // if we purposefully set the data to null, don't go further
            if (this._data === null) { return null; }

            // otherwise run the standard update function
            return super._updateInternalData(internalOnly);
        }

        //#endregion
        //...........................

        //.................................
        //#region HANDLE ORDER CHANGING

        public addOrderingListener(orderListener: ArrayField<M>): void {
            this._orderlistener = orderListener;
        }

        protected _changeOrder(direction: DirectionType): void {
            if (!this._orderlistener) { return; }
            this._orderlistener.onChangeOrder(this, direction)
        }
        
        //#endregion
        //.................................
    }
}