namespace KIP {
    export interface KipPromiseFunction<T extends Function = Function> {
        (resolve: T, reject: Function, ...params: any[]) : any;
    }

    export function isPromise(data: any): data is KipPromise {
        if (!data) { return false; }
        return (!!(data as any).then);
    }

    /**----------------------------------------------------------------------------
     * @class KipPromise
     * ----------------------------------------------------------------------------
     * Create a promise class to run async calls in a chained fashion
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class KipPromise<T extends Function = Function> implements Promise<T> {

        //.....................
        //#region PROPERTIES

        /** the code that will be run for the actual promise evaluation */
        protected _executable: KipPromiseFunction<T>;

        /** keep track of what this promise should do after completion */
        protected _thenListeners: KipPromise[];

        /** keep track of what this promise should do after an error */
        protected _catchListeners: KipPromise[];

        //#endregion
        //.....................

        /**
         * KipPromise
         * ----------------------------------------------------------------------------
         * Creates a promise elements that runs a bit of code asynchronously
         * @param   func    The code to run 
         */
        public constructor (func: KipPromiseFunction<T>, deferred?: boolean) {
            // initialize properties
            this._thenListeners = [];
            this._catchListeners = [];

            // run the actual promise code
            if (!deferred) {
                this._executePromise(func);
            } else {
                this._executable = func;
            }

        }

        /**
         * _executePromise
         * ----------------------------------------------------------------------------
         * Runs the code associated with a promise
         * @param   func    The code to run
         * @param   params  Any additional parameters that should be included in the promise
         * 
         * @version 1.0.1
         */
        protected _executePromise(func: KipPromiseFunction<T>, ...params: any[]): void {
            try {
                func(
                    ((...params: any[]) => { this._resolve(...params); }) as any as T,
                    (...params: any[]) => { this._reject(...params); },
                    ...params
                );
            } catch (e) {
                this._reject(e);
            }
        }

        /**
         * _chain
         * ----------------------------------------------------------------------------
         * Run the contents of a deferred promise based on a chain event
         * @param   params  Any additional data that should be passed to the next promise
         */
        protected _chain(...params: any[]): void {
            this._executePromise(this._executable, ...params);
        }

        /**
         * _getListenerPromise
         * ----------------------------------------------------------------------------
         * Generates a promise (or reuses an existing one) for the then / catch listeners
         * @param   listener    The listener to add 
         */
        protected _getListenerPromise (listener: Function | KipPromise): KipPromise {
            let promise: KipPromise;

            // already a promise? just return it
            if (isPromise(listener)) {
                promise = listener;

            // otherwise, build a promise that will support this function
            } else {
                promise = new KipPromise((resolve, reject, ...params: any[]) => {
                    let result: any = listener(...params);

                    // if the result of this function is another promise, attach to the then listener
                    if (isPromise(result)) {
                        result.then((...params: any[]) => { resolve(...params); });

                    // otherwise, just resolve immediately after execution
                    } else {
                        resolve(result);
                    }

                }, true);
            }

            return promise;
        }

        /**
         * then
         * ----------------------------------------------------------------------------
         * Public function to setup what should run after this promise completes
         * @param   onThen  The function to run on completion
         * @returns The promise associated with our then action
         * 
         */
        public then(onThen: Function | KipPromise): KipPromise {
            let onThenPromise: KipPromise = this._getListenerPromise(onThen);
            this._thenListeners.push(onThenPromise);
            return onThenPromise;
        }
        
        /**
         * catch
         * ----------------------------------------------------------------------------
         * Register the function that should catch any errors that occur
         * @param   onCatch     The function that will handle catching
         * @returns This promise
         */
        public catch(onCatch: Function): KipPromise<T> {
            let onCatchPromise: KipPromise = this._getListenerPromise(onCatch);
            this._catchListeners.push(onCatchPromise);
            return this;
        }


        /**
         * resolve
         * ----------------------------------------------------------------------------
         * Called when the promise has been successfully resolved
         * @param   params  Any additional data that should be passed along to the promise
         */
        protected _resolve(...params: any[]): void {
            window.setTimeout(() => {
                if (!this._thenListeners) { return; }
                for (let listener of this._thenListeners) {
                    if (!listener) { continue; }
                    listener._chain(...params);
                }
            }, 0);
        }

        /**
         * _reject
         * ----------------------------------------------------------------------------
         * Called when the promise failed to resolve for some reason
         * @param   params  Any additional data that should be passed along to the promise
         */
        protected _reject(...params: any[]): void {
            window.setTimeout(() => {
                if (!this._catchListeners) { return; }
                for (let listener of this._catchListeners) {
                    if (!listener) { continue; }
                    listener._chain(...params);
                }
            }, 0);
        }

        /**
         * resolve
         * ----------------------------------------------------------------------------
         * return a promise that will immediately resolve 
         * @param   any arguments that should be passed to the resolve function
         */
        public static resolve<T extends Function>(...params: any[]): KipPromise<T> {
            let promise: KipPromise<T> = new KipPromise<T>((resolve) => {resolve(...params); });
            return promise;
        }

        /**
         * reject
         * ----------------------------------------------------------------------------
         * return a promise that will be rejected 
         */
        public static reject<T extends Function>(...params: any[]): KipPromise<T> {
            let promise: KipPromise<T> = new KipPromise<T>((resolve, reject) => { reject(...params); });
            return promise;
        }

    }

    /**----------------------------------------------------------------------------
     * @class   PromiseChain
     * ----------------------------------------------------------------------------
     * Ensure that promises get evaluated in order
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class PromiseChain extends KipPromise {

        //.....................
        //#region PROPERTIES

        /** keep track of the first promise added */
        protected _initialPromise: KipPromise;

        /** keep track of the last promise added */
        protected _finalPromise: KipPromise;

        //#endregion
        //.....................

        /**
         * PromiseChain
         * ----------------------------------------------------------------------------
         * create a promise chain to be executed asynchronously
         */
        public constructor() {
            super(null, true);

            // wrap our promises to be able to handle the full chain
            this._executable = (resolve: Function, reject: Function, ...addlParams: any[]) => {
                this._finalPromise.then((...params: any[]) => { resolve(...params); });
                (this._initialPromise as PromiseChain)._chain(...addlParams);
            };
        }

        /**
         * addPromise
         * ----------------------------------------------------------------------------
         * Add a promise to the execution chain
         * @param onThenListener 
         */
        public addPromise(onThenListener: Function | KipPromise): void {
            let promise: KipPromise = this._getListenerPromise(onThenListener);

            // if this is the inital promise, set it as both start and end
            if (!this._initialPromise){
                this._initialPromise = promise;
                this._finalPromise = promise;
            
            // otherwise, add it to the end of the promise chain
            } else {
                this._finalPromise.then(promise);
                this._finalPromise = promise;
            }

        }

        /**
         * execute
         * ----------------------------------------------------------------------------
         * Actually run this promise chain 
         * @param params 
         */
        public execute(...params: any[]): PromiseChain {
            this._chain(...params);
            return this;
        }
    }
}