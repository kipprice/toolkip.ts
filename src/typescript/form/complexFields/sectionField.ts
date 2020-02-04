/// <reference path="./_collapsibleField.ts" />

namespace KIP.Forms {

    /**----------------------------------------------------------------------------
     * @class SectionField
     * ----------------------------------------------------------------------------
     * create an element in the form that will contain other elements of a form
     * @author  Kip Price
     * @version 1.0.2
     * ----------------------------------------------------------------------------
     */
    export class SectionField<M extends Object, T extends IFormCollapsibleTemplate<M> = IFormCollapsibleTemplate<M>> extends CollapsibleField<M, T> {

        //.................
        //#region STYLES
        
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

            ".kipFormElem.section > .formChildren .section.collapsible > .formChildren": {
                borderLeft: "1px solid <formTheme>",
                paddingLeft: "20px"
            },

            ".kipFormElem.section > .formChildren .section > .sectionHeaderContainer.hidden + .formChildren": {
                borderLeft: "0 solid",
                paddingLeft: "0"
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
            return this._mergeThemes(
                SectionField._uncoloredStyles, 
                CollapsibleField._uncoloredStyles, 
                Field._uncoloredStyles
            );
        }
        
        //#endregion
        //.................
        
        //.....................
        //#region PROPERTIES

        /** HTML elements that make up this form */
        protected _elems: ICollapsibleHTMLElements;

        /** update the appropriate theme color for the form */
        public setThemeColor(uniqueId: string, color: string, noReplace: boolean): void {
            super.setThemeColor(uniqueId, color);

            if (!this._children) { return; }
            if (isField(this._children)) {
                this._children.setThemeColor(uniqueId, color, noReplace);
            } else {
                map(this._children, (child: Field<any>) => {
                    child.setThemeColor(uniqueId, color, noReplace);
                });
            }
        }

        /** also allow child elements that are gracefully created */
        protected _children: IFields<M> | Field<M>;
        public get children(): IFields<M> | Field<M> { return this._children; }

        /** handle the defaults that all form elements need */
        protected get _defaultCls(): string { return "kipFormElem section"; }
        protected get _defaultValue(): M { return {} as M; }

        /** use a section type */
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.SECTION; }

        //#endregion
        //.....................

        //.......................................
        //#region CONSTRUCT AND CREATE ELEMENTS

        /**
         * SectionElement
         * ----------------------------------------------------------------------------
         * create a section element 
         * @param   id          Unique identifier for the section
         * @param   config      Template for the section itself
         * @param   children    All child elements of this section
         */
        public constructor(id: string, config: T | SectionField<M,T>, children?: IFields<M> | Field<M>) {
            super(id, config as  any);

            // grab children from the parent element if appropriate
            if (isField(config)) {
                children = config.children;
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
            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null, this._elems.base);
            this._createStyles();

            this._updateClsBasedOnLayout();
        }

        /** create a clone of this element */
        protected _createClonedElement(appendToID: string): SectionField<M,T> {
            return new SectionField<M,T>(this._id + appendToID, this);
        }

        //#endregion
        //.......................................

        //..........................................
        //#region PARSE THE CHILDREN OF A SECTION

        /**
         * _parseChildren
         * ----------------------------------------------------------------------------
         * parse the children array of this form element 
         * @param   children    The children for this section
         */
        protected _parseChildren<K extends keyof M>(children?: IFields<M> | Field<M>): void {

            // quit if there isn't any data
            if (!children) { 
                children = {} as any;
                return; 
            }

            // Handle when there is just a single element inside of this section
            if (isField(children)) {
                let elem: Field<M> = this._parseChild(children);
                this._children = elem;
                return;

                // handle when there is a list of children
            } else {
                this._children = {} as IFields<M>;

                // go through each of the children
                map(children, (template: Field<M[K]>, key: K) => {
                    let elem: Field<M[K]> = this._parseChild(template);
                    (this._children as IFields<M>)[key] = elem;
                });
            }
        }

