namespace KIP {

	//================
	// ENUMS
	//================
	export enum FormStandardButtons {
		OK = 1, 
		Accept = 2,
		Cancel = 3,
		Next = 4,
		Previous = 5,
		Custom = 99
	};

	export enum FieldTypeEnum {
		Text,
		Date,
		Numeric,
		Range,
		Color,
		TextArea,
		Checkbox,
		Radio,
		Select
	}

	//======================
	// INTERFACES
	//======================
	export interface IFormButtonDefinition {
		lbl: string;
		onClick: Function;
	}

	export interface IFormConfiguration {
		id: string;
		title: string;
		buttons?: FormStandardButtons[];
		saveCb: IFormSaveFunction;
		options?: IFormOptions,
		fields?: IFormDefinition
	}

	export interface IFormOptions {
		useStandardStyles?: boolean;
		themeColor?: string;
	}

	export interface IFormSaveFunction {
		(data: IFormData): void;
	}

	export interface IFormCancelFunction {
		(dataChanged: boolean): void;
	}

	export interface IFormData {
		[key: string]: any;
	}

	export interface IFormDefinition {
		[key: string]: IFormFieldDefinition;
	}

	export interface IFormFieldDefinition {
		id: string;
		type: FieldTypeEnum;
		lbl?: string;
		default?: any;
		placeholder?: any;
		options?: ISelectOption[];
	}

	export interface ISelectOption {
		value: any;
		lbl: string;
	}

	export interface IFormField {
		definition: IFormFieldDefinition;
		id: string;
		inputElem: HTMLInputElement;
		lblElem: HTMLElement;
		data?: any;
	}

	// //==========================
	// // FORM CLASS
	// //==========================
	
	// /**
	//  * @class Form
	//  * Creates a generic form class that can collect lots of pieces of information
	//  */
	// export class Form extends Drawable {

	// 	//============================
	// 	// PROPERTIES
	// 	//============================
	// 	private __title: string;
	// 	private __tables: HTMLTableElement[];
	// 	private __content: HTMLElement;
	// 	private __btns: HTMLElement;
	// 	private __saveCb: IFormSaveFunction;
	// 	private __options: IFormOptions;
	// 	private __fields: Collection<IFormField>;
	// 	private __currentSection: number;

	// 	//=========================================
	// 	// SETUP THE FORM INITIALLY
	// 	//=========================================
	// 	constructor (config: IFormConfiguration) {
	// 		super(config.id, "form");

	// 		this.__title = config.title;
	// 		this.__saveCb = config.saveCb;

	// 		this.__tables = [];
	// 		this.__fields = new Collection<IFormField>();

	// 		// Handle options for the form
	// 		let defaults: IFormOptions = this.__buildDefaultOptions();
	// 		reconcileOptions(config.options, defaults);

	// 		// Create elements for the form
	// 		this.__createElements();

	// 		// Process buttons
	// 		this.__processButtons(config.buttons);

	// 	}
	// 	private __buildDefaultOptions(): IFormOptions {
	// 		let opt: IFormOptions = {
	// 			useStandardStyles: true,
	// 			themeColor: "#22A174"
	// 		}

	// 		return opt;
	// 	}

	// 	//=================================
	// 	// CREATE ELEMENTS
	// 	//=================================
	// 	private __createElements() : void {
	// 		this.__createTitleBar();
	// 		this.__createContent();
	// 		this.__createButtonContainer();
	// 	}
	// 	private __createTitleBar(): void {
	// 		let titleBar: HTMLElement = createSimpleElement("", "titleBar " + THEME_BG_COLOR_CLS, this.__title);
	// 		this.appendChild(titleBar);
	// 	}
	// 	private __createButtonContainer(): void {
	// 		let cls: string = "btnBar " + THEME_BG_COLOR_CLS;
  	// 	this.__btns = createSimpleElement("", cls);
	// 	}
	// 	private __createContent(): void {
	// 		let elem: HTMLElement = createSimpleElement(this._id + "-content", "content");
	// 		this.appendChild(elem);

	// 		this.__content = elem;
	// 	}

	// 	//=================================
	// 	// BUTTON HANDLING
	// 	//=================================
	// 	private __processButtons(btns: FormStandardButtons[]): void {
	// 		let btn: FormStandardButtons;
	// 		for (btn of btns) {
	// 			switch (btn) {
	// 				case FormStandardButtons.Accept:
	// 					this.__setupSavingButton("Accept");
	// 					break;

