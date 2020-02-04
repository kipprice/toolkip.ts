/// <reference path="../drawable/drawable.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class   UpdateableView
     * ----------------------------------------------------------------------------
     * Create a view that will be used in a MVC world
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class UpdateableView<I> extends Drawable {

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
         * @param   addlParams  ANything additional needed to render this view
         */
        constructor(...addlParams: any[]) {
            super();
            this._createElements(...addlParams);
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
         * @param   addlParams  Any additional data needed to appropriately create the 
         *                      view
         */
        protected abstract _createElements(...addlParams: any[]): void;

        /**
         * _clear
         * ----------------------------------------------------------------------------
         * Clear out the contents of this view
         */
        public abstract clear();

        /**
         * update
         * ----------------------------------------------------------------------------
         * Let the view know that our model has updated and we thus need to update our 
         * display
         */
        public abstract update(model: I, ...addlParams: any[]): void;

    }
}