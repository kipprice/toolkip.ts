namespace KIP.Forms {
    /**----------------------------------------------------------------------------
     * @class	InlineForm
     * ----------------------------------------------------------------------------
     * special type of form that doesn't render buttons, but instead saves 
     * everytime there is a change
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export class InlineForm<T> extends _Form<T> {

        //..................
        //#region STYLES
        
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".kipForm.inline": {
                display: "flex",

                nested: {
                    ".formChildren.flex .kipFormElem": {
                        marginRight: "20px"
                    }
                }
            }
        }

        protected _getUncoloredStyles() {
            return this._mergeThemes(
                InlineForm._uncoloredStyles,
                _Form._uncoloredStyles
            );
        }
        
        //#endregion
        //..................
        
        protected _createBase(): StandardElement {
            let out = super._createBase();
            addClass(out, "inline");
            return out;
        }

        protected _createPostForm(): StandardElement {
            return null;
        }

        protected _onFormChange(event: FormElemChangeEvent<any>): void {
            if (!this._isFormChangeForMe(event)) { return; }

            // any change within our form should be treated as a save for 
            // inline forms
            this.trySave();
        }
    }
}