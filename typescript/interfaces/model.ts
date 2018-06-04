namespace KIP {

    /**...........................................................................
     * Model
     * ...........................................................................
     * Generic class to be able to easily create models that can save down to JSON.
     * 
     * By default, can copy over simple data (primitives, arrays, objects) for both 
     * loading and saving.
     * If more complex logic is needed, supports functions of the format
     *      _copy[CamelCasePropertyName] : get data out of JSON onto the class
     *      _save[CamelCasePropertyName] : save data into JSON from this class
     * 
     * @author  Kip Price
     * @version 1.0.2
     * ...........................................................................
     */
    export abstract class Model<T> {

        /**...........................................................................
         * Create a new model from specific data
         * @param   dataToCopy  If provided, the JSON of this data to copy over
         * ........................................................................... 
         */
        constructor(dataToCopy?: T) {
            this._setDefaultValues();
            if (dataToCopy) {
                this._copyData(dataToCopy);
            }
        }

        /**...........................................................................
         * _setDefaultValues
         * ...........................................................................
         * Overridable function to initialize any default data that is needed
         * ...........................................................................
         */
        protected _setDefaultValues(): void {}
        
        /**...........................................................................
         * _copyData
         * ...........................................................................
         * Copies data from a JSON version of this model
         * @param   data    The data to save into our model
         * ...........................................................................
         */
        protected _copyData<K extends keyof T>(data: T): void {
            map(data, (value: T[K], key: K) => {
                this._copyPiece(key, value);
            });
        }

        /**...........................................................................
         * _copyPiece
         * ...........................................................................
         * Copy a particular piece of data into this class
         * @param   key     The key to copy over 
         * @param   value   The value to copy over
         * ...........................................................................
         */
        protected _copyPiece<K extends keyof T>(key: K, value: T[K]): void {
            let capitalizedName: string = (key[0].toUpperCase() + rest(key, 1));
            let copyFuncName: string = "_copy" + capitalizedName;

            // don't override values for undefined elements
            if (value === undefined) { 
                return; 
            }
           
            // if we have a custom function to write this data, use it
            if (this[copyFuncName]) {
                this[copyFuncName](value);
                return;
            };

            let savableValue: T[K];

            // make shallow copies of arrays by default
            if (isArray(value)) {
                savableValue = (value.slice()) as any as T[K];

            // stringify and parse objects by default
            } else if (isObject(savableValue)) {
                savableValue = JSON.parse(JSON.stringify(value))

            // just use primitives as is
            } else {
                savableValue = value;
            }

            // otherwise, just set our internal property to have this value
            let privateName: string = "_" + capitalizedName;
            this[privateName] = savableValue;
        }

        /**...........................................................................
         * saveData
         * ...........................................................................
         * Gets data out of this model in JSON format
         * ...........................................................................
         */
        public saveData<K extends keyof T>(): T {
            let out: T = {} as T;
            
            map(this, (val: any, key: string) => {
                if (typeof key === "function") { return; }
                out[key] = this._savePiece(key as keyof T, val);
            });
            return out;
        }

        /**...........................................................................
         * _savePiece
         * ...........................................................................
         * Save a piece of data to our out array
         * @param   key     The key to save data for
         * @param   value   The value of that key
         * @returns The value
         * ...........................................................................
         */
        protected _savePiece<K extends keyof T>(key: K, val: T[K]): T[K] {
            let capitalizedName: string = (key[0].toUpperCase() + rest(key, 1));
            let saveFuncName: string = "_save" + capitalizedName;

            if (this[saveFuncName]) {
                return this[saveFuncName]();
            }

            let privateName: string = "_" + capitalizedName;
            return this[privateName];
        }
    }

    /**...........................................................................
     * @class   Serializable
     * ...........................................................................
     * Creates a model that can be turned into a string
     * @author  Kip Price
     * @version 1.0.0
     * ...........................................................................
     */
    export abstract class Serializable<T> extends Model<T> {

        /**...........................................................................
         * serialize
         * ...........................................................................
         * Turn this model into a savable JSON string
         * @returns The string version of this data   
         * ...........................................................................
         */
        public serialize(): string {
            let data: T = this.saveData();
            return JSON.stringify(data);
        }

        /**...........................................................................
         * deserialize
         * ...........................................................................
         * Turns a string into a version of this model
         * 
         * @param   data  The string to deserialize
         * 
         * @returns True if we could deserialize
         * ...........................................................................
         */
        public deserialize(data: string) : boolean {
            try {
                let parsedData: T = JSON.parse(data);
                this._copyData(parsedData);
                return true;
            } catch (err) {
                console.log("non JSON: " + data);
                return false;
            } 
        }
    }
}