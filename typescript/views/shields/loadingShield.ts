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
     * @version 1.0.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class LoadingShield extends Shield{

        //#region PROPERTIES

        /** elements that make up this shield */
        protected _elems: ILoadingShieldElements;

        /** text to display as we display the shield */
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
            },

            "@keyframes rotate" : {
                from: {
                    transform: "rotate(0deg)"
                },
                to: {
                    transform: "rotate(360deg)"
                }
            }
        }

        //#endregion

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

        /**...........................................................................
         * _createShieldDetails
         * ...........................................................................
         * Create 
         * ...........................................................................
         */
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