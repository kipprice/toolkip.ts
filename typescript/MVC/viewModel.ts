
namespace KIP {

    export class ViewModel<T extends Model<I> = Model<I>, I extends IModel = IModel> {

        //.....................
        //#region PROPERTIES
        
        /** keep track of the core model behind this view model */
        protected _model: T;
        public get model(): T { return this._model; }
        
        
        //#endregion
        //.....................

        //..........................................
        //#region CREATE THE VIEW MODEL
        
        constructor ( model: T ) {
            this._model = model;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region PASS THROUGH GETTERS AND SETTERS
        
        /**
         * get
         * ----------------------------------------------------------------------------
         * performs a get operation on the model this view model contains
         */
        public get<K extends keyof T>(key: K): T[K] {
            return this._model[key];
        }

        /**
         * set
         * ----------------------------------------------------------------------------
         * performs a set operation on the model this view model contains
         */
        public set<K extends keyof T>(key: K, value: T[K]): void {
            this._model[key] = value;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region PASS THROUGH LISTENERS
        
        public registerModelListener ( func: IModelChangeListener<I> ): void {
            this._model.registerModelListener(func);
        }

        public registerPropertyListener ( key: keyof I, func: IPropertyChangeListener<I, keyof I> ): void {
            this._model.registerPropertyListener( key, func );
        }
        
        //#endregion
        //..........................................
    }
}