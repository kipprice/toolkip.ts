namespace KIP {
	
	/**
	 * INamedClass
	 * ----------------------------------------------------------------------------
	 * Interface to allow for access into any named class
	 */
	export interface INamedClass {
		className: string;
	}

	/**----------------------------------------------------------------------------
	 * NamedClass
	 * ----------------------------------------------------------------------------
	 * A class that contains a set of names that apply to this class. Used for
	 * easier typing.
	 * @author	Kip Price
	 * @version 1.0
	 * ----------------------------------------------------------------------------
	 */
	export abstract class NamedClass implements INamedClass {

		/** keep track of all layers of the class name */
		private _class_names: string[];

		public get className () : string {
			let tmpNames: string[] = this._class_names.slice();
			return tmpNames.reverse().join("::");
		}

		public get paddedClassName (): string {
			return this._class_names.join(" <-- ");
		}

		/**
		 * Creates a named class 
		 * 
		 * @param	classNames		The initial class name to assign
		 * 
		 */
		constructor (...classNames: string[]) {
			this._class_names = classNames;
		};

		/**
		 * _addClassName
		 * 
		 * Adds a new layer to our class name
		 * 
		 * @param	class_name		The new class name to add
		 * 
		 * @returns	True if we added the class name
		 * 
		 */
		protected _addClassName (class_name: string) : boolean {
			if (contains(this._class_names, class_name)) { return false; }
			this._class_names.push(class_name);
			return true;
		}

	}

}