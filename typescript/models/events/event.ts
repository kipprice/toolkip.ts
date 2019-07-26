namespace KIP.Events {

	//.....................
	//#region INTERFACES

	/**
	 * IEvent
	 * ----------------------------------------------------------------------------
	 * Keeps track of the basics of an event 
	 */
	export interface IEventDefinition {

		/** name of the event, largely for readability */
		name: string;

		/** the key of the event, under which this event will be stored */
		key: string;

	}

	/**
	 * IListener
	 * ----------------------------------------------------------------------------
	 * Creates a function ready to receive context from a particular event firing
	 * @param	ev	The Event that is being fired
	 */
	export interface IListener<C extends IEventContext>  {
		(ev: Event<C>): void;
	}

	/**
	 * IListenerData
	 * ----------------------------------------------------------------------------
	 * Keeps track of all info we need about an event listener
	 */
	export interface IListenerData<C extends IEventContext> {

		/** the function to call when the appropriate event is fired */
		func: IListener<C>;

		/** if included, ensures that the element issuing the event is the one registered before calling the listener */
		target?: any;

		/** if included, a unique qualifier of the listener */
		uniqueId?: string;
	}

	/**
	 * IEventContext
	 * 
	 * Keeps track of the context atound a particular event dispatch
	 * 
	 */
	export interface IEventContext {

		/** if included, who should be considered the element triggering this event */
		target?: any;

		/** keep track of any other data */
		[key: string]: any;
	}

	//#endregion

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

