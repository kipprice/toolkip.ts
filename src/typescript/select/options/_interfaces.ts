namespace KIP {
    /**
     * IDynamicOption
     * ----------------------------------------------------------------------------
     * Keep track of a choice for a dynamic selection
     */
    export interface ICustomOption<T> {
        display: string;
        value: T;
    }
}