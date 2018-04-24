namespace KIP.Events {

	//#region INTERFACES
	/**...........................................................................
	 * IEvent
	 * ...........................................................................
	 * Keeps track of the basics of an event 
	 * ...........................................................................
	 */
	export interface IEvent {

		/** name of the event, largely for readability */
		name: string;

		/** the key of the event, under which this event will be stored */
		key: string;

	}

	/**...........................................................................
	 * IListener
	 * ...........................................................................
	 * Creates a function ready to receive context from a particular event firing
	 * 
	 * @param	ev	The Event that is being fired
	 * ...........................................................................
	 */
	export interface IListener  {
		(ev: Event): void;
	}

	/**...........................................................................
	 * IListenerData
	 * ...........................................................................
	 * Keeps track of all info we need about an event listener
	 * ...........................................................................
	 */
	export interface IListenerData {

		/** the function to call when the appropriate event is fired */
		func: IListener;

		/** if included, ensures that the element issuing the event is the one registered before calling the listener */
		target?: any;

		/** if included, a unique qualifier of the listener */
		uniqueId?: string;
	}

	/**...........................................................................
	 * IEventContext
	 * ...........................................................................
	 * Keeps track of the context atound a particular event dispatch
	 * ...........................................................................
	 */
	export interface IEventContext {

		/** if included, who should be considered the element triggering this event */
		target?: any;

		/** keep track of any other data */
		[key: string]: any;
	}

	//#endregion

	export class Event {
		/** keep track of the name of the event */
		protected _name: string;

		/** key to use to associate this [articular event] */
		protected _key: string;

		/** colletcion of areas of code that care when this event fires */
		protected _listeners: Collection<IListenerData>;

		/** keep track of how many listeners we've added */
		protected _numOfListeners: number = 0;

		/** grab the appropriate context for the event */
		protected _context: IEventContext;
		public get context(): IEventContext { return this._context; }

		/**...........................................................................
		 * Creates a new Event
		 * @param 	details 	The specs for this particular event
		 * ...........................................................................
		 */
		constructor(details: IEvent) {
			this._name = details.name;
			this._key = details.key;
			this._listeners = new Collection<IListenerData>(CollectionTypeEnum.ReplaceDuplicateKeys);
		}

		/**...........................................................................
		 * addListener
		 * ...........................................................................
		 * add a listener to our collection (with the option to replace if using a unique key) 
		 * 
		 * @param	listenerData	The listener features to add
		 * ...........................................................................
		 */
		public addListener(listenerData: IListenerData): void {
			listenerData.uniqueId = listenerData.uniqueId || (this._key + this._numOfListeners.toString());
			this._listeners.addElement(listenerData.uniqueId, listenerData);
			this._numOfListeners += 1;
		}

		/**...........................................................................
		 * removeEventListener
		 * ...........................................................................
		 *  allow a listener to be skipped 
		 * 
		 * @param	uniqueId	Unique identifier for the listener to remove
		 * ...........................................................................
		 */
		public removeEventListener(uniqueId: string): void {
			if (!uniqueId) { return; }
			this._listeners.removeElement(uniqueId);
		}

		/**...........................................................................
		 * notifyListeners
		 * ...........................................................................
		 * Let listeners know that an event that they care about has been fired
		 * 
		 * @param 	context 	The context to send along with the event
		 * ...........................................................................
		 */
		public notifyListeners(context: IEventContext): void {
			this._context = context;

			// loop through the listeners to find one that applies for this context
			this._listeners.map((elem: IListenerData, key: string) => {
				if (!elem) { return; }
				if (!elem.target || (equals(elem.target, context.target))) {
					elem.func(this);
				}
			});

			// reset our context
			this._context = null; 
		}

	}

}

