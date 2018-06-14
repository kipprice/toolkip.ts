namespace KIP.Forms {

	/**...........................................................................
	 * Interface for the context needed at form change
	 * ...........................................................................
	 */
	export interface IFormElemChangeEventContext<T> extends Events.IEventContext {
		key: string;
		subkey?: string;
		data: T;
	}

	/**...........................................................................
	 * @class	FormElemChangeEvent
	 * ...........................................................................
	 * Registers the form element change event for type safety
	 * @author	Kip Price
	 * @version	1.0.0
	 * ...........................................................................
	 */
	export class FormElemChangeEvent<T> extends Events.Event<IFormElemChangeEventContext<T>> {
		protected get _key(): string { return FORM_ELEM_CHANGE; }
	}

	/**...........................................................................
	 * Interface for the context needed when the savability of the form changes
	 * ...........................................................................
	 */
	export interface IFormSavableEventContext extends Events.IEventContext {
		hasErrors?: boolean;
		hasMissingRequired?: boolean;
	}

	/**...........................................................................
	 * @class	FormSavableEvent
	 * ...........................................................................
	 * Registers the event that fires when a form is savable
	 * @author	Kip Price
	 * @version 1.0.0
	 * ...........................................................................
	 */
	export class FormSavableEvent extends Events.Event<Events.IEventContext> {
		protected get _key(): string { return FORM_SAVABLE_CHANGE; }
	}
}