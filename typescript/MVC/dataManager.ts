namespace KIP {
    export type ManagedId = string | number;

    /**----------------------------------------------------------------------------
     * @class	Manager
     * ----------------------------------------------------------------------------
     * Manages a set of data; similar to a collection, but less intensive
     * @author	Kip Price
     * @version	1.0.2
     * ----------------------------------------------------------------------------
     */
    export abstract class DataManager<M extends KIP.IdentifiableModel<I>, I extends KIP.Identifiable> {

        //.....................
        //#region PROPERTIES

        /** data backing this manager */
        protected _data: KIP.IDictionary<M>;

        /** track any requests that are currently being loaded */
        protected _inFlight: KIP.IDictionary<Promise<M>>;

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
            this._inFlight = {};
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
        public add(datum: M): boolean {
            if (this.contains(datum.id)) { return false; }
            this._data[datum.id] = datum;
            return true;
        }

        /**
         * remove
         * ----------------------------------------------------------------------------
         * remove an element from this manager
         */
        public remove(id: ManagedId): M {
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
        public get(id: ManagedId): M {
            if (!this.contains(id)) { return null; }
            return this._data[id];
        }

        /**
         * getOrCreate
         * ----------------------------------------------------------------------------
         * get the data associated with a particular ID
         */
        public async getOrCreate(id: ManagedId): Promise<M> {

            // validate input
            if (!id) { throw new Error("no ID provided"); }

            // check if we already have info on this element; if so, return it
            let datum = this.get(id);
            if (datum) { return datum; }

            // check if we are already running a request for this element
            // if so, return the current request
            if (this._inFlight[id]) { return this._inFlight[id]; }

            // otherwise, run the appropriate loading code for this element
            this._inFlight[id] = this._loadAndCreate(id);
            return this._inFlight[id];
        }

        /**
         * _loadAndCreate
         * ---------------------------------------------------------------------------
         * create a new element via the appropriate loading call
         */
        protected async _loadAndCreate(id: ManagedId): Promise<M> {
            let d = await this.load(id);
            if (!d) { throw new Error("no data found for id '" + id + "'") };

            // create the appropriate model
            let datum = this.create(d);
            this.add(datum);
            return datum;
        }

        /**
         * toArray
         * ----------------------------------------------------------------------------
         * get the data contained within this manager as an array
         */
        public toArray(): M[] {
            let out: M[] = [];
            KIP.map(this._data, (elem: M) => {
                out.push(elem);
            })
            return out;
        }

        /**
         * toDictionary
         * ----------------------------------------------------------------------------
         * get the data contained wuthin this manager as an dictionary
         */
        public toDictionary(): IDictionary<M> {
            let out: IDictionary<M> = {};
            KIP.map(this._data, (elem: M, id: ManagedId) => {
                out[id] = elem;
            });
            return out;
        }

        //#endregion
        //..........................................

        //..........................................
        //#region GENERATE NEW DATA

        /**
         * create
         * ----------------------------------------------------------------------------
         * create a new element
         */
        public abstract create(d: I): M;

        /**
         * load
         * ----------------------------------------------------------------------------
         * load details about the element tied to the specified ID
         */
        public async abstract load(id: ManagedId): Promise<I>;

        //#endregion
        //..........................................
    }

}