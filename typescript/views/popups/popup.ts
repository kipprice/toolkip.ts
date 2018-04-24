///<reference path="../drawable.ts" />
namespace KIP {

	export interface PopupElements extends IDrawableElements {
		base: HTMLElement;
		overlay: HTMLElement;
		frame: HTMLElement;
		title: HTMLElement;
		content: HTMLElement;
		closeBtn: HTMLElement;
		buttonContainer: HTMLElement;
	}

	export interface IPopupDefinition extends IElemDefinition {
		themeColor?: string;
	}

	/**...........................................................................
	 * @class Popup
	 * Generic class to show data in a popup form
	 * @version 1.0
	 * ...........................................................................
	 */
	export class Popup extends Drawable {

		//#region PROPERTIES

		/** elements contained within the popup */
		protected _elems: PopupElements;

		/** styles to render the popup with */
		protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
			".overlay": {
				backgroundColor: "rgba(0,0,0,.6)",
				position: "absolute",
				left: "0",
				top: "0",
				width: "100%",
				height: "100%",
				
			},

			".popup": {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "Segoe UI, OpenSans, Helvetica",
				position: "fixed",
				width: "100%",
				height: "100%",
				left: "0",
				top: "0",
				zIndex: "5",
			},

			".frame": {
				position: "absolute",
				backgroundColor: "#FFF",
				borderRadius: "3px",
				boxShadow: "1px 1px 5px 2px rgba(0,0,0,.2)",
				display: "block",
				borderTop: "10px solid <0>",
				padding: "10px",
			},

			".popup .popupTitle" : {
				fontSize: "1.3em",
				fontWeight: "bold"
			},

			".popup .popupTitle.hasContent" : {
				marginBottom: "5px"
			},

			".popup .content": {
				fontSize: "0.9em"
			},

			".popup .buttonContainer": {
				display: "flex",
				marginTop: "8px",
				justifyContent: "flex-end"
			},

			".popup .buttonContainer .popupButton": {
				padding: "2px 10px",
				backgroundColor: "<0>",
				color: "#FFF",
				cursor: "pointer",
				marginLeft: "15px",
				borderRadius: "2px",
				transition: "all ease-in-out .1s"
			},

			".popup .buttonContainer .popupButton:hover": {
				transform: "scale(1.1)"
			},

			".popup .closeBtn": {
				width: "16px",
				height: "16px",
				borderRadius: "8px",
				cursor: "pointer",
				position: "absolute",
				left: "calc(100% - 7px)",
				top: "-15px",
				backgroundColor: "#DDD",
				boxShadow: "1px 1px 5px 2px rgba(0,0,0,.1)",
				color: "#333",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				transition: "all ease-in-out .1s"
			},

			".popup .closeBtn .x":  {
				paddingBottom: "2px"
			},

			".popup .closeBtn:hover": {
				transform: "scale(1.1)"
			}
		}
		//#endregion

		//#region CREATE A POPUP FORM

		/**...........................................................................
		 * Creates a new popup form
		 * @param 	obj 	If included, contains info on how to create this popup
		 * ........................................................................... 
		 */
		constructor (obj?: IPopupDefinition) {
			if (!obj) { 
				obj = {cls: "popup"}; 
			} else {
				obj.cls = (obj.cls || "") +  " popup";
			}

			super(obj);
			if (obj.themeColor) {
				this.setThemeColor(0, obj.themeColor);
			} else {
				this.setThemeColor(0, "#06F", true);
			}
			
		}
		//#endregion

		//#region CREATE ELEMENTS

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 * Creates all of the elements needed for this popup
		 * ...........................................................................
		 */
		protected _createElements(): void {
			this._createOverlay();				// BG layer to shield the rest of the page from this popup
			this._createFrame();				// The frame hosting the popup content
			this._createTitle();				// create the elem that will become the title of the form
			this._createCloseButton();			// Button to close the form
			this._createContentElement();		// Element that will be added to to show data in the popup
			this._createButtonContainer();		// create the container for the buttons
		}

		/**...........................................................................
		 * _createOverlay
		 * ...........................................................................
		 * Creates the overlay for the popup to shield the rest of the page
		 * ...........................................................................
		 */
		private _createOverlay(): void {
			this._elems.overlay = createSimpleElement("", "overlay");
			this._elems.overlay.addEventListener("click", () => {
				this.erase();
			});
			this._elems.base.appendChild(this._elems.overlay);
		}

		/**...........................................................................
		 * _createFrame
		 * ...........................................................................
		 * Create the frame of the popup
		 * ...........................................................................
		 */
		private _createFrame(): void {
			this._elems.frame = createSimpleElement("", "frame");
			this._elems.base.appendChild(this._elems.frame);
		}

