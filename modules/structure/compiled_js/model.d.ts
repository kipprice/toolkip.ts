/// <reference path="../../../../compiled_js/kip.d.ts" />
export declare function isIdentifiableModel(model: Model<any>): model is IdentifiableModel;
export interface IPropertyChangeListener<T, K extends keyof T> {
    (newValue: T[K], oldValue?: T[K]): void;
}
export interface IModelChangeListener<T> {
    (key: keyof T, newValue: T[keyof T], oldValue?: T[keyof T]): void;
}
export declare type IPropertyChangeListeners<T> = {
    [K in keyof T]?: IPropertyChangeListener<T, K>[];
};
export declare type IPartial<T> = {
    [K in keyof T]?: T[K];
};
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
export declare abstract class Model<T extends IModel = IModel> {
    /** track listeners for specific properties registered by callers */
    private __propertyListeners;
    /** track listeners for specific properties registered by callers */
    private __modelListeners;
    /**
     * Model
     * ----------------------------------------------------------------------------
     * Create a new model from specific data
     * @param   dataToCopy  If provided, the JSON of this data to copy over
     */
    constructor(dataToCopy?: IPartial<T>);
    /**
     * _setDefaultValues
     * ----------------------------------------------------------------------------
     * Overridable function to initialize any default data that is needed
     */
    protected _setDefaultValues(): void;
    /**
     * _copyData
     * ----------------------------------------------------------------------------
     * Copies data from a JSON version of this model
     * @param   data    The data to save into our model
     */
    protected _copyData<K extends keyof T>(data: IPartial<T>): void;
    /**
     * _copyPiece
     * ----------------------------------------------------------------------------
     * Copy a particular piece of data into this class
     * @param   key     The key to copy over
     * @param   value   The value to copy over
     */
    protected _copyPiece<K extends keyof T>(key: K, value: T[K]): void;
    /**
     * _copyModelArray
     * ----------------------------------------------------------------------------
     *
     * @param arr
     * @param constructor
     */
    protected _copyModelArray<I, M extends I>(arr: I[], constructor: KIP.IConstructor<M>): M[];
    /**
     * _copyModelDictionary
     * ----------------------------------------------------------------------------
     * @param dict
     * @param constructor
     */
    protected _copyModelDictionary<I, M extends I>(dict: KIP.IDictionary<I>, constructor: KIP.IConstructor<M>): KIP.IDictionary<M>;
    /**
     * update
     * ----------------------------------------------------------------------------
     * update various elements of the model to match the passed in data
     */
    update(model: IPartial<T>): void;
    /**
     * saveData
     * ----------------------------------------------------------------------------
     * Gets data out of this model in JSON format
     */
    saveData<K extends keyof T>(): T;
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
    protected _savePiece<K extends keyof T>(key: K, val: T[K]): T[K];
    /**
     * _setValue
     * ---------------------------------------------------------------------------
     * Helper to update a value in this model & notify listeners about the change
     */
    protected _setValue<K extends keyof T>(key: K, value: T[K]): void;
    /**
     * _notifyListeners
     * ---------------------------------------------------------------------------
     * Let any subscribers to this model know that some changes have occurred
     * @param   key     The key that changed in the model
     * @param   oldVal  The previous version of this key's value
     * @param   newVal  The new version of this key's value
     */
    protected _notifyListeners<K extends keyof T>(key: K, oldVal: T[K], newVal: T[K]): void;
    /**
     * _notifyModelListeners
     * ----------------------------------------------------------------------------
     * Let any listeners that care about any change to the model know that this
     * particular key has changed to this particular value
     */
    protected _notifyModelListeners<K extends keyof T>(key: K, oldVal: T[K], newVal: T[K]): void;
    /**
     * _notifyPropertyListerners
     * ----------------------------------------------------------------------------
     * Let any listeners that care about this particular property know that it has
     * changed
     */
    protected _notifyPropertyListeners<K extends keyof T>(key: K, oldVal: T[K], newVal: T[K]): void;
    /**
     * registerListener
     * ---------------------------------------------------------------------------
     * @param key
     * @param listener
     * @param uniqueKey
     */
    registerPropertyListener<K extends keyof T>(key: K, listener: IPropertyChangeListener<T, K>): void;
    /**
     * registerModelListener
     * ----------------------------------------------------------------------------
     * register a listener for any change that occurs in this model
     */
    registerModelListener(listener: IModelChangeListener<T>): void;
}
/**----------------------------------------------------------------------------
 * @class   Serializable
 * ----------------------------------------------------------------------------
 * Creates a model that can be turned into a string
 * @author  Kip Price
 * @version 1.0.0
 * ----------------------------------------------------------------------------
 */
export declare abstract class Serializable<T> extends Model<T> {
    /**
     * serialize
     * ----------------------------------------------------------------------------
     * Turn this model into a savable JSON string
     * @returns The string version of this data
     */
    serialize(): string;
    /**
     * toString
     * ----------------------------------------------------------------------------
     * Override to allow for native javascript stringification
     * @returns String version of this data
     */
    toString(): string;
    /**
     * deserialize
     * ----------------------------------------------------------------------------
     * Turns a string into a version of this model
     * @param   data  The string to deserialize
     *
     * @returns True if we could deserialize
     */
    deserialize(data: string): boolean;
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
export declare class IdentifiableModel<T extends Identifiable = Identifiable> extends Serializable<T> implements Identifiable {
    /** unique ID for the model */
    protected _id: string;
    id: string;
    /** track the last ID used in a model */
    protected static _lastId: number;
    /**
     * _generateNewId
     * ---------------------------------------------------------------------------
     * spin up a new ID for a new model
     *
     * @returns A new ID
     */
    protected static _generateNewId(): string;
    /**
     * _updateLastId
     * ---------------------------------------------------------------------------
     * When incorporating an existing model, update the last ID used
     * @param   lastId  Most recent iD used in a model
     */
    protected static _updateLastId(lastId: string): void;
    /**
     * IdentifiableModel
     * ---------------------------------------------------------------------------
     * Create a new model with a unique ID
     * @param   dataToCopy  If available, the interface to copy into this model
     */
    constructor(dataToCopy?: IPartial<T>);
}
