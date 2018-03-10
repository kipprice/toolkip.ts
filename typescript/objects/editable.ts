namespace KIP {

	//========================
	// INTERFACES
	//========================
	/** Interface for the result of a validate function */
	export interface IValidateResult {
		passed: boolean;
		allowLeave?: boolean;
	}

	/** Interface for the validate function used for Editables */
	export interface ValidateFunction {
		(value: string): IValidateResult;
	}

	/** Interface for the update function used for Editables */
	export interface UpdateFunction<T> {
		(value: T): void;
	}

	/** Interface for the format function used for Editables */
	export interface FormatFunction<T> {
		(value: T, for_edit?: boolean): string;
	}

	/** Interface for the unformat function used for Editables */
	export interface UnformatFunction<T> {
		(value: string): T;
	}

	/**...........................................................................
	 * IEditableOptions
	 * ...........................................................................
	 * Keep track of the information a caller can create an Editable with
	 * ...........................................................................
	 */
	export interface IEditableOptions<T> extends IElemDefinition {

		/** value for the Editable */
		value?: T;

		/** type of editable element */
		inputType?: string;

		/** handle validation */
		onValidate?: ValidateFunction;

		/** handle when the editable updates */
		onUpdate?: UpdateFunction<T>;

		/** handle when we need to format data */
		formatFunc?: FormatFunction<T>;

		/** handle when we need to convert data to the unformatted version */
		onUnformat?: UnformatFunction<T>
	}

	/**...........................................................................
	 * Drawable element that also allows for editing inline
	 * @class Editable
	 * @version 1.0
	 * ...........................................................................
	 */
	export class Editable<T> extends Drawable{

		//#region PROPERTIES

		/** type of input field this editable contains */
		public type: string;

		/** value for the field */
		public value: T;

		/** function to use on validation */
		public onValidate: ValidateFunction;

		/** function to use when data gets updated */
		public onUpdate: UpdateFunction<T>;

		/** function to use to format data */
		public formatFunc: FormatFunction<T>;

		/** function to use to unformat data */
		public onUnformat: UnformatFunction<T>;

		/** internal flag to detect if we are modifying */
		private _isModifying: boolean;

		/** elements we care about */
		protected _elems: {
			base: HTMLElement;
			display: HTMLElement;
			input: HTMLInputElement;
		}

		/** styles to use for standard Editables */
		protected static _uncoloredStyles: Styles.IStandardStyles = {
			".editable": {
				fontFamily: "Segoe UI, Calibri, Helvetica",
				fontSize: "1em",
				cursor: "pointer"
			},

			".editable input": {
				fontFamily: "Segoe UI, Calibri, Helvetica",
				fontSize: "1em",
				backgroundColor: "#eee",
				border: "1px solid #AAA"
			},

			".editable input:focus": {
				outline: "none"
			},

			".editable input.error": {
				borderColor: "#C30"
			}
		}

		//#region INITIALIZE OUR EDITABLE

		/**...........................................................................
		 * Creates an Editable object
		 * 
		 * @param	options		Any options needed to configure the editable
		 * ...........................................................................
		 */
		constructor(options?: IEditableOptions<T>) {

			// initialize options if they weren't passed in
			if (!options) { options = {}; }
			options.cls = (options.cls || "") + " editable";

			// Call the Drawable constructor
			super(options);
			this._addClassName("Editable");

			// Store our properties
			this.type = options.inputType;
			this.value = options.value;

			// add the validation functions added by the user
			this.onValidate = options.onValidate;
			this.onUpdate = options.onUpdate;
			this.formatFunc = options.formatFunc;
			this.onUnformat = options.onUnformat;

			// Default the format functions
			if (!this.formatFunc) {
				this.formatFunc = function(value: T): string {
					if (!value) { return ""; }
					return value.toString();
				}
			}

			if (!this.onUnformat) {
				this.onUnformat = function(value: string): T {
					return (value as any as T);
				}
			}

			// Initialize our modifying flag
			this._isModifying = false;

			// Create the elements, along with their listeners
			this._createElements();
			this._addListeners();
		}

		/**...........................................................................
		 * _shouldSkipCreateElements
		 * ...........................................................................
		 * If true, doesn't run the element creation until manually called
		 * @returns	True
		 * ...........................................................................
		 */
		protected _shouldSkipCreateElements(): boolean { return true; }
		//#endregion

		//#region CREATE ELEMENTS & LISTENERS

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 * Create elements for the editable 
		 * ...........................................................................
		 */
		protected _createElements(): void {

			let base: HTMLElement = this._elems.base;
			let val_str: string;

			val_str = this.formatFunc(this.value);

			this._elems.display = createElement({
				content: val_str, 
				parent: this._elems.base
			});

			this._elems.input =  (createElement({
				type: "input",
				attr: {
					"type": this.type,
					"value": this.value
				}
			}) as HTMLInputElement);
		}

		/**...........................................................................
		 * _addListeners
		 * ...........................................................................
		 * Add event listeners to the editable 
		 * ...........................................................................
		 */
		private _addListeners(): void {

			// Click event on our base element
			this.base.addEventListener("click", (e: Event) => {
				if (!this._isModifying) {
					this.modify();
				}

				// Make sure we prevent other events from being propagated (but why?)
				if (e.stopPropagation) { e.stopPropagation(); }
				if (e.cancelBubble) { e.cancelBubble = true; }
			});

			// Enter key recognition on our input element
			this._elems.input.addEventListener("keydown", (ev: KeyboardEvent) => {
				if (ev.keyCode === 13 && this._isModifying) {
					//this._save();
				}
			});

			// Blur recognition on our input element
			this._elems.input.addEventListener("blur", () => {
				if (this._isModifying) { this._save(); }
			});

		}
		//#endregion

		//#region HANDLE CHANGES TO THE ELEMENT

		/**...........................................................................
		 * _save
		 * ...........................................................................
		 * Save the contents of the Editable
		 * 
		 * @returns True if the editable was successfully saved
		 * ...........................................................................
		 */
		private _save(): boolean {
			let validated: IValidateResult
			let content: string = this._elems.input.value;

			validated = this._validate(content);

			// Update UI / saved data based on whether validation passed
			if (!validated.passed) { return this._onValidationFailed(validated.allowLeave); }
			else { return this._onValidationPassed(content); }
		}
		//#endregion

		//#region VALIDATE USER INPUT IN THE ELEMENT

		/**...........................................................................
		 * _validate
		 * ...........................................................................
		 * validate whether the current data in the input field is valid 
		 * 
		 * @param	content		Content to validate
		 * 
		 * @returns	Result of the validation
		 * ...........................................................................
		 */
		private _validate(content: string): IValidateResult {
			let validated: IValidateResult

			// Check if the editable could be validated
			if (this.onValidate) {
				validated = this.onValidate(content);
			} else {
				validated = { passed: true };
			}

			return validated;
		}

		/**...........................................................................
		 * _onValidationFailed
		 * ...........................................................................
		 * validation failing for this element 
		 * 
		 * @param	allowLeave	True if the user should be able to navigate away
		 * 
		 * @returns	False
		 * ...........................................................................
		 */
		private _onValidationFailed (allowLeave: boolean): boolean {
			
			// Add the error class
			addClass(this._elems.input, "error");

			// If we won't allow the user to leave, don't
			if (!allowLeave) {
				this._elems.input.select();
				this._elems.input.focus();
			}

			return false;

		}

		/**...........................................................................
		 * _onValidationPassed
		 * ...........................................................................
		 * handle validation passing for this element 
		 * @param	content		Content to set for the editable
		 * @returns	True 
		 * ...........................................................................
		 */
		private _onValidationPassed (content: string): boolean {

			// Remove any error hiliting if we did it
			removeClass(this._elems.input, "error");

			// Resave our value through our unformat function
			this.value = this.onUnformat(content);

			// Call our update function in order to notify our parent
			if (this.onUpdate) {
				this.onUpdate(this.value);
			}

			// swap the UI back to the display version
			this.base.removeChild(this._elems.input);
			this.base.appendChild(this._elems.display);

			// remove our modifying flag
			this._isModifying = false;

			// update content of the display element
			this._elems.display.innerHTML = content;

			return true;
		}
		//#endregion

		//#region ENABLE THE ELEMENT FOR EDITING

		/**...........................................................................
		 * modify
		 * ...........................................................................
		 * Modifies the Editable element
		 * 
		 * @returns True if we were able to start modifying the element
		 * ...........................................................................
		 */
		public modify(): boolean {

			// Don't start modifying again if we are already modifying
			if (this._isModifying) { return false; }

			// Set our property to true
			this._isModifying = true;

			// Grab the appropriately formatted string for this element
			this._elems.input.value = this.formatFunc(this.value, true);

			// Update the HTML to have an editable field
			this.base.removeChild(this._elems.display);
			this.base.appendChild(this._elems.input);

			// Select our input
			this._elems.input.select();
			this._elems.input.focus();

			return true;
		}
		//#endregion

	};
}