	// 				case FormStandardButtons.OK:
	// 					this.__setupSavingButton("OK");
	// 					break;

	// 				case FormStandardButtons.Cancel:
	// 					this.__setupHidingButton("Cancel");
	// 					break;

	// 				default:
	// 					break;
	// 			}
	// 		}
	// 	}
	// 	private __setupSavingButton (lbl: string) : void {
	// 		let btn: HTMLElement = createSimpleElement("", "btn save", lbl);
	// 		btn.addEventListener("click", () => {
	// 			this.save();
	// 		});
	// 		this.__btns.appendChild(btn);
	// 	}
	// 	private __setupHidingButton (lbl: string): void {
	// 		let btn: HTMLElement = createSimpleElement("", "btn hide", lbl);
	// 		btn.addEventListener("click", () => {
	// 			this.reset();
	// 		});
	// 		this.__btns.appendChild(btn);
	// 	}
	// 	public addButton (btnDef: IFormButtonDefinition): void {
	// 		let btn: HTMLElement = createSimpleElement("", "btn", btnDef.lbl);
	// 		btn.addEventListener('click', () => {
	// 			btnDef.onClick();
	// 		});
	// 		this.__btns.appendChild(btn);
	// 	}

	// 	//========================================
	// 	// HANDLE SECTION CREATION AND SWITCHING
	// 	//========================================
	// 	public createSection (title?: string, numberOfColumns?: number) : number {

	// 		// Create the general section UI
	// 		let sec: HTMLElement = createSimpleElement("", "section");

	// 		// Create the header text if appropriate
	// 		let secHeader: HTMLElement;
	// 		if (title) {
	// 			secHeader = createSimpleElement("", "secHeader " + THEME_COLOR_CLS, title);
	// 			sec.appendChild(secHeader);
	// 		}

 	// 		// Create the appropriate table
  	// 	numberOfColumns = numberOfColumns || 2;
	// 		let tIdx: number = this.__createTable(numberOfColumns);
	// 		let table: HTMLTableElement = this.__tables[tIdx];

	// 		// Add the table + section to our collections
	// 		sec.appendChild(table);
	// 		this.__content.appendChild(sec);
	// 		this.__currentSection = tIdx;

	// 		// Return the index of the table created for this section
	// 		return tIdx;
	// 	}

	// 	public swapSection (index: number): void {
	// 		if (index >= this.__tables.length) { return; }
	// 		this.__currentSection = index;
	// 	}

	// 	//=============================================
	// 	// HANDLE FIELD CREATION
	// 	//=============================================
	// 	/** creates a new field to be used in the form */
	// 	public createField(config: IFormFieldDefinition): void {

	// 	}

	// 	//======================================================
	// 	// PRIVATE CREATION FUNCTIONS
	// 	//======================================================
	// 	private __createTable(numberOfColumns: number): number {
	// 		let tIdx: number = this.__tables.length;
	// 		let table: HTMLTableElement = createTable("", "columnContainer", null, 0, numberOfColumns);

	// 		// Add to our set of tables
	// 		this.__tables[tIdx] = table;

	// 		// Return the index of the created table
	// 		return tIdx;
	// 	}

	// 	private __createDefaultForm(definition: IFormDefinition): void {
	// 		let def: IFormFieldDefinition;
	// 		let key: string;
	// 		for (key in definition) {
	// 			if (definition.hasOwnProperty(key)) {
	// 				def = definition[key];
	// 				this.createField(def);
	// 			}
	// 		}
	// 	}

	// 	private __createCheckbox (definition: IFormFieldDefinition): void {

	// 	}

	// 	private __createLabel (lbl: string): HTMLElement {
	// 		let out: HTMLElement = createSimpleElement("", "lbl", lbl);
	// 		return out;
	// 	}

	// 	//=====================================
	// 	// SHOW OR HIDE THE FORM
	// 	//=====================================
	// 	public save () {

	// 	}

	// 	public reset () {

	// 	}

	// 	//=================================
	// 	// STANDARD CSS STYLES
	// 	//=================================
	// 	private __addStandardStyles (): void {
	// 		//TODO
	// 	}
	// }
}
		/*globals KIP,window*/


// Form.CreateBtnBar
//----------------------------------------------------------



