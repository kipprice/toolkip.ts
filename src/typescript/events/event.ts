namespace KIP.Events {

	/**----------------------------------------------------------------------------
	 * @class	EventDefinition
	 * ----------------------------------------------------------------------------
	 * Declare the definition for a particular event
	 * @author	Kip Price
	 * @version 1.0.1
	 * ----------------------------------------------------------------------------
	 */
	export class EventDefinition<C extends IEventContext> {
		
		//.....................
		//#region PROPERTIES
		
		/** keep track of the name of the event */
		protected _name: string;

		/** key to use to associate this [articular event] */
		protected _key: string;

		/** colletcion of areas of code that care when this event fires */
		protected _listeners: Collection<IListenerData<C>>;

		/** keep track of how many listeners we've added */
		protected _numOfListeners: number = 0;
		
		//#endregion
		//.....................

		/**
		 * EventDefinition
		 * ----------------------------------------------------------------------------
		 * Creates a new Event
		 * @param 	details 	The specs for this particular event
		 */
		constructor(key: string, name: string) {
			this._name = name;
			this._key = key;
			this._listeners = new Collection<IListenerData<C>>(CollectionTypeEnum.ReplaceDuplicateKeys);
		}

		/**
		 * addListener
		 * ----------------------------------------------------------------------------
		 * add a listener to our collection (with the option to replace if using a unique key) 
		 * 
		 * @param	listenerData	The listener features to add
		 * 
		 */
		public addListener(listenerData: IListenerData<C>): void {
			listenerData.uniqueId = listenerData.uniqueId || (this._key + this._numOfListeners.toString());
			this._listeners.add(listenerData.uniqueId, listenerData);
			this._numOfListeners += 1;
		}

		/**
		 * removeEventListener
		 * ----------------------------------------------------------------------------
		 * allow a listener to be skipped 
		 * 
		 * @param	uniqueId	Unique identifier for the listener to remove
		 * 
		 */
		public removeEventListener(uniqueId: string): void {
			if (!uniqueId) { return; }
			this._listeners.remove(uniqueId);
		}

		/**
		 * notifyListeners
		 * ----------------------------------------------------------------------------
		 * Let listeners know that an event that they care about has been fired
		 * 
		 * @param 	context 	The context to send along with the event
		 * 
		 */
		public notifyListeners(context: Event<C>): void {

			// loop through the listeners to find one that applies for this context
			this._listeners.map((elem: IListenerData<C>, key: string) => {
				if (!elem) { return; }
				if (!elem.target || (equals(elem.target, context.context.target))) {
					elem.func(context);
				}
			});
		}

	}

	/**----------------------------------------------------------------------------
	 * @class	Event
	 * ----------------------------------------------------------------------------
	 * New instance of a particular event definition
	 * @author	Kip Price
	 * @version 1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export abstract class Event<C extends IEventContext> {

		//.....................
		//#region PROPERTIES

		/** event name (overriden by child classes) */
		protected abstract get _key(): string;
		public get key(): string { return this._key; }

		/** the context to include in the event */
		protected _context: C;
		public get context(): C { return this._context; }

		//#endregion
		//.....................

		/**
		 * Event
		 * ----------------------------------------------------------------------------
		 * create a new Event with the appropriate context
		 * @param	context		The context to add to the event
		 */
		constructor(context: C) {
			this._context = context;
		}
	}

}

