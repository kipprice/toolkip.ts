/// <reference path="../models/singleton.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class	Factory
     * ----------------------------------------------------------------------------
     * Class that allows for creation of lots of other classes
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class Factory<I extends IModel> extends Singleton {

        //..........................................
        //#region ABSTRACT GETTERS / SETTERS

        protected abstract get _modelConstructor(): KIP.IConstructor<Model<I>>;
        protected abstract get _viewModelConstructor(): KIP.IConstructor<ViewModel<Model<I>>>;
        protected abstract get _viewConstructor(): KIP.IConstructor<MVCView<I>>;
        protected abstract get _controllerConstructor(): KIP.IConstructor<Controller<I>>;
        protected abstract get _eventHandlerConstructor(): KIP.IConstructor<EventHandler<Controller<I>, MVCView<I>>>;

        //#endregion
        //..........................................

        //..........................................
        //#region CREATION FUNCTIONS

        /**
         * createModel
         * ----------------------------------------------------------------------------
         * create the appropriate model for this factory
         */
        public createModel(data?: I, ...addlParams: any[]): Model<I> {
            return this._createObject(this._modelConstructor, data, ...addlParams);
        }

        /**
         * createViewModel
         * ----------------------------------------------------------------------------
         * create the view-specific version of the model
         */
        public createViewModel(model: Model<I>, ...addlParams: any[]): ViewModel<Model<I>> {
            return this._createObject(this._viewModelConstructor, model, ...addlParams);
        }

        /**
         * createView
         * ----------------------------------------------------------------------------
         * create the UI that represents this model
         */
        public createView(viewModel: ViewModel<Model<I>>, ...addlParams: any[]): MVCView<I> {
            return this._createObject(this._viewConstructor, viewModel, ...addlParams);
        }

        /**
         * createController
         * ----------------------------------------------------------------------------
         * creates the controller that communicates between 
         */
        public createController(model: Model<I>, view: MVCView<I>, ...addlParams: any[]): Controller<I> {
            return this._createObject(this._controllerConstructor, model, view, ...addlParams);
        }

        public createEventHandler(view: MVCView<I>, controller: Controller<I>, ...addlParams: any[]): EventHandler<Controller<I>, MVCView<I>> {
            return this._createObject(this._eventHandlerConstructor, view, controller, ...addlParams);
        }

        //#endregion
        //..........................................

        //..........................................
        //#region HELPER FUNCTIONS
        
        protected _createObject<C extends KIP.IConstructor<T>, T>(constructor: C, ...params: any[]): T {
            if (!constructor) { return null; }
            return new constructor(...params);
        }
        
        //#endregion
        //..........................................
    }

}