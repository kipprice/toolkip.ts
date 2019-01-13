/// <reference path="./sectionElement.ts" />

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
     * @class   ArrayChildElement
     * ----------------------------------------------------------------------------
     * Keep track of a child of an array in the form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class ArrayChildElement<T> extends SectionElement<T> {

        //.....................
        //#region PROPERTIES
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.ARRAY_CHILD; }
        protected get _defaultValue(): T { return {} as T; }
        protected get _defaultCls(): string { return "arrayChild"; }

        protected _template: IArrayChildTemplate<T>;
        protected _orderlistener: ArrayElement<T>;
        protected _elems: IArrayChildHTMLElements;
        protected _allowReordering: boolean;
        //#endregion
        //.....................

        //..................
        //#region STYLES
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem.array .formChildren .kipFormElem.arrayChild": {
                maxWidth: "calc(33% - 20px)",
                backgroundColor: "#FFF",
                borderRadius: "5px",
                boxShadow: "1px 1px 5px 2px rgba(0,0,0,.2)",
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

                    ".kipBtn": {
                        position: "absolute",
                        cursor: "pointer",
                        top: "calc(50% - 8px)",
                        transition: "all ease-in-out .2",
                        padding: "2px",
                        boxShadow: "none",
                        backgroundColor: "none",
                        color: "#555",
                        opacity: "0.5",

                        nested: {
                            "&.close": {
                                top: "-10px",
                                opacity: "1",
                                color: "#FFF"
                            },

                            "&.next, &.prev": {
                                borderTop: "10px solid transparent",
                                borderBottom: "10px solid transparent",
                                padding: "0",
                                width: "20px",
                                height: "20px"
                            },

                            "&.next": {
                                left: "calc(100% - 20px)",
                                borderLeft: "10px solid <formTheme>"
                            },

                            "&.prev": {
                                left: "0",
                                borderRight: "10px solid <formTheme>",
                                borderTop: "10px solid transparent",
                                borderBottom: "10px solid transparent"
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
            return this._mergeThemes(ArrayChildElement._uncoloredStyles, CollapsibleElement._uncoloredStyles, FormElement._uncoloredStyles);
        }
        //#endregion
        //..................

        //..........................................
        //#region CONSTRUCT AN ARRAY CHILD ELEMENT

        /** create an element of an array */
        constructor(id: string, children: IFormElements<T> | FormElement<T>, template?: IArrayChildTemplate<T>) {
            super(id? id.toString(): "", template || {}, children);
        }

        protected _parseElemTemplate(template: IArrayChildTemplate<T>): void {
            super._parseElemTemplate(template);
            this._allowReordering = template.allowReordering;
        }

        protected _onCreateElements(): void {

            if (this._allowReordering) {
                this._elems.nextBtn = createElement({
                    cls: "next kipBtn",
                    content: "",
                    parent: this._elems.core,
                    eventListeners: {
                        click: () => { this._changeOrder(DirectionType.FORWARD); }
                    }
                });

                this._elems.prevBtn = createElement({
                    cls: "prev kipBtn",
                    content: "",
                    parent: this._elems.core,
                    eventListeners: {
                        click: () => { this._changeOrder(DirectionType.BACKWARD); }
                    }
                });
            }

            this._elems.closeBtn = createElement({
                cls: "close kipBtn", 
                content: "X", 
                parent: this._elems.core,
                eventListeners: {
                    click: () => { this._delete(); }
                }
            });

            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null, this._elems.core);
        }

        protected _createClonedElement(appendToID: string): ArrayChildElement<T> {
            return new ArrayChildElement<T>(this._id + appendToID, this._children);
        }

        protected _cloneFormElement(child: FormElement<any>): FormElement<any> {
            return super._cloneFormElement(child, "|" + this._id);
        }
        //#endregion
        //..........................................

        //...........................
        //#region HANDLE DELETION
        protected _delete(): void {
            this._elems.core.parentNode.removeChild(this._elems.core);
            this._data = null;
            this._dispatchChangeEvent();
        }
        //#endregion
        //...........................

        //.................................
        //#region HANDLE ORDER CHANGING
        public addOrderingListener(orderListener: ArrayElement<T>): void {
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