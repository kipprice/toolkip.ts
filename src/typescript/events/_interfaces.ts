namespace KIP.Events {
    
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
}