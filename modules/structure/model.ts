/// <reference path="../../../compiled_js/kip.d.ts" />

//..........................................
//#region TYPE GUARDS

export function isIdentifiableModel(model: Model<any>): model is IdentifiableModel {
    if (!model) { return false; }
    if (!(model as any).id) { return false; }
    return true;
}

//#endregion
//..........................................

//.............................................
//#region LISTENERS FOR CHANGES ON THE MODEL

export interface IPropertyChangeListener<T, K extends keyof T> {
    (newValue: T[K], oldValue?: T[K]): void;
}

export interface IModelChangeListener<T> {
    (key: keyof T, newValue: T[keyof T], oldValue?: T[keyof T]): void;
}

export type IPropertyChangeListeners<T> = {
    [K in keyof T]?: IPropertyChangeListener<T, K>[];
}

//#endregion
//.............................................

export type IPartial<T> = {
    [K in keyof T]?: T[K];
}

export interface IModel {
    [key: string]: any;
}

/**----------------------------------------------------------------------------
 * @class   Model
 * ----------------------------------------------------------------------------
 * Generic class to be able to easily create models that can save down to JSON.
 * 
 * By default, can copy over simple data (primitives, arrays, objects) for both 
 * loading and saving.
 * If more complex logic is needed, supports functions of the format
 *      _copy[CamelCasePropertyName] : get data out of JSON onto the class
 *      _save[CamelCasePropertyName] : save data into JSON from this class
 * 
 * @author  Kip Price
 * @version 1.0.5
 * ----------------------------------------------------------------------------
 */
export abstract class Model<T extends IModel = IModel> {

    //.....................
    //#region PROPERTIES

    /** track listeners for specific properties registered by callers */
    private __propertyListeners: IPropertyChangeListeners<T>;

    /** track listeners for specific properties registered by callers */
    private __modelListeners: IModelChangeListener<T>[];

    //#endregion
    //.....................

    //..........................................
    //#region CREATE THE MODEL

    /**
     * Model
     * ----------------------------------------------------------------------------
     * Create a new model from specific data
     * @param   dataToCopy  If provided, the JSON of this data to copy over
     */
    constructor(dataToCopy?: IPartial<T>) {

        // initialize the listeners for our properties
        this.__propertyListeners = {};
        this.__modelListeners = [];

        // Copy data over from the passed in interface
        this._setDefaultValues();
        if (dataToCopy) {
            if ((dataToCopy as any).saveData) { dataToCopy = (dataToCopy as any).saveData(); }
            this._copyData(dataToCopy);
        }
    }

    /**
     * _setDefaultValues
     * ----------------------------------------------------------------------------
     * Overridable function to initialize any default data that is needed
     */
    protected _setDefaultValues(): void { }

    //#endregion
    //..........................................

    //.......................................
    //#region MOVE DATA FROM OTHER ELEMENT

    /**
     * _copyData
     * ----------------------------------------------------------------------------
     * Copies data from a JSON version of this model
     * @param   data    The data to save into our model
     */
    protected _copyData<K extends keyof T>(data: IPartial<T>): void {
        KIP.map(data, (value: T[K], key: K) => {
            this._copyPiece(key, value);
        });
    }

    /**
     * _copyPiece
     * ----------------------------------------------------------------------------
     * Copy a particular piece of data into this class
     * @param   key     The key to copy over 
     * @param   value   The value to copy over
     */
    protected _copyPiece<K extends keyof T>(key: K, value: T[K]): void {
        let capitalizedName: string = (key[0].toUpperCase() + KIP.rest(key as string, 1));
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

        // if our current value for this field can be updated, do that instead
        if (KIP.isUpdatable(this[key as any])) {
            this[key as any].update(value);
            return;
        }

        let savableValue: T[K];

        // make shallow copies of arrays by default
        if (KIP.isArray(value)) {
            savableValue = (value.slice()) as any as T[K];

            // stringify and parse objects by default
        } else if (KIP.isObject(value)) {
            savableValue = JSON.parse(JSON.stringify(value))

            // just use primitives as is
        } else {
            savableValue = value;
        }

        // otherwise, just set our internal property to have this value
        this._setValue(key, value);
    }

