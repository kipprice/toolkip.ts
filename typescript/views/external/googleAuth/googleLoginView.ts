namespace KIP.Google {
    //#region GOOGLE SPECIFIC VARIABLES
    declare var gapi : any;

    /**
     * available functions for a Google Profile
     */
    interface IGoogleProfile {
        getId(): string;
        getName(): string;
        getGivenName(): string;
        getFamilyName(): string;
        getImageUrl(): string;
        getEmail(): string;
    }
    //#endregion

    /**
     * @class   GoogleView
     * 
     * Create a reusable login button for signing in with google accounts
     * @author  Kip Price
     * @version 1.0.0
     */
    export abstract class GoogleLoginButton extends KIP.Drawable {
        //#region PROPERTIES
        /** track the loaded Google profile */
        private _googleProfile: IGoogleProfile;

        /** functions that want to know about login events */
        protected _loginListeners: Function[];

        /** functions that want to know about logout events */
        protected _logoutListeners: Function[];

        /** track whether we are currently logged in */
        protected _isLoggedIn: boolean;
        public get isLoggedIn(): boolean { return this._isLoggedIn; }
        public set isLoggedIn(data: boolean) { this._isLoggedIn = data; }
        //#endregion

        /**
         * create a Google login button
         */
        constructor() {
            super();
            this._loginListeners = [];
            this._logoutListeners = [];
        }
        /**
         * create the elements needed to display the login button
         */
        protected _createElements(): void {
            gapi.load('auth2', () => {
                let auth2 = gapi.auth2.init({
                    client_id: "672328688721-shd2ipkttksoatvi4r0m0rpms8dp2efo.apps.googleusercontent.com",
                    hd: 'gmail.com'
                });

                auth2.currentUser.listen((user) => { 
                    if (!user.getBasicProfile()) { 
                    } else { 
                        //this._onSignIn(user); 
                    }
                });
            })
            
            this._elems.base = KIP.createElement({ id: "elgoog", cls: "g-signin2" });

            // actually create the styled button
            window.setTimeout(() => {
                gapi.signin2.render('elgoog', {
                    'scope': 'profile email',
                    'longtitle': false,
                    'theme': 'light',
                    'onsuccess': (data) => { this._onSignIn(data); },
                    'onfailure': () => { console.log("error occurred"); }
                });
            }, 10);
        }

        /**
         * _onSignIn
         * 
         * Handle when we've attempted to log in through google's api
         * @param googleUser 
         */
        private _onSignIn(googleUser: any): void {
            // verify that this is a new login
            let profile = googleUser.getBasicProfile();
            if (this._googleProfile && (profile.getId() === this._googleProfile.getId())) { return; }

            // if it is, update our profile info
            this._googleProfile = profile;
            let id_token = googleUser.getAuthResponse().id_token;

            // validate against the server as well
            this._login(id_token, () => { this._onSignedIn(); }, () => { this._onSignInFailure(); });

            // be overlay cautious; logout with every refresh
            window.addEventListener("beforeunload", () => {
                this.signOut();
            });

        }

        /**
         * _onSignedIn
         * 
         * Handle when a user is actually logged in through the google API
         */
        private _onSignedIn(): void {

            // internal tag for tracking
            this._isLoggedIn = true;

            // notify listeners
            for (let listener of this._loginListeners) {
                if (!listener) { continue; }
                listener();
            }
        }

        /**
         * _onSignInFailure
         * 
         * Handle when signing in fails 
         */
        private _onSignInFailure(): void {
            let errorPopup = new KIP.ErrorPopup("We couldn't log you in securely. Are you supposed to be here?");
            errorPopup.draw(document.body);
            this.signOut();
        }

        /**
         * signOut
         * 
         * Allow a user to specify that they are logging out
         */
        public signOut(): void {
            let auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(() => {
                this._googleProfile = null;

                // update our server as well
                this._logout();

                // reload the page to refresh the UI
                //window.location.reload();
            });
        }

        /**
         * addLoginListener
         * 
         * Adds a listener for the log in event
         * @param   listener    What to do on log in
         */
        public addLoginListener(listener: Function): void {
            this._loginListeners.push(listener);
        }

        /**
         * addLogoutListener
         * 
         * Add a listener for the log out event
         * @param   listener    What to do on logout
         */
        public addLogoutListener(listener: Function): void {
            this._logoutListeners.push(listener);
        }

        protected abstract _login(token: string, onSuccess?: Function, onFailure?: Function): void;

        protected abstract _logout(onSuccess?: Function, onFailure?: Function): void;
    }
}