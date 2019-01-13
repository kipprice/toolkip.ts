/// <reference path="../collection.ts" />

namespace KIP.Events {

	/**----------------------------------------------------------------------------
	 * @class 	EventHandler
	 * ----------------------------------------------------------------------------
	 * Handles all events that are raised by any applications
	 * @author	Kip Price
	 * @version 1.0.5
	 * ----------------------------------------------------------------------------
	 */
	export class EventHandler {

		public static eventTypes: {
			test: string;
			[key: string]: string;
		}

		/** keep track of all the events that are registered to this event handler */
		protected static _events: Collection<EventDefinition<any>> = new Collection<EventDefinition<any>>();

		/**
		 * createEvent
		 * ----------------------------------------------------------------------------
		 * create a new event with a partular key and name
		 * 
		 * @param	details		Specs for the event we are creating
		 * 
		 * @returns	True if a new event was created
		 */
		public static createEvent<C extends IEventContext>(details: IEventDefinition): boolean {
			let evt: EventDefinition<C> = new EventDefinition<C>(details);
			return (this._events.addElement(details.key, evt) !== -1);
		}

		/**
		 * dispatchEvent
		 * ----------------------------------------------------------------------------
		 * handle notifying listeners about an event that occurred 
		 * 
		 * @param	key			The key used by this particular event
		 * @param	context		THe additional context to use for the event
		 * */
		public static dispatchEvent<C extends IEventContext>(event: Event<C>): void {
			let evtDef: EventDefinition<C> = this._events.getValue(event.key);
			if (!evtDef) { return; }
			evtDef.notifyListeners(event);
		}

		/**
		 * addEventListener
		 * ----------------------------------------------------------------------------
		 * register an additional listener with a particular event 
		 * 
		 * @param	key				The key to use for the event
		 * @param	listenerData	The data to use for the listener being added
		 */
		public static addEventListener<C extends IEventContext>(key: string, listenerData: IListenerData<C>): void {
			let evt: EventDefinition<C> = this._events.getValue(key);
			if (!evt) { return; }
			evt.addListener(listenerData);
		}

		/**
		 * removeEventListener
		 * ----------------------------------------------------------------------------
		 *  remove a particular event listener 
		 * 
		 * @param	uniqueId	The unique ID for this listener
		 * @param	key			If specified, the particular event to remove from
		 */
		public static removeEventListener(uniqueID: string, key?: string): void {
			if (!uniqueID) { return; }

			// If it's only a particular type of event that is being removed, do so
			if (key) {
				let evt: EventDefinition<any> = this._events.getValue(key);
				if (!evt) { return; }

				evt.removeEventListener(uniqueID);
			
			// Otherwise, remove this uniqueID from all events
			} else {
				this._events.map((evt: EventDefinition<any>) => {
					evt.removeEventListener(uniqueID);
				});
			}
		}

	}

	//...........................
	//#region HELPER FUNCTIONS

	/**
	 * createEvent
	 * ----------------------------------------------------------------------------
	 * Creates a new type of event that can now be listened for
	 * 
	 * @param 	details 	The specs with which to create the event
	 * 
	 * @returns	True if the event was created
	 */
	export function createEvent<C extends IEventContext>(details: IEventDefinition): boolean {
		return EventHandler.createEvent(details); 
	}

	/**
	 * dispatchEvent
	 * ----------------------------------------------------------------------------
	 * Sends out the notification that an event occurred
	 * 
	 * @param 	key 		The key of the event being sent out
	 * @param 	context 	Any additional context needed by listeners of the event
	 */
	export function dispatchEvent<C extends IEventContext>(event: Event<C>): void { 
		EventHandler.dispatchEvent(event); 
	}

	/**
	 * addEventListener
	 * ----------------------------------------------------------------------------
	 * @param 	key 			The key of the event to listen on
	 * @param 	listenerData	Context for the event listener
	 */
	export function addEventListener<C extends IEventContext>(key: string, listenerData: IListenerData<C>): void {
		EventHandler.addEventListener(key, listenerData); 
	}

	//#endregion
	//...........................

}