// // Form.AddField
// //---------------------------------------------------------------------------------------
// /**
//  * Adds an input field to the form
//  * @param {string} id          The identifier for the field
//  * @param {string} field       The type of input we are creating
//  * @param {string} position    Where the field should be placed
//  * @param {string} lbl         What label to use for the field
//  * @param {string} lblPosition Where the label for the field should be positioned
//  * @returns {HTMLElement} The created field
//  */
// KIP.Objects.Form.prototype.AddField = function (id, field, position, lbl, lblPosition, original) {
//   "use strict";

//   // Default label position to be the same as the regular position
//   if (!lblPosition && lblPosition !== 0) {
//     lblPosition = position;
//   }


//   if (lbl) {
//     this.AddElement(lbl, lblPosition);
//   }
//   this.AddElement(field, position);

//   if (field) {
//     this.fields.AddElement(id, {
//       "elem": field,
//       "id": id,
//       "resetValue" : original
//     });
//   }

//   if (this.div.parentNode) {
//     this.Draw();
//   }

//   return field;
// };

// // Form.AddElement
// //----------------------------------------------------------------------
// /*
//  *@description Adds an HTML element to the given position on the form
//  *@param {HTMLElement} element - The HTML element to add to the form
//  *@param {variant} position - The position at which an element should appear in the form
// */
// KIP.Objects.Form.prototype.AddElement = function (element, position) {
//   "use strict";
//   var row, table, col, data, rowNum, colNum, tableData, added;

//   // Default positions
//   if (!position) {
//     position = {
//       table: (this.currentSection || (this.tables.length - 1)),
//       col: 0
//     };
//   } else {

//     // Table defaults: first current section, then last added
//     if (!position.table && (position.table !== 0)) {
//       position.table = this.currentSection;
//     }
//     if (!position.table && (position.table !== 0)) {
//       position.table = this.tables.length - 1;
//     }

//     // Column defaults to 0
//     position.col = position.col || 0;
//   }

//   // Positions are now objects with a specified table & column
//   table = position.table;
//   col = position.col;

//   // Quit if we don't actually have a table
//   if (table < 0) return false;
//   if (!this.tables[table]) return false;

//   // Grab the pieces of data about the table
//   rowNum = this.tables[table].rowNum;
//   colNum = this.tables[table].colNum;
//   tableData = this.tables[table].data;

//   // Check if we're adding a new cell to an existing row
//   if (rowNum > 0 && tableData[rowNum - 1]) {
//     row = tableData[rowNum - 1];

//     // If this row doesn't yet have data in this cell, update it
//     if (!row.children[col] || !row.children[col].innerHTML) {
//       KIP.Functions.ProcessCellContents(element, row.children[col]);
//       added = true;
//     }

//   }

//   // If we didn't handle this in the existing cell update, create a new row
//   if (!added) {
//     data = [];
//     data[col] = element;
//     row = KIP.Functions.AddRow(this.tables[table].table, data, "", colNum);
//     rowNum += 1;
//     tableData.push(row);
//   }

//   // Update our globals
//   this.tables[table].rowNum = rowNum;
//   this.tables[table].data = tableData;

// };


// // Form.AddExpandingInput
// //--------------------------------------------------------------------------------------------------------------------------------------------
// /*
//  * Add an input that, when data is entered, expands to an extra field
//  * @param {string} id - THe unique identifier for
//  * @param {string} subID
//  * @param {string} [type]
//  * @param {string} position
//  * @param {string} [value]
//  * @param {object} [attr]
//  * @param {string} [lbl]
//  * @param {string} [cls]
//  * @param {function} [changeCb]
//  * @param {function} [blurCb]
//  * @param {array} [addlListeners]
//  * @returns {HTMLElement} The expandable field that was created
//  */
// KIP.Objects.Form.prototype.AddExpandingInput = function (id, subID, type, position, value, attr, lbl, cls, changeCb, blurCb, addlListeners) {
//   "use strict";
//   var field, that, a, aList;
//   that = this;

//   // Make sure we have an ID & a subID
//   if (!subID) subID = 0;

//   // Create the field
//   field = this.AddInput(id + "." + subID, type || "text", value, attr, lbl, cls, position, position);

//   // Add a content listener that adds fields
//   field.addEventListener("keyup", changeCb || function (e) {
//     var next;
//     next = document.getElementById(id + "." + (subID + 1));
//     if (!next && this.value.length > 0) {
//       that.AddExpandingTextInput(id, subID + 1, txt, position, ghostTxt, lbl);
//     }
//     this.focus();
//   });

