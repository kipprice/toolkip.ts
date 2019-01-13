namespace KIP {

    /**----------------------------------------------------------------------------
     * @class   Router
     * ----------------------------------------------------------------------------
     * Assist with routing based on the URL loaded
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class Router {

        /** allow loading of script files dynamically */
        protected _loader: ScriptLoader;
        
        /**
         * route
         * ----------------------------------------------------------------------------
         * Route this page to a particular set of code, based on details on the
         * URL that brought us here
         */
        public route(): void {
            this._route(
                URL.cleanURL(),
                URL.splitParams()
            )
        }

        /**
         * _createScriptLoader
         * ----------------------------------------------------------------------------
         * Overridable function that determines how JS files are dynamically loaded
         */
        protected _createScriptLoader(): void {
            this._loader = new ScriptLoader("{0}");
        }

        /**
         * _route
         * ----------------------------------------------------------------------------
         * Overridable function that looks to the details of the current URL & 
         * determines what scripts to load
         * @param   url     Current URL, without additional parameters 
         * @param   params  Parameters for the current URL
         */
        protected abstract _route(url: string, params: IKeyValPair<string>[]): void;

    }

    /**----------------------------------------------------------------------------
     * @class   ScriptLoader
     * ----------------------------------------------------------------------------
     * Dynamically load a JS file to the document
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class ScriptLoader {

        /** the string that will be formatted to be the appropriate JS file */
        protected _scriptURLFormat: string

        /**
         * ScriptLoader
         * ----------------------------------------------------------------------------
         * Initialize the script loader with the appropriate format function
         */
        constructor(format: string) {
            this._scriptURLFormat = format || "{0}";
        }

        /**
         * _loadScript
         * ----------------------------------------------------------------------------
         * Dynamically load a particular script
         * @param   script  unique piece that should be applied in our formatted string
         *                  to load this particular URL
         */
        public loadScript(script: string): void {
            let formattedURL = KIP.format(this._scriptURLFormat, script);

            KIP.createElement({
                type: "script",
                attr: { src: formattedURL },
                parent: document.head
            });
        }
    }
}