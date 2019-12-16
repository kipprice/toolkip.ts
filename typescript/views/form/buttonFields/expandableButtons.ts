/// <reference path="./_toggleButtonField.ts" />
/// <reference path="./multiSelectButtonField.ts" />

namespace KIP.Forms {
    export interface IExpandableElems extends IToggleButtonElems{
        base: HTMLElement;
        opts: HTMLElement;
        input: HTMLInputElement;
        addBtn: HTMLElement;
    }

    /**----------------------------------------------------------------------------
     * @class   ExpandableButtonField
     * ----------------------------------------------------------------------------
     * Add standard form element to create new buttons inline
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class ExpandableButtonField<M, T extends IFormMultiSelectButtonTemplate<M> = IFormMultiSelectButtonTemplate<M>> extends MultiSelectButtonField<M, T> {

        //.......................................
        //#region STATIC COLLECTION OF OPTIONS
        
        protected static _options: IToggleBtnOption<any>[];
        public static set options(opts: IToggleBtnOption<any>[]) {
            if ((this as any)._options) { return; }
            (this as any)._options = opts;

            for (let instance of this._instances) { 
                instance._createAvailableOptions();
            }
        }

        protected static _instances: ExpandableButtonField<any>[] = [];

        //#endregion
        //.......................................

        //.....................
        //#region PROPERTIES

        protected get _defaultCls(): string { return "toggleBtns expandable"; }
        protected _elems: IExpandableElems;
        protected abstract get _showInputField(): boolean;
        protected get _addBtnLabel(): string { return "+ Add"; }

        //#endregion
        //.....................

        //..................
        //#region STYLES
        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".optElement": {
                whiteSpace: "nowrap",
                marginTop: "10px",

                nested: {
                    ".opts": {
                        display: "flex",
                        flexGrow: "1",
                        flexWrap: "wrap",
                        width: "100%",

                        nested: {
                            ".toggleBtn": {
                                width: "auto",

                            }
                        }
                    },

                    ".addOptWrapper": {
                        display: "flex",
                        maxWidth: "300px",
                        fontSize: "1em",
                        marginTop: "10px",

                        nested: {
                            ".addOpt": {
                                flexGrow: "1"
                            },

                            ".addBtn": {
                                backgroundColor: "<formTheme>",
                                color: "#FFF",
                                padding: "2px 10px",
                                cursor: "pointer",
                                width: "auto",
                                display: "inline-block",
                                whiteSpace: "nowrap",
                                marginLeft: "10px",
                                transition: "all ease-in-out .2",
                                flexShrink: "0",
                                borderRadius: "30px",

                                nested: {
                                    "&:hover": {
                                        transform: "scale(1.05)"
                                    }
                                }
                            }
                        }
                    }

                }
            }
        };
        //#endregion
        //..................

        constructor(id: string, template: T | ExpandableButtonField<M, T>) {
            super(id, template);
            ExpandableButtonField._instances.push(this);
        }
        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * @param appendToId 
         */
        protected _createClonedElement(appendToId: string): ExpandableButtonField<M, T> {
            return new (this.constructor as any)(this._id + appendToId, this.template);
        }
 
        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * Changing buttons always succeeds
         */
        protected _getValueFromField(): M[] { return this._data; }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * Create the appropriate elements for this 
         */
        protected _onCreateElements(): void {
            this._elems.base = KIP.createElement({
                cls: "optElement"
            });

            this._createAvailableOptions();
            this._createInput();
        }

        /**
         * _createTags
         * ----------------------------------------------------------------------------
         * Create the tags section of this form element
         */
        protected _createAvailableOptions(): void {
            if (!this._elems.opts) {
                this._elems.opts = KIP.createElement({
                    cls: "opts",
                    parent: this._elems.base
                });
            } else {
                this._elems.opts.innerHTML = "";
                this._buttons = [];
            }

            if (!(this.constructor as any)._options) { return; }

            // loop through the available options
            for (let opt of (this.constructor as any)._options) {
                let optElem: HTMLElement = this._createAvailableOption(opt);
                this._elems.opts.appendChild(optElem);
            };
        }

        /**
         * _createTag
         * ----------------------------------------------------------------------------
         * Create a toggle button for this element
         * @param   opt     
         * @returns The created element
         */
        protected _createAvailableOption(opt: IToggleBtnOption<M>): HTMLElement {
            let tagElem: HTMLElement = this._createOptionElement(opt);
            return tagElem;
        }

        /**
         * _createInput
         * ----------------------------------------------------------------------------
         * Create the appropriate input elements to be able to create new options
         * inline
         */
        protected _createInput(): void {

            let inputWrapper: HTMLElement = KIP.createElement({
                cls: "addOptWrapper",
                parent: this._elems.base
            });

            this._addInputField(inputWrapper);

            this._addAddButton(inputWrapper);
        }

        /**
         * _addInputField
         * ----------------------------------------------------------------------------
         * if appropriate, add a text field that can be used to add new elements
         * @param inputWrapper 
         */
        protected _addInputField(inputWrapper: HTMLElement): void {
            if (!this._showInputField) { return; }

            this._elems.input = KIP.createElement({
                cls: "addOpt",
                type: "input",
                parent: inputWrapper,
                eventListeners: {
                    keydown: (keyEvent: KeyboardEvent) => {
                        if (keyEvent.keyCode !== 13) { return; }
                        this._addNewOption(this._elems.input.value);
                        this._clearInputField();
                    }
                }
            }) as HTMLInputElement;
        }

        /**
         * _addAddButton
         * ----------------------------------------------------------------------------
         * Add the appropriate button to create new elements to add
         */
        protected _addAddButton(inputWrapper: HTMLElement) {
            this._elems.addBtn = KIP.createElement({
                cls: "addBtn",
                content: this._addBtnLabel,
                parent: inputWrapper,
                attr: {
                    tabindex: "0"
                },

                eventListeners: {
                    click: () => {
                        this._addNewOption(this._elems.input.value);
                        this._clearInputField();
                    },

                    keydown: (keyEvent: KeyboardEvent) => {
                        if (keyEvent.keyCode !== 13) { return; }
                        this._addNewOption(this._elems.input.value);
                        this._clearInputField();
                        this._elems.input.focus();
                    }
                }
            });
        }

        /**
         * _clearInputField
         * ----------------------------------------------------------------------------
         * Clear out the input field if we have one
         */
        protected _clearInputField(): void {
            if (!this._elems.input) { return; }
            this._elems.input.value = "";
        }

        /**
         * _addNewOption
         * ----------------------------------------------------------------------------
         * Add a new tag to our collection
         */
        protected _addNewOption(name: string): void {

            // only add new elements
            if (name && this._doesElementAlreadyExist(name)) { return; }

            let opt = this._createNewOption(name);
            let optElem = this._createAvailableOption(opt);
            this._elems.opts.appendChild(optElem);
            this._selectBtn(optElem, opt.value);
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * Update the current selections of the element
         * @param data 
         */
        public update(data: M[], allowEvents: boolean): void {
            this._createAvailableOptions(); 
            super.update(data, allowEvents);
        }

        //#region ABSTRACT FUNCTIONS
        protected abstract _doesElementAlreadyExist(text: string): boolean;
        protected abstract _createNewOption(text?: string): IToggleBtnOption<M>;
        //#endregion
    }
}