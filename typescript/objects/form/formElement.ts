///<reference path="formConstants.ts" />
namespace KIP.Forms {

    /** 
     * determine whether a particular parameter is a form element 
     * @param elem - Either a FormElement or a FormTemplate
     * @returns True if elem is a form Element
     */
    export function isFormElement<T>(elem: IFormElemTemplate<T> | FormElement<T>): elem is FormElement<T> {
        if (!elem) { return false; }
        return ((elem as FormElement<T>).id !== undefined) && ((elem as FormElement<T>).type !== undefined);
    }

    /** create the general form element class that all others extend */
    export abstract class FormElement<T> extends Styles.Stylable {

        //#region Form Element Properties

        /** id of the element */
        protected _id: string;
        public get id(): string { return this._id; }

        /** store the appropriate class for the element */
        protected _cls: string;

        /** store the standard class for all form elements */
        protected readonly _standardCls: string = "kipFormElem";

        /** label for the element */
        protected _label: string;

        /** what type of form element it is */
        protected _type: FormElementTypeEnum;
        public get type(): FormElementTypeEnum { return this._type; }

        /** abstract property for the default value of child elements */
        protected abstract get _defaultValue(): T;

        /** abstract property for the default class of child elements */
        protected abstract get _defaultCls(): string;

        /** the current value of the element */
        protected _data: T;
        public get data(): T { return this._data; }
        public set data(data: T) { this.update(data); }

        /** what to use to validate the function */
        protected _onValidate: IValidateFunc<T>;

        /** handler for when another element changes */
        protected _onOtherChange: IOtherChangeFunc<T>;
        public get onOtherChange(): IOtherChangeFunc<T> { return this._onOtherChange; }

        /** elements of the form element */
        protected _elems: IFormHTMLElements;

        /** how this form element should be laid out */
        protected _layout: FormElementLayoutEnum;

        /** whether this element is required */
        protected _required: boolean;

        /** where this element sits in the order of the form */
        protected _position: number;

        /** handle listeners for events */
        protected _listeners: IListenerFunction<T>[];

        /** keep track of where this form is drawn */
        protected _parent: HTMLElement;

        /** keep track of the form template */
        protected _template: IFormElemTemplate<T>;
        public get template(): IFormElemTemplate<T> { return this._template; }

        /** keep track of whether we are currently in an error state */
        protected _hasErrors: boolean;
        public get hasErrors(): boolean { return this._hasErrors; }

        /** keep track of how this field should be validated */
        protected _validationType: ValidationType;
        public get validationType(): ValidationType { return this._validationType; }

        /** placeholder for individual CSS styles */
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem, .kipFormElem input, .kipFormElem select, .kipFormElem textarea": {
                fontSize: "1em",
                width: "100%",
                boxSizing: "border-box"
            },

            ".kipFormElem": {
                marginTop: "10px",
                position: "relative"
            },

            ".kipFormElem input, .kipFormElem textarea, .kipFormElem select": {
                fontFamily: "OpenSansLight,Segoe UI,Helvetica",
                fontSize: "0.8em",
                border: "1px solid #CCC"
            },

            ".kipFormElem textarea": {
                minHeight: "100px",
                maxWidth: "100%"
            },

            ".kipFormElem .lbl": {
                fontSize: "0.9em",
                color: "#666",
                width: "100%",
                boxSizing: "border-box"
            },

            ".kipFormElem.required .lbl": {

            },