    /**
     * _copyModelArray
     * ----------------------------------------------------------------------------
     * 
     * @param arr 
     * @param constructor 
     */
    protected _copyModelArray<I, M extends I>(arr: I[], constructor: KIP.IConstructor<M>): M[] {
        let out: M[] = [];

        for (let m of arr) {
            let model = new constructor(m);
            out.push(model);
        }

        return out;
    }

    /**
     * _copyModelDictionary
     * ----------------------------------------------------------------------------
     * @param dict 
     * @param constructor 
     */
    protected _copyModelDictionary<I, M extends I>(dict: KIP.IDictionary<I>, constructor: KIP.IConstructor<M>): KIP.IDictionary<M> {
        let out: KIP.IDictionary<M> = {};

        KIP.map(dict, (m: I, key: string) => {
            out[key] = new constructor(m);
        });

        return out;
    }

    /**
     * update
     * ----------------------------------------------------------------------------
     * update various elements of the model to match the passed in data
     */
    public update(model: IPartial<T>): void {
        this._copyData(model);
    }
    //#endregion
    //.......................................

    //....................
    //#region SAVE DATA

    /**
     * saveData
     * ----------------------------------------------------------------------------
     * Gets data out of this model in JSON format
     */
    public saveData<K extends keyof T>(): T {
        let out: T = {} as T;

        KIP.map(this, (val: any, key: string) => {
            if (typeof val === "function") { return; }
            let fmtKey: string = key;
            if (fmtKey[0] === "_") { fmtKey = KIP.rest(fmtKey, 1); }
            if (fmtKey === "_listeners") { return; }
            let outVal = this._savePiece(fmtKey as keyof T, val);
            if (!KIP.isNullOrUndefined(outVal)) { out[fmtKey] = outVal; }
        });

        return out;
    }

    /**
     * _savePiece
     * ----------------------------------------------------------------------------
     * Save a piece of data to our out array. If the data is a model itself, calls
     * SaveData to retrieve the data from that model.
     * @param   key     The key to save data for
     * @param   value   The value of that key
     * 
     * @returns The value
     */
    protected _savePiece<K extends keyof T>(key: K, val: T[K]): T[K] {
        let capitalizedName: string = (key[0].toUpperCase() + KIP.rest(key as string, 1));
        let saveFuncName: string = "_save" + capitalizedName;

        // if there is a custom function to save this particular data element, use that
        if (this[saveFuncName]) {
            return this[saveFuncName]();
        }

        let privateName: string = "_" + key;

        // determine if this is an array of elements, and if so, check if they have the ability to save themselves
        if (this[privateName] instanceof Array) {
            let outArr = [];
            for (let elem of this[privateName]) {
                if (elem && elem.saveData) {
                    outArr.push(elem.saveData());
                } else {
                    outArr.push(elem);
                }
            }
            return outArr as any as T[K];
        }
        else if (this[privateName] && this[privateName].saveData) {
            return this[privateName].saveData();
        }
        else {
            return this[privateName];
        }
    }

    //#endregion
    //....................

    //...........................
    //#region MANAGE LISTENERS

    /**
     * _setValue
     * ---------------------------------------------------------------------------
     * Helper to update a value in this model & notify listeners about the change
     */
    protected _setValue<K extends keyof T>(key: K, value: T[K]): void {
        let privateName: string = "_" + key;
        let currentValue: T[K] = this[privateName];
        this[privateName] = value;
        this._notifyListeners(key, currentValue, value);
    }

    /**
     * _notifyListeners
     * ---------------------------------------------------------------------------
     * Let any subscribers to this model know that some changes have occurred
     * @param   key     The key that changed in the model
     * @param   oldVal  The previous version of this key's value
     * @param   newVal  The new version of this key's value
     */
    protected _notifyListeners<K extends keyof T>(key: K, oldVal: T[K], newVal: T[K]): void {
        this._notifyModelListeners(key, oldVal, newVal);
        this._notifyPropertyListeners(key, oldVal, newVal);
    }

    /**
     * _notifyModelListeners
     * ----------------------------------------------------------------------------
     * Let any listeners that care about any change to the model know that this 
     * particular key has changed to this particular value
     */
    protected _notifyModelListeners<K extends keyof T>(key: K, oldVal: T[K], newVal: T[K]): void {
        let listeners = this.__modelListeners;
        if (!listeners || listeners.length === 0) { return; }

        for (let listener of listeners) {
            if (!listener) { continue; }
            listener(key, newVal, oldVal);
        }
    }

