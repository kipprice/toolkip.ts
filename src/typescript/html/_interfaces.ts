namespace KIP {
    //..........................................
    //#region INTERFACES AND TYPES
    
    export type IAttribute = IKeyValPair<string> | string | number;
    export interface IAttributes {
        [key: string]: IAttribute;
    }

    export type IChild = StandardElement | IElemDefinition | Drawable;
    export type IChildren = IChild[];

    export interface IClasses {
        [key: string]: IClassDefinition | IKeyValPair<string>[];
    }

    export interface IClassDefinition {
        [key: string]: string;
    }

    export type IKeyedElems = IDictionary<StandardElement | Drawable>;

    /**
     * IElemDefinition
     * ----------------------------------------------------------------------------
     * Interface for how elements are created
     * @version 1.3.0
     */
    export interface IElemDefinition<T extends IKeyedElems = IKeyedElems> {

        /** unique key for this element; used to return an element */
        key?: keyof T;

        /** Id to use for the element */
        id?: string;

        /** CSS class to use for the element */
        cls?: string | IClasses;

        /** the type of HTML element we are creating */
        type?: "div" | "span" | "input" | "select" | "option" | "textarea" | "li" | "ul" | "p" | "br" | string;

        /** content that should be added to the element */
        content?: string;

        /** content that should specifically be added before the children of this element */
        before_content?: string;

        /** content that should specifically be added after the children of this element */
        after_content?: string;

        /** any additional attributes that should be applied to this element */
        attr?: IAttributes;

        /** any specific styles to apply to this element */
        style?: Styles.TypedClassDefinition;

        /** any children that should be added for this element */
        children?: IChildren;

        /** the parent element that this should be added to */
        parent?: StandardElement;

        /** allow callers to add event listeners while creating elements */
        eventListeners?: IEventListeners;

        /** if we're creating a namespaced element, allow for specifying it */
        namespace?: string;

        /** determine whether this element should be able to receive focus */
        focusable?: boolean;

        /** allow HTML contents to be bound dynamically */
        boundContent?: BoundEvalFunction<string>;

        /** builds a custom tooltip in lieu of the standard title */
        tooltip?: string;

        /** allow the function to spin up a drawable instead of an element (will still apply classes & the like) */
        drawable?: IConstructor<Drawable>;
    }

    /**
     * keep track of event listeners of a particular type
     */
    export type IEventListeners = {
        [key in keyof WindowEventMap]?: EventListener;
    }
}