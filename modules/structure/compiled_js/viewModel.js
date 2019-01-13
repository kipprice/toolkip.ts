define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**----------------------------------------------------------------------------
     * @class	ViewModel
     * ----------------------------------------------------------------------------
     * keep track of the details of the model that should be exposed to the view
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    var ViewModel = /** @class */ (function () {
        //#endregion
        //.....................
        //..........................................
        //#region CREATE THE VIEW MODEL
        function ViewModel(model) {
            this._model = model;
        }
        Object.defineProperty(ViewModel.prototype, "model", {
            get: function () { return this._model; },
            enumerable: true,
            configurable: true
        });
        //#endregion
        //..........................................
        //..........................................
        //#region PASS THROUGH GETTERS AND SETTERS
        /**
         * get
         * ----------------------------------------------------------------------------
         * performs a get operation on the model this view model contains
         */
        ViewModel.prototype.get = function (key) {
            return this._model[key];
        };
        /**
         * set
         * ----------------------------------------------------------------------------
         * performs a set operation on the model this view model contains
         */
        ViewModel.prototype.set = function (key, value) {
            this._model[key] = value;
        };
        //#endregion
        //..........................................
        //..........................................
        //#region PASS THROUGH LISTENERS
        ViewModel.prototype.registerModelListener = function (func) {
            this._model.registerModelListener(func);
        };
        ViewModel.prototype.registerPropertyListener = function (key, func) {
            this._model.registerPropertyListener(key, func);
        };
        return ViewModel;
    }());
    exports.ViewModel = ViewModel;
});
//# sourceMappingURL=viewModel.js.map