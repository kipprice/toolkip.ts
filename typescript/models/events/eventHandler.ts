/// <reference path="../../dataStructures/collection.ts" />

namespace KIP.Events {

	/**----------------------------------------------------------------------------
	 * @class 	EventHandler
	 * ----------------------------------------------------------------------------
	 * Handles all events that are raised by any applications
	 * @author	Kip Price
	 * @version 1.0.5
	 * ----------------------------------------------------------------------------
	 */
	export abstract class EventHandler<T = any> {

		/** keep track of all the events that are registered to this event handler */
		protected _events: Collection<EventDefinition<any>> = new Collection<EventDefinition<any>>();

		/**
		 * createEvent
		 * ----------------------------------------------------------------------------
		 * create a new event with a partular key and name
		 * 
		 * @param	details		Specs for the event we are creating
		 * 
		 * @returns	True if a new event was created
		 */
		public createEvent<K extends keyof T>(key: K, name?: string): boolean {
			let evt: EventDefinition<T[K]> = new EventDefinition<T[K]>(key as string, name);
			return (this._events.add(key as string, evt) !== -1);
		}

		/**
		 * dispatchEvent
		 * ----------------------------------------------------------------------------
		 * handle notifying listeners about an event that occurred 
		 * 
		 * @param	key			The key used by this particular event
		 * @param	context		THe additional context to use for the event
		 * */
		public dispatchEvent<K extends keyof T>(key: K, event: Event<T[K]>): void {
			let evtDef: EventDefinition<T[K]> = this._events.getValue(event.key);
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
		public addEventListener<K extends keyof T>(key: K, listenerData: IListenerData<T[K]>): void {
			let evt: EventDefinition<T[K]> = this._events.getValue(key as string);
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
		public removeEventListener(uniqueID: string, key?: string): void {
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

}
