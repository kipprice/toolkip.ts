///<reference path="drawable.ts" />
namespace KIP {

	export interface OptionCallback {
		(e: Event): void;
	}

	export interface Option {
		label: string;
		callback?: OptionCallback;
		elems?: {
			base?: HTMLElement,
			sub_menu?: HTMLElement
		};
	}

	export enum ContextMenuColors {
		MAIN_COLOR = 0,
		FONT_COLOR = 1,
		SUB_MENU_COLOR = 2,
		SUB_MENU_BORDER = 3,
		SUB_SUB_MENU_COLOR = 4,
		SUB_SUB_MENU_BORDER = 5,
		
	}

	/**...........................................................................
	 * @class ContextMenu
	 * creates a custom context menu 
	 * @version 1.0
	 * ...........................................................................
	 */
	export class ContextMenu extends Drawable {

		/** The menu that is being shown */
		protected static _showingMenu: ContextMenu;	

		/** True if we already added window listeners */
		protected static _windowListenersAdded: boolean;	

		/** adds a target to this instance of the context menu */
		protected _target: HTMLElement;					

		/** The collection of options available in our context menu */
		protected _options: Collection<Option>;	

		/** true if we should not create our standard styles */					
		protected _noStyles: boolean;											

		/** The elements we need for the option menu */
		protected _elems: {
			base: HTMLElement,																	
			option_container?: HTMLElement
		};

		/** public accessible function for the base element */
		public get base(): HTMLElement { return this._elems.base; }

		/** collection of theme colors for the context menu */
		protected _themes: string[];

		/** the styles to use for the standard context menu */
		protected static _uncoloredStyles: Styles.IStandardStyles = {
			".ctxMenu": {
				backgroundColor: "<0>",
				color: "<1>",
				fontFamily: "'Calibri Light', Helvetica",
				boxShadow: "1px 1px 3px 2px rgba(0,0,0,.1)",
				fontSize: "14px",
				borderRadius: "4px",
				paddingTop: "2px",
				paddingBottom: "2px",
				width: "10%",
				position: "absolute"
			},

			".ctxMenu .subMenu": {
				backgroundColor: "<2>",
				width: "100%",
				top: "-2px",
				boxShadow: "1px 1px 1px 1px rgba(0,0,0,.1)",
				left: "calc(100% - 1px)",
				borderLeft: "1px solid <3>"
			},

			".ctxMenu .subMenu .subMenu": {
				backgroundColor: "<4>",
				borderLeft: "1px solid <5>"
			},

			".ctxMenu .ctxOption" : {
				padding: "4px 10px",
				cursor: "pointer",
				position: "relative"
			},

			".ctxMenu .ctxOption:hover": {
				backgroundColor: "<6>",
				color: "<2>",
				borderLeft: "7px solid <7>"
			}
		}

		/**...........................................................................
		 * Creates a custom context (right-click) menu for a given element
		 * @param 	target    	The element to create the custom menu for
		 * @param 	noStyles	True if we shouldn't create css classes for the standard menu styles
		 * @param	themes		Optional set of theme colors to use for the menu
		 * ...........................................................................
		 */
		constructor(target: HTMLElement, noStyles?: boolean, themes?: string[]) {

			// Initialize our Drawable
			super({cls: "ctxMenu"});
			this._addClassName("ContextMenu");

			// Set our initial properties
			this._target = target;
			this._noStyles = noStyles;
			this._themes = themes || ["rgba(40,40,40,1)", "#FFF", "rgba(40,40,40,.9)", "#777", "rgba(40,40,40,.85)", "#888", "#505050", "#999"];

			// Initialize the option array
			this._options = new Collection<Option>();

			// Create our other elements
			this._createElements();

			// Add listeners
			this._addEventListeners();
		}

