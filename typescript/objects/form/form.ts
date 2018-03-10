///<reference path="../drawable.ts" />
///<reference path="formConstants.ts" />

namespace KIP.Forms {

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
    /** 
     * create a form with a data structure of F 
     * @version 1.0
     */
    export class Form<F> extends Drawable {
        //#region PROPERTIES

        /** handle standard styles for the form */
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipForm": {
                borderRadius: "2px",
                backgroundColor: "#FFF",
                width: "60%",
                marginLeft: "20%",
                padding: "5px",
                fontFamily: "OpenSansLight,Segoe UI,Helvetica",
                fontSize: "1.2em",
                position: "inherit",
                boxSizing: "border-box"
            },

            ".kipForm.hidden": {
                display: "none"
            },

            ".kipForm overlay": {
                position: "absolute",
                width: "100%",
                height: "100%",
                top: "0",
                left: "0",
                backgroundColor: "rgba(0,0,0,.6)"
            },

            ".kipForm .formContent": {
                marginRight: "10px"
            },

            ".kipForm .kipBtns": {
                display: "flex",
                justifyContent: "flex-end"
            },

            ".kipForm .kipBtn": {
                padding: "5px 20px",
                marginRight: "10px",
                cursor: "pointer",
                borderRadius: "2px",
                boxShadow: "1px 1px 5px 2px rgba(0,0,0,.1)",
                fontSize: "1.2em",
                boxSizing: "border-box",
                textAlign: "center",
                transition: "all ease-in-out .1s"
            },

            ".kipForm .kipBtn:hover, .kipForm .kipBtn.selected": {
                transform: "scale(1.05)"
            },

            ".kipForm .save.kipBtn": {
                backgroundColor: "<0>",
                color: "#FFF",
                width: "20%"
            },

            ".kipForm .close.kipBtn": {
                borderRadius: "10px",
                border: "2px solid #999",
                width: "15px",
                height: "15px",
                backgroundColor: "#999",
                color: "#FFF",
                padding: "0",
                fontSize: "0.6em",
                position: "absolute",
                top: "-7px",
                left: "calc(100% - 7px)",
                boxSizing: "content-box",
                textAlign: "center"
            },