    /**
     * _notifyPropertyListerners
     * ----------------------------------------------------------------------------
     * Let any listeners that care about this particular property know that it has 
     * changed
     */
    protected _notifyPropertyListeners<K extends keyof T>(key: K, oldVal: T[K], newVal: T[K]): void {
        let listeners = this.__propertyListeners[key];
        if (!listeners) { return; }

        // notify all registered listeners
        for (let listener of listeners) {
            if (!listener) { continue; }
            listener(newVal, oldVal);
        }
    }

    /**
     * registerListener
     * ---------------------------------------------------------------------------
     * @param key 
     * @param listener 
     * @param uniqueKey 
     */
    public registerPropertyListener<K extends keyof T>(key: K, listener: IPropertyChangeListener<T, K>): void {
        if (!this.__propertyListeners[key]) { this.__propertyListeners[key] = []; }
        this.__propertyListeners[key].push(listener);
    }

    /**
     * registerModelListener
     * ----------------------------------------------------------------------------
     * register a listener for any change that occurs in this model
     */
    public registerModelListener(listener: IModelChangeListener<T>): void {
        if (!listener) { return; }
    }

    //TODO: Unregister listeners

    //#endregion
    //...........................
}

/**----------------------------------------------------------------------------
 * @class   Serializable
 * ----------------------------------------------------------------------------
 * Creates a model that can be turned into a string
 * @author  Kip Price
 * @version 1.0.0
 * ----------------------------------------------------------------------------
 */
export abstract class Serializable<T> extends Model<T> {

    /**
     * serialize
     * ----------------------------------------------------------------------------
     * Turn this model into a savable JSON string
     * @returns The string version of this data   
     */
    public serialize(): string {
        let data: T = this.saveData();
        return JSON.stringify(data);
    }

    /**
     * toString
     * ----------------------------------------------------------------------------
     * Override to allow for native javascript stringification
     * @returns String version of this data
     */
    public toString(): string {
        return this.serialize();
    }

    /**
     * deserialize
     * ----------------------------------------------------------------------------
     * Turns a string into a version of this model
     * @param   data  The string to deserialize
     * 
     * @returns True if we could deserialize
     */
    public deserialize(data: string): boolean {
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

export interface Identifiable {
    id: string;
}

/**----------------------------------------------------------------------------
 * @class   Identifiable<T>
 * ----------------------------------------------------------------------------
 * Creates a model that has an associated ID
 * @author  Kip Price
 * @version 1.0.0
 * ----------------------------------------------------------------------------
 */
export class IdentifiableModel<T extends Identifiable = Identifiable> extends Serializable<T> implements Identifiable {

    //.....................
    //#region PROPERTIES

    /** unique ID for the model */
    protected _id: string;
    public get id(): string { return this._id; }
    public set id(data: string) { this._id = data; }

    /** track the last ID used in a model */
    protected static _lastId: number = 0;

    //#endregion
    //.....................

    /**
     * _generateNewId
     * ---------------------------------------------------------------------------
     * spin up a new ID for a new model
     * 
     * @returns A new ID 
     */
    protected static _generateNewId(): string {
        this._lastId += 1;
        return this._lastId.toString();
    }

    /**
     * _updateLastId
     * ---------------------------------------------------------------------------
     * When incorporating an existing model, update the last ID used
     * @param   lastId  Most recent iD used in a model  
     */
    protected static _updateLastId(lastId: string): void {
        let lastNumericId = parseInt(lastId);
        if (isNaN(lastNumericId)) {
            this._lastId += 1;      // don't fail on NaN conditions; just increment
        } else {
            this._lastId = lastNumericId;
        }

    }

    /**
     * IdentifiableModel
     * ---------------------------------------------------------------------------
     * Create a new model with a unique ID
     * @param   dataToCopy  If available, the interface to copy into this model 
     */
    constructor(dataToCopy?: IPartial<T>) {
        super(dataToCopy);

        // make sure we have an appropriate id stored statically
        if (dataToCopy && dataToCopy.id) {
            (this.constructor as any)._updateLastId(dataToCopy.id)
        } else {
            this._id = (this.constructor as any)._generateNewId();
        }
    }
}
