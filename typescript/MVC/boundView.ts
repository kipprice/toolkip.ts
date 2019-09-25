/// <reference path="../views/drawable.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class	BoundView
     * ----------------------------------------------------------------------------
     * create a view that binds to a view model
     * @author	Kip Price
     * @version	1.0.1
     * ----------------------------------------------------------------------------
     */
    export abstract class BoundView<VM = any> extends Drawable {

        //.....................
        //#region PROPERTIES
        
        /** keep track of the model associated with this view */
        protected _model: VM;
        public get model(): VM { return this._getModel(); }
        public set model(data: VM) { this._setModel(data); }

        /** keep track of each of the update functions */
        protected _updateFunctions: IUpdateFunctions<VM>;
        public get updateFunctions(): IUpdateFunctions<VM> { return this._updateFunctions; }
        public set updateFunctions(data: IUpdateFunctions<VM>) { this._updateFunctions = data; }
        
        //#endregion
        //.....................

        //..........................................
        //#region CREATE THE VIEW
        
        public constructor(template?: IElemDefinition<IDictionary<Drawable | HTMLElement | SVGElement, string>>) {
            super(template);
            this._updateFunctions = {} as any;
            this._model = {} as any;
            this._createElements();
        }

        protected _shouldSkipCreateElements(): boolean { return true; }
        
        //#endregion
        //..........................................

        //..........................................
        //#region MODEL HANDLING
        
        protected _getModel(): VM {
            let oldModel: VM = JSON.parse(JSON.stringify(this._model));
            window.setTimeout( 
                () => this._onPotentialModelChange(oldModel), 
                0
            );
            return this._model; 
        }

        protected _setModel(data: VM): void {
            let oldModel: VM = this._model;
            this._model = data; 
            window.setTimeout(
                () => this._onPotentialModelChange(oldModel),
                0
            );
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region EVENT HANDLERS
        
        /**
         * _onPotentialModelChange
         * ----------------------------------------------------------------------------
         * overridable function to allow for any array-based child views
         */
        protected _onPotentialModelChange(oldModel: VM): void { }
        
        //#endregion
        //..........................................

        //..........................................
        //#region BINDING
        
        /**
         * _bind
         * ----------------------------------------------------------------------------
         * bind a particular element of the view model to the specified element
         */
        protected _bind<K extends keyof VM>(elem: IBindableElement<VM[K] | VM>, key?: K): void {
            bind(
                () => { 
                    // handle the null case
                    if (!this._model) { return ""; }

                    // handle if the user specified a specific key in the model
                    if (key) { return this._model[key]; } 

                    // otherwise, just return the model
                    return this._model;
                },
                this._createUpdateFunc(elem, key),
                () => this._shouldDelete(elem)
            );
        }

        /**
         * _createUpdateFunc
         * ----------------------------------------------------------------------------
         * helper that will generate an update function for binding
         */
        protected _createUpdateFunc<K extends keyof VM>(elem: IBindableElement<VM[K] | VM>, key?: K): BoundUpdateFunction<any> {
            return (value: VM[K] | VM) => {

                // always prefer a user-specified function over the default behavior
                if (this._updateFunctions[key as string]) {
                    this._updateFunctions[key as string](value, elem);
                    return; 
                }

                if (this._updateFunctions["_"]) {
                    this._updateFunctions["_"](value, elem);
                    return;
                }

                // otherwise, fall back on a default appropriate to the element type
                if (isHTMLElement(elem)) {
                    this._updateHtmlElement(elem, value);
                } else if (isUpdatable(elem)) {
                    this._updateUpdateable(elem, value);
                } else {
                    this._updateBoundView(elem as BoundView<VM[K]>, value);
                }

            }
            
        }

        protected _updateHtmlElement<K extends keyof VM>(elem: HTMLElement, value: VM[K] | VM): void {
            if (!value) { value = "" as any; }
            elem.innerHTML = value.toString(); 
        }

        protected _updateUpdateable<K extends keyof VM>(elem: UpdateableView<VM[K] | VM>, value: VM[K] | VM): void {
            elem.update(value);
        }

        protected _updateBoundView<K extends keyof VM>(elem: BoundView<VM[K] | VM>, value: VM[K] | VM): void {
            elem.model = value;
        }
        
        /**
         * setUpdateFunction
         * ----------------------------------------------------------------------------
         * specify how a particular element should be updated when the model updates
         */
        public setUpdateFunction(key: keyof VM, updateFunc: IViewUpdateFunc<VM>): void {
            if (!updateFunc) { return; }
            this._updateFunctions[key as string] = updateFunc;
        }

        protected _shouldDelete<K extends keyof VM>(elem: IBindableElement<VM[K] | VM>): boolean {

            // if this element is no longer rendered, we should kill its bindings
            if (isDrawable(elem)) {
                return (!elem.base.parentNode);
            } else {
                return (!elem.parentNode)
            }
        }

        //#endregion
        //..........................................

        //..........................................
        //#region UNRENDERING
        
        public erase() {
            super.erase();
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region HELPERS
        
        /**
         * _createElement
         * ----------------------------------------------------------------------------
         * wrapper around the standard function for creating elements that handles 
         * binding a little more nuanced
         */
        protected _createElement(obj: IBoundElemDefinition<VM>): StandardElement {

            // use the standard function, but recurse with this one
            let recurseFunc: ICreateElementFunc = (obj: IBoundElemDefinition) => { return this._createElement(obj); }
            let elem = createCustomElement(obj, this._elems as any, recurseFunc);

            // if a binding is specified, set it up
            if (obj.boundTo) { this._bindElement(elem, obj); }

            return elem;
        }

        protected async _bindElement(elem: IBindableElement<any>, obj: IBoundElemDefinition<VM>): Promise<void> {
            let boundElem: IBindableElement<any> = elem;
            if (obj.key && obj.drawable) { boundElem = this._elems[obj.key] as IBindableElement<any>; }
            this._bind(boundElem, obj.boundTo); 
        }
        
        //#endregion
        //..........................................
    }

    //..........................................
    //#region TYPE CHECKS

    export function isUpdateableView<T = any>(elem: IBindableElement<T>): elem is UpdateableView<T> {
        if ((elem as any).update) { return true; }
        return false;
    }
    
    //#endregion
    //..........................................

    //..........................................
    //#region INTERFACES
    
    export type IBoundChild<VM> = StandardElement | IBoundElemDefinition<VM> | Drawable;

    export interface IBoundElemDefinition<VM = any> extends IElemDefinition {
        boundTo?: keyof VM;
        children?: IBoundChild<VM>[];
    }

    export interface IViewUpdateFunc<T> {
        (newValue: T, elem: IBindableElement<T>): void
    }

    export type IUpdateFunctions<VM> = {
        [K in keyof VM]: IViewUpdateFunc<VM[K]>
    }

    export type IBindableElement<T> = StandardElement | BoundView<T> | UpdateableView<T>;
    
    //#endregion
    //..........................................
}