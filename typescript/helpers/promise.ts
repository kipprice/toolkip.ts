namespace KIP {
    export interface KipPromiseFunction {
        (resolve: Function, reject: Function) : any;
    }

    /**...........................................................................
     * @class KipPromise
     * Create a promise class to run async calls in a chained fashion
     * @version 1.0
     * ...........................................................................
     */
    export class KipPromise implements Promise<any> {

        /** keep track of what this promise should do after completion */
        protected _thenListener: Function;

        /** keep track of what this promise should do after an error */
        protected _catchListener: Function;

        /**...........................................................................
         * Creates a promise elements that runs a bit of code asynchronously
         * 
         * @param   func    The code to run 
         * ...........................................................................
         */
        public constructor (func: KipPromiseFunction) {
            try {
                func(
                    (...params: any[]) => { this._resolve(params); },
                    (...params: any[]) => { this._reject(params); }
                );
            } catch (e) {
                this._reject(e);
            }
        }

        /**...........................................................................
         * then
         * ...........................................................................
         * Public function to setup what should run after this promise completes
         * 
         * @param   onThen  The function to run on completion
         * 
         * @returns This promise
         * ...........................................................................
         */
        public then(onThen: Function): KipPromise {
            this._thenListener = onThen;
            return this;
        }
        
        /**...........................................................................
         * catch
         * ...........................................................................
         * Register the function that should catch any errors that occur
         * 
         * @param   onCatch     The function that will handle catching
         * 
         * @returns This promise
         * ...........................................................................
         */
        public catch(onCatch: Function): KipPromise {
            this._catchListener = onCatch;
            return this;
        }


        /**...........................................................................
         * resolve
         * ...........................................................................
         * Called when the promise has been successfully resolved
         * @param params 
         * ...........................................................................
         */
        protected _resolve(...params: any[]): void {
            window.setTimeout(() => {
                if (!this._thenListener) { return; }
                this._thenListener(params);
            }, 0);
        }

        /**...........................................................................
         * _reject
         * ...........................................................................
         * Called when the promise failed to resolve for some reason
         * @param params 
         * ...........................................................................
         */
        protected _reject(...params: any[]): void {
            window.setTimeout(() => {
                if (!this._catchListener) { return; }
                this._catchListener(params);
            }, 0);
        }

        /**...........................................................................
         * resolve
         * ...........................................................................
         * return a promise that will immediately resolve 
         * 
         * @param   any arguments that should be passed to the resolve function
         * ...........................................................................
         */
        public static resolve(...params: any[]): KipPromise {
            let promise: KipPromise = new KipPromise((resolve,reject) => {resolve(params); });
            return promise;
        }

        /**...........................................................................
         * reject
         * ...........................................................................
         * return a promise that will be rejected 
         * ...........................................................................
         */
        public static reject(...params: any[]): KipPromise {
            let promise: KipPromise = new KipPromise((resolve, reject) => { reject(params); });
            return promise;
        }

    }
}