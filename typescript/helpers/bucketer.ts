namespace KIP {
    /**----------------------------------------------------------------------------
     * @class	BucketHelper
     * ----------------------------------------------------------------------------
     * handle bucketing elements into a dictionary
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    class _BucketHelper {

        /**
         * bucket
         * ----------------------------------------------------------------------------
         * helper to run bucket sort on a set of objects
         * 
         * @param   things      The items to bucket sort
         * @param   getBucket   The function that determines what bucket an item falls into
         * @param   addlParams  Allow for any other details that might change the bucket
         * 
         * @returns A dictionary of items, based on the bucketing specified
         */
        public bucket<T>(things: T[], getBucket: IBucketFunc<T, number>, ...addlParams: any[]): KIP.INumericDictionary<T>;
        public bucket<T>(things: T[], getBucket: IBucketFunc<T, string>, ...addlParams: any[]): KIP.IDictionary<T>;
        public bucket<T>(things: T[], getBucket: IBucketFunc<T, string | number>, ...addlParams: any[]): KIP.IDictionary<T> | KIP.INumericDictionary<T> {
            let out = {};

            for (let t of things) {
                let bucket = getBucket(t, ...addlParams);
                if (!out[bucket]) { out[bucket] = []; }
                out[bucket].push(t);
            }

            return out;
        }

    }
    
    export const BucketHelper = new _BucketHelper();

    //..........................................
    //#region TYPES AND INTERFACES
    
    export interface IBucketFunc<T, O extends string | number> {
        (thing: T, ...addlParams: any[]): O;
    }
    
    //#endregion
    //..........................................
}