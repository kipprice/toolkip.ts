namespace KIP {

    /**----------------------------------------------------------------------------
     * @class	DataMaanager
     * ----------------------------------------------------------------------------
     * generic manager for any element that has an ID
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class DataManager<I extends KIP.Identifiable> {

        //.....................
        //#region PROPERTIES

        /** data backing this manager */
        protected _data: KIP.IDictionary<I>;

        //#endregion
        //.....................

        //..........................................
        //#region CREATE THE MANAGER
        
        /**
         * DataManager
         * ----------------------------------------------------------------------------
         * generate a new data manager
         */
        public constructor() {
            this._data = {};
            this._populateWithDefaultData();
        }

        /**
         * _populateWithDefaultData
         * ----------------------------------------------------------------------------
         * overridable function that can assign default data to this manager
         */
        protected _populateWithDefaultData(): void { }

        /**
         * _createAndAddDefault
         * ----------------------------------------------------------------------------
         * add a generic default to this manager
         */
        protected _createAndAddDefault(data: I): void {
            this.add(data);
        }
        
        //#endregion
        //..........................................
        
        //..........................................
        //#region ADD AND REMOVE DATA

        /**
         * add
         * ----------------------------------------------------------------------------
         * add a new element to this manager
         */
        public add(datum: I): boolean {
            if (this.contains(datum.id)) { return false; }
            this._data[datum.id] = datum;
            return true;
        }

        /**
         * remove
         * ----------------------------------------------------------------------------
         * remove an element from this manager
         */
        public remove(id: ManagedId): I {
            if (!this.contains(id)) { return null; }
            let out = this.get(id);
            delete this._data[id];
            return out;
        }

        /**
         * contains
         * ----------------------------------------------------------------------------
         * test if a particular element is present in the manager
         */
        public contains(id: ManagedId): boolean {
            return !!this._data[id];
        }

        /**
         * clear
         * ----------------------------------------------------------------------------
         * clear out all elements in the manager
         */
        public clear(): void {
            this._data = {};
        }

        //#endregion
        //..........................................

        //..........................................
        //#region RETRIEVE DATA     
        
        /**
         * get
         * ----------------------------------------------------------------------------
         * get the element with the specified ID
         */
        public get(id: ManagedId): I {
            if (!this.contains(id)) { return null; }
            return this._data[id];
        }
        
        //#endregion
        //.........................................
        
        //..........................................
        //#region STANDARD COLLECTION FORM
        
        /**
         * toArray
         * ----------------------------------------------------------------------------
         * get the data contained within this manager as an array
         */
        public toArray(): I[] {
            let out: I[] = [];
            KIP.map(this._data, (elem: I) => {
                out.push(elem);
            })
            return out;
        }

        /**
         * toDictionary
         * ----------------------------------------------------------------------------
         * get the data contained wuthin this manager as an dictionary
         */
        public toDictionary(): IDictionary<I> {
            let out: IDictionary<I> = {};
            KIP.map(this._data, (elem: I, id: ManagedId) => {
                out[id] = elem;
            });
            return out;
        }
        
        //#endregion
        //...........................................
        
    }

    //..........................................
    //#region TYPES AND INTERFACES
    
    export type ManagedId = string | number;

    export interface Creatable<I extends Identifiable> {
        create(d: Partial<I>): IdentifiableModel<I>;
    }

    export interface Loadable<I extends Identifiable> {
        load(id: ManagedId): Promise<I>;
    }
    
    //#endregion
    //..........................................
}