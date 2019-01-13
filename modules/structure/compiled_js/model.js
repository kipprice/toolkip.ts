/// <reference path="../../../compiled_js/kip.d.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //..........................................
    //#region TYPE GUARDS
    function isIdentifiableModel(model) {
        if (!model) {
            return false;
        }
        if (!model.id) {
            return false;
        }
        return true;
    }
    exports.isIdentifiableModel = isIdentifiableModel;
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
    var Model = /** @class */ (function () {
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
        function Model(dataToCopy) {
            // initialize the listeners for our properties
            this.__propertyListeners = {};
            this.__modelListeners = [];
            // Copy data over from the passed in interface
            this._setDefaultValues();
            if (dataToCopy) {
                if (dataToCopy.saveData) {
                    dataToCopy = dataToCopy.saveData();
                }
                this._copyData(dataToCopy);
            }
        }
        /**
         * _setDefaultValues
         * ----------------------------------------------------------------------------
         * Overridable function to initialize any default data that is needed
         */
        Model.prototype._setDefaultValues = function () { };
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
        Model.prototype._copyData = function (data) {
            var _this = this;
            KIP.map(data, function (value, key) {
                _this._copyPiece(key, value);
            });
        };
        /**
         * _copyPiece
         * ----------------------------------------------------------------------------
         * Copy a particular piece of data into this class
         * @param   key     The key to copy over
         * @param   value   The value to copy over
         */
        Model.prototype._copyPiece = function (key, value) {
            var capitalizedName = (key[0].toUpperCase() + KIP.rest(key, 1));
            var copyFuncName = "_copy" + capitalizedName;
            // don't override values for undefined elements
            if (value === undefined) {
                return;
            }
            // if we have a custom function to write this data, use it
            if (this[copyFuncName]) {
                this[copyFuncName](value);
                return;
            }
            ;
            // if our current value for this field can be updated, do that instead
            if (KIP.isUpdatable(this[key])) {
                this[key].update(value);
                return;
            }
            var savableValue;
            // make shallow copies of arrays by default
            if (KIP.isArray(value)) {
                savableValue = (value.slice());
                // stringify and parse objects by default
            }
            else if (KIP.isObject(value)) {
                savableValue = JSON.parse(JSON.stringify(value));
                // just use primitives as is
            }
            else {
                savableValue = value;
            }
            // otherwise, just set our internal property to have this value
            this._setValue(key, value);
        };
        /**
         * _copyModelArray
         * ----------------------------------------------------------------------------
         *
         * @param arr
         * @param constructor
         */
        Model.prototype._copyModelArray = function (arr, constructor) {
            var out = [];
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var m = arr_1[_i];
                var model = new constructor(m);
                out.push(model);
            }
            return out;
        };
        /**
         * _copyModelDictionary
         * ----------------------------------------------------------------------------
         * @param dict
         * @param constructor
         */
        Model.prototype._copyModelDictionary = function (dict, constructor) {
            var out = {};
            KIP.map(dict, function (m, key) {
                out[key] = new constructor(m);
            });
            return out;
        };
        /**
         * update
         * ----------------------------------------------------------------------------
         * update various elements of the model to match the passed in data
         */
        Model.prototype.update = function (model) {
            this._copyData(model);
        };
        //#endregion
        //.......................................
        //....................
        //#region SAVE DATA
        /**
         * saveData
         * ----------------------------------------------------------------------------
         * Gets data out of this model in JSON format
         */
        Model.prototype.saveData = function () {
            var _this = this;
            var out = {};
            KIP.map(this, function (val, key) {
                if (typeof val === "function") {
                    return;
                }
                var fmtKey = key;
                if (fmtKey[0] === "_") {
                    fmtKey = KIP.rest(fmtKey, 1);
                }
                if (fmtKey === "_listeners") {
                    return;
                }
                var outVal = _this._savePiece(fmtKey, val);
                if (!KIP.isNullOrUndefined(outVal)) {
                    out[fmtKey] = outVal;
                }
            });
            return out;
        };
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
        Model.prototype._savePiece = function (key, val) {
            var capitalizedName = (key[0].toUpperCase() + KIP.rest(key, 1));
            var saveFuncName = "_save" + capitalizedName;
            // if there is a custom function to save this particular data element, use that
            if (this[saveFuncName]) {
                return this[saveFuncName]();
            }
            var privateName = "_" + key;
            // determine if this is an array of elements, and if so, check if they have the ability to save themselves
            if (this[privateName] instanceof Array) {
                var outArr = [];
                for (var _i = 0, _a = this[privateName]; _i < _a.length; _i++) {
                    var elem = _a[_i];
                    if (elem && elem.saveData) {
                        outArr.push(elem.saveData());
                    }
                    else {
                        outArr.push(elem);
                    }
                }
                return outArr;
            }
            else if (this[privateName] && this[privateName].saveData) {
                return this[privateName].saveData();
            }
            else {
                return this[privateName];
            }
        };
        //#endregion
        //....................
        //...........................
        //#region MANAGE LISTENERS
        /**
         * _setValue
         * ---------------------------------------------------------------------------
         * Helper to update a value in this model & notify listeners about the change
         */
        Model.prototype._setValue = function (key, value) {
            var privateName = "_" + key;
            var currentValue = this[privateName];
            this[privateName] = value;
            this._notifyListeners(key, currentValue, value);
        };
        /**
         * _notifyListeners
         * ---------------------------------------------------------------------------
         * Let any subscribers to this model know that some changes have occurred
         * @param   key     The key that changed in the model
         * @param   oldVal  The previous version of this key's value
         * @param   newVal  The new version of this key's value
         */
        Model.prototype._notifyListeners = function (key, oldVal, newVal) {
            this._notifyModelListeners(key, oldVal, newVal);
            this._notifyPropertyListeners(key, oldVal, newVal);
        };
        /**
         * _notifyModelListeners
         * ----------------------------------------------------------------------------
         * Let any listeners that care about any change to the model know that this
         * particular key has changed to this particular value
         */
        Model.prototype._notifyModelListeners = function (key, oldVal, newVal) {
            var listeners = this.__modelListeners;
            if (!listeners || listeners.length === 0) {
                return;
            }
            for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                var listener = listeners_1[_i];
                if (!listener) {
                    continue;
                }
                listener(key, newVal, oldVal);
            }
        };
        /**
         * _notifyPropertyListerners
         * ----------------------------------------------------------------------------
         * Let any listeners that care about this particular property know that it has
         * changed
         */
        Model.prototype._notifyPropertyListeners = function (key, oldVal, newVal) {
            var listeners = this.__propertyListeners[key];
            if (!listeners) {
                return;
            }
            // notify all registered listeners
            for (var _i = 0, listeners_2 = listeners; _i < listeners_2.length; _i++) {
                var listener = listeners_2[_i];
                if (!listener) {
                    continue;
                }
                listener(newVal, oldVal);
            }
        };
        /**
         * registerListener
         * ---------------------------------------------------------------------------
         * @param key
         * @param listener
         * @param uniqueKey
         */
        Model.prototype.registerPropertyListener = function (key, listener) {
            if (!this.__propertyListeners[key]) {
                this.__propertyListeners[key] = [];
            }
            this.__propertyListeners[key].push(listener);
        };
        /**
         * registerModelListener
         * ----------------------------------------------------------------------------
         * register a listener for any change that occurs in this model
         */
        Model.prototype.registerModelListener = function (listener) {
            if (!listener) {
                return;
            }
        };
        return Model;
    }());
    exports.Model = Model;
    /**----------------------------------------------------------------------------
     * @class   Serializable
     * ----------------------------------------------------------------------------
     * Creates a model that can be turned into a string
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    var Serializable = /** @class */ (function (_super) {
        __extends(Serializable, _super);
        function Serializable() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * serialize
         * ----------------------------------------------------------------------------
         * Turn this model into a savable JSON string
         * @returns The string version of this data
         */
        Serializable.prototype.serialize = function () {
            var data = this.saveData();
            return JSON.stringify(data);
        };
        /**
         * toString
         * ----------------------------------------------------------------------------
         * Override to allow for native javascript stringification
         * @returns String version of this data
         */
        Serializable.prototype.toString = function () {
            return this.serialize();
        };
        /**
         * deserialize
         * ----------------------------------------------------------------------------
         * Turns a string into a version of this model
         * @param   data  The string to deserialize
         *
         * @returns True if we could deserialize
         */
        Serializable.prototype.deserialize = function (data) {
            try {
                var parsedData = JSON.parse(data);
                this._copyData(parsedData);
                return true;
            }
            catch (err) {
                console.log("non JSON: " + data);
                return false;
            }
        };
        return Serializable;
    }(Model));
    exports.Serializable = Serializable;
    /**----------------------------------------------------------------------------
     * @class   Identifiable<T>
     * ----------------------------------------------------------------------------
     * Creates a model that has an associated ID
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    var IdentifiableModel = /** @class */ (function (_super) {
        __extends(IdentifiableModel, _super);
        /**
         * IdentifiableModel
         * ---------------------------------------------------------------------------
         * Create a new model with a unique ID
         * @param   dataToCopy  If available, the interface to copy into this model
         */
        function IdentifiableModel(dataToCopy) {
            var _this = _super.call(this, dataToCopy) || this;
            // make sure we have an appropriate id stored statically
            if (dataToCopy && dataToCopy.id) {
                _this.constructor._updateLastId(dataToCopy.id);
            }
            else {
                _this._id = _this.constructor._generateNewId();
            }
            return _this;
        }
        Object.defineProperty(IdentifiableModel.prototype, "id", {
            get: function () { return this._id; },
            set: function (data) { this._id = data; },
            enumerable: true,
            configurable: true
        });
        //#endregion
        //.....................
        /**
         * _generateNewId
         * ---------------------------------------------------------------------------
         * spin up a new ID for a new model
         *
         * @returns A new ID
         */
        IdentifiableModel._generateNewId = function () {
            this._lastId += 1;
            return this._lastId.toString();
        };
        /**
         * _updateLastId
         * ---------------------------------------------------------------------------
         * When incorporating an existing model, update the last ID used
         * @param   lastId  Most recent iD used in a model
         */
        IdentifiableModel._updateLastId = function (lastId) {
            var lastNumericId = parseInt(lastId);
            if (isNaN(lastNumericId)) {
                this._lastId += 1; // don't fail on NaN conditions; just increment
            }
            else {
                this._lastId = lastNumericId;
            }
        };
        /** track the last ID used in a model */
        IdentifiableModel._lastId = 0;
        return IdentifiableModel;
    }(Serializable));
    exports.IdentifiableModel = IdentifiableModel;
});
//# sourceMappingURL=model.js.map