		/**...........................................................................
		 * addOption
		 * ...........................................................................
		 * adds an option to our context menu 
		 * 
		 * @param	opt			The option to add
		 * @param	subOptions	Any nested options to include
		 * @param	parent		What the parent element should be (defaults to option container)
		 * 
		 * @returns	True if the option could be added
		 * ...........................................................................
		 */
		public addOption(opt: Option, subOptions?: Option[], parent?: HTMLElement): boolean {

			// Make sure the option label is unique
			if (this._options.hasElement(opt.label)) { return false; }

			// Create the element for the option if not included
			if (!opt.elems) { opt.elems = {}; };
			if (!opt.elems.base) {
				if (!parent) { parent = this._elems.option_container; }
				opt.elems.base = createSimpleElement("", "ctxOption", opt.label, null, null, parent);
				opt.elems.base.onclick = opt.callback;
			}

			// Add the option to our collection
			this._options.addElement(opt.label, opt);

			// Loop through suboptions and add them as well
			let sub_success: boolean = true;
			for (let s_opt of subOptions) {
				if (!this.addSubOption(opt, s_opt)) { sub_success = false; }
			}
			if (!sub_success) { return false; }

			// Making it this far means we added everything ok
			return true;
		}

		/**...........................................................................
		 * addSubOption
		 * ...........................................................................
		 * Adds a nested option to our context menu
		 * 
		 * @param 	srcOption	The option we are nesting under 
		 * @param 	subOption 	The sub option we are currently adding
		 * 
		 * @returns	True if the suboption was added
		 * ...........................................................................
		 */
		public addSubOption(srcOption: Option, subOption: Option): boolean {

			// Try to grab the option from our collection if not passed in correctly
			if (!srcOption.elems) {

				// If this is a new option, create it first
				if (!this._options.hasElement(srcOption.label)) {
					this.addOption(srcOption);
				}

				// Try to grab the option from our collection
				srcOption = this._getOption(srcOption.label);

				// Quit if we couldn't find an option
				if (!srcOption) {
					return false;
				}
			}

			// Quit if the option hasn't been appropriately initialized
			if (!srcOption.elems) { return false; }

			// Create the submenu div if it's missing
			if (!srcOption.elems.sub_menu) {
				this._buildSubMenu(srcOption);
			}

			// Add the actual sub menu
			this.addOption(subOption, [], srcOption.elems.sub_menu);

		}

		/**...........................................................................
		 * _buildSubMenu
		 * ...........................................................................
		 * creates a sub menu 
		 * @param	srcOption	The option to nest under
		 * ...........................................................................
		 */
		private _buildSubMenu(srcOption: Option): void {

			srcOption.elems.sub_menu = createSimpleElement("", "subMenu hidden", "", null, null, srcOption.elems.base);
			srcOption.elems.base.innerHTML += "...";

			if (!this._noStyles) { return; }

			// Handle mouse-over only if we didn't add standard classes
			srcOption.elems.sub_menu.style.display = "none";

			srcOption.elems.base.addEventListener("mouseover", () => {
				srcOption.elems.sub_menu.style.display = "block";
			});

			srcOption.elems.base.addEventListener("mouseout", () => {
				srcOption.elems.sub_menu.style.display = "none";
			});


		}

		/**...........................................................................
		 * _getOption
		 * ...........................................................................
		 * grabs a particular option from our menu 
		 * 
		 * @param	lbl		The label of the option we are grabbing
		 * 
		 * @returns	The option with this label
		 * ...........................................................................
		 */
		private _getOption(lbl: string): Option {
			if (!lbl) { return null; }
			let iCol: ICollectionElement<Option> = this._options.getElement(lbl);

			// Grab the value of the element in our collection
			if (iCol) {
				return iCol.value;
			} else {
				return null;
			}
		}