		/**...........................................................................
		 * _createTitle
		 * ...........................................................................
		 * Create the title of the popup
		 * ...........................................................................
		 */
		private _createTitle(): void {
			this._elems.title = createElement({ cls: "popupTitle", parent: this._elems.frame });
		}

		/**...........................................................................
		 * _createCloseButton
		 * ...........................................................................
		 * Create the close button for the form
		 * ...........................................................................
		 */
		private _createCloseButton(): void {
			this._elems.closeBtn = createSimpleElement("", "closeBtn", "", null, [{ content: "x", cls: "x" }] );
			this._elems.closeBtn.addEventListener("click", () => {
				this.erase();
			});
			this._elems.frame.appendChild(this._elems.closeBtn);
		}

		/**...........................................................................
		 * _createContentElement
		 * ...........................................................................
		 * Create the element taht will hold all content for the popup
		 * ...........................................................................
		 */
		private _createContentElement(): void {
			this._elems.content = createSimpleElement("", "content");
			this._elems.frame.appendChild(this._elems.content);
		}

		/**...........................................................................
		 * _createButtonContainer
		 * ...........................................................................
		 * Create the container that will hold buttons
		 * ...........................................................................
		 */
		private _createButtonContainer(): void {
			this._elems.buttonContainer = createElement({ cls: "buttonContainer", parent: this._elems.frame });
		}
		//#endregion

		//#region SET THE TITLE

		/**...........................................................................
		 * setTitle
		 * ...........................................................................
		 * Sets the title for the popup
		 * 
		 * @param 	title	What to set as the title
		 * ........................................................................... 
		 */
		public setTitle(title: string): void {
			this._elems.title.innerHTML = title;

			if (title) {
				addClass(this._elems.title, "hasContent");
			} else {
				removeClass(this._elems.title, "hasContent");
			}
		}
		//#endregion

		//#region ALLOW THE CALLER TO ADD / REMOVE CONTENT TO THE POPUP

		/**...........................................................................
		 * addContent
		 * ...........................................................................
		 * Allows the caller to add a Drawable to the popup
		 * 
		 * @param 	drawable 	The drawable element to add
		 * ...........................................................................
		 */
		public addContent(drawable: Drawable): void;

		/**...........................................................................
		 * addContent
		 * ...........................................................................
		 * Allows the caller to add an HTMLElement to the popup
		 * 
		 * @param	elem	The HTMLElement to add
		 * ...........................................................................
		 */
		public addContent(elem: HTMLElement): void;

		/**...........................................................................
		 * addContent
		 * ...........................................................................
		 * Allows the caller to pass basic info to the popup so that 
		 * createSimpleElement can be called
		 * 
		 * @param	id		ID of the element to be created
		 * @param	cls		Class of the element to be created
		 * @param	content	What content the element should contain
		 * ...........................................................................
		 */
		public addContent(id?: string, cls?: string | IClasses, content?: string): void;

		/**...........................................................................
		 * addContent
		 * ...........................................................................
		 * Allows the caller to add detailed info to the popup so that createElement
		 * can be called
		 * 
		 * @param	obj		The object containing data on how to create the element
		 * ...........................................................................
		 */
		public addContent(obj: IElemDefinition): void;

		/**...........................................................................
		 * addContent
		 * ...........................................................................
		 * Allows the user to add content to the popup
		 * See individual tags for param info
		 * ...........................................................................
		 */
		public addContent(param1?: (HTMLElement | string | Drawable | IElemDefinition), cls?: string | IClasses, content?: string): void {
			let elem: StandardElement;
			
			// Create an HTMLElement if one wasn't passed in
			if (isString(param1)) {
				elem = createSimpleElement(param1, cls, content);

			// If a Drawable was passed in, grab its HTML element
			} else if (isDrawable(param1)) {
				elem = param1.base;

			// Otherwise, just take the HTMLElement that was passed in
			} else if (param1 instanceof HTMLElement) {
				elem = param1;

			} else {
				elem = createElement(param1);
			}

			// Quit if we don't have an element at this point
			if (!elem) { return; }

			// Add the element to our content container
			this._elems.content.appendChild(elem);
		}

		/**...........................................................................
		 * clearContent
		 * ...........................................................................
		 * Clears all content out of the form
		 * ...........................................................................
		 */
		public clearContent(): void {
			this._elems.content.innerHTML = "";
		}
		//#endregion

		//#region ADD BUTTONS
		/**...........................................................................
		 * addButton
		 * ...........................................................................
		 * Adds a button to the popup
		 * 
		 * @param 	label 		The label to use for the button
		 * @param 	callback 	What to do when the button is clicked
		 * ...........................................................................
		 */
		public addButton(label: string, callback: Function) : void {
			let btnElem: HTMLElement = createElement({ cls: "popupButton", parent: this._elems.buttonContainer, content: label });
			btnElem.addEventListener("click", () => {
				callback();
			});
		}
		//#endregion

	}


}