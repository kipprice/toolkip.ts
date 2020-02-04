namespace KIP {
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