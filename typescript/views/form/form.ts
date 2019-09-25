///<reference path="../drawable.ts" />
///<reference path="formConstants.ts" />
namespace KIP.Forms {

    export type FormColor = "formTheme" | "formSubTheme";

    export interface IFormElems extends IDrawableElements {
        base: HTMLElement;
        overlay?: HTMLElement;
        background?: HTMLElement;
        formContent?: HTMLElement;
        buttons?: HTMLElement;
        saveButton?: HTMLElement;
        cancelButton?: HTMLElement;
        closeButton?: HTMLElement;
    }

    /**----------------------------------------------------------------------------
     * @class   Form
     * ----------------------------------------------------------------------------
     * create a form with a data structure of F 
     * @author  Kip Price
     * @version 3.5.0
     * ----------------------------------------------------------------------------
     */
    export class Form<F> extends Drawable {

        //.....................
        //#region PROPERTIES

        /** get the appropriate data out of this form */
        public async getData(): Promise<F> {
            return await this._coreFormElem.save(true);
        }

        /** internal tracking for whether the form is showing or not */
        protected _hidden: boolean;

        /** true if this is a popup form rather than an inline form */
        protected _showAsPopup: boolean;

        /** true if we should skip our standard styles */
        protected _noStandardStyles: boolean;

        /** unique ID for the form */
        protected _id: string;

        /** keep track pf the elements in this form */
        protected _elems: IFormElems;

        /** the drawable element containing all other form elements */
        protected _coreFormElem: SectionField<F>;

        /** any listeners that should be used upon the form saving */
        protected _saveListeners: Collection<IFormSaveFunction>;

        /** any listeners that should be used upon the form canceling */
        protected _cancelListeners: Collection<IFormCancelFunction>;

        /** any additional buttons that should show in the form */
        protected _additionalButtons: IFormButton[];

        /** keep track of whether there are changes in this form */
        protected _hasChanges: boolean;

        /** if true, will not prompt the user to save when unloading the page, 
         * regardless of whether there are changes */
        protected _ignoreChanges: boolean;

        /** keep track of whether we can save this form */
        protected _canSaveTracker: ICanSaveTracker;

        //#endregion
        //.....................

        //..................
        //#region STYLES

        /** handle standard styles for the form */
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipForm": {
                margin: "0",
                padding: "0",
                left: "0",
                top: "0",
                width: "100%",
                height: "100%",
                fontFamily: "Open Sans,Segoe UI Light,Helvetica",
                fontSize: "1em",
                position: "fixed",
                boxSizing: "border-box",
                fontWeight: "100",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                

