///<reference path="formConstants.ts" />
namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class	Field
     * ----------------------------------------------------------------------------
     * abstract implementation of a form element to be used in the form library
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class Field<M, T extends IFieldConfig<M> = IFieldConfig<M>> extends Drawable {

        //..........................................
        //#region CONSTANTS
        
        /** store the standard class for all form elements */
        protected readonly _standardCls: string = "kipFormElem";
        
        //#endregion
        //..........................................

        //.....................
        //#region PROPERTIES

        /** id of the element */
        protected _id: string;
        public get id(): string { return this._id; }

        /** what type of field this is */
        protected abstract get _type(): FieldTypeEnum;
        public get type(): FieldTypeEnum { return this._type; }

        /** keep track of the form template */
        protected _config: T;
        public get template(): T { return this._config; }

        protected get _defaultLayout(): FormElementLayoutEnum { return FormElementLayoutEnum.MULTILINE; }

        /** abstract property for the default value of child elements */
        protected abstract get _defaultValue(): M;

        /** abstract property for the default class of child elements */
        protected abstract get _defaultCls(): string;

        /** the current value of the element */
        protected _data: M;
        public get data(): M { return this._data; }
        public set data(data: M) { this.update(data, false); } // TODO: evaluate if we'd ever need to fire events here

        /** handle listeners for events */
        protected _listeners: IListenerFunction<M>[];

        /** keep track of whether we are currently in an error state */
        protected _hasErrors: boolean;
        public get hasErrors(): boolean { return this._hasErrors; }

        //#endregion
        //.....................

        //..........................................
        //#region HTML ELEMENTS
        
        /** elements of the form element */
        protected _elems: IFieldElems;

        /** input element */
        public get input(): EvaluableElem {
            if (!this._elems.input) { return null; }
            return this._elems.input;
        }

        /** allow for label or label containers to be used */
        protected get _labelElem(): HTMLElement {
            return this._elems.lblContainer || this._elems.lbl;
        }

        /** keep track of where this form is drawn */
        protected _parent: HTMLElement;
        
        //#endregion
        //..........................................

        //..........................................
        //#region STYLES
        
        /** placeholder for individual CSS styles */
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem, .kipFormElem input, .kipFormElem select, .kipFormElem textarea": {
                fontSize: "1em",
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "Segoe UI, Open Sans, Helvetica",
            },

            ".kipFormElem": {
                marginTop: "10px",
                position: "relative"
            },

            ".kipFormElem input, .kipFormElem textarea, .kipFormElem select": {
                border: "1px solid #CCC"
            },

            ".kipFormElem textarea": {
                minHeight: "100px",
                maxWidth: "100%"
            },

            ".kipFormElem .labelContainer": {
                display: "flex",
                alignItems: "center"
            },

            ".kipFormElem .helpTextIcon": {
                width: "19px",
                height: "19px",
                boxSizing: "border-box",
                paddingTop: "4px",
                backgroundColor: "<formSubTheme>",
                color: "#FFF",
                borderRadius: "50%",
                fontSize: "0.8em",
                textAlign: "center",
                fontFamily: "SpecialElite",
                cursor: "pointer",

                nested: {
                    "&:hover": {
                        transform: "scale(1.1)"
                    }
                }
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
                color: "<formSubTheme>",
                fontWeight: "bold",
                position: "absolute",
                marginLeft: "2px"
            },

            ".kipFormElem .error": {
                color: "#C30",
                fontSize: "0.7em",
                fontStyle: "italic"
            },

            ".kipFormElem.flex": {
                display: "flex",
                alignItems: "center",
                nested: {
                    "> div:not(.error), > label, > span, > input": {
                        width: "auto",
                        marginRight: "10px"
                    }
                }
            }
        };
        
        //#endregion
        //..........................................

        //..........................................
        //#region CONSTRUCT A FIELD
        
        /**
         * FormElement
         * ----------------------------------------------------------------------------
         * Create a Form Element
         * @param   id      The ID of the element; should be unique in the form
         * @param   data    a template or existing form element 
         */
        constructor(id: string, data?: T | Field<M, T>) {
            super();
            this._addClassName("FormElement");
            this._id = id;
            this._hasErrors = false;

            //  parse the template for this element
            if (isField(data)) { this._parseFieldTemplate(data.template as T); }
            else { this._parseFieldTemplate(data); }

            this._createElements();
        }

        /**
         * _shouldSkipCreateElements
         * ----------------------------------------------------------------------------
         * handle element creation at our own pace
         */
        protected _shouldSkipCreateElements() { return true; }
        
        //#endregion
        //..........................................

        //..........................................
        //#region PARSE TEMPLATE
        
        /**
         * _parseFieldTemplate
         * ----------------------------------------------------------------------------
         * parse the template for this particular field
         */
        protected _parseFieldTemplate(template: T): void {

            // ensure template is never null
            if (isNullOrUndefined(template)) { template = {} as T; }

            // save off the template
            this._config = template;

            // set appropriate defaults on the template
            if (!template.label) { template.label = this._id; }
            if (!template.layout) { template.layout = this._defaultLayout; }
            if (!template.defaultValue) { template.defaultValue = this._defaultValue; }
            
            // verify that we check for valid falsey values
            if (isNullOrUndefined(template.value)) { template.value = template.defaultValue; }
            if (isNullOrUndefined(template.validationType)) { template.validationType = ValidationType.KEEP_ERROR_VALUE; }

            // handle our special cases
            this._processTemplateClass();
            this._processRequiredElement();
            this._registerOnOtherChangeListener();
            
            // set our data to be the default value
            this._data = template.defaultValue;
        }

        /**
         * _processTemplateClass
         * ----------------------------------------------------------------------------
         * generate the appropriate class for this element
         */
        protected _processTemplateClass(): void {
            let template = this._config;
            template.cls = Styles.buildClassString(
                this._standardCls,                      // class for all form elements
                this._defaultCls,                       // class for this particular form element
                template.cls,                           // class specified in template
                template.required ? "required" : ""     // required class (if appropriate)
            );
        }

        /**
         * _processRequiredElement
         * ----------------------------------------------------------------------------
         * if this element is required, indicate that we're not ready to save if we 
         * don't yet have data
         */
        protected _processRequiredElement(): void {

            // quit if this element isn't required, or if we already have a value
            if (!this._config.required) { return; }
            if (this._data) { return; }

            // otherwise, send a message that this element is not ready to save
            formEventHandler.dispatchEvent(
                FORM_SAVABLE_CHANGE, 
                new FormSavableEvent({ 
                    hasErrors: false, 
                    hasMissingRequired: true 
                })
            );
        }

        /**
         * _registerOnOtherChangeListener
         * ----------------------------------------------------------------------------
         * listen for other fields changing, if a listener was provided in the 
         * template
         */
        protected _registerOnOtherChangeListener(): void {

            // don't add a listener if there's nothing to listen to
            if (!this._config.onOtherChange) { return; }

            formEventHandler.addEventListener(FORM_ELEM_CHANGE, {
                func: (ev: FormElemChangeEvent<any>) => { this._handleOtherChange(ev); }
            });
        }
        
        //#endregion
        //..........................................

        //...........................
        //#region CREATE ELEMENTS

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * creates all elements for this input 
         */
        protected _createElements(): void {

            // generate the elements that are shared between all form elements
            KIP.createElement({
                cls: this._config.cls,
                key: "base",

                children: [{
                    cls: "error",
                    key: "error"
                }]
            }, this._elems as any);

            // Let the child handle actually creating the elements that make 
            // up the specific nature of the element
            this._onCreateElements();

            // register the change listener if we created one
            if (this._elems.input) {
               this._registerInputListeners(this._elems.input as HTMLInputElement);
            }

            // generate the styles for the element 
            // (we need to do this manually because form elements aren't 
            //  Drawable elements)
            this._createStyles();
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * generates the input-type-specific elements for this form element
         */
        protected abstract _onCreateElements(): void;
        
        /**
         * _registerInputListeners
         * ----------------------------------------------------------------------------
         * create the listeners that pay attention to when content in the form has
         * updated
         */
        protected _registerInputListeners(input: HTMLInputElement): void {
            input.addEventListener("input", () => {
                this._changeEventFired(true);
            });

            input.addEventListener("change", () => {
                this._changeEventFired();
            });
        }

        /**
         * _addStandardElemsToCore
         * ----------------------------------------------------------------------------
         * add created elements to the appropriate parent
         */
        protected _addStandardElemsToCore(): void {
            this._elems.base.appendChild(this._labelElem);
            this._elems.base.appendChild(this._elems.input);
        }

        //#endregion
        //...........................
        
        //..........................................
        //#region HANDLE LAYOUT OF ELEMENTS
        
        /**
         * _handleStandardLayout
         * ----------------------------------------------------------------------------
         * helper to handle an elements layout based on their config 
         * 
         * @returns True if the layout was valid; false otherwise
         */
        protected _handleStandardLayout(): boolean {
            let l = FormElementLayoutEnum;
            switch (this._config.layout) {

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

         /**
         * _tableLayout
         *----------------------------------------------------------------------------
         * draws elements in a table format 
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
            if (this._labelElem) { cells[0].appendChild(this._labelElem); }
            if (this._elems.input) { cells[1].appendChild(this._elems.input); }

            // create the actual table element & add it to the core element
            this._elems.table = createTable("", "", cells);
            this._elems.base.appendChild(this._elems.table);
        }

        /**
         * _flexLayout
         * ----------------------------------------------------------------------------
         * handle a flex layout of label: elem 
         */
        protected _flexLayout(): void {
            this._addStandardElemsToCore();
            addClass(this._elems.base, "flex");
        }

        /**
         * _multiLineLayout
         * ----------------------------------------------------------------------------
         * handle a multiline layout of label on top of input 
         */
        protected _multiLineLayout(): void {
            this._addStandardElemsToCore();
            addClass(this._elems.base, "multiline");
        }

        /**
         * _labelAfterLayout
         * ----------------------------------------------------------------------------
         * handle displaying the label element after the input 
         */
        protected _labelAfterLayout(): void {
            this._elems.base.appendChild(this._elems.input);
            this._elems.base.appendChild(this._labelElem);
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region SAVE THIS FIELD
        
        /**
         * save
         * ----------------------------------------------------------------------------
         * handle saving the data from this form 
         * @returns The data contained within this form element
         */
        public async save<K extends keyof M>(internalUpdate?: boolean): Promise<M> {
            return this._data;
        }

        /**
         * canSave
         * ----------------------------------------------------------------------------
         * Determines whether this element has the option for saving
         * 
         * @returns True if this element is prepared to save
         */
        public canSave(): ICanSaveTracker {
            return {
                hasErrors: this._hasErrors,
                hasMissingRequired: this._hasBlankRequiredElems()
            };
        }

        /**
         * _hasBlankRequiredElems
         * ----------------------------------------------------------------------------
         * Check if this element has any misisng required elements
         */
        protected _hasBlankRequiredElems(): boolean {
            if (!this._config.required) { return false; }
            if (this._data !== this._config.defaultValue) { return false; }
            return true;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region DATA MANAGEMENT
        
        /**
         * update
         * ----------------------------------------------------------------------------
         * handle setting data programmatically
         * @param   data    The data to populate in this field
         */
        public update(data: M, allowEvents: boolean): void {

            // check if the value has changed, and if so, notify others
            let changed: boolean = !this._testEquality(data);
            if (changed && allowEvents) { window.setTimeout(() => { this._dispatchChangeEvent(); }, 0); }

            // clear the form ahead of time
            this.clear();

            // if there's no data, grab the default value from the config
            if (isNullOrUndefined(data)) { data = this._config.defaultValue; }

            // set the data and update the UI
            this._data = data;
            this._updateUI(data);

        }

        /**
         * _testEquality
         * ----------------------------------------------------------------------------
         * determine if the new value is the same as the current value
         */
        protected _testEquality(data: M): boolean {
            return equals(data, this._data);
        }

        /**
         * _updateUI
         * ----------------------------------------------------------------------------
         * update the UI elements to have the right data, when the data has changed
         */
        protected _updateUI(data: M): void {
            if (!this._elems.input) { return; }
            this._elems.input.value = data;
        }

        /**
         * _clear
         * ----------------------------------------------------------------------------
         * reset the form to its default values
         */
        public clear(): void {
            this._data = this._config.defaultValue;
            this._clearUI();
        }

        /**
         * _clearUI
         * ----------------------------------------------------------------------------
         * clear out the form element
         */
        protected _clearUI(): void {
            if (!this._elems.input) { return; }
            this._elems.input.value = this._config.defaultValue;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region EVENT HANDLING
        
        /**
         * focus
         * ----------------------------------------------------------------------------
         * Set focus to the input of this form element
         */
        public focus(): boolean {
            if (!this._elems.input) { return false; }
            this._elems.input.focus();
            return true;
        }
        
        /**
        * _dispatchSavableChangeEvent
        * ----------------------------------------------------------------------------
        * let any listeners know that we updated the savable status of this element
        */
        protected _dispatchSavableChangeEvent(): void {
            formEventHandler.dispatchEvent(
                FORM_SAVABLE_CHANGE, 
                new FormSavableEvent({
                    target: this
                }),
            );
        }

        /**
         * _dispatchChangeEvent
         * ----------------------------------------------------------------------------
         * let any listeners know that we updated our stuff 
         */
        protected _dispatchChangeEvent(subkey?: string): void {
            formEventHandler.dispatchEvent(FORM_ELEM_CHANGE, new FormElemChangeEvent({
                key: this._id,
                subkey: subkey,
                data: this._data,
                target: this
            }));
        }

        /**
         * _handleOtherChange
         * ----------------------------------------------------------------------------
         * wrapper around our listener to ensure the data gets parsed appropriately
         */
        protected _handleOtherChange(ev: FormElemChangeEvent<any>): void {
            if (!this._config.onOtherChange) { return; }
            this._config.onOtherChange(ev.context.key, ev.context.data, this);
        }

        //#endregion
        //..........................................

        //.............................................
        //#region HANDLE USER CHANGES TO THE FIELD

        /**
         * _changeEventFired
         * ----------------------------------------------------------------------------
         * handle when the input element has changed in order to kick off the 
         * validation process
         */
        protected _changeEventFired(fieldStillHasFocus?: boolean): void {

            // clear out any current errors
            this._clearErrors();

            // if we don't validate until the field has lost focus, continue on
            if (fieldStillHasFocus && !this._shouldValidateBeforeBlur()) { return; }

            // notify listeners that something that might affect savability has occurred
            KIP.wait(0).then(() => this._dispatchSavableChangeEvent() );

            // grab & validate the data from the field
            let value: M = this._getValueFromField(fieldStillHasFocus);
            if (this._testEquality(value)) { return; }
            
            let validationResult = this._validate(value);
            if (!validationResult) { return; }

            // notify event listeners that something has successfully changed
            this._dispatchChangeEvent();
        }

        /**
         * _getChangedValue
         * ----------------------------------------------------------------------------
         * child implementation that grabs the data from the input field and processes
         * it so that it is in the right format
         */
        protected abstract _getValueFromField(fieldStillHasFocus: boolean): M;

        /**
         * _shouldValidateBeforeBlur
         * ----------------------------------------------------------------------------
         * determine whether validation should occur on every change, or whether it 
         * should only occur upon moving focus away from the field
         */
        protected _shouldValidateBeforeBlur(): boolean { return true; }

        //#endregion
        //.............................................

        //..........................................
        //#region VALIDATION
        
        /**
         * _validate
         * ----------------------------------------------------------------------------
         * validate that the current value of this field is appropriate
         * @param   value   data we are validating 
         * @returns true if the validation succeeded, false otherwise
         */
        protected _validate(value: M): boolean {

            // spin up the object that will get updated if the validation encounters an error
            let errorString: IErrorString = {
                title: "",
                details: ""
            };

            // run through our custom validation
            let validationResult = this._runValidation(value, errorString);

            // if validation succeeded, set our data to the passed-in value
            if (validationResult) {
                this._data = value;
                return true;

            // otherwise, show the appropriate error state
            } else {
                this._onValidationError(errorString);
                return false;
            }
            
        }

        /**
         * _runValidation
         * ----------------------------------------------------------------------------
         *  runs the user-defined validation function & returns the result
         */
        protected _runValidation(data: M, errorString: IErrorString): boolean {

            // run it through the user-defined eval function
            if (this._config.onValidate) {
                if (!this._config.onValidate(data, errorString)) {
                    this._hasErrors = true;
                    return false;
                }
            }

            // if we made it this far, either there was no validation, or it succeeded
            this._hasErrors = false;
            return true;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region ERROR HANDLING

        /**
         * _onValidationError
         * ----------------------------------------------------------------------------
         * take an action based on validation failing, taking into consideration
         * the validation type of this field
         */
        protected _onValidationError(err?: IErrorString): void {
            this._updateErrorElem(err);
            this._updateInputOnError();
        }

        /**
         * _updateErrorElem
         * ----------------------------------------------------------------------------
         * update the error element of this field to show the appropriate message
         */
        protected _updateErrorElem(err: IErrorString): void {
            if (!this._elems.error) { return; }

            let msg: string = this._buildValidationErrorDisplay(err);
            this._elems.error.innerHTML = msg;
        }

        /**
         * _updateInputOnError
         * ----------------------------------------------------------------------------
         * update the input element when a validation attempt failed
         */
        protected _updateInputOnError(): void {
            if (!this._elems.input) { return; }

            let value: M;
            switch (this._config.validationType) {

                case ValidationType.CLEAR_ERROR_VALUE:
                    value = this._config.defaultValue;
                    break;

                case ValidationType.KEEP_ERROR_VALUE:
                    value = this._elems.input.value;
                    break;

                case ValidationType.NO_BLUR_PROCESSED:
                    value = this._elems.input.value;
                    window.setTimeout(() => { this._elems.input.focus(); }, 10);
                    break;

                case ValidationType.RESTORE_OLD_VALUE:
                    value = this._data;
                    break;

                default:
                    value = this._config.defaultValue;
                    break;
            }
            this._elems.input.value = value;
            
        }

        /**
         * _buildValidationErrorDisplay
         * ----------------------------------------------------------------------------
         * generate the error message based on the error details returned by the
         * validation function
         */
        protected _buildValidationErrorDisplay(err: IErrorString) {
            if (!err) { return "Invalid data"; }

            let msg: string;
            msg = err.title ? err.title + ": " : "Uh-oh: ";
            msg += err.details || (this._id + "'s data couldn't be saved");
            return msg;
        }

        /**
         * _clearErrors
         * ----------------------------------------------------------------------------
         * clear all of the errors 
         *
         */
        protected _clearErrors(): void {
            if (this._elems.error) {
                this._elems.error.innerHTML = "";
            }
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region STANDARD ELEMENT CREATION
        
        /**
         * _createStandardInput
         *----------------------------------------------------------------------------
         *  create a standard input based on the form type 
         */
        protected _createStandardInput(): void {
            let attr: IAttributes = {};

            if (this._config.useGhostText) { attr.placeholder = this._config.label; }

            this._elems.input = createInputElement(
                this._id + "|input", 
                "input", 
                FieldTypeEnum[this.type], 
                this._data, 
                attr
            );
        }

        /**
         * _createStandardLabel
         * ----------------------------------------------------------------------------
         *  create a standard label for the input 
         */
        protected _createStandardLabel(embedIn?: HTMLElement): void {
            let lbl: string = this._config.label;
            if (this._config.useGhostText) { lbl = ""; }

            this._elems.lblContainer = createElement({
                cls: "labelContainer",
                parent: embedIn
            });

            this._elems.lbl = createLabelForInput(lbl, this._id, "lbl", this._elems.lblContainer);

            if (this._config.helpText) {
                this._elems.helpTextIcon = createElement({
                    type: "span",
                    cls: "helpTextIcon",
                    content: "?",
                    parent: this._elems.lblContainer
                });

                let tooltip: Tooltip = new Tooltip({ content: this._config.helpText }, this._elems.helpTextIcon);
            }
        }

        /**
         * _createStandardLabeledInput
         *----------------------------------------------------------------------------
         * create an input field with a label, based on the form type
         */
        protected _createStandardLabeledInput(shouldEmbed?: boolean): void {
            this._createStandardInput();
            this._createStandardLabel((shouldEmbed ? this._elems.input : null));
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region CLONE AN ELEMENT
        
        /**
         * _cloneFormElement
         * ----------------------------------------------------------------------------
         * wrapper around the cloning method so we don't run into protection issues 
         */
        protected _cloneFormElement(elemToClone: Field<any>, appendToID?: string): Field<any> {
            if (!appendToID) { appendToID = ""; }
            return elemToClone._createClonedElement(appendToID);
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * creates a new version of the same form element
         * 
         * @param   appendToID  ID to add to the current elem ID when cloning (to 
         *                      avoid id conflicts)
         * 
         * @returns The cloned form element
         */
        protected _createClonedElement(appendToID: string): Field<M, T> {
            return new (this.constructor as IConstructor<Field<M, T>>)(this._id + appendToID, this._config);
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region GET ELEMENTS AFTER CREATION
        
        public getField(id: string): Field<any> {
            if (id === this._id) { return this; }
            return null;
        }
        
        //#endregion
        //..........................................
        

    }

}