            ".kipFormElem.required .lbl:after": {
                content: '"*"',
                color: "<1>",
                fontWeight: "bold",
                fontSize: "1.8em",
                position: "absolute",
                marginLeft: "2px"
            }
        };
        
        //#endregion

        //#region Constructing a Form Element

        /** ...........................................................................
         * Create a Form Element
         * @param id - The ID of the element; should be unique in the form
         * @param data - A template of what should be contained in a form element
         * @returns a new FormElement instance
         * ...........................................................................
         */
        constructor(id: string, data?: FormElement<T>);

        /**...........................................................................
         * Create a Form Element
         * @param   id      The ID of the element; should be unique in the form
         * @param   data    An existing FormElement to clone from
         * @returns A new FormElement instance
         * ...........................................................................
         */
        constructor(id: string, data?: IFormElemTemplate<T>);

        /**...........................................................................
         * 
         * @param id 
         * @param data 
         * ...........................................................................
         */
        constructor(id: string, data?: IFormElemTemplate<T> | FormElement<T>) {
            super();
            this._addClassName("FormElement");
            this._id = id;

            // If this is another element, parse it
            if (isFormElement(data)) {
                this._cloneFromFormElement(data);
            
            // otherwise, handle the standard template parsing
            } else {
                this._parseElemTemplate(data);
            }
            this._createElements();
        }

        /**...........................................................................
         * _cloneFromFormElement
         * ...........................................................................
         *  handle creation of the element through copying over an existing element
         * ...........................................................................
         */
        protected _cloneFromFormElement(elem: FormElement<T>): void {
            this._parseElemTemplate(elem.template);
        }

        /**...........................................................................
         * _parseElemTemplate
         * ...........................................................................
         * parse the template 
         * ........................................................................... 
         */
        protected _parseElemTemplate(template: IFormElemTemplate<T>): void {

            // quit if there is nothing to parse
            if (isNullOrUndefined(template)) {
                template = {};
            }

            // set up the label for the element
            this._label = template.label || this._id;
            if (isNullOrUndefined(this._label)) { this._label = this._id; }

            // set the appropriate type
            this._type = template.type || this._type;

            // set the appropriate default value
            this._data = template.value;
            if (isNullOrUndefined(this._data)) { this._data = this._defaultValue; }

            // create the appropriate layout
            this._layout = template.layout || FormElementLayoutEnum.MULTILINE;

            // determine whether we need this element to submit
            this._required = template.required;

            // ensure a particular order of elements
            this._position = template.position;

            // set an appropriate CSS class
            this._cls = Styles.buildClassString(this._standardCls, this._defaultCls, template.cls, template.required? "required" : "");

            // handle validation options
            this._onValidate = template.onValidate;
            this._validationType = template.validationType;
            if (isNullOrUndefined(this._validationType)) { this._validationType = ValidationType.KEEP_ERROR_VALUE; }

            // If there's an "other changed" function, register a listener
            this._onOtherChange = template.onOtherChange;
            if (this._onOtherChange) {
                Events.addEventListener(FORM_ELEM_CHANGE, {
                    func: (ev: Events.Event) => { this._handleOtherChange(ev); },
                    uniqueId: this._id
                });
            }

            // save off our template
            this._template = template;
        }

        /**...........................................................................
         * _parseElement
         * ...........................................................................
         * wrapper around the cloning method so we don't run into protection issues 
         * ...........................................................................
         */
        protected _parseElement (template: FormElement<any>, appendToID?: string): FormElement<any> {
            if (!appendToID) { appendToID = ""; }
            return template._createClonedElement(appendToID);
        }

        //#endregion

        //#region Creating elements for a Form Element

        /**...........................................................................
         * _createElements
         * ...........................................................................
         * creates all elements for this input 
         * ........................................................................... 
         */
        protected _createElements(): void {
            this._elems = {
                core: KIP.createSimpleElement("", this._cls),
                error: KIP.createSimpleElement("", "error")
            };

            this._elems.core.appendChild(this._elems.error);

            // Let the child handle actually creating the elements
            this._onCreateElements();

            // register the change listener if we created one
            if (this._elems.input) {
                this._elems.input.addEventListener("change", () => {
                    this._changeEventFired();
                });
            }

            this._createStyles();
        }


        /**...........................................................................
         * _tableLayout
         * ...........................................................................
         * draws elements in a table format 
         * ...........................................................................
         */
        protected _tableLayout(): void {

            // build the cells that will hold the elements
            let cells = [];
            for (var i = 0; i < 2; i += 1) {
                let cell: HTMLTableCellElement = KIP.createElement({
                    type: "td",
                    cls: "frmCel"
                }) as HTMLTableCellElement;
                cells[i] = cell;
            }

            // add the label and the input to the table cells
            if (this._elems.lbl) { cells[0].appendChild(this._elems.lbl); }
            if (this._elems.input) { cells[1].appendChild(this._elems.input); }

            // create the actual table element & add it to the core element
            this._elems.table = createTable("", "", cells);
            this._elems.core.appendChild(this._elems.table);
        }

        /**...........................................................................
         * _flexLayout
         * ...........................................................................
         * handle a flex layout of label: elem 
         * ........................................................................... 
         */
        protected _flexLayout(): void {
            this._addStandardElemsToCore();
            addClass(this._elems.core, "flex");
        }

        /**...........................................................................
         * _multiLineLayout
         * ...........................................................................
         * handle a multiline layout of label on top of input 
         * ........................................................................... 
         */
        protected _multiLineLayout(): void {
            this._addStandardElemsToCore();
            addClass(this._elems.core, "multiline");
        }

        /**...........................................................................
         * _labelAfterLayout
         * ...........................................................................
         * handle displaying the label element after the input 
         * ........................................................................... 
         */
        protected _labelAfterLayout(): void {
            this._elems.core.appendChild(this._elems.input);
            this._elems.core.appendChild(this._elems.lbl);
        }

        /**...........................................................................
         * _addStandardElemsToCore
         * ...........................................................................
         * 
         * ...........................................................................
         */
        protected _addStandardElemsToCore(): void {
            this._elems.core.appendChild(this._elems.lbl);
            this._elems.core.appendChild(this._elems.input);
        }

        /**...........................................................................
         * _handleStandardLayout
         * ...........................................................................
         * helper to handle an elements layout based on their config 
         * ........................................................................... 
         */
        protected _handleStandardLayout(): boolean {
            let l = FormElementLayoutEnum;
            switch (this._layout) {

                // label displays in table cell, elemnt in other table cell
                case l.TABLE:
                    this._tableLayout();
                    return true;

                // label displays before element inline
                case l.FLEX:
                    this._flexLayout();
                    return true;

                // label displays line above element
                case l.MULTILINE:
                    this._multiLineLayout();
                    return true;

                // label displays after the input
                case l.LABEL_AFTER:
                    this._labelAfterLayout();
                    return true;
            }

            return false;
        }

        //#endregion

        //#region Publicly-accessible functions 

        /**...........................................................................
         * save
         * ...........................................................................
         * handle saving the data from this form 
         * @returns The data contained within this form element
         * ...........................................................................
         */
        public save<K extends keyof T>(internalUpdate?: boolean): T {
            // return the data that was created
            return this._data;
        }

        /**...........................................................................
         * canSave
         * ...........................................................................
         * Determines whether this element has the option for saving
         * @returns True if this element is prepared to save
         * ...........................................................................
         */
        public canSave(): boolean {
            return !this._hasErrors;
        }

        /** ...........................................................................
         * update
         * ...........................................................................
         * handle when someone gives us new data programmatically 
         * @param data - The data to use for this FormElement
         * ...........................................................................
         */
        public update(data: T): void {
            this._onClear();
            if (isNullOrUndefined(data)) { data = this._defaultValue; }
            
            this._data = data;
            if (this._elems.input) {
                this._elems.input.value = data;
            }
        }

        /** ...........................................................................
         * render
         * ...........................................................................
         * render a particular form element 
         * @param parent - The parent element that should be used to render this element
         * ...........................................................................
         */
        public render(parent?: HTMLElement): void {

            // update the parent & quit if it's null
            this._parent = parent || this._parent;
            if (!this._parent) { return; }

            // add this core element to the parent
            this._parent.appendChild(this._elems.core);

        }

        /**...........................................................................
         * clear
         * ...........................................................................
         * Clears all data in this particular element
         * ...........................................................................
         */
        public clear(): void {
            return this._onClear();
        }

        //#endregion

        //#region Handle changes to the element's data 

        /**...........................................................................
         * _changeEventFired
         * ...........................................................................
         * 
         * ...........................................................................
         */
        protected _changeEventFired(): void {

            this._clearErrors();

            // call the child's version of the validation
            if (this._onChange()) {

                // let the listeners know that this succeeded
                this._dispatchChangeEvent();
            }

        }

        /**...........................................................................
         * _clearErrors
         * ...........................................................................
         * clear all of the errors 
         * ...........................................................................
         */
        protected _clearErrors(): void {
            if (this._elems.error) {
                this._elems.error.innerHTML = "";
            }
        }

        /**...........................................................................
         * _validate
         * ...........................................................................
         *  handle the shared validation function 
         * ...........................................................................
         */
        protected _validate(data: T): boolean {

            // run it through the eval function
            if (this._onValidate) {
                if (!this._onValidate(data)) {
                    return false;
                }
            }

            return true;
        }

        /**...........................................................................
         * _onValidateError
         * ...........................................................................
         * display a default error message 
         * ...........................................................................
         */
        protected _onValidateError(msg?: string): void {
            if (!msg) { msg = "uh-oh: " + this._id + "'s data couldn't be saved"; }
            console.log(msg);

            /** if we have an error element, fill it with the error */
            if (this._elems.error) {
                this._elems.error.innerHTML = msg;
            }

            /** update the thing */
            if (this._elems.input) {
                this._elems.input.value = this._data;
            }

            
        }

        

        /**...........................................................................
         * _dispatchChangeEvent
         * ...........................................................................
         * let any listeners know that we updated our stuff 
         * ...........................................................................
         */
        protected _dispatchChangeEvent(subkey?: string): void {
            Events.dispatchEvent(FORM_ELEM_CHANGE, {
                key: this._id,
                subkey: subkey,
                data: this._data
            });
        }

        /**...........................................................................
         * _handleOtherChange
         * ...........................................................................
         * wrapper around our listener to ensure the data gets parsed appropriately
         * ...........................................................................
         */
        protected _handleOtherChange(ev: Events.Event): void {
            if (!this._onOtherChange) { return; }
            this._onOtherChange(ev.context.key, ev.context.data, this);
        }
        //#endregion

        //#region Abstract functions to be implemented by child elements

        /**...........................................................................
         * _onCreateElements
         * ...........................................................................
         */
        protected abstract _onCreateElements(): void;

        /**...........................................................................
         * _onChange
         * ...........................................................................
         */
        protected abstract _onChange(): boolean;

        /**...........................................................................
         * _createClonedElement
         * ...........................................................................
         * @param   appendToID  
         * 
         * @returns The cloned form element
         * ...........................................................................
         */
        protected abstract _createClonedElement(appendToID: string): FormElement<T>;
        
        //#endregion

        //#region Standard functions for reuse

        /**...........................................................................
         * _standardValidation
         * ...........................................................................
         * 
         * @param value 
         * 
         * @returns
         * ...........................................................................
         */
        protected _standardValidation(value: T): boolean {

            if (!this._validate(value)) {
                this._onValidateError();
                return false;
            }

            this._data = value;
            return true;
        }

        /**...........................................................................
         * _createStandardInput
         * ...........................................................................
         *  create a standard input based on the form type 
         * ...........................................................................
         */
        protected _createStandardInput(): void {
            this._elems.input = createInputElement(this._id + "|input", "input", FormElementTypeEnum[this.type], this._data);
        }

        /**...........................................................................
         * _createStandardLabel
         * ...........................................................................
         *  create a standard label for the input 
         * ...........................................................................
         */
        protected _createStandardLabel(embedIn?: HTMLElement): void {
            this._elems.lbl = createLabelForInput(this._label, this._id, "lbl", embedIn);
        }

        /**...........................................................................
         * _createStandardLabeledInput
         * ...........................................................................
         * @param shouldEmbed 
         * ...........................................................................
         */
        protected _createStandardLabeledInput(shouldEmbed?: boolean): void {
            this._createStandardInput();
            this._createStandardLabel((shouldEmbed? this._elems.input : null));
        }

        /**...........................................................................
         * _onClear
         * ...........................................................................
         * 
         * ...........................................................................
         */
        protected  _onClear(): void {
            this._data = this._defaultValue;
            if (this._elems.input) {
                this._elems.input.value = this._defaultValue;
            }
        }
        //#endregion
    }

}