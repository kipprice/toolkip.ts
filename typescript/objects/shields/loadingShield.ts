///<reference path="shield.ts" />
namespace KIP {

    /**...........................................................................
     * ILoadingShieldElements
     * ...........................................................................
     * Keep track of elements
     * ...........................................................................
     */
    export interface ILoadingShieldElements extends IShieldElements{
        text: HTMLElement;
        icon: HTMLElement;
        wrapper: HTMLElement;
    }

    /**...........................................................................
     * @class LoadingShield
     * ...........................................................................
     * Show a loading indication
     * @version 1.0
     * ...........................................................................
     */
    export class LoadingShield extends Shield{

        protected _elems: ILoadingShieldElements;

        protected _loadingText: string;

        /** styles for the loading shield */
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipShield loadingContainer": {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            },

            ".kipShield .loadingText": {
                fontFamily: '"OpenSansLight", "Helvetica"',
                fontSize: "1.4em",
                color: "#FFF"
            },

            ".kipShield .loadingIcon": {
                border: "1px solid transparent",
                borderTop: "1px solid #FFF",
                borderRadius: "25px",
                width: "25px",
                height: "25px",
                animation: "rotate infinite linear 1s",
                margin: "auto"
            }
        }

        /** make sure we return the right set of styles */
        protected _getUncoloredStyles(): Styles.IStandardStyles { return this._mergeThemes(LoadingShield._uncoloredStyles, Shield._uncoloredStyles); }

        /**...........................................................................
         * Create a loading shield
         * @param   loadingText   Additional etxt to display while loading
         * ...........................................................................
         */
        constructor(loadingText?: string) {
            super();
            this._loadingText = loadingText || "Loading...";
            this._createElements();
        }

        /** skip creating elements before data is set */
        protected _shouldSkipCreateElements(): boolean { return true; }

        protected _createShieldDetails(): void {
            this._elems.wrapper = createElement({
                cls: "loadingContainer",
                parent: this._elems.shieldContent
            });

            this._elems.text = createElement({
                cls: "loadingText",
                content: this._loadingText,
                parent: this._elems.wrapper
            });

            this._elems.icon = createElement({
                cls: "loadingIcon",
                parent: this._elems.wrapper
            });
        }
    }
}