            ".kipForm .cancel.kipBtn": {
                backgroundColor: "#999",
                color: "#FFF"
            }
        };

        /** get the appropriate data out of this form */
        public get data(): F {
            return this._coreFormElem.save();
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
        protected _coreFormElem: SectionElement<F>;

        /** any listeners that should be used upon the form saving */
        protected _saveListeners: Collection<IFormSaveFunction>;

        /** any listeners that should be used upon the form canceling */
        protected _cancelListeners: Collection<IFormCancelFunction>;

        /** any additional buttons that should show in the form */
        protected _additionalButtons: IFormButton[];

        /** keep track of whether there are changes in this form */
        protected _hasChanges: boolean;

        //#endregion

        //#region CONSTRUCTOR

        /**...........................................................................
         * Form
         * ...........................................................................
         * Create the Form 
         * 
         * @param   id          Unique ID for the form
         * @param   options     Specific way this form should be created
         * @param   elems       Form elements that should be shown for this form
         * ...........................................................................
         */
        constructor(id: string, options: IFormOptions, elems?: IFormElements<F>) {
            super();
            this._addClassName("Form");

            this._id = id;
            this._showAsPopup = options.popupForm;
            this._noStandardStyles = options.noStandardStyles;
            this._hidden = true;
            this._additionalButtons = options.addlButtons || [];
            this._hasChanges = false;

            this._colors = options.colors || ["#4A5", "#284"];
            this._applyColors();

            // handle listeners
            this._saveListeners = new Collection<IFormSaveFunction>();
            this._cancelListeners = new Collection<IFormCancelFunction>();

            this._createElements();
            this._createCoreElem(options, elems);
            this._addWindowEventListeners();
        }

        //#endregion

        //#region CREATE ELEMENTS

        /**...........................................................................
         * _createElements
         * ...........................................................................
         * Create the elements used by the form 
         * ...........................................................................
         */
        protected _createElements(): void {
            this._elems = {
                base: createSimpleElement(this._id, "kipForm hidden"),
                background: createSimpleElement("", "background"),
                formContent: createSimpleElement("", "formContent")
            };
            this._createPopupElements();
            this._elems.background.appendChild(this._elems.formContent);
            this._createButtons();
            if (!this._noStandardStyles) { this._createStyles(); }
        }

        /**...........................................................................
         * _createPopupElements
         * ...........................................................................
         * create the elements needed for the popup version of the form 
         * ...........................................................................
         */
        protected _createPopupElements(): void {

            // If we aren't showing as a popup, add the BG directly to the base
            if (!this._showAsPopup) {
                this._elems.base.appendChild(this._elems.background);
                return;
            }

            // Create the elements that are only used for the popup version of the form
            addClass(this._elems.base, "popup");
            this._elems.overlay = createSimpleElement("", "overlay", "", null, null, this._elems.base);
            this._elems.overlay.appendChild(this._elems.background);
            this._elems.closeButton = createSimpleElement("", "close kipBtn", "", null, null, this._elems.background);
        }

        /**...........................................................................
         * _createButtons
         * ...........................................................................
         * create the appropriate buttons for the form 
         * ...........................................................................
         */
        protected _createButtons(): void {
            this._elems.buttons = createSimpleElement("", "kipBtns", "", null, null, this._elems.background);

            this._elems.saveButton = createSimpleElement("", "kipBtn save", "Save", null, null, this._elems.buttons);
            this._elems.saveButton.addEventListener("click", () => {
                this.save();
                this.hide();
            });

            this._elems.cancelButton = createSimpleElement("", "kipBtn cancel", "Cancel", null, null, this._elems.buttons);
            this._elems.cancelButton.addEventListener("click", () => {
                window.setTimeout(() => {
                    this._cancelConfirmation();
                }, 10);
            });

            // if we have additional buttons add them here
            if (!this._additionalButtons) { return; }
            let idx: number = 0;
            for (idx; idx < this._additionalButtons.length; idx += 1) {
                let btnTemplate: IFormButton = this._additionalButtons[idx];
                let btn: HTMLElement = createSimpleElement("", "kipBtn " + btnTemplate.cls, btnTemplate.display, null, null, this._elems.buttons);
                btn.addEventListener("click", () => {
                    btnTemplate.callback();
                });
            }
        }

        /**...........................................................................
         * _createCoreElem
         * ...........................................................................
         * create the core section that will display all of our data 
         * 
         * @param   options     the options that are passed in for the general form
         * @param   elems       Elements associated with this form
         * ...........................................................................
         */
        protected _createCoreElem(options: IFormOptions, elems: IFormElements<F>): void {

            // create the template that will render the section
            let template: IFormElemTemplate<F> = {
                type: FormElementTypeEnum.SECTION,
                label: options.label,
                cls: options.cls,
                layout: options.layout,
            };

            // create the core section
            this._coreFormElem = new SectionElement<F>(this._id, template, elems);
            this._applyColors(this._coreFormElem);
            this._coreFormElem.expand();

            // add the event listener to the section changing
            Events.addEventListener(FORM_ELEM_CHANGE,
                {
                    func: (event: Events.Event) => {
                        let key: string = event.context.key;
                        if (key !== this._id) { return; }
                        this._hasChanges = true;
                    },
                    uniqueId: this._id + "|form"
                }
            );

            // add the section to the overall form UI
            this._coreFormElem.render(this._elems.formContent);
        }
        //#endregion

        //#region DATA MANIPULATIONS

        /**...........................................................................
         * save
         * ...........................................................................
         * Saves data in the form
         * 
         * @returns The data contained in the form
         * ...........................................................................
         */
        public save(): F {
            let data: F = this._coreFormElem.save();

            // Alert any listeners of this particular form that 
            this._notifySaveListeners(data);
            this._hasChanges = false;
            return data;
        }

        /**...........................................................................
         * _notifySaveListeners
         * ...........................................................................
         * lets all listeners know that the form has saved
         *
         * @param  data    The form data that was just saved
         * ...........................................................................
         */
        protected _notifySaveListeners(data: F): void {
            this._saveListeners.map((listener: IFormSaveFunction) => {
                if (!listener) { return; }
                listener(data);
            });
        }

        /**...........................................................................
         * _cancelConfirmation
         * ...........................................................................
         * Handle informing the user that they have unsaved changes before cancelling
         * ...........................................................................
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
                popup.setThemeColor(0, this._colors[0]);
                popup.draw(document.body);
            } else {
                this._cancel();
            }
        }

        /**...........................................................................
         * _cancel
         * ...........................................................................
         * Cancel the form and any changes within it
         * ...........................................................................
         */
        protected _cancel(): void {
            this.clear();
            this._notifyCancelListeners(this._hasChanges);
            this._hasChanges = false;
            this.hide();
        }

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

        /**...........................................................................
         * _notifyCancelListeners
         * ...........................................................................
         * lets all listeners know that the form has been canceled
         * 
         * @param   hasChanges  True if the form has been changed since initialization
         * ...........................................................................
         */
        protected _notifyCancelListeners(hasChanges: boolean): void {
            this._cancelListeners.map((listener: IFormCancelFunction) => {
                if (!listener) { return; }
                listener(hasChanges);
            });
        }

        /**...........................................................................
         * clear
         * ...........................................................................
         * clears all data out of the form
         * ...........................................................................
         */
        public clear(): void {
            this._coreFormElem.clear();
        }

        /**...........................................................................
         * update
         * ...........................................................................
         * update the data in the form to match a particular data set
         * 
         * @param   data    The data to update the form with
         * ...........................................................................
         */
        public update(data: F): void {
            this._coreFormElem.update(data);
            this._hasChanges = false;
        }

        //#endregion

        //#region TRACK CHANGES
        public undo(): void {
            // TODO
        }

        public redo(): void {

        }

        protected _trackChanges(): void {
            // TODO
        }
        //#endregion

        //#region HIDE OR SHOW THE FORM

        /**...........................................................................
         * show
         * ...........................................................................
         * show the form on the appropriate parent
         * ...........................................................................
         */
        public show(): void {

            if (!this._hidden) { return; }
            KIP.removeClass(this._elems.base, "hidden");
        }

        /**...........................................................................
         * hide
         * ...........................................................................
         * hide the form
         * ...........................................................................
         */
        public hide(): void {
            if (this._hidden) { return; }
            KIP.addClass(this._elems.base, "hidden");
        }

        /**...........................................................................
         * draw
         * ...........................................................................
         * Draw the form element on whatever parent is specified 
         * (defaults to document.body)
         * 
         * @param   parent  The element to add to
         * @param   noShow  If true, doesn't show the form as a oart of this draw 
         * ...........................................................................
         */
        public draw(parent: HTMLElement, noShow?: boolean): void {
            super.draw(parent);
            if (!this._elems.base.parentNode) {
                document.body.appendChild(this._elems.base);
            }
            if (!noShow) { this.show(); }
        }
        //#endregion

        //#region Handle Listeners

        /**...........................................................................
         * registerSaveListener
         * ...........................................................................
         * register any listener that wants to hear about this form saving
         * 
         * @param   listener    The function to call when the form is saved
         * 
         * @returns The key with which the event is registered
         * ...........................................................................
         */
        public registerSaveListener(listener: IFormSaveFunction): string {
            let key: string = this._saveListeners.length.toString();
            this._saveListeners.addElement(key, listener);
            return key;
        }

        /**...........................................................................
         * registerCancelListener
         * ...........................................................................
         * registers any listener that wants to hear about this form canceling
         * 
         * @param   listener       The function to call when the form is cancelled
         * 
         * @returns The key with which the event is registered
         * ...........................................................................
         */
        public registerCancelListener(listener: IFormCancelFunction): string {
            let key: string = this._cancelListeners.length.toString();
            this._cancelListeners.addElement(key, listener);
            return key;
        }

        protected _addWindowEventListeners(): void {
            window.addEventListener("beforeunload", (e: Event) => {
                if (this._hasChanges) {
                    let msg = "You have unsaved changes; are you sure you want to leave this page?";
                    e.returnValue = msg as any;
                    return msg;
                }
            });
        }
        //#endregion

        //#region CHANGE THE FORM DISPLAY
        protected addFormElement<K extends keyof F>(key: K, formElem: FormElement<F[K]>): boolean {
            return this._coreFormElem.addChildElement(key, formElem);
        }
        //#endregion
    }

    //#region EVENT HANDLER FOR FORMS

    // create a particular event for all form change events
    export const FORM_ELEM_CHANGE = "formelemchange";
    KIP.Events.createEvent({
        name: "Form Element Changed",
        key: FORM_ELEM_CHANGE
    });

    //#endregion

}