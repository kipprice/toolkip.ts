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
		(value: T, forEdit?: boolean): string;
	}

	/** Interface for the unformat function used for Editables */
	export interface ParseContentFunction<T> {
		(value: string): T;
	}

	export interface IEditableElems extends KIP.IDrawableElements {
		base: HTMLElement;
		display: HTMLElement;
		input: HTMLElement;
	}	

	/**
	 * IEditableOptions
	 * ---------------------------------------------------------------------------
	 * Keep track of the information a caller can create an Editable with
	 */
	export interface IEditableOptions<T> extends IElemDefinition {

		/** value for the Editable */
		value?: T;

		/** value to use by default */
		defaultValue?: string;

		/** type of editable element */
		inputType: string;

		/** handle validation */
		onValidate?: ValidateFunction;

		/** handle when the editable updates */
		onUpdate?: UpdateFunction<T>;

		/** handle when we need to format data for editing */
		onFormat?: FormatFunction<T>;

		/** handle when we need to convert data to the unformatted version */
		onParseContent?: ParseContentFunction<T>;

		/** allow for multi-line editable fields, but by default, keep the editable to a single line */
		isMultiline?: boolean;

		/** color to use for the BG of the editable */
		lightBg?: string;
	}

	/**---------------------------------------------------------------------------
	 * @class	Editable<T>
	 * ---------------------------------------------------------------------------
	 * Drawable element that also allows for editing inline
	 * @author	Kip Price
	 * @version	1.3.0
	 * ---------------------------------------------------------------------------
	 */
	export class Editable<T> extends Drawable {

		//.....................
		//#region PROPERTIES

		/** type of input field this editable contains */
		public type: string;

		/** value for the field */
		protected _value: T;
		public get value(): T { return this._value; }
		public set value(val: T) {
			this._value = val;
			this._elems.input.innerHTML = this.format(val);
		}

		protected _defaultValue: string;

		/** function to use on validation */
		public onValidate: ValidateFunction;

		/** function to use when data gets updated */
		public onUpdate: UpdateFunction<T>;

		/** function to use to format data */
		public format: FormatFunction<T>;

		/** function to use to unformat data */
		public parseContent: ParseContentFunction<T>;

		/** internal flag to detect if we are modifying */
		private _isModifying: boolean;

		/** track whether this editable supports multi-line input */
		private _isMultiline: boolean;

		/** elements we care about */
		protected _elems: IEditableElems;

		/** styles to use for standard Editables */
		protected static _uncoloredStyles: Styles.IStandardStyles = {
			".unselectable": {
				userSelect: "none",
      			MozUserSelect: "none",
      			WebkitUserSelect: "none",
      			khtmlUserSelect: "none",
      			oUserSelect: "none"
			},

			".editable": {
				fontFamily: "Segoe UI, Calibri, Helvetica",
				fontSize: "1em",
				cursor: "pointer",
				
				nested: {

					".input": {
						fontFamily: "Segoe UI, Calibri, Helvetica",
						fontSize: "1em",
						backgroundColor: "<editableLightBG>",
						border: "2px solid #AAA",
						minWidth: "150px",
						whiteSpace: "nowrap",

						nested: {
							"&:focus": {
								border: "2px dotted #888",
								outline: "none"
							},

							"&.error": {
								borderColor: "#C30"
							}
						}
					},

					"&.multiline .input": {
						whiteSpace: "auto"
					},

					".display": {
						border: "2px solid transparent",

						nested: {
							"&:hover": {
								backgroundColor: "<editableLightBG>",
							}
						}
					},

					".hidden": {
						display: "none"
					}
				}
			}
		}
		//#endregion
		//.....................

		//.................................
		//#region INITIALIZE OUR EDITABLE

		/**...........................................................................
		 * Creates an Editable object
		 * 
		 * @param	options		Any options needed to configure the editable
		 * ...........................................................................
		 */
		constructor(options?: IEditableOptions<T>) {

			// initialize options if they weren't passed in
			if (!options) { options = {} as IEditableOptions<T>; }
			options.cls = (options.cls || "") + " editable";
			if (options.isMultiline) { options.cls += " multiline"; }

			// Call the Drawable constructor
			super(options);
			this._addClassName("Editable");

			// Store our properties
			this.type = options.inputType;
			this._value = options.value;
			this._defaultValue = options.defaultValue;
			this._isMultiline = options.isMultiline;

			// add the validation + formatting handlers
			this._addHandlers(options);

			// Initialize our modifying flag
			this._isModifying = false;

			// Create the elements, along with their listeners
			this._createElements();
			this._addListeners();

			// add the BG color of an active editable
			this.setThemeColor("editableLightBG", options.lightBg || "#eee");
		}

		/**...........................................................................
		 * _addHandlers
		 * ...........................................................................
		 * Adds all handlers specified by the user
		 * @param 	options		Options specified by the user
		 * ........................................................................... 
		 */
		private _addHandlers(options: IEditableOptions<T>) {
			this.onValidate = options.onValidate;
			this.onUpdate = options.onUpdate;
			this.format = options.onFormat;
			this.parseContent = options.onParseContent;

			this._addDefaultFormatHandlers();
		}

		/**
		 * _addDefaultFormatHandlers
		 * ---------------------------------------------------------------------------
		 * Adds default handlers for dealing with formatting of the Editable
		 */
		private _addDefaultFormatHandlers() {
			if (!this.format) { this._addDefaultFormatHandler(); }
			if (!this.parseContent) { this._addDefaultParseHandler(); }
		}

		/**
		 * _addDefaultParseHandler
		 * ---------------------------------------------------------------------------
		 * Handle parsing through type override if the user didn't specify anything
		 */
		private _addDefaultParseHandler(): void {
			this.parseContent = function (value: string): T {
				return (value as any as T);
			};
		}

		/**
		 * _addDefaultFormatHandler
		 * ---------------------------------------------------------------------------
		 * Handle formatting through toString if the user didn't specify anything
		 */
		private _addDefaultFormatHandler(): void {
			this.format = function (value: T, forEdit?: boolean): string {
				if (!value) {
					let ret = "";
					if (!forEdit) {
						ret = this._defaultValue || "";
					}
					return ret;
				}
				return value.toString();
			};
		}

		/**
		 * _shouldSkipCreateElements
		 * ---------------------------------------------------------------------------
		 * If true, doesn't run the element creation until manually called
		 * @returns	True
		 */
		protected _shouldSkipCreateElements(): boolean { return true; }
		//#endregion
		//.................................

		//....................................
		//#region CREATE ELEMENTS & LISTENERS

		/**
		 * _createElements
		 * ---------------------------------------------------------------------------
		 * Create elements for the editable 
		 */
		protected _createElements(): void {

			let base: HTMLElement = this._elems.base;

			this._elems.display = createElement({
				cls: "display unselectable",
				parent: this._elems.base,
				focusable: true
			});

			this._elems.input = createElement({
				cls: "input hidden",
				content: "",
				attr: {
					"type": this.type,
					"contenteditable": "true",
					"draggable": "true"
				},
				eventListeners: {
					"dragstart": (ev: DragEvent) => {
						ev.preventDefault();
						ev.stopPropagation();
					}
				},
				parent: this._elems.base
			});

			this._renderDisplayView();
		}

		/**...........................................................................
		 * _addListeners
		 * ...........................................................................
		 * Add event listeners to the editable 
		 * ...........................................................................
		 */
		private _addListeners(): void {

			// Click event on our base element
			this._elems.display.addEventListener("click", (e: Event) => { this._handleFocusEvent(e); });
			this._elems.display.addEventListener("focus", (e: Event) => { this._handleFocusEvent(e); });

			// Enter key recognition on our input element
			this._elems.input.addEventListener("keypress", (ev: KeyboardEvent) => {
				if (ev.keyCode === 13) {
					if (this._isModifying && !ev.shiftKey) {
						this._save();
						ev.preventDefault();

					// don't process enter key except for multi line elements with shift key
					} else if (!this._isMultiline || !ev.shiftKey) {
						ev.stopPropagation();
						ev.preventDefault();
					}
				}
				
			});

			// Blur recognition on our input element
			this._elems.input.addEventListener("blur", () => {
				if (this._isModifying) { this._save(); }
			});

		}

		private _handleFocusEvent(e?: Event): void {
			if (!this._isModifying) { this.modify(); }
		}
		//#endregion
		//....................................

		//.......................................
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
			let content: string = this._elems.input.innerHTML;

			validated = this._validate(content);

			// Update UI / saved data based on whether validation passed
			if (!validated.passed) { return this._onValidationFailed(validated.allowLeave); }
			else { return this._onValidationPassed(content); }
		}
		//#endregion
		//.......................................

		//.............................................
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
		private _onValidationFailed(allowLeave: boolean): boolean {

			// Add the error class
			addClass(this._elems.input, "error");

			// If we won't allow the user to leave, don't
			if (!allowLeave) {
				select(this._elems.input);
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
		private _onValidationPassed(content: string): boolean {

			// Remove any error hiliting if we did it
			removeClass(this._elems.input, "error");

			// Resave our value through our unformat function
			this._value = this.parseContent(content);

			// Call our update function in order to notify our parent
			if (this.onUpdate) {
				this.onUpdate(this.value);
			}

			// swap the UI back to the display version
			this._hideElement(this._elems.input);
			this._showElement(this._elems.display);
			
			// remove our modifying flag
			this._isModifying = false;

			// update content of the display element
			this._renderDisplayView();

			return true;
		}
		//#endregion
		//.............................................

		//..........................................
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
			this._elems.input.innerHTML = this.format(this.value, true);

			// Update the HTML to have an editable field
			this._hideElement(this._elems.display);
			this._showElement(this._elems.input);

			// Select our input
			select(this._elems.input);
			this._elems.input.focus();

			return true;
		}
		//#endregion
		//..........................................
		
		public focus(): void {
			this._handleFocusEvent();
		}

		protected _hideElement(elem: HTMLElement): void {
			addClass(elem, "hidden");
		}

		protected _showElement(elem: HTMLElement): void {
			removeClass(elem, "hidden");
		}

		/**
		 * _renderDisplayView
		 * ----------------------------------------------------------------------------
		 * Overridable function that creates the display-version of the editable
		 */
		protected _renderDisplayView(): void {
			this._elems.display.innerHTML = this.format(this._value);
		}

	};
}
