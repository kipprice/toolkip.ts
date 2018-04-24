namespace KIP.Events {

	/**...........................................................................
	 * @class EventHandler
	 * Handles all events that are raised by any applications
	 * @version 1.0
	 * ...........................................................................
	 */
	export class EventHandler {

		public static eventTypes: {
			test: string;
			[key: string]: string;
		}

		/** keep track of all the events that are registered to this event handler */
		protected static _events: Collection<Event> = new Collection<Event>();

		/**...........................................................................
		 * createEvent
		 * ...........................................................................
		 * create a new event with a partular key and name
		 * 
		 * @param	details		Specs for the event we are creating
		 * 
		 * @returns	True if a new event was created
		 * ...........................................................................
		 */
		public static createEvent(details: IEvent): boolean {
			let evt: Event = new Event(details);
			return (this._events.addElement(details.key, evt) !== -1);
		}

		/**...........................................................................
		 * dispatchEvent
		 * ...........................................................................
		 * handle notifying listeners about an event that occurred 
		 * 
		 * @param	key			The key used by this particular event
		 * @param	context		THe additional context to use for the event
		 * ...........................................................................
		 * */
		public static dispatchEvent(key: string, context: IEventContext): void {
			let evt: Event = this._events.getValue(key);
			if (!evt) { return; }
			evt.notifyListeners(context);
		}

		/**...........................................................................
		 * addEventListener
		 * ...........................................................................
		 * register an additional listener with a particular event 
		 * 
		 * @param	key				The key to use for the event
		 * @param	listenerData	The data to use for the listener being added
		 * ...........................................................................
		 */
		public static addEventListener(key: string, listenerData: IListenerData): void {
			let evt: Event = this._events.getValue(key);
			if (!evt) { return; }
			evt.addListener(listenerData);
		}

		/**...........................................................................
		 * removeEventListener
		 * ...........................................................................
		 *  remove a particular event listener 
		 * 
		 * @param	uniqueId	The unique ID for this listener
		 * @param	key			If specified, the particular event to remove from
		 * ...........................................................................
		 */
		public static removeEventListener(uniqueID: string, key?: string): void {
			if (!uniqueID) { return; }

			// If it's only a particular type of event that is being removed, do so
			if (key) {
				let evt: Event = this._events.getValue(key);
				if (!evt) { return; }

				evt.removeEventListener(uniqueID);
			
			// Otherwise, remove this uniqueID from all events
			} else {
				this._events.map((evt: Event) => {
					evt.removeEventListener(uniqueID);
				});
			}
		}

	}

	//#region HELPER FUNCTIONS

	/**...........................................................................
	 * createEvent
	 * ...........................................................................
	 * Creates a new type of event that can now be listened for
	 * 
	 * @param 	details 	The specs with which to create the event
	 * 
	 * @returns	True if the event was created
	 * ...........................................................................
	 */
	export function createEvent(details: IEvent): boolean {
		return EventHandler.createEvent(details); 
	}

	/**...........................................................................
	 * dispatchEvent
	 * ...........................................................................
	 * Sends out the notification that an event occurred
	 * 
	 * @param 	key 		The key of the event being sent out
	 * @param 	context 	Any additional context needed by listeners of the event
	 * ...........................................................................
	 */
	export function dispatchEvent(key: string, context: IEventContext): void { 
		EventHandler.dispatchEvent(key, context); 
	}

	/**...........................................................................
	 * addEventListener
	 * ...........................................................................
	 * @param 	key 			The key of the event to listen on
	 * @param 	listenerData	Context for the event listener
	 * ...........................................................................
	 */
	export function addEventListener(key: string, listenerData: IListenerData): void {
		EventHandler.addEventListener(key, listenerData); 
	}

	//#endregion
	

}