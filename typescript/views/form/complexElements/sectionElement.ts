/// <reference path="./collapsibleElement.ts" />

namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class SectionElement
     * ----------------------------------------------------------------------------
     * create an element in the form that will contain other elements of a form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class SectionElement<T extends Object> extends CollapsibleElement<T> {

        //#region PROPERTIES

        /** HTML elements that make up this form */
        protected _elems: ICollapsibleHTMLElements;

        /** styles to display this section correctly */
        protected static _uncoloredStyles: Styles.IStandardStyles = {

            ".kipFormElem.section": {
                marginTop: "10px",
                marginBottom: "5px"
            },

            ".kipFormElem .sectionHeader": {
                fontFamily: "OpenSansBold,Segoe UI,Helvetica",
                fontSize: "1.5em",
                color: "<formTheme>",
                fontWeight: "bold",
            },

            ".kipFormElem .section .sectionHeader, .kipFormElem .array .sectionHeader": {
                fontSize: "1.2em",
                color: "<formSubTheme>"
            },

            ".kipFormElem.section > .formChildren": {
                marginLeft: "25px"
            },

            ".kipFormElem.section > .formChildren.flex": {
                display: "flex",
                alignItems: "center",
                marginLeft: "0",

                nested: {
                    "> .kipFormElem": {
                        width: "auto"
                    },
                }
            }
        };

        /** section elements are a merged set of themes */
        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(SectionElement._uncoloredStyles, CollapsibleElement._uncoloredStyles, FormElement._uncoloredStyles);
        }

        /** update the appropriate theme color for the form */
        public setThemeColor(uniqueId: string, color: string, noReplace: boolean): void {
            super.setThemeColor(uniqueId, color);

            if (!this._children) { return; }
            if (isFormElement(this._children)) {
                this._children.setThemeColor(uniqueId, color, noReplace);
            } else {
                map(this._children, (child: FormElement<any>) => {
                    child.setThemeColor(uniqueId, color, noReplace);
                });
            }
        }

        /** also allow child elements that are gracefully created */
        protected _children: IFormElements<T> | FormElement<T>;
        public get children(): IFormElements<T> | FormElement<T> { return this._children; }

        /** handle the defaults that all form elements need */
        protected get _defaultCls(): string { return "kipFormElem section"; }
        protected get _defaultValue(): T { return {} as T; }

        /** use a section type */
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.SECTION; }

        //#endregion

        //#region CONSTRUCT AND CREATE ELEMENTS

        /**
         * SectionElement
         * ----------------------------------------------------------------------------
         * create a section element 
         * @param   id          Unique identifier for the section
         * @param   template    Template for the section itself
         * @param   children    All child elements of this section
         */
        public constructor(id: string, template: IFormCollapsibleTemplate<T> | SectionElement<T>, children?: IFormElements<T> | FormElement<T>) {
            super(id, template);
            if (isFormElement(template)) {
                children = (template as SectionElement<T>).children;
            }
            this._parseChildren(children);
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * create elements for the section 
         */
        protected _onCreateElements(): void {

            // Create the title for the section
            this._createCollapsibleTitle();

            // Create the form children section
            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null, this._elems.core);
            this._createStyles();

            this._updateClsBasedOnLayout();
        }

        /** create a clone of this element */
        protected _createClonedElement(appendToID: string): SectionElement<T> {
            return new SectionElement<T>(this._id + appendToID, this);
        }

        //#endregion

        //#region PARSE THE CHILDREN OF A SECTION

        /**
         * _parseChildren
         * ----------------------------------------------------------------------------
         * parse the children array of this form element 
         * @param   children    The children for this section
         */
        protected _parseChildren<K extends keyof T>(children?: IFormElements<T> | FormElement<T>): void {

            // quit if there isn't any data
            if (!children) { 
                children = {} as any;
                return; 
            }

            // Handle when there is just a single element inside of this section
            if (isFormElement(children)) {
                let elem: FormElement<T> = this._parseChild(children);
                this._children = elem;
                return;

                // handle when there is a list of children
            } else {
                this._children = {} as IFormElements<T>;

                // go through each of the children
                map(children, (template: FormElement<T[K]>, key: K) => {
                    let elem: FormElement<T[K]> = this._parseChild(template);
                    (this._children as IFormElements<T>)[key] = elem;
                });
            }
        }

        /**
         * parseChild
         * ----------------------------------------------------------------------------
         * Go through our children array and create the individual children
         * @param   child   The element to parse
         */
        protected _parseChild(child: FormElement<any>): FormElement<any> {
            let elem: FormElement<any> = this._cloneFormElement(child);

            this._applyColors(elem);
            elem.render(this._elems.childrenContainer);
            Events.addEventListener(FORM_ELEM_CHANGE, {
                func: (event: FormElemChangeEvent<any>) => {
                    let key: string = event.context.key;
                    if (key !== elem.id) { return; }

                    window.setTimeout(() => {
                        this._updateInternalData(true);
                        this._dispatchChangeEvent();
                    }, 0);
                },
                uniqueId: this._id + "|" + elem.id
            });

            return elem;
        }

        /**
         * _updateInternalData
         * ----------------------------------------------------------------------------
         * Handle keeping our internal data tracking up to date with our children
         * @param   internalOnly    If true, indicates that we aren't doing a full save
         */
        protected _updateInternalData<K extends keyof T>(internalOnly?: boolean): void {
            let elem: FormElement<T[K]>;
            if (isFormElement(this._children)) {
                this._data = this._children.save(internalOnly);
            } else {
                if (this._data === null) { return; }
                map(this._children, (elem: FormElement<T[K]>, key: K) => {
                    this._data[key] = elem.save(internalOnly);
                });
            }
        }
        //#endregion

        //#region OVERRIDE SPECIAL BEHAVIOR FOR SECTIONS

        /**
         * save
         * ----------------------------------------------------------------------------
         * Handle saving the section 
         * 
         * @param   internalOnly    If true, doesn't do all the updating that would 
         *                          happen on a real save
         * 
         * @returns The data contained in this sections child elements
         */
        public save(internalOnly?: boolean): T {
            // save all of the child elements
            this._updateInternalData(internalOnly);

            return this._data;
        }

        /**
         * canSave
         * ----------------------------------------------------------------------------
         * Determine whether this element can save, based on whether its children 
         * have errors.
         * 
         * @returns True if we can save this element
         */
        public canSave<K extends keyof T>(): ICanSaveTracker {
           
            // if we only have a single child, check that one
            if (isFormElement(this._children)) {
                return this._children.canSave();

            // otherwise, check all of our children
            } else {
                let canSave: ICanSaveTracker = {
                    hasErrors: false,
                    hasMissingRequired: false
                };

                map(this._children,
                    (child: FormElement<T[K]>) => {
                        let childCanSave: ICanSaveTracker = child.canSave();
                        canSave.hasErrors = canSave.hasErrors || childCanSave.hasErrors;
                        canSave.hasMissingRequired = canSave.hasMissingRequired || childCanSave.hasMissingRequired;
                    },
                    () => { return canSave.hasErrors && canSave.hasMissingRequired; }
                );
                return canSave;
            }
        }

        /**
         * _onClear
         * ----------------------------------------------------------------------------
         * Clear out all child elements when clearing the section
         */
        protected _onClear<K extends keyof T>(): void {
            if (isFormElement(this._children)) {
                this._children.clear();
            } else {
                map(this._children, (elem: FormElement<T[K]>, key: K) => {
                    elem.clear();
                });
            }
        }

        /**
         * focus
         * ----------------------------------------------------------------------------
         * Allow the first child of this section to take focus
         */
        public focus<K extends keyof T>(): boolean {
            if (!this._children) { return false; }
            if (isFormElement(this._children)) {
                return this._children.focus();
            } else {
                let isFocused: boolean;
                map(this._children, (value: FormElement<T[K]>, key: K) => {
                    if (value.focus()) { isFocused = true; }
                }, () => { return isFocused; })
                return isFocused;
            }
        }

        //#endregion

        //#region HANDLE CHANGES

        /**
         * update
         * ----------------------------------------------------------------------------
         * update the inter contents of the form 
         * @param   data    The new data for this element
         */
        public update<K extends keyof T>(data: T): void {
            if (!data) { return; }
            if (isFormElement(this._children)) {
                this._children.update(data);
            } else {
                map(this._children, (elem: FormElement<T[K]>, key: K) => {
                    elem.update(data[key]);
                });
            }
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * no validation for section elements 
         */
        protected _onChange(): boolean {
            return true;
        }
        //#endregion   
        
        //#region DYNAMICALLY ADD FIELDS TO THIS FORM
        public addChildElement<K extends keyof T>(key: K, formElem: FormElement<T[K]>): boolean {

            // if this section doesn't actually have keyed children, we can't do anything
            if (isFormElement(this._children)) { return false; }

            // add to the children's array and to the UI
            this._children[key] = this._parseChild(formElem);
        }

        protected _updateClsBasedOnLayout(): void {
            let cls: string;
            switch(this._layout) {
                case FormElementLayoutEnum.FLEX:
                    cls = "flex";
                    break;
                case FormElementLayoutEnum.TABLE:
                    cls = "table";
                    break;
                case FormElementLayoutEnum.LABEL_AFTER:
                case FormElementLayoutEnum.MULTILINE:
                default:
                    cls = "multiline";
                    break;
            }

            addClass(this._elems.childrenContainer, cls);
        }
        //#endregion

    }
}