//   // Add a content listener to remove fields on lost focus when they are empty
//   field.addEventListener("blur", blurCb || function () {
//     if (this.value.length === 0) {
//       that.RemoveField(this.id + "." + this.subID);
//     }
//   });

//   // Add any additional listeners
//   if (addlListeners) {
//     for (a = 0; a < addlListeners.length; a += 1) {
//       aList = addlListeners[a];
//       if (!aList) continue;
//       field.addEventListener(aList.type, aList.func);
//     }
//   }
// };

// // Form.AddExpandingInputTable
// //-----------------------------------------------------------------------------------------------------------------------------------------
// /* Creates a table that expands when the user adds details */
// KIP.Objects.Form.prototype.AddExpandingInputTable = function (ids, subID, types, positions, values, attrs, lbls, classes, addlListeners) {
//   "use strict";
//   var c, field, that, changeCb, blurCb, cb;
//   that = this;

//   // Function for adding new rows
//   changeCb = function () {
//     var next;
//     next = document.getElementById(ids[0] + "." + (subID + 1));
//     if (!next && this.value.length > 0) {
//       that.AddExpandingInputTable(ids, subID + 1, types, positions, values, attrs, lbls, classes, addlListeners);
//     }
//     this.focus();
//   };

//   // Function for removing empy rows
//   blurCb = function () {
//     var i, empty, f, k;
//     empty = true;

//     for (i = 0; i < ids.length; i += 1) {
//       f = that.fields.GetElement(ids[i] + "." + subID).value;
//       if (f.elem.value.length > 0) {
//         empty = false;
//         break;
//       }
//     }

//     // Only clear the row if everything is empty
//     if (!empty) return;

//     // Remove the entire row
//     for (i = 0; i < ids.length; i += 1) {
//       k = ids[i] + "." + subID;
//       that.RemoveField(k);
//     }
//   };

//   // Loop through the columns we received
//   for (c = 0; c < ids.length; c += 1) {
//     this.AddExpandingInput(ids[c], subID, types && types[c] || "", positions && positions[c] || 0, values && values[c] || "", attrs && attrs[c] || {}, lbls && lbls[c] || "", classes && classes[c] || "", changeCb, blurCb, addlListeners && addlListeners[c]);
//   }
// };

// KIP.Objects.Form.prototype.RemoveField = function (id, ignoreContent) {
//   "use strict";
//   var field;

//   field = this.fields.GetElement(id).value;
//   if (!field) return false;
//   if (field.elem.value && !ignoreContent) return false;

//   // Remove from view
//   if (field.elem.parentNode) {
//     field.elem.parentNode.removeChild(field.elem);
//   }

//   // Remove from collection
//   this.fields.RemoveElement(id);

//   return true;
// };

// // Form.AddInput
// //-----------------------------------------------------------------------------------------------------------------------------
// /*
//  @description Adds an input element to the form with the provided parameters
//  @param {variant} id - If a string, treated as the identifier for the element. If an object, used to grab values for all parameters.
//  @param {string} [type] - What type of input is being created. Defaults to "text".
//  @param {string} [value] - What value, if any, should be set initially in this field
//  @param {obj} [addlAttr] - An object containing key-value pairs of any additional attributes that need to be set for this input.
//  @param {string} [lbl] - What label should be used to describe this element.
//  @param {string} [cls] - What class should be applied for this input
//  @param {string} position - The position at which this input should be placed.
//  @param {string} [lblPosition] - THe position at which the label for this input should be placed. Defaults to the position value.
//  @returns {HTMLElement} The field that was created.
// */
// KIP.Objects.Form.prototype.AddInput = function (id, type, value, addlAttr, lbl, cls, position, lblPosition, tooltip) {
//   "use strict";
//   var input, lblElem, elem;

//   // Check if an object was passed in instead of individual parts
//   if (typeof id === "object") {
//     type = id.type;
//     value = id.value;
//     addlAttr = id.attr;
//     lbl = id.lbl;
//     cls = id.cls;
//     position = id.position;
//     lblPosition = id.lblPosition;
//     id = id.id;
//   }

//   if (!addlAttr) {
//     addlAttr = {};
//   }

//   addlAttr.type = type;
  
//   if (type === "checkbox" || type === "radio") {
//     addlAttr.checked = value;
//   } else {
//     addlAttr.value = value;
//   }

//   input = KIP.Functions.CreateElement({
//     type: "input",
//     cls: cls,
//     id: id,
//     attr : addlAttr
//   });

