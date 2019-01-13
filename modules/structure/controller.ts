/// <reference path="../../../compiled_js/kip.d.ts" />

import { IModel, Model, isIdentifiableModel } from "./model";
import { MVCView } from "./view";

/**----------------------------------------------------------------------------
 * @class   Controller
 * ----------------------------------------------------------------------------
 * Generate class that will be responsible for all actions taken in an
 * MVC-structured application
 * 
 * @author  Kip Price
 * @version 1.0.1
 * ----------------------------------------------------------------------------
 */
export abstract class Controller<I extends IModel = IModel> {

    //.....................
    //#region PROPERTIES

    /** tracking of which controller this is */
    protected _id: string;

    /** standard view for the controller */
    protected _view: MVCView<I>;
    public get view(): MVCView<I> { return this._view; }

    /** model backing the controller */
    protected _model: Model<I>;
    public get model(): Model<I> { return this._model; }

    //#endregion
    //.....................

    //..........................................
    //#region STATIC TRACKING OF CONTROLLERS

    /** all the controllers of this particular type */
    protected static _controllers: KIP.IDictionary<Controller<IModel>>

    /** the last ID we had to manually assign to a controller of this type */
    protected static _lastId: number = 0;

    //#endregion
    //..........................................

    /**
     * Controller
     * ----------------------------------------------------------------------------
     * Generate a standard controller with a particular model backing it
     */
    constructor(model?: Model<I>) {
        if (!model) { return; }
        this._model = model;
        this._createView();

        // register this as a created controller
        this._registerController(model);
    }

    /**
     * _registerController
     * ----------------------------------------------------------------------------
     * ensure that this controller is being tracked in our static dictionary
     */
    protected _registerController(model?: Model<I>) {

        // track the current constructor
        let staticRef = (this.constructor as any);

        // find an appropriate id for the controller
        let id: string;
        if (isIdentifiableModel(model)) { id = "Model" + model.id; }
        else { id = "Controller" + (staticRef._lastId++); }

        // update our dictionary
        staticRef._controllers[id] = this;
    }

    /**
     * update
     * ----------------------------------------------------------------------------
     * Update our view with a new model
     */
    public update(model: Model<I>) {
        this._model = model;
        this._createView();
    }

    /**
     * _createView
     * ----------------------------------------------------------------------------
     * Generate the appropriate view for this controller
     */
    protected abstract _createView(): MVCView<I>;


}
