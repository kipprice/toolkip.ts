/// <reference path="_form.ts" />

namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class	PopupForm
     * ----------------------------------------------------------------------------
     * form that renders as a popup display automatically
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export class PopupForm<T> extends _Form<T> {

        //..................
        //#region STYLES
        
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".kipForm.popup": {
                position: "fixed",
                left: "0",
                top: "0",
                margin: "0",
                padding: "0",
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                nested: {
                    "&.hidden": {
                        display: "none"
                    },

                    ".formOverlay": {
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: "0",
                        left: "0",
                        backgroundColor: "rgba(0,0,0,.6)",
                    },

                    ".background": {
                        boxShadow: "1px 1px 8px 3px rgba(0,0,0,.2)",
                        overflow: "hidden",
                        borderRadius: "3px",
                        backgroundColor: "#FFF",

                        minWidth: "40%",
                        maxWidth: "90%",
                        maxHeight: "90%",

                        position: "relative",
                        display: "flex",
                        flexDirection: "column",

                        nested: {
                            ".titleBar, .kipBtns": {
                                display: "flex",
                                backgroundColor: "<formSubTheme>",
                                color: "#FFF",
                                padding: "3px 20px",
                                alignItems: "center"
                            },

                            ".close.kipBtn": {
                                fontSize: "1.5em"
                            },


                            ".formTitle": {
                                flexGrow: "1",
                                fontSize: "1.5em"
                            },

                            ".formContent": {
                                overflowY: "auto",
                                padding: "15px",
                                maxWidth: "1000px"
                            },

                            ".kipBtns .kipBtn": {
                                backgroundColor: "transparent",
                                border: "1px solid #FFF",
                                fontSize: "1em",
                                color: "#FFF",

                                nested: {
                                    "&.primary": {
                                        fontSize: "1.2em"
                                    }
                                }
                            }

                        }
                    },

                    
                }
            }
        }

        protected _getUncoloredStyles() {
            return this._mergeThemes(
                PopupForm._uncoloredStyles,
                _Form._uncoloredStyles
            );
        }
        
        //#endregion
        //..................

        //.....................
        //#region PROPERTIES
        
        protected _isHidden: boolean;

        protected _elems: {
            base: HTMLElement;
            overlay: HTMLElement;
            background: HTMLElement;
            closeButton: HTMLElement;
            formContainer: HTMLElement;
            coreSection: SectionField<T>;
        }
        
        //#endregion
        //.....................

        protected _createBase(): StandardElement {
            let out = super._createBase();
            addClass(out, "popup");
            addClass(out, "hidden");
            this._isHidden = true;
            return out;
        }
        
        protected _createPreForm(): StandardElement {
            this._elems.overlay = KIP.createElement({
                cls: "formOverlay", 
                parent: this._elems.base,
            });

            super._createPreForm();

            this._elems.closeButton = createElement({
                cls: "close kipBtn", 
                content: "&#x2715;",
                eventListeners: {
                    click: async () => { 
                        await KIP.wait(10);
                        this.tryCancel(); 
                    }
                }
            });

            this._createTitle();

            return this._elems.overlay;
        }

        protected _createTitle(): void {

            KIP.createElement({
                cls: "titleBar",
                children: [
                    { cls: "formTitle", content: this._config.hideTitle? "" : this._config.label },
                    this._elems.closeButton
                ],
                parent: this._elems.background
            })

            // ensure that the child doesn't render the title
            this._config.hideTitle = true;
        }

        //..........................................
        //#region SAVING AND CANCELING
        
        public async trySave(): Promise<T> {
            let out = super.trySave();
            this.hide();
            return out;
        }

        public tryCancel(ignoreUnsavedChanges?: boolean): boolean {
            let out = super.tryCancel();
            this.hide();
            return out;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region HOW OR HIDE FORM
        
         /**
         * show
         * ----------------------------------------------------------------------------
         * show the form on the appropriate parent if it styled a as a popup
         */
        public show(): void {
            if (!this._isHidden) { return; }
            KIP.removeClass(this._elems.base, "hidden");
            this._isHidden = false;
        }

        /**
         * hide
         * ----------------------------------------------------------------------------
         * hide the form if it is styled as a popup 
         */
        public hide(): void {
            if (this._isHidden) { return; }
            KIP.addClass(this._elems.base, "hidden");
            this._isHidden = true;
        }
        
        //#endregion
        //..........................................
    }
}