                nested: {
                    "&.hidden": {
                        display: "none"
                    },

                    ".formOverlay": {
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: "0",
                        left: "0",
                        backgroundColor: "rgba(0,0,0,.6)",

                        nested: {
                            ".background": {
                                marginTop: "2%",
                                boxShadow: "1px 1px 8px 3px rgba(0,0,0,.2)",
                                overflow: "hidden",

                                nested: {
                                    ".formContent": {
                                        overflowY: "auto",
                                    }
                                }
                            }
                        }
                    },

                    ".background": {
                        borderRadius: "5px",
                        backgroundColor: "#FFF",
                        minWidth: "60%",
                        maxHeight: "90%",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    },
        
                    ".formContent": {
                        
                        position: "relative",
                        padding: "5px",
                        paddingRight: "15px",
                        flexGrow: "1"
                    },
        
                    ".kipBtns": {
                        display: "flex",
                        justifyContent: "flex-start",
                        padding: "3px 5px",
                        flexShrink: "0",
                        zIndex: "5",
                        textTransform: "uppercase",
                        flexDirection: "row-reverse",
                        alignItems: "center",

                        nested: {
                            ".standardBtns":{
                                flexGrow: "1",
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "row-reverse"
                            }
                        }
                    },
        
                    "&.popup .kipBtns": {
                        boxShadow: "0px -2px 2px 1px rgba(0,0,0,.08)",
                        backgroundColor: "<formSubTheme>",

                        nested: {
                            ".kipBtn": {
                                backgroundColor: "transparent",
                                color: "#FFF",
                                boxShadow: "none",
                                opacity: "0.7"
                            }
                        }
                    },   

                    ".titleBar": {
                        display: "flex",
                        backgroundColor: "<formSubTheme>",
                        color: "#FFF",
                        flexShrink: "0",
                        alignItems: "center",
                        boxShadow: "0px 2px 2px 1px rgba(0,0,0,.08)",

                        nested: {
                            ".formTitle": {
                                fontSize: "1.3em",
                                padding: "5px",
                                marginLeft: "20px",
                                flexGrow: "1"
                            }
                        }
                    },
        
                    ".kipBtn": {
                        padding: "5px 20px",
                        marginRight: "10px",
                        cursor: "pointer",
                        borderRadius: "30px",
                        boxShadow: "1px 1px 5px 2px rgba(0,0,0,.1)",
                        fontSize: "1.2em",
                        boxSizing: "border-box",
                        textAlign: "center",
                        transition: "all ease-in-out .1s",

                        nested: {
                            "&:not(.disabled):hover, &.selected": {
                                transform: "scale(1.05)"
                            },

                            "&.save, &.cancel": {
                                color: "#FFF",

                                nested: {
                                    "&:hover": {
                                        opacity: "1",
                                        transform: "scale(1.1)"
                                    },

                                    "&.disabled": {
                                        backgroundColor: "#888",
                                        color: "#FFF",
                                        opacity: "0.5",
                                        cursor: "unset"
                                    }
                                }
                            },

                            "&.save": {
                                backgroundColor: "<formTheme>",
                            },

                            "&.cancel": {
                                fontSize: "0.9em",
                                backgroundColor: "#888"
                            },

                            "&.close": {
                                color: "#FFF",
                                padding: "0",
                                boxSizing: "content-box",
                                textAlign: "center",
                                fontSize: "20px",
                                boxShadow: "none",
                                cursor: "pointer",
                                zIndex: "1",
                                opacity: "0.6",
                
                                nested: {
                                    "&:hover": {
                                        opacity: "1",
                                        transform: "scale(1.1)"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        public setThemeColor(colorId: FormColor, color: string, noReplace?: boolean): void {
            super.setThemeColor(colorId, color, noReplace);
        }

        protected _getUniqueThemeName(): string {
            return "Form";
        }
        //#endregion
        //..................

        //.....................
        //#region CONSTRUCTOR

        /**
         * Form
         * ----------------------------------------------------------------------------
         * Create the Form 
         * 
         * @param   id          Unique ID for the form
         * @param   options     Specific way this form should be created
         * @param   elems       Form elements that should be shown for this form
         */
        constructor(id: string, options: IFormOptions, elems?: IFields<F>) {
            super();
            this._addClassName("Form");

            this._id = id;
            this._showAsPopup = options.popupForm;
            this._noStandardStyles = options.noStandardStyles;
            this._hidden = true;
            this._additionalButtons = options.addlButtons || [];
            this._hasChanges = false;
            this._ignoreChanges = options.ignoreChanges;
            this._canSaveTracker = { hasMissingRequired: false, hasErrors: false };

            this._colors = options.colors || {formTheme: "#EFC500", formSubTheme: "#444"};
            this._applyColors();

            // handle listeners
            this._saveListeners = new Collection<IFormSaveFunction>();
            this._cancelListeners = new Collection<IFormCancelFunction>();

            this._createElements(options);
            this._createCoreElem(options, elems);
            this._addWindowEventListeners();
        }

        //#endregion
        //.....................

        //........................
        //#region CREATE ELEMENTS

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * Create the elements used by the form 
         */
        protected _createElements(options: IFormOptions): void {
            this._elems = {
                base: createSimpleElement(this._id, "kipForm hidden"),
                background: createSimpleElement("", "background"),
                formContent: createSimpleElement("", "formContent")
            };

            this._createPopupElements(options);
            this._elems.background.appendChild(this._elems.formContent);
            this._createButtons();
        }

        /**
         * _createPopupElements
         * ----------------------------------------------------------------------------
         * create the elements needed for the popup version of the form 
         */
        protected _createPopupElements(options: IFormOptions): void {

            // If we aren't showing as a popup, add the BG directly to the base
            if (!this._showAsPopup) {
                this._elems.base.appendChild(this._elems.background);
                return;
            }

            // Create the elements that are only used for the popup version of the form
            addClass(this._elems.base, "popup");

            this._elems.overlay = createElement({ 
                cls: "formOverlay", 
                parent: this._elems.base
            });

            this._elems.base.appendChild(this._elems.background);

            this._elems.closeButton = createElement({
                cls: "close kipBtn", 
                content: "&#x2715;",
                eventListeners: {
                    click: () => { KIP.wait(10).then( () => this._cancelConfirmation() ) }
                }
            });

            KIP.createElement({
                cls: "titleBar",
                children: [
                    { cls: "formTitle", content: options.hideTitle ? "" : options.label },
                    this._elems.closeButton
                ],
                parent: this._elems.background
            })

            options.hideTitle = true;

        }

        /**
         * _createButtons
         * ----------------------------------------------------------------------------
         * create the appropriate buttons for the form 
         * 
         */
        protected _createButtons(): void {
            this._elems.buttons = createSimpleElement("", "kipBtns", "", null, null, this._elems.background);

            let standardBtnWrapper = KIP.createElement({
                cls: "standardBtns",
                parent: this._elems.buttons
            });
            this._elems.saveButton = createSimpleElement("", "kipBtn save", "Save", null, null, standardBtnWrapper);
            this._elems.saveButton.addEventListener("click", () => {
                this.trySave();
                this.hide();
            });

            this._elems.cancelButton = createSimpleElement("", "kipBtn cancel", "Cancel", null, null, standardBtnWrapper);
            this._elems.cancelButton.addEventListener("click", () => {
                window.setTimeout(() => {
                    this._cancelConfirmation();
                }, 10);
            });

            // if we have additional buttons add them here
            let customBtnWrapper = KIP.createElement({
                cls: "customBtns",
                parent: this._elems.buttons
            });

            if (!this._additionalButtons) { return; }
            let idx: number = 0;
            for (idx; idx < this._additionalButtons.length; idx += 1) {
                let btnTemplate: IFormButton = this._additionalButtons[idx];
                let btn: HTMLElement = createSimpleElement("", "kipBtn " + btnTemplate.cls, btnTemplate.display, null, null, customBtnWrapper);
                btn.addEventListener("click", () => {
                    btnTemplate.callback();
                });
            }
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
        protected _createCoreElem(options: IFormOptions, elems: IFields<F>): void {

            // create the template that will render the section
            let template: IFormCollapsibleTemplate<F> = {
                label: options.label,
                cls: options.cls,
                layout: options.layout,
                hideTitle: options.hideTitle,
                uncollapsible: !options.hideTitle
            };

            // create the core section
            this._coreFormElem = new SectionField<F>(this._id, template, elems);
            this._applyColors(this._coreFormElem);

            // add the event listener to the section changing
            formEventHandler.addEventListener(FORM_ELEM_CHANGE,
                {
                    func: (event: FormElemChangeEvent<any>) => {
                        let key: string = event.context.key;
                        if (key !== this._id) { return; }
                        this._hasChanges = true;
                    },
                    uniqueId: this._id + "|form"
                }
            );

            // add listener for savable changes
            this._addSaveButtonUpdater();

            // add the section to the overall form UI
            this._coreFormElem.draw(this._elems.formContent);
        }

        protected _addSaveButtonUpdater(): void {
            formEventHandler.addEventListener(FORM_SAVABLE_CHANGE, {
                func: (event: FormSavableEvent) => {
                    let canSave = this.canSave();
                    if (!canSave) {
                        this._elems.saveButton.title = this._getCannotSaveMessage();
                        addClass(this._elems.saveButton, "disabled");
                    } else {
                        this._elems.saveButton.title = "";
                        removeClass(this._elems.saveButton, "disabled");
                    }
                }
            })
        }
        //#endregion
        //........................

        //..............................
        //#region DATA MANIPULATIONS

        /**
         * _save
         * ---------------------------------------------------------------------------
         * Saves data in the form
         * 
         * @returns The data contained in the form
         */
        protected async _save(): Promise<F> {
            let data: F = await this._coreFormElem.save();

            // Alert any listeners of this particular form that 
            this._notifySaveListeners(data);
            this._hasChanges = false;
            return data;
        }

        /**
         * trySave
         * ---------------------------------------------------------------------------
         * Attempt to save the form
         */
        public async trySave(): Promise<F> {
            if (hasClass(this._elems.saveButton, "disabled")) { return null; }
            if (!this.canSave()) {
                this._showCannotSaveMessage();
                return null;
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
            this._canSaveTracker = this._coreFormElem.canSave();

            return !(this._canSaveTracker.hasErrors || this._canSaveTracker.hasMissingRequired);
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

        /**
         * _notifySaveListeners
         * ----------------------------------------------------------------------------
         * lets all listeners know that the form has saved
         *
         * @param  data    The form data that was just saved
         */
        protected _notifySaveListeners(data: F): void {
            this._saveListeners.map((listener: IFormSaveFunction) => {
                if (!listener) { return; }
                listener(data);
            });
        }

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
            this._notifyCancelListeners(this._hasChanges);
            this._hasChanges = false;
            this.hide();
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

        /**
         * _notifyCancelListeners
         * ----------------------------------------------------------------------------
         * lets all listeners know that the form has been canceled
         * 
         * @param   hasChanges  True if the form has been changed since initialization
         */
        protected _notifyCancelListeners(hasChanges: boolean): void {
            this._cancelListeners.map((listener: IFormCancelFunction) => {
                if (!listener) { return; }
                listener(hasChanges);
            });
        }

        /**
         * clear
         * ----------------------------------------------------------------------------
         * clears all data out of the form
         */
        public clear(): void {
            this._coreFormElem.clear();
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
        public update(model: F, allowEvents?: boolean): void {
            this._coreFormElem.update(model, allowEvents);
            this._hasChanges = false;
        }

        //#endregion
        //..............................

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

        //.................................
        //#region HIDE OR SHOW THE FORM

        /**
         * show
         * ----------------------------------------------------------------------------
         * show the form on the appropriate parent
         */
        public show(): void {
            if (!this._hidden) { return; }
            KIP.removeClass(this._elems.base, "hidden");
            this._hidden = false;
        }

        /**
         * hide
         * ----------------------------------------------------------------------------
         * hide the form
         */
        public hide(): void {
            if (this._hidden) { return; }
            KIP.addClass(this._elems.base, "hidden");
            this._hidden = true;
        }

        /**
         * draw
         * ----------------------------------------------------------------------------
         * Draw the form element on whatever parent is specified 
         * (defaults to document.body)
         * 
         * @param   parent  The element to add to
         * @param   noShow  If true, doesn't show the form as a oart of this draw 
         * 
         */
        public draw(parent: HTMLElement, noShow?: boolean): void {
            super.draw(parent);
            if (!this._elems.base.parentNode) {
                document.body.appendChild(this._elems.base);
            }
            if (!noShow) { this.show(); }
        }

        /**
         * focus
         * ----------------------------------------------------------------------------
         * Gives focus to the first element that can take focus
         */
        public focus(): void {
            this._coreFormElem.focus();
        }
        //#endregion
        //.................................

        //...........................
        //#region HANDLE LISTENERS

        /**
         * registerSaveListener
         * ----------------------------------------------------------------------------
         * register any listener that wants to hear about this form saving
         * 
         * @param   listener    The function to call when the form is saved
         * 
         * @returns The key with which the event is registered
         */
        public registerSaveListener(listener: IFormSaveFunction): string {
            let key: string = this._saveListeners.length.toString();
            this._saveListeners.add(key, listener);
            return key;
        }

        /**
         * registerCancelListener
         * ----------------------------------------------------------------------------
         * registers any listener that wants to hear about this form canceling
         * 
         * @param   listener       The function to call when the form is cancelled
         * 
         * @returns The key with which the event is registered
         */
        public registerCancelListener(listener: IFormCancelFunction): string {
            let key: string = this._cancelListeners.length.toString();
            this._cancelListeners.add(key, listener);
            return key;
        }

        /**
         * _addWindowEventListeners
         * ----------------------------------------------------------------------------
         * listen to unload events to be able to prompt the user to save
         */
        protected _addWindowEventListeners(): void {
            window.addEventListener("beforeunload", (e: Event) => {
                if (this._hasChanges && !this._ignoreChanges) {
                    let msg = "You have unsaved changes; are you sure you want to leave this page?";
                    e.returnValue = msg as any;
                    return msg;
                }
            });
        }
        //#endregion
        //..................

        //.................................
        //#region CHANGE THE FORM DISPLAY

        // TODO: Allow changing of the form after it's been created

         /**
          * addFormElement
          * ----------------------------------------------------------------------------
          * Adds a form element to our form after it's been initialized
          */
        public addFormElement<K extends keyof F>(key: K, formElem: Field<F[K]>): boolean {
            return this._coreFormElem.addChildElement(key, formElem);
        }

        public getField(id: string): Field<any> {
            return this._coreFormElem.getField(id);
        }

        //#endregion
        //.................................
    }
}