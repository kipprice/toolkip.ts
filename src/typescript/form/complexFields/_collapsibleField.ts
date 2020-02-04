///<reference path="../_field.ts" />

namespace KIP.Forms {

    export interface IFormCollapsibleTemplate<T> extends IFieldConfig<T> {
        isExpanded?: boolean;
        hideTitle?: boolean;
        uncollapsible?: boolean;
    }
    
    export interface ICollapsibleHTMLElements extends IFieldElems {
        title: HTMLElement;
        collapseElem?: HTMLElement;
        titleContainer?: HTMLElement;
    }

    /**----------------------------------------------------------------------------
     * @class CollapsibleField
     * ----------------------------------------------------------------------------
     * Create a collapsible element of the form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export abstract class CollapsibleField<M, T extends IFormCollapsibleTemplate<M> = IFormCollapsibleTemplate<M>> extends Field<M, T> {

        //.....................
        //#region PROPERTIES

        /** keep track of whether we are currently collapsed */
        protected _isCollapsed: boolean;

        /** track if we are already collapsing or expanding */
        protected _isTransitioning: boolean;

        /** keep track of shared elements for collapsible sections */
        protected _elems: ICollapsibleHTMLElements;

        /** style collapsible sections */
        protected static _uncoloredStyles: Styles.IStandardStyles = {

            ".kipFormElem.collapsible .formChildren": {
                
            },

            ".kipFormElem.collapsible.collapsed .formChildren": {
                height: "0",
                overflow: "hidden"
            },

            ".kipFormElem.collapsible .sectionHeaderContainer": {
                display: "flex",
                justifyContent: "space-between",
                boxSizing: "border-box",
                cursor: "pointer",
                padding: "10px 10px",
                alignItems: "center",
                width: "calc(100% + 20px)",
                marginLeft: "-10px",
                borderRadius: "30px",

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
                cursor: "pointer",
                color: "<formSubTheme>"
            },

            ".kipFormElem.collapsible.collapsed .caret": {
                transform: "rotate(180deg)"
            },

            ".kipFormElem.collapsible .sectionHeaderContainer:hover": {
                backgroundColor: "rgba(0,0,0,.05)"
            }

        }
        //#endregion
        //...............

        //........................
        //#region CREATE ELEMENTS

        protected _parseFieldTemplate(template: T): void {
            super._parseFieldTemplate(template);
            this._isCollapsed = (!template.isExpanded && !template.hideTitle && !template.uncollapsible);
        }

        /**
         * _createCollapsibleTitle
         * ----------------------------------------------------------------------------
         * Create the title for a collapsible section & associated icons
         */
        protected _createCollapsibleTitle(): void {
            let titleCls: string = "sectionHeaderContainer";
            if (this._config.hideTitle) { titleCls += " hidden"; }

            this._elems.titleContainer = createElement({
                cls: titleCls,
                parent:this._elems.base,
                eventListeners: {
                    click: () => { this._onCaretClicked(); }
                }
            });

            this._elems.title = createSimpleElement("", "sectionHeader", this._config.label, null, null, this._elems.titleContainer);

            if (this._config.uncollapsible) { return; }

            this._elems.collapseElem = createSimpleElement("", "caret", "\u25B5", null, null, this._elems.titleContainer);

            // add a tracking class to the core element
            addClass(this._elems.base, "collapsible");

            // start collapsed
            if (this._isCollapsed) {
                addClass(this._elems.base, "collapsed");
                this._isCollapsed = true;
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
            if (this._config.uncollapsible) { return; }
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
            if (this._isTransitioning) { return; }
            this._isTransitioning = true;
            this._isCollapsed = true;

            KIP.transition(
                this._elems.childrenContainer,
                { height: "<height>", overflow: "hidden" },
                { height: "0", overflow: "hidden"  },
                500
            ).then(() => {
                addClass(this._elems.base, "collapsed");
                this._isTransitioning = false;
            })
        }

        /**
         * expand
         * ----------------------------------------------------------------------------
         * Handle expanding the section
         */
        public expand(): void {
            if (this._isTransitioning) { return; }
            this._isTransitioning = true;
            this._isCollapsed = false;

            removeClass(this._elems.base, "collapsed");
            KIP.transition(
                this._elems.childrenContainer,
                { height: "0", overflow: "hidden" },
                { height: "<height>" },
                500
            ).then(() => {
                
                this._isTransitioning = false;
            });
            
            
        }

        //#endregion
        //.................................

    }

}