        /**
         * parseChild
         * ----------------------------------------------------------------------------
         * Go through our children array and create the individual children
         * @param   child   The element to parse
         */
        protected _parseChild(child: Field<any>): Field<any> {
            let elem: Field<any> = this._cloneFormElement(child);

            this._applyColors(elem);
            elem.draw(this._elems.childrenContainer);

            formEventHandler.addEventListener(FORM_ELEM_CHANGE, {
                func: (event: FormElemChangeEvent<any>) => {
                    let key: string = event.context.key;
                    if (key !== elem.id) { return; }

                    window.setTimeout(() => {
                        this._updateInternalData(true);
                        this._dispatchChangeEvent(elem.id);
                    }, 0);
                },
                target: elem,
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
        protected async _updateInternalData<K extends keyof M>(internalOnly?: boolean): Promise<any> {
            let elem: Field<M[K]>;
            let data: M;
            
            if (isField(this._children)) {
                data = await this._children.save(internalOnly);
            } else {
                data = {} as any;

                let promises: Promise<any>[] = map(
                    this._children, 
                    async (elem: Field<M[K]>, key: K): Promise<any> => {
                        return this._updateInternalField(key, elem, data, internalOnly);
                    }
                );

                await Promise.all(promises);
                
            }
            return data;
        }

        protected async _updateInternalField<K extends keyof M>(key: K, elem: Field<M[K]>, data: M, internalOnly?: boolean): Promise<any> {
            data[key] = await elem.save(internalOnly);
            return Promise.resolve();
        }
        //#endregion
        //..........................................

        //................................................
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
        public async save(internalOnly?: boolean): Promise<M> {
            // save all of the child elements
            this._data = await this._updateInternalData(internalOnly);
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
        public canSave<K extends keyof M>(): ICanSaveTracker {
           
            // if we only have a single child, check that one
            if (isField(this._children)) {
                return this._children.canSave();

            // otherwise, check all of our children
            } else {
                let canSave: ICanSaveTracker = {
                    hasErrors: false,
                    hasMissingRequired: false
                };

                map(this._children,
                    (child: Field<M[K]>) => {
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
         * clear
         * ----------------------------------------------------------------------------
         * Clear out all child elements when clearing the section
         */
        public clear<K extends keyof M>(): void {

            if (isField(this._children)) {
                this._children.clear();
            } else {
                map(this._children, (elem: Field<M[K]>, key: K) => {
                    elem.clear();
                });
            }
        }

        /**
         * focus
         * ----------------------------------------------------------------------------
         * Allow the first child of this section to take focus
         */
        public focus<K extends keyof M>(): boolean {
            if (!this._children) { return false; }
            if (isField(this._children)) {
                return this._children.focus();
            } else {
                let isFocused: boolean;
                map(this._children, (value: Field<M[K]>, key: K) => {
                    if (value.focus()) { isFocused = true; }
                }, () => { return isFocused; })
                return isFocused;
            }
        }

        //#endregion
        //................................................

        //........................
        //#region HANDLE CHANGES

        /**
         * update
         * ----------------------------------------------------------------------------
         * update the inter contents of the form 
         * @param   data    The new data for this element
         */
        public update<K extends keyof M>(data: M, allowEvents: boolean): void {
            if (!data) { return; }
            if (isField(this._children)) {
                this._children.update(data, allowEvents), allowEvents;
            } else {
                map(this._children, (elem: Field<M[K]>, key: K) => {
                    elem.update(data[key], allowEvents);
                });
            }
        }

        /**
         * _getValueFromField
         * ----------------------------------------------------------------------------
         * return standard value
         */
        protected _getValueFromField(): M {
            return this._data;
        }

        /**
         * _validate
         * ----------------------------------------------------------------------------
         * no validation for section elements 
         */
        protected _validate(data: M): boolean {
            return true;
        }

        //#endregion   
        //........................
        
        //.............................................
        //#region DYNAMICALLY ADD FIELDS TO THIS FORM

        public addChildElement<K extends keyof M>(key: K, formElem: Field<M[K]>): boolean {

            // if this section doesn't actually have keyed children, we can't do anything
            if (isField(this._children)) { return false; }

            // add to the children's array and to the UI
            if (!this._children) { this._children = {} as IFields<M>; }
            this._children[key] = this._parseChild(formElem);

            return true; 
        }

        protected _updateClsBasedOnLayout(): void {
            let cls: string;

            switch(this._config.layout) {

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
        //.............................................

        //..........................................
        //#region GET ELEMENTS AFTER CREATION
        
        public getField(id: string): Field<any> {

            // first check this element
            if (id === this._id) { return this; }
            
            // then check child elements
            if (isField(this._children)) {
                return this._children.getField(id);
            } else {
                let result: Field<any>;
                KIP.map(this._children, (child: Field<any>) => {
                    if (result) { return }
                    result = child.getField(id);
                }, () => { return !!result; } )
                return result;
            }
        }
        
        //#endregion
        //..........................................

    }
}