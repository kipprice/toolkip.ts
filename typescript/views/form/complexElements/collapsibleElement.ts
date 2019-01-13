///<reference path="../formElement.ts" />

namespace KIP.Forms {

    export interface IFormCollapsibleTemplate<T> extends IFormElemTemplate<T> {
        isExpanded?: boolean;
        hideTitle?: boolean;
        uncollapsible?: boolean;
    }
    
    export interface ICollapsibleHTMLElements extends IFormHTMLElements {
        title: HTMLElement;
        collapseElem?: HTMLElement;
        titleContainer?: HTMLElement;
    }

    /**----------------------------------------------------------------------------
     * @class CollapsibleElement
     * ----------------------------------------------------------------------------
     * Create a collapsible element of the form
     * @version 1.0
     * ----------------------------------------------------------------------------
     */
    export abstract class CollapsibleElement<T> extends FormElement<T> {

        //.....................
        //#region PROPERTIES

        /** keep track of whether we are currently collapsed */
        protected _isCollapsed: boolean;

        /** determine whether we should show the collapsible elements at all */
        protected _canCollapse: boolean;

        /** keep track of whether the title should be hidden */
        protected _shouldHideTitle: boolean;

        /** keep track of shared elements for collapsible sections */
        protected _elems: ICollapsibleHTMLElements;

        /** style collapsible sections */
        protected static _uncoloredStyles: Styles.IStandardStyles = {

            ".kipFormElem.collapsible .formChildren": {
                maxHeight: "100%"
            },

            ".kipFormElem.collapsible.collapsed .formChildren": {
                maxHeight: "0px",
                overflow: "hidden"
            },

            ".kipFormElem.collapsible .sectionHeaderContainer": {
                display: "flex",
                justifyContent: "space-between",
                boxSizing: "border-box",
                cursor: "pointer",
                padding: "10px 10px",
                borderRadius: "3px",
                alignItems: "center",
                
                nested: {
                    "&.hidden": {
                        display: "none"
                    }
                }
            },

            ".kipFormElem.collapsible .caret": {
                transformOrigin: "50% 50%",
                width: ".8em",
                fontSize: "1em",
                transition: "all ease-in-out .1s",
                cursor: "pointer"
            },

            ".kipFormElem.collapsible.collapsed .caret": {
                transform: "rotate(180deg)"
            },

            ".kipFormElem.collapsible .sectionHeaderContainer:hover": {
                backgroundColor: "#eee"
            }

        }
        //#endregion
        //...............

        //........................
        //#region CREATE ELEMENTS

        constructor(id: string, template: IFormCollapsibleTemplate<T> | CollapsibleElement<T>) {
            super(id, template);
        }

        protected _parseElemTemplate(template: IFormCollapsibleTemplate<T>): void {
            super._parseElemTemplate(template);

            this._isCollapsed = (!template.isExpanded && !template.hideTitle && !template.uncollapsible);
            this._shouldHideTitle = template.hideTitle;
            this._canCollapse = !template.uncollapsible;
        }

        /**
         * _createCollapsibleTitle
         * ----------------------------------------------------------------------------
         * Create the title for a collapsible section & associated icons
         */
        protected _createCollapsibleTitle(): void {
            let titleCls: string = "sectionHeaderContainer";
            if (this._shouldHideTitle) { titleCls += " hidden"; }

            this._elems.titleContainer = createElement({
                cls: titleCls,
                parent:this._elems.core,
                eventListeners: {
                    click: () => { this._onCaretClicked(); }
                }
            });
            this._elems.title = createSimpleElement("", "sectionHeader", this._label, null, null, this._elems.titleContainer);

            if (!this._canCollapse) { return; }

            this._elems.collapseElem = createSimpleElement("", "caret", "\u25B5", null, null, this._elems.titleContainer);

            // add a tracking class to the core element
            addClass(this._elems.core, "collapsible");

            // start collapsed
            if (this._isCollapsed) {
                this.collapse();
            }
        }
        //#endregion

        //.................................
        //#region HANDLE EXPAND + COLLAPSE

        /**
         * _onCaretClicked
         * ----------------------------------------------------------------------------
         * Handle the expand/collapse icon being clicked
         */
        protected _onCaretClicked(): void {
            if (!this._canCollapse) { return; }
            if (this._isCollapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }

        /**
         * collapse
         * ----------------------------------------------------------------------------
         * Handle collapsing the section
         */
        public collapse(): void {
            addClass(this._elems.core, "collapsed");
            this._isCollapsed = true;
        }

        /**
         * expand
         * ----------------------------------------------------------------------------
         * Handle expanding the section
         */
        public expand(): void {
            removeClass(this._elems.core, "collapsed");
            this._isCollapsed = false;
        }

        //#endregion
        //.................................

    }

}