		/**...........................................................................
		 * removeOption
		 * ...........................................................................
		 * removes an option from our menu 
		 * 
		 * @param	lbl		The label of the option being removed
		 * 
		 * @returns	True if the option was removed
		 * ...........................................................................
		 */
		public removeOption(lbl: string): boolean {
			let opt: Option;
			let iCol: ICollectionElement<Option>;

			iCol = this._options.removeElement(lbl);
			if (!iCol) { return false; }
			opt = iCol.value;

			// Also remove the HTML element added by this option
			if (opt.elems.base.parentNode) {
				opt.elems.base.parentNode.removeChild(opt.elems.base);
			} else {
				return false;
			}

			// Return true if we made it this far
			return true;

		};

		/**...........................................................................
		 * clearOptions
		 * ...........................................................................
		 * Removes all of our options
		 * ...........................................................................
		 */
		public clearOptions(): void {

			this._options.resetLoop(true);
			let opt: Option;
			let iCol: ICollectionElement<Option>;

			// Remove all HTML ELements
			while (this._options.hasNext(true)) {
				iCol = this._options.getNext(true);
				if (!iCol) { continue; }

				opt = iCol.value;
				if (opt.elems.base.parentNode) {
					opt.elems.base.parentNode.removeChild(opt.elems.base);
				}
			}

			// Clear the collection
			this._options.clear();

		};

		/**...........................................................................
		 * _addEventListeners
		 * ...........................................................................
		 * Adds event listeners to the relevant pieces to show and/or hide the context menu 
		 * ...........................................................................
		 */
		private _addEventListeners(): void {

			// Erase the currently showing context menu always on mousedown and on right-click
			if (!ContextMenu._windowListenersAdded) {
				window.addEventListener("contextmenu", () => {
					this._hideExistingMenu();
				});
				window.addEventListener("mousedown", () => {
					this._hideExistingMenu();
				});
				ContextMenu._windowListenersAdded;
			}

			// Show this menu when it's target is hit
			this._target.addEventListener("contextmenu", (e: MouseEvent) => {
				let pos_x: number;
				let pos_y: number;

				this.erase();

				// Show the normal rclick menu when holding control
				if (e.ctrlKey) { return true; }

				// Stop bubbling since we have found our target
				e.stopPropagation();
				e.preventDefault();

				// Grab the approximate position
				pos_x = e.clientX;
				pos_y = e.clientY;

				// Adjust the display
				this.base.style.left = (pos_x + "px");
				this.base.style.top = (pos_y + "px");

				// Draw in our best guess position
				this.draw(document.body);

				// If we're too far over, shift it.
				if ((pos_x + this.base.offsetWidth) > window.innerWidth) {
					pos_x = (window.innerWidth - this.base.offsetWidth);
				}

				// If we're too low, move up
				if ((pos_y + this.base.offsetHeight) > window.innerHeight) {
					pos_y = (window.innerHeight - this.base.offsetHeight);
				}

				// Adjust the display
				this.base.style.left = (pos_x + "px");
				this.base.style.top = (pos_y + "px");

				// prevent the real r-click menu
				return false;
			});

		};

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 * Creates the basic elements of the context menu & optionally adds the 
		 * standard classes
		 * ...........................................................................
		 */
		protected _createElements(): void {
			this._elems.option_container = createSimpleElement("", "optionContainer", "", null, null, this.base);
			this._setThemeColors();
		};

		/**...........................................................................
		 * _setThemeColors
		 * ...........................................................................
		 * Sets the theme colors for the context menu
		 * ...........................................................................
		 */
		protected _setThemeColors(): void {
			let idx: number = 0;
			for (idx; idx < this._themes.length; idx += 1) {
				this.setThemeColor(idx, this._themes[idx]);
			}
		}

		/**...........................................................................
		 * _hideExistingMenu
		 * ...........................................................................
		 * Hides whatever context menu is currently showing 
		 * ...........................................................................
		 */
		private _hideExistingMenu(): void {
			if (ContextMenu._showingMenu) {
				if (ContextMenu._showingMenu.base.parentNode) {
					ContextMenu._showingMenu.base.parentNode.removeChild(ContextMenu._showingMenu.base);
				}
			}
		}


	}
}