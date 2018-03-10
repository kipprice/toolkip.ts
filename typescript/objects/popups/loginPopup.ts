///<reference path="popup.ts" />
namespace KIP {
    
    export interface LoginPopupElements extends PopupElements {
        username: HTMLInputElement;
        password: HTMLInputElement;
    }

    /**
     * @class LoginPopup
     * 
     * Creates a popup with fields for handling login
     * @version 1.0
     * 
     */
    export class LoginPopup extends Popup {

        /** elems contained within this popup */
        protected _elems : LoginPopupElements;

        /** what to do when the user chooses to login */
        protected _loginCallback: Function;
        public set loginCallback (func: Function) { this._loginCallback = func; }

        /** draw specific styles for this particular popup */
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".popup.login .wrapper + .wrapper" : {
                marginTop: "10px"
            }
        }

        /** make sure we get a mix of core styles and these styles */
        protected _getUncoloredStyles(): Styles.IStandardStyles { return this._mergeThemes(LoginPopup._uncoloredStyles, Popup._uncoloredStyles); }

        /**
         * Creates a LoginPopup object
         * @param   obj     If provided, the data to create the base element of the popup 
         */
        constructor(obj?: IElemDefinition) {

            if (obj) {
                 obj.cls += " login"; 
            } else {
                obj = { cls: "login popup"}
            }

            super(obj);
        }

        /**
         * _createElements
         * 
         * Creates the elements for this particular popup
         */
        protected _createElements(): void {
            super._createElements();
            let usernameElems: ILabeledElement = createLabeledElement( {type: "input", attr: { type: "text" } }, { content: "Username" });
            this._elems.username = usernameElems.data as HTMLInputElement;
            this._elems.content.appendChild(usernameElems.wrapper);

            let passwordElems: ILabeledElement = createLabeledElement({ type: "input", attr: { type: "password" } }, { content: "Password" });
            this._elems.password = passwordElems.data as HTMLInputElement;
            this._elems.content.appendChild(passwordElems.wrapper);

            this.addButton("Login", () => {
                this.erase();
                if (!this._loginCallback) { return; }
                this._loginCallback(this._elems.username.value, this._elems.password.value);
            });

            this.addButton("Cancel", () => {
                this.erase();
            });
        }

        /**
         * erase
         * 
         * Handles undrawing the popup
         */
        public erase(): void {
            super.erase();
            this._elems.username.value = "";
            this._elems.password.value = "";
        }
        
    }
}