//   if (lbl) {
//     lblElem = KIP.Functions.CreateSimpleElement(id + "lbl", "lbl", lbl);
//   }

//   // Add both of these new elements to our form
//   elem = this.AddField(id, input, position, lblElem, lblPosition, value);

//   if (tooltip) {
//     elem.parentNode.parentNode.setAttribute("title", tooltip);
//   }
  
//   return elem;
// };

// KIP.Objects.Form.prototype.UpdateFieldValue = function (id, value) {
//   "use strict";
//   var fld, f, type;
//   f = this.fields.GetElement(id);
//   if (!f) return;
//   fld = f.value.elem;
//   type = fld.getAttribute(fld, "type");
//   if (type === "checkbox" || type === "radio") {
//     fld.checked = value;
//   } else {
//     fld.value = value;
//   }
// }

// KIP.Objects.Form.prototype.UpdateFieldAttribute = function (id, attr, newValue) {
//   "use strict";
//   var fld, f;
//   f = this.fields.GetElement(id);
//   if (!f) return;
//   fld = f.value.elem;
//   fld.setAttribute(attr, newValue);
// }

// // Form.Reset
// //-----------------------------------------------
// /**
//  * Clears all fields in the form
//  */
// KIP.Objects.Form.prototype.Reset = function () {
//   "use strict";
//   var fIdx, field, type;
//   for (fIdx = 0; fIdx < this.fields.Length(); fIdx += 1) {
//     field = this.fields.GetElement("", fIdx).value;
    
//      type = field.elem.getAttribute("type");
//     if (type === "checkbox" || type === "radio") {
//       field.elem.checked = field.resetValue;
//     } else {
//       field.elem.value = field.resetValue;
//     }
//   }
// };

// // Form.Save
// //--------------------------------------------------
// /**
//  * Saves all data detailed in the form, as specified by the callback function
//  */
// KIP.Objects.Form.prototype.Save = function () {
//   "use strict";
//   var fIdx, field, values, type;
//   values = {};

//   // Loop through all of our fields
//   for (fIdx = 0; fIdx < this.fields.Length(); fIdx += 1) {
//     field = this.fields.GetElement("", fIdx).value; //Pull out of our collection
//     type = field.elem.getAttribute("type");
//     if (type === "checkbox" || type === "radio") {
//       values[field.id] = field.elem.checked;
//     } else {
//       values[field.id] = field.elem.value;
//     }
    
//   }

//   if (this.saveCb) {
//     this.saveCb(values);
//   }
// };

// //Form.CloseForm
// //---------------------------------------------------
// /**
//   * Closes the form without saving any data. It can also be called by Save
//   */

// KIP.Objects.Form.prototype.CloseForm = function () {
//   "use strict";
//   if (this.overlay && this.overlay.parentNode) {
//     this.overlay.parentNode.removeChild(this.overlay);
//   }

//   if (this.div.parentNode) {
//     this.div.parentNode.removeChild(this.div);
//   }
// };

// // Form.AfterDrawChildren
// //---------------------------------------------------------------------------
// /**
//   * Makes sure to create the standard CSS styles unless the caller disabled it
//   */
// KIP.Objects.Form.prototype.AfterDrawChildren = function () {
//   "use strict";
//   if ((this.standardStyle) && (!this.stylesCreated)) {
//     this.ApplyStandardStyles();
//     this.stylesCreated = true;
//   }
// };

// // Form.ApplyStandardStyles
// //---------------------------------------------------------------------------
// /**
//   * Creates standard CSS classes for each of the elements in the form. Can be overridden with more specific CSS.
//   */
// KIP.Objects.Form.prototype.ApplyStandardStyles = function () {
//   "use strict";
//   var ov, form, input, title, btns, pStyle, lbl, column, cPerc, t, tbl, hd, w, l, top, max_w;

//   // Force parent to have an explicit display
//   pStyle = KIP.Functions.GetComputedStyle(this.parent, "position");
//   if (pStyle === "static") {
//     pStyle = "relative";
//   }
//   this.parent.style.position = pStyle;

//   // Overlay styles
//   ov = {
//     "position": "fixed",
//     "left": 0,
//     "top" : 0,
//     "width": "100%",
//     "height" : "100%",
//     "background-color": "rgba(0,0,0,0.7)",
//     "z-index" : "1"
//   };
//   ov = KIP.Functions.CreateCSSClass(".overlay", ov);

