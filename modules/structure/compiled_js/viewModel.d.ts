import { Model, IModel, IModelChangeListener, IPropertyChangeListener } from "./model";
/**----------------------------------------------------------------------------
 * @class	ViewModel
 * ----------------------------------------------------------------------------
 * keep track of the details of the model that should be exposed to the view
 * @author	Kip Price
 * @version	1.0.0
 * ----------------------------------------------------------------------------
 */
export declare class ViewModel<T extends Model<I> = Model<I>, I extends IModel = IModel> {
    /** keep track of the core model behind this view model */
    protected _model: T;
    readonly model: T;
    constructor(model: T);
    /**
     * get
     * ----------------------------------------------------------------------------
     * performs a get operation on the model this view model contains
     */
    get<K extends keyof T>(key: K): T[K];
    /**
     * set
     * ----------------------------------------------------------------------------
     * performs a set operation on the model this view model contains
     */
    set<K extends keyof T>(key: K, value: T[K]): void;
    registerModelListener(func: IModelChangeListener<I>): void;
    registerPropertyListener(key: keyof I, func: IPropertyChangeListener<I, keyof I>): void;
}
