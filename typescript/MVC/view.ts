/// <reference path="../views/drawable.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class   MVCView
     * ----------------------------------------------------------------------------
     * Create a view that will be used in a MVC world
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class MVCView<I extends IModel, VM extends ViewModel<Model<I>> = ViewModel<Model<I>>, E extends string = string> extends Drawable {

        //.....................
        //#region PROPERTIES
        
        /** keep track of whether this view is currently considered active */
        protected _isActive: boolean;
        
        //#endregion
        //.....................

        /**
         * MVCView
         * ----------------------------------------------------------------------------
         * Create a view that will be used for MVC-structured projects
         * @param   model       Model to generate this view off of
         * @param   addlParams  ANything additional needed to render this view
         */
        constructor(model: VM, ...addlParams: any[]) {
            super();
            this._createElements(model, ...addlParams);
        }

        /**
         * _shouldSkipCreateElements
         * ----------------------------------------------------------------------------
         * Skip creating elements until we are ready
         */
        protected _shouldSkipCreateElements(): boolean { return true; }

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * Create the elements needed for this particular view
         * @param   model       The model to use to create the view
         * @param   addlParams  Any additional data needed to appropriately create the 
         *                      view
         */
        protected abstract _createElements(model: VM, ...addlParams: any[]): void;

        /**
         * _dispatchEvent
         * ----------------------------------------------------------------------------
         * send notification that an event occurred on this view
         */
        protected abstract _dispatchEvent(eventType: E, ...addlParams: any[]): void;

        /**
         * _dispatchStandardEvent
         * ----------------------------------------------------------------------------
         * easy access to use the standard event functionality; notifies event handlers
         * that their view has had some sort of interaction
         */
        protected _dispatchStandardEvent(eventType: E, ...addlParams: any[]): void {
            //Events.dispatchEvent( new ViewEvent({ target: this, type: eventType, addlData: addlParams }) );
        }

    }

    /**----------------------------------------------------------------------------
     * @class	MappedView
     * ----------------------------------------------------------------------------
     * Builds a MVC view that is tied to a particular model, rather than being
     * shared across different types of models
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class MappedView<I extends IModel, VM extends ViewModel<Model<I>> = ViewModel<Model<I>>> extends MVCView<I> {
        
        //.....................
        //#region PROPERTIES
        
        /** keep track of the model associated with this view */
        protected _model: VM;
        
        //#endregion
        //.....................

        /**
         * MappedView
         * ----------------------------------------------------------------------------
         * create the view and tie it into the model
         */
        public constructor(model: VM, ...addlParams: any[]) {
            super(model, addlParams);
            this._trackModel(model);
        }

        /**
         * _trackModel
         * ----------------------------------------------------------------------------
         * ensure that we store a reference to our model, and we listen for changes that
         * occur on it
         */
        protected _trackModel(model: VM) : void {
            this._model = model;
            this._model.registerModelListener(
                (key, newVal, oldVal) => { 
                    this._onModelUpdate(key, newVal, oldVal);
                }
            );
        }

        /**
         * _onModelUpdate
         * ----------------------------------------------------------------------------
         * Handle when there is a change made to the associated model
         */
        protected abstract _onModelUpdate<K extends keyof I>(key: K, newVal: I[K], oldVal: I[K]): void;
    }

    /**----------------------------------------------------------------------------
     * @class	SharedView
     * ----------------------------------------------------------------------------
     * Generate a view that can display data from lots of different models
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class SharedView<I extends IModel, VM extends ViewModel<Model<I>> = ViewModel<Model<I>>> extends MVCView<I> {
        
        /**
         * SharedView
         * ----------------------------------------------------------------------------
         * render a view that can display data from lots of different models
         */
        public constructor(...addlParams: any[]) {
            super(undefined, ...addlParams);
        }

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * create the elements needed by this view, bearing in mind that the model may 
         * not yet be available
         */
        protected abstract _createElements(model?: VM, ...addlParams: any[]): void;

        /**
         * _clear
         * ----------------------------------------------------------------------------
         * Clear out the contents of this view
         */
        protected abstract _clear();

        /**
         * update
         * ----------------------------------------------------------------------------
         * Let the view know that our model has updated and we thus need to regenerate
         * appropriate styles.
         */
        public update(model: VM, ...addlParams: any[]): void {
            this._clear();
            this._createElements(model, ...addlParams);
        }

    }
}