//   // form formatting
//   form = {
//     "background-color": "#FFF",
//     "box-shadow" : "1px 1px 13px 4px rgba(0,0,0,.2);",
//     "font-family" : "Segoe UI, Calibri, sans",
//     "z-index" : "2",
//     "position" : "absolute",
//     "display" : "block",
//     "padding" : "10px",
//     "box-sizing" : "border-box"
//   };
//   form = KIP.Functions.CreateCSSClass(".form", form);
  
//   form = {
//     "left":"30%",
//     "top":"9%",
//     "max-width": "80%",
//     "width":"40%",
//     "max-height": "82%"
//   };
//   form = KIP.Functions.CreateCSSClass(".form:not(.embedded)", form);
  
//   form = {
//     "left":"0",
//     "top":"0",
//     "max-width": "100%",
//     "width":"100%" 
//   };
//   form = KIP.Functions.CreateCSSClass(".form.embedded", form);

//   // input formatting
//   input = {
//     "background-color" : "rgba(0,0,0,.1)",
//     "border" : "1px solid rgba(0,0,0,.25)",
//     "font-family" : "Segoe UI, Calibri, sans",
//   };
//   input = KIP.Functions.CreateCSSClass(".form input", input);
//   input = {
//     "width": "250px",
//     "outline" : "none"
//   };
//   input = KIP.Functions.CreateCSSClass(".form input[type=text]", input);

//   // title bar
//   title = {
//     "width" : "calc(100% - 10px)",
//     "text-align" : "center",
//     "background-color" : this.themeColor,
//     "color" : "#FFF",
//     "padding" : "5px",
//     "font-size" : "20px",
//     "position" : "absolute",
//     "top" : "-30px",
//     "left" : "0px"
//   };
//   title = KIP.Functions.CreateCSSClass(".form .titleBar", title);
//   title = {
//     "float" : "right",
//     "display" : "inline-block",
//     "opacity": "0.7",
//     "font-size": "15px",
//     "padding-top" : "2px",
//     "padding-right" : "5px"
//   };
//   title = KIP.Functions.CreateCSSClass(".form .titleBar .close", title);
//   title = {
//     "opacity": "1",
//     "cursor" : "pointer"
//   };
//   title = KIP.Functions.CreateCSSClass(".form .titleBar .close:hover", title);

//   // button bar
//   btns = {
//     "width" : "100%",
//     "display" : "flex",
//     "flex-direction" : "row",
//     "justify-content" : "flex-end",
//     "font-size" : "20px"
//   };
//   btns = KIP.Functions.CreateCSSClass(".form .btnBar", btns);
//   btns = {
//     "padding" : "5px",
//     "box-shadow": "1px 1px 1px 1px rgba(0,0,0,.2)",
//     "border-radius" : "3px",
//     "font-size" : "15px",
//     "opacity" : "0.7",
//     "margin" : "5px"
//   };
//   btns = KIP.Functions.CreateCSSClass(".form .btnBar .btn", btns);
//   btns = {
//       "opacity" : "1",
//       "cursor" : "pointer"
//   };
//   btns = KIP.Functions.CreateCSSClass(".form .btnBar .btn:hover", btns);

//   // Labels
//   lbl = {
//     "color": "#666",
//     "display" : "inline-block",
//     "text-align": "right",
//     "padding-left" : "5px",
//     "padding-right" : "5px"
//   }
//   lbl = KIP.Functions.CreateCSSClass(".form .lbl", lbl);

//   // Headers
//   hd = {
//     "color" : this.themeColor,
//     "font-weight" : "bold",
//     "font-size" : "22px",
//     "margin-bottom": "10px",
//     "margin-top": "10px"
//   }
//   hd = KIP.Functions.CreateCSSClass(".form .secHeader", hd);

//   // Columns
//   column = {
//     "display" : "table",
//     "width" : "100%"
//   }
//   column = KIP.Functions.CreateCSSClass(".form .columnContainer", column);

//   column = {
//     "display" : "table-cell"
//   };
//   column = KIP.Functions.CreateCSSClass(".form .column", column);

//   // Calculate the appropriate width for each table column
//   for (t = 0; t < this.tables.length; t += 1) {
//     tbl = this.tables[t];
//     cPerc = 100 / tbl.colNum;
//     column = {
//       "width" : cPerc + "%",
//     };
//     column = KIP.Functions.CreateCSSClass(".form #" + tbl.id + " .column", column);
//   }

// };
// 	}

// }