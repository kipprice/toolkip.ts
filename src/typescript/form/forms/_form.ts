namespace KIP.Forms {
    
    export abstract class _Form<T> extends KIP.Drawable {

        //..................
        //#region STYLES
        
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".kipForm": {
                fontFamily: "Open Sans,Segoe UI Light,Helvetica",
                fontSize: "1em",
                boxSizing: "border-box",
                fontWeight: "100",

                nested: {
                    ".background": {
                        display: "flex",
                        flexDirection: "column"
                    },

                    ".formContent": {
                        flexShrink: "1",
                        flexGrow: "1",
                        position: "relative",
                        padding: "5px",
                        overflowY: "auto",
                    },

                    ".kipBtn": {
                        cursor: "pointer",
                        opacity: "0.7",
                        transition: "all ease-in-out .1s",
                        fontFamily: "Open Sans,Segoe UI Light,Helvetica",
                        fontSize: "1em",

                        nested: {
                            "&:hover:not(.disabled)": {
                                opacity: "1"
                            },

                            "&.disabled": {
                                cursor: "not-allowed",
                                opacity: "0.4"
                            }
                        }
                    },


                    ".kipBtns": {
                        display: "flex",
                        flexDirection: "row-reverse",

                        nested: {
                            ".kipBtn": {
                                padding: "3px 15px",
                                margin: "5px",
                                borderRadius: "3px",

                                nested: {

                                    "&.primary": {
                                        backgroundColor: "<formTheme>",
                                        color: "#FFF"
                                    },

                                    "&.secondary": {
                                        border: "1px solid <formTheme>",
                                        color: "<formTheme>"
                                    },

                                    "&.tertiary": {
                                        border: "1px solid <formSubTheme>",
                                        color: "<formSubTheme>"
                                    }
                                }
                            }
                        }
                    },

                    "button" : {
                        backgroundColor: "transparent",
                        border: "none"
                    }
                }
            }
        }
        
        //#endregion
        //..................
        
        //...................
        //#region DELEGATES
        
        /** handle when the user saves the form */
        protected _onSave: ((data: T) => void)[] = [];
        public registerSaveHandler (f: (data: T) => void) { this._onSave.push(f); }
        protected _notifySave(data: T) {
            if (!this._onSave) { return; }
            for (let d of this._onSave) {
                d(data);
            }
        }

        /** handle when the user chooses to cancel */
        protected _onCancel: ((hasChanges?: boolean) => void)[] = [];
        public registerCancelHandler (f: (hasChanges?: boolean) => void) { this._onCancel.push(f); }
        protected _notifyCancel(hasChanges?: boolean) {
            if (!this._onCancel) { return; }
            for (let d of this._onCancel) {
                d(hasChanges);
            }
        }
        
        //#endregion
        //...................

        //.....................
        //#region PROPERTIES
        
        protected _config: IFormOptions;
        
        protected _elems: {
            base: HTMLElement;
            background: HTMLElement;
            formContainer: HTMLElement;
            coreSection: SectionField<T>;
            saveButton?: HTMLElement;
            cancelButton?: HTMLElement;
        }
        
        protected _hasChanges: boolean = false;
        protected _canSaveTracker: ICanSaveTracker = { hasMissingRequired: false, hasErrors: false }; 
        
        //#endregion
        //.....................

        //..........................................
        //#region THEMING
        
        public setThemeColor(colorId: FormColor, color: string, noReplace?: boolean): void {
            super.setThemeColor(colorId, color, noReplace);
        }
        
        protected _getUniqueThemeName(): string {
            return "Form";
        }
        //#endregion
        //..........................................

        //..........................................
        //#region INITIALIZATION
        
        public constructor(opts: IFormOptions, children?: IFields<T>) {
            super();
            this._config = opts || {};
            this._addClassName("Form");

            this._colors = combineObjects(
                { formBackgroundTheme: "#FFF", formTheme: "#EFC500", formSubTheme: "#444" },
                this._config.colors || {}
            );
            this._applyColors();

            this._createElements(children);
        }

        protected _shouldSkipCreateElements() { return true; }
        
        //#endregion
        //..........................................

        //..........................................
        //#region CREATE ELEMENTS
        
        protected _createElements(elems: IFields<T>): void {
            this._elems = {} as any;

            this._createBase();
            this._createPreForm();
            this._createFormContainer();
            this._createCoreSection(elems);
            this._createPostForm();
        }

        /**
         * _createBase
         * ----------------------------------------------------------------------------
         * generate a base of the form
         */
        protected _createBase(): StandardElement {
            let cls = "kipForm";
            if (this._config.cls) {
                cls += " " + this._config.cls
            }

            this._elems.base = KIP.createElement({
                cls: cls,
                type: "form",
                id: this._config.id
            });

            return this._elems.base
        }

        /**
         * _createCoreElem
         * ----------------------------------------------------------------------------
         * create the core section that will display all of our data 
         * 
         * @param   options     the options that are passed in for the general form
         * @param   elems       Elements associated with this form
         * 
         */
        protected _createCoreSection(elems: IFields<T>): void {

            // create the template that will render the section
            let template: IFormCollapsibleTemplate<T> = {
                label: this._config.label,
                cls: this._config.cls,
                layout: this._config.layout,
                hideTitle: this._config.hideTitle,
                uncollapsible: !this._config.hideTitle
            };

            // create the core section
            this._elems.coreSection = new SectionField<T>(this._id, template, elems);
            this._applyColors(this._elems.coreSection);
            this._addEventHandlers();

            // add the section to the overall form UI
            this._elems.coreSection.draw(this._elems.formContainer);
        }

        /**
         * _createPreForm
         * ----------------------------------------------------------------------------
         * handle generating the aspects of the form that are rendered before the 
         * content. Overridable by child classes
         */
        protected _createPreForm(): StandardElement { 
            this._elems.background = createElement({
                cls: "background",
                parent: this._elems.base
            });
            return this._elems.background;
        }

        /**
         * _createFormContainer
         * ----------------------------------------------------------------------------
         * generate the element that will actually encompass the form. Overridable by
         * child classes
         */
        protected _createFormContainer(): StandardElement { 
            this._elems.formContainer = createElement({
                cls: "formContent",
                parent: this._elems.background
            });
            return this._elems.formContainer;
        }

        /**
         * _createPostForm
         * ----------------------------------------------------------------------------
         * generate any elements that will appear after the core section of the form.
         * Overridable by child classes
         */
        protected _createPostForm(): StandardElement { 
            let btns: IFormButton[] = [
                { 
                    display: "Save", 
                    callback: () => this.trySave(), 
                    cls: "save primary",
                    key: "saveButton"
                },

                { 
                    display: "Cancel", 
                    callback: () => { this.tryCancel() }, 
                    cls: "cancel tertiary"
                }
            ];

            if (this._config.addlButtons) {
                btns.splice(1, 0, ...this._config.addlButtons);
            }

            return this._createButtons(btns);
        }

        /**
         * _createButtons
         * ----------------------------------------------------------------------------
         * generate the buttons that should be visible in this form
         */
        protected _createButtons(btns: IFormButton[]) {
            let children = [];
            for (let b of btns) {
                if (!b) { continue; }
                children.push(this._createButton(b));
            }

            return createElement({ 
                cls: "kipBtns", 
                parent: this._elems.background,
                children: children
            });
        }

        /**
         * _createButton
         * ----------------------------------------------------------------------------
         * generate a specific button with the provided definition
         */
        protected _createButton(btn: IFormButton): StandardElement {
            return createElement({
                key: btn.key || "" as any,
                type: "button",
                cls: "kipBtn " + (btn.cls ? btn.cls : " secondary"),
                content: btn.display,
                eventListeners: { click: (e) => {
                    btn.callback();
                    e.preventDefault();
                }}
            }, this._elems);
        }

        protected _addEventHandlers(): void {

            // add the event listener to the section changing
            formEventHandler.addEventListener(FORM_ELEM_CHANGE,
                {
                    func: (event: FormElemChangeEvent<any>) => this._handleFormChange(event),
                    uniqueId: this._id + "|form"
                }
            );

            // handle when the form becomes savable or non-savable
            formEventHandler.addEventListener(FORM_SAVABLE_CHANGE, {
                func: (event: FormSavableEvent) => this._handleSavabilityChange(event)
            });
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region CHANGE HANDLING
        
        protected _handleFormChange(event: FormElemChangeEvent<any>) {

            // listen only at the global level to this event
            let key: string = event.context.key;
            if (key !== this._id) { return; }

            // call into the child handling once it's determined we
            // care about this particular event
            this._onFormChange(event);
        }

        protected _onFormChange(event: FormElemChangeEvent<any>): void {
            if (!this._isFormChangeForMe(event)) { return; }
            this._hasChanges = true;
        }

        protected _isFormChangeForMe(event: FormElemChangeEvent<any>): boolean {
            let key: string = event.context.key;
            if (key !== this._id) { return false; }
            return true;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region SAVABILITY CHANGE
        
        protected _handleSavabilityChange(event: FormSavableEvent): void {
            if (!this._elems.saveButton) { return; }
                    
            let canSave = this.canSave();

            if (!canSave) { this._disableSave(); } 
            else { this._enableSave(); }
            
        }

        protected _disableSave(): void {
            this._elems.saveButton.title = this._getCannotSaveMessage();
            this._elems.saveButton.setAttribute("disabled", "true");
            addClass(this._elems.saveButton, "disabled");
        }

        protected _enableSave(): void {
            this._elems.saveButton.title = "";
            this._elems.saveButton.removeAttribute("disabled");
            removeClass(this._elems.saveButton, "disabled");
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region HANDLE SAVING
        
        /**
         * getData
         * ----------------------------------------------------------------------------
         * ensure that we are retrieving the data within the form without actually
         * running the save handlers
         */
        public async getData(): Promise<T> {
            return this._elems.coreSection.save(true);
        }

        /**
         * _save
         * ---------------------------------------------------------------------------
         * Saves data in the form
         * 
         * @returns A promise that will retrieve the data contained in the form
         */
        protected async _save(): Promise<T> {
            let data: T = await this._elems.coreSection.save();

            // Alert any listeners of this particular form that 
            // the data has been updated
            this._notifySave(data);
            this._hasChanges = false;
            return data;
        }

        /**
         * trySave
         * ---------------------------------------------------------------------------
         * Attempt to save the form
         */
        public async trySave(): Promise<T> {

            // handle if we can't save
            if (!this.canSave()) {
                this._showCannotSaveMessage();
                return null;
            
            // otherwise, retrieve the save data from the
            // core element
            } else {
                return await this._save();
            }
        }

        /**
         * _canSave
         * ---------------------------------------------------------------------------
         * Check with our elements that we are able to save
         */
        public canSave(): boolean {
            this._canSaveTracker = this._elems.coreSection.canSave();
            if (this._canSaveTracker.hasErrors) { return false; }
            if (this._canSaveTracker.hasMissingRequired) { return false; }
            return true;
        }

        /**
         * _showCannotSaveMessage
         * ----------------------------------------------------------------------------
         * Show popup indicating why we couldn't save this form
         */
        protected _showCannotSaveMessage(): void {
            let msg: string = this._getCannotSaveMessage();
            if (!msg) { return; }

            let popup: ErrorPopup = new ErrorPopup(msg, "Couldn't Save");
            popup.setThemeColor("popupTheme", this._colors.formTheme);
            popup.draw(document.body);
        }

        /**
         * _getCannotSaveMessage
         * ----------------------------------------------------------------------------
         * Determine what message to show as to why the form cannot be saved
         */
        protected _getCannotSaveMessage(): string {
            let msg: string = "";

            if (this._canSaveTracker.hasErrors && this._canSaveTracker.hasMissingRequired) {
                msg = "This form has missing data and errors; correct errors and fill in all required fields before saving."
            } else if (this._canSaveTracker.hasErrors) {
                msg = "There are some errors in your form; correct them before saving.";
            }  else if (this._canSaveTracker.hasMissingRequired) {
                msg = "There are some fields with missing data; fill them in before saving.";
            }

            return msg;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region HANDLE CANCELING
        
        /**
         * _cancelConfirmation
         * ----------------------------------------------------------------------------
         * Handle informing the user that they have unsaved changes before cancelling
         */
        protected _cancelConfirmation(): void {
            if (this._hasChanges) {
                let popup: YesNoPopup = new YesNoPopup(
                    "You have unsaved changes. Are you sure you want to cancel?",
                    (response: YesNoEnum) => {
                        if (response === YesNoEnum.YES) {
                            this._cancel();
                        }
                    }
                );
                popup.setThemeColor("popupTheme", this._colors.formTheme);
                popup.draw(document.body);
            } else {
                this._cancel();
            }
        }

        /**
         * _cancel
         * ----------------------------------------------------------------------------
         * Cancel the form and any changes within it\
         */
        protected _cancel(): void {
            this.clear();
            this._notifyCancel(this._hasChanges);
            this._hasChanges = false;
        }

        /**
         * tryCancel
         * ----------------------------------------------------------------------------
         * Public call to attempt to cancel all data within a form; prompts the user to
         * verify cancelling if there are any unsaved elements unless otherwise 
         * specified.
         * 
         * @param   ignoreUnsavedChanges    If true, doesn't prompt the user to confirm
         *                                  that unsaved aspects won't be saved
         * 
         * @returns True if the form was successfully canceled
         */
        public tryCancel(ignoreUnsavedChanges?: boolean): boolean {
            if (!this._hasChanges || ignoreUnsavedChanges) {
                this._cancel();
                return true;
            } else {
                // show the popup
                this._cancelConfirmation();

                // tell the caller that they should wait for the cancel listener
                return false;
            }
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region CLEARING AND UPDATING DATA
        
        /**
         * clear
         * ----------------------------------------------------------------------------
         * clears all data out of the form
         */
        public clear(): void {
            this._elems.coreSection.clear();
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * update the data in the form to match a particular data set
         * 
         * @param   model           The data to update the form with
         * @param   allowEvents     If true, also fires change events as a result of 
         *                          the update
         */
        public update(model: T, allowEvents?: boolean): void {
            this._elems.coreSection.update(model, allowEvents);
            this._hasChanges = false;
        }
        
        //#endregion
        //..........................................

        //........................
        //#region TRACK CHANGES

        /* TODO: actually implement change control
        */
       public undo(): void {
            // TODO
        }

        public redo(): void {

        }

        protected _trackChanges(): void {
            // TODO
        }
        //#endregion
        //........................

        //..........................................
        //#region USABILITY
        
         /**
         * focus
         * ----------------------------------------------------------------------------
         * Gives focus to the first element that can take focus
         */
        public focus(): void {
            this._elems.coreSection.focus();
        }
        
        //#endregion
        //..........................................

        //.................................
        //#region CHANGE THE FORM DISPLAY

        // TODO: Allow changing of the form after it's been created

         /**
          * addFormElement
          * ----------------------------------------------------------------------------
          * Adds a form element to our form after it's been initialized
          */
         public addFormElement<K extends keyof T>(key: K, formElem: Field<T[K]>): boolean {
            return this._elems.coreSection.addChildElement(key, formElem);
        }

        public getField(id: string): Field<any> {
            return this._elems.coreSection.getField(id);
        }

        //#endregion
        //.................................
    }

    //..........................................
    //#region TYPES AND INTERFACES
    
    export interface IFormOptions extends IFormDisplay {
        /** identifier for the form */
        id?: string;

        /** the type of form that is being rendered */
        style?: FormStyleOptions

        /** true if we should skip the style rendering */
        noStandardStyles?: boolean;

        /** colors to use for this form */
        colors?: IPartial<IDictionary<string, FormColor>>;

        /** any additional buttons that should be added to the form */
        addlButtons?: IFormButton[];

        /** true if we should allow canceling the form even if there
         * are unsaved changes */
        ignoreChanges?: boolean;

        /** @deprecated: use style instead */
        popupForm?: boolean;
    }
    
    //#endregion
    //..........................................
}