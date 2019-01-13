/// <reference path="../../../compiled_js/kip.d.ts" />

import { IModel, Model } from "./model";
import { ViewModel } from "./viewModel";
import { MVCView } from "./view";
import { Controller } from "./controller";
import { EventHandler } from "./eventHandler";

/**----------------------------------------------------------------------------
 * @class	Factory
 * ----------------------------------------------------------------------------
 * Class that allows for creation of lots of other classes
 * @author	Kip Price
 * @version	1.0.0
 * ----------------------------------------------------------------------------
 */
export abstract class Factory<I extends IModel> extends KIP.Singleton {

    //..........................................
    //#region ABSTRACT GETTERS / SETTERS

    protected abstract get _modelConstructor(): KIP.IConstructor<Model<I>>;
    protected abstract get _viewModelConstructor(): KIP.IConstructor<ViewModel<Model<I>>>;
    protected abstract get _viewContructor(): KIP.IConstructor<MVCView<I>>;
    protected abstract get _controllerConstructor(): KIP.IConstructor<Controller<I>>;
    protected abstract get _eventHandlerConstructor(): KIP.IConstructor<EventHandler<I>>;

    //#endregion
    //..........................................

    //..........................................
    //#region CREATION FUNCTIONS

    public createModel(data?: I, ...addlParams: any[]): Model<I> {
        return this._createObject(this._modelConstructor, data, ...addlParams);
    }

    public createViewModel(model: Model<I>, ...addlParams: any[]): ViewModel<Model<I>> {
        return this._createObject(this._viewModelConstructor, model, ...addlParams);
    }

    public createView(viewModel: ViewModel<Model<I>>, ...addlParams: any[]): MVCView<I> {
        return this._createObject(this._viewContructor, viewModel, ...addlParams);
    }

    public createController(model: Model<I>, view: MVCView<I>, ...addlParams: any[]): Controller<I> {
        return this._createObject(this._controllerConstructor, model, view, ...addlParams);
    }

    public createEventHandler(view: MVCView<I>, controller: Controller<I>, ...addlParams: any[]): EventHandler<I> {
        return this._createObject(this._eventHandlerConstructor, view, controller, ...addlParams);
    }

    protected _createObject<C extends KIP.IConstructor<T>, T>(constructor: C, ...params: any[]): T {
        if (!constructor) { return null; }
        return new constructor(...params);
    }

    //#endregion
    //..........................................
}