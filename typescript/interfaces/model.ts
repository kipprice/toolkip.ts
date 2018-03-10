namespace KIP {

    export abstract class Model<T> {
        
        /**...........................................................................
         * _copyData
         * ...........................................................................
         * Copies data from a JSON version of this model
         * 
         * @param   data    The data to save into our model
         * ...........................................................................
         */
        protected _copyData<K extends keyof T>(data: T): void {
            map(data, (value: T[K], key: K) => {
                this._copyPiece(key, value);
            });
        }

        protected _copyPiece<K extends keyof T>(key: K, value: T[K]) {
            let capitalizedName: string = (key[0].toUpperCase() + rest(key, 1));
            let copyFuncName: string = "_copy" + capitalizedName;
           
            // if we have a custom function to write this data, use it
            if (this[copyFuncName]) {
                this[copyFuncName](value);
                return;
            };

            // otherwise, just set our internal property to have this value
            let privateName: string = "_" + capitalizedName;
            this[privateName] = value;
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

    /**
     * @class   Serializable
     * 
     * Creates a model that can be turned into a string
     * @version 1.0
     * @author  Kip Price
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