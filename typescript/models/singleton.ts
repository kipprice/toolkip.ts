namespace KIP {
    
    /**----------------------------------------------------------------------------
     * @class   Singleton
     * ----------------------------------------------------------------------------
     * Basic implementation for a Singleton that allows for easy reuse
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export abstract class Singleton {
        
        //...........................
        //#region SINGLETON TRACKING

        /** instance backing this singleton */
        private static __innerInstance: Singleton;
        protected static get _innerInstance(): Singleton {
            if (!this.__innerInstance) { this.__innerInstance = new (this as any)(); }
            return this.__innerInstance;
        }

        protected static _getInstance<T extends Singleton>(): T {
            return this._innerInstance as T;
        }

        //#endregion
        //...........................

        //..............................
        //#region HIDDEN CONSTRUCTOR

        /**
         * Singleton
         * ----------------------------------------------------------------------------
         * Protected constructor 
         */
        protected constructor() {}

        //#endregion
        //..............................
    }
}