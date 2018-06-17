///<reference path="formElement.ts" />

namespace KIP.Forms {

    //#region COLLAPSIBLE ELEMENT
    /**...........................................................................
     * @class CollapsibleElement
     * ...........................................................................
     * Create a collapsible element of the form
     * @version 1.0
     * ...........................................................................
     */
    export abstract class CollapsibleElement<T> extends FormElement<T> {

        //#region PROPERTIES

        /** keep track of whether we are currently collapsed */
        protected _isCollapsed: boolean;

        /** keep track of whether the title should be hidden */
        protected _shouldHideTitle: boolean;

        /** keep track of shared elements for collapsible sections */
        protected _elems: {
            core: HTMLElement;
            title: HTMLElement;
            collapseElem?: HTMLElement;
            titleContainer?: HTMLElement;
            childrenContainer: HTMLElement;
        }

        /** style collapsible sections */
        protected static _uncoloredStyles: Styles.IStandardStyles = {

            ".kipFormElem.collapsible .formChildren": {
                maxHeight: "100%"
            },

            ".kipFormElem.collapsible.collapsed .formChildren": {
                maxHeight: "0px",
                overflow: "hidden"
            },

            ".kipFormElem.collapsible .sectionHeaderContainer": {
                display: "flex",
                justifyContent: "space-between",
                boxSizing: "border-box",
                cursor: "pointer",
                padding: "10px 10px",
                borderRadius: "3px",
                alignItems: "center",
                
                nested: {
                    "&.hidden": {
                        display: "none"
                    }
                }
            },

            ".kipFormElem.collapsible .caret": {
                transformOrigin: "50% 50%",
                width: ".8em",
                fontSize: "1em",
                transition: "all ease-in-out .1s",
                cursor: "pointer"
            },

            ".kipFormElem.collapsible.collapsed .caret": {
                transform: "rotate(180deg)"
            },

            ".kipFormElem.collapsible .sectionHeaderContainer:hover": {
                backgroundColor: "#eee"
            }

        }
        //#endregion

        //#region CREATE ELEMENTS

        constructor(id: string, template: IFormCollapsibleTemplate<T> | CollapsibleElement<T>) {
            super(id, template);
        }

        protected _parseElemTemplate(template: IFormCollapsibleTemplate<T>): void {
            super._parseElemTemplate(template);

            this._isCollapsed = (!template.isExpanded && !template.hideTitle);
            this._shouldHideTitle = template.hideTitle;
        }

        /**...........................................................................
         * _createCollapsibleTitle
         * ...........................................................................
         * Create the title for a collapsible section & associated icons
         * ...........................................................................
         */
        protected _createCollapsibleTitle(): void {
            let titleCls: string = "sectionHeaderContainer";
            if (this._shouldHideTitle) { titleCls += " hidden"; }

            this._elems.titleContainer = createSimpleElement("", titleCls, "", null, null, this._elems.core);
            this._elems.title = createSimpleElement("", "sectionHeader", this._label, null, null, this._elems.titleContainer);
            this._elems.collapseElem = createSimpleElement("", "caret", "\u25B5", null, null, this._elems.titleContainer);
            this._elems.titleContainer.addEventListener("click", () => { this._onCaretClicked(); });

            // add a tracking class to the core element
            addClass(this._elems.core, "collapsible");

            // start collapsed
            if (this._isCollapsed) {
                this.collapse();
            }
        }
        //#endregion

        //#region HANDLE EXPAND + COLLAPSE
        /**...........................................................................
         * _onCaretClicked
         * ...........................................................................
         * Handle the expand/collapse icon being clicked
         * ...........................................................................
         */
        protected _onCaretClicked(): void {
            if (this._isCollapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }

        /**...........................................................................
         * collapse
         * ...........................................................................
         * Handle collapsing the section
         * ...........................................................................
         */
        public collapse(): void {
            addClass(this._elems.core, "collapsed");
            this._isCollapsed = true;
        }

        /**...........................................................................
         * expand
         * ...........................................................................
         * Handle expanding the section
         * ...........................................................................
         */
        public expand(): void {
            removeClass(this._elems.core, "collapsed");
            this._isCollapsed = false;
        }

        //#endregion

    }

    //#endregion

    //#region SECTION ELEMENT
    /**...........................................................................
     * @class SectionElement
     * ...........................................................................
     * create an element in the form that will contain other elements of a form
     * @version 1.0
     * ...........................................................................
     */
    export class SectionElement<T extends Object> extends CollapsibleElement<T> {

        //#region PROPERTIES

        /** HTML elements that make up this form */
        protected _elems: {
            core: HTMLElement;
            title: HTMLElement;
            collapseElem?: HTMLElement;
            titleContainer?: HTMLElement;
            childrenContainer: HTMLElement;
        }

        /** styles to display this section correctly */
        protected static _uncoloredStyles: Styles.IStandardStyles = {

            ".kipFormElem.section": {
                marginTop: "10px",
                marginBottom: "5px"
            },

            ".kipFormElem .sectionHeader": {
                fontFamily: "OpenSansBold,Segoe UI,Helvetica",
                fontSize: "1.5em",
                color: "<0>",
                fontWeight: "bold",
            },

            ".kipFormElem .section .sectionHeader, .kipFormElem .array .sectionHeader": {
                fontSize: "1.2em",
                color: "<1>"
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
        public setThemeColor(idx: number, color: string, noReplace: boolean): void {
            super.setThemeColor(idx, color);

            if (!this._children) { return; }
            if (isFormElement(this._children)) {
                this._children.setThemeColor(idx, color, noReplace);
            } else {
                map(this._children, (child: FormElement<any>) => {
                    child.setThemeColor(idx, color, noReplace);
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

        /**...........................................................................
         * create a section element 
         * 
         * @param   id          Unique identifier for the section
         * @param   template    Template for the section itself
         * @param   children    All child elements of this section
         *........................................................................... 
         */
        public constructor(id: string, template: IFormCollapsibleTemplate<T> | SectionElement<T>, children?: IFormElements<T> | FormElement<T>) {
            super(id, template);
            if (isFormElement(template)) {
                children = (template as SectionElement<T>).children;
            }
            this._parseChildren(children);
        }

        /**...........................................................................
         * _onCreateElements
         * ...........................................................................
         * create elements for the section 
         * ...........................................................................
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

        /**...........................................................................
         * _parseChildren
         * ...........................................................................
         * parse the children array of this form element 
         * 
         * @param   children    The children for this section
         * ...........................................................................
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

        /**...........................................................................
         * parseChild
         * ...........................................................................
         * Go through our children array and create the individual children
         * 
         * @param   child   The element to parse
         * ...........................................................................
         */
        protected _parseChild(child: FormElement<any>): FormElement<any> {
            let elem: FormElement<any> = this._parseElement(child);

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

        /**...........................................................................
         * _updateInternalData
         * ...........................................................................
         * Handle keeping our internal data tracking up to date with our children
         * 
         * @param   internalOnly    If true, indicates that we aren't doing a full save
         * ...........................................................................
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

        /**...........................................................................
         * save
         * ...........................................................................
         * Handle saving the section 
         * 
         * @param   internalOnly    If true, doesn't do all the updating that would 
         *                          happen on a real save
         * 
         * @returns The data contained in this sections child elements
         * ...........................................................................
         */
        public save(internalOnly?: boolean): T {
            // save all of the child elements
            this._updateInternalData(internalOnly);

            return this._data;
        }

        /**...........................................................................
         * canSave
         * ...........................................................................
         * Determine whether this element can save, based on whether its children 
         * have errors.
         * 
         * @returns True if we can save this element
         * ...........................................................................
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

        /**...........................................................................
         * _onClear
         * ...........................................................................
         * Clear out all child elements when clearing the section
         * ...........................................................................
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

        //#endregion

        //#region HANDLE CHANGES

        /**...........................................................................
         * update
         * ...........................................................................
         * update the inter contents of the form 
         * 
         * @param   data    The new data for this element
         * ...........................................................................
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

        /**...........................................................................
         * _onChange
         * ...........................................................................
         * no validation for section elements 
         * ...........................................................................
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

        private _updateClsBasedOnLayout(): void {
            let cls: string;
            switch(this._layout) {
                case FormElementLayoutEnum.FLEX:
                    cls = "flex";
                    break;
                case FormElementLayoutEnum.LABEL_AFTER:
                case FormElementLayoutEnum.TABLE:
                case FormElementLayoutEnum.MULTILINE:
                default:
                    cls = "multiline";
                    break;
            }

            addClass(this._elems.childrenContainer, cls);
        }
        //#endregion

    }

    //#endregion

    /**...........................................................................
     * @class ArrayElement
     * ...........................................................................
     * Create an element in the form that can be added to
     * @version 1.0
     * ...........................................................................
     */
    export class ArrayElement<T> extends CollapsibleElement<T[]> {

        //#region PROPERTIES
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.ARRAY; }
        protected get _defaultValue(): T[] { return []; }
        protected get _defaultCls(): string { return "array"; }
        protected _data: T[];

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipBtn.new": {
                marginTop: "10px",
                marginBottom: "10px",
                marginLeft: "25px",
                backgroundColor: "<0>",
                color: "#FFF",
                width: "calc(33% - 15px)",
            },

            ".kipFormElem.array .arrayChild .arrayChild .kipBtn.new": {
                width: "100%",
                display: "block"
            },

            ".kipForm .kipBtn.new:hover": {
                transform: "scale(1.01)"
            },

            ".kipFormElem.array .formChildren": {
                display: "flex",
                flexWrap: "wrap",
                alignItems: "top"
            },

            ".kipFormElem.array .formChildren .arrayChild": {
                maxWidth: "calc(33% - 20px)"
            },

            ".kipFormElem.array .formChildren .arrayChild .arrayChild": {
                maxWidth: "100%"
            },

            ".kipFormElem.array.collapsed .kipBtn.new": {
                display: "none"
            }
        };

        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(ArrayElement._uncoloredStyles, CollapsibleElement._uncoloredStyles, FormElement._uncoloredStyles);
        }

        protected _childTemplate: IFormElements<T> | FormElement<T>;
        public get childTemplate(): IFormElements<T> | FormElement<T> { return this._childTemplate; }

        protected _childFormElem: FormElement<T>;

        protected _children: FormElement<T>[];

        protected _elems: {
            core: HTMLElement;
            title: HTMLElement;
            collapseElem?: HTMLElement;
            titleContainer?: HTMLElement;
            childrenContainer: HTMLElement;
            newButton: HTMLElement;
        }

        protected _template: IFormArrayTemplate<T>;

        protected _newLabel: string;

        /** update the appropriate theme color for the form */
        public setThemeColor(idx: number, color: string, noReplace?: boolean): void {
            super.setThemeColor(idx, color);

            // if there are no children yet, apply to the child template
            if (!this._children || this._children.length === 0) {
                if (isFormElement(this._childTemplate)) {
                    this._childTemplate.setThemeColor(idx, color, noReplace);
                } else {
                    map(this._childTemplate, (child: FormElement<any>) => {
                        child.setThemeColor(idx, color, noReplace);
                    });
                }
            }

            map(this._children, (child: FormElement<any>) => {
                child.setThemeColor(idx, color, noReplace);
            });
        }
        //#endregion

        //#region CONSTRUCT THE FORM ELEMENT
        constructor(id: string, template: IFormArrayTemplate<T> | ArrayElement<T>, children?: IFormElements<T> | FormElement<T>) {
            super(id, template);

            if (isFormElement(template)) {
                this._childTemplate = (template as ArrayElement<T>).childTemplate;
            } else {
                this._childTemplate = children;
            }

            // create the children array; this will be parsed after elements are created
            this._children = [];

            //this._createNewChild();
        }

        protected _parseElemTemplate(template: IFormArrayTemplate<T>): void {
            super._parseElemTemplate(template);
            this._newLabel = template.newLabel || "+ Add New Element";
        }

        /** create the elements for the array */
        protected _onCreateElements(): void {

            // show the title
            this._createCollapsibleTitle();

            // handle showing the children
            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null, this._elems.core);
            this._elems.newButton = createSimpleElement("", "kipBtn new", this._newLabel, null, null, this._elems.core);
            this._elems.newButton.addEventListener("click", () => {
                this._createNewChild();
            });
            this._createStyles();
        }

        /** create a cloned version of this element */
        protected _createClonedElement(appendToID: string): ArrayElement<T> {
            return new ArrayElement<T>(this._id + appendToID, this);
        }

        //#endregion

        //#region HANDLE CHANGES

        /** array elements can always change */
        protected _onChange(): boolean {
            return true;
        }

        /** handle when an external force needs to update the form */
        public update(data: T[]): void {
            if (!data) { return; }

            // First clear out the existing data
            this._onClear();

            // recreate the children
            data.map((elem: T) => {
                let child: ArrayChildElement<T> = this._createNewChild();
                child.update(elem);
            });
        }

        //#endregion

        //#region HANDLE CHILDREN

        /** create a new child element in the array */
        protected _createNewChild(): ArrayChildElement<T> {
            let idx: number = this._children.length;
            let elem: ArrayChildElement<T> = new ArrayChildElement(this._id + "|" + idx.toString(), this._childTemplate);
            elem.addOrderingListener(this);

            this._applyColors(elem);

            this._children.push(elem);
            elem.render(this._elems.childrenContainer);

            Events.addEventListener(FORM_ELEM_CHANGE,
                {
                    func: (event: FormElemChangeEvent<any>) => {

                        let key: string = event.context.key;
                        if (key !== elem.id) { return; }

                        window.setTimeout(() => {
                            this._updateInternalData(true);
                            this._dispatchChangeEvent();
                        }, 0);
                    },
                    uniqueId: this.id + "|" + elem.id
                }
            );
            return elem;
        }

        protected _updateInternalData(internalOnly?: boolean): void {
            this._data = [];
            let cnt: number = 0;

            // loop through all of the children we have to update the internal data structure
            for (cnt; cnt < this._children.length; cnt += 1) {
                let elem: FormElement<T> = this._children[cnt];
                if (isNullOrUndefined(elem)) { continue; }
                let data: any = elem.save(internalOnly);
                if (isNullOrUndefined(data)) { continue; }
                this._data.push(data);
            }
        }


        //#endregion

        //#region OVERRIDE STANDARD FUNCTIONS THAT NEED CUSTOM LOGIC

         /**...........................................................................
         * save
         * ...........................................................................
         * Handle saving the section 
         * 
         * @param   internalOnly    If true, doesn't do all the updating that would 
         *                          happen on a real save
         * 
         * @returns The data contained in this sections child elements
         * ...........................................................................
         */
        public save<K extends keyof T>(internalOnly?: boolean): T[] {

            // save all of the child elements
            this._updateInternalData(internalOnly);

            // return the data that was created
            return this._data;
        }

        /**...........................................................................
         * canSave
         * ...........................................................................
         * Determine whether this element can save, based on whether its children 
         * have errors.
         * 
         * @returns True if we can save this element
         * ...........................................................................
         */
        public canSave<K extends keyof T>(): ICanSaveTracker {
            let canSave: ICanSaveTracker = {
                hasErrors: false,
                hasMissingRequired: false
            };
            map(
                this._children,
                (child: FormElement<T[K]>) => {
                    let childCanSave: ICanSaveTracker = child.canSave();
                    canSave.hasErrors = canSave.hasErrors || childCanSave.hasErrors;
                    canSave.hasMissingRequired = canSave.hasMissingRequired || childCanSave.hasMissingRequired;
                },
                () => { return canSave.hasErrors && canSave.hasMissingRequired; }
            );
            return canSave;
        }

        /** handle clearing out the array */
        protected _onClear(): void {
            this._elems.childrenContainer.innerHTML = "";
            this._children = [];
        }

        public onChangeOrder(child: ArrayChildElement<T>, direction: DirectionType, moveTo?: number): void {

            // update data array
            let curIdx: number;
            for (let i = 0; i < this._children.length; i += 1) {
                if (this._children[i] === child) {
                    curIdx = i;
                }
            }
            let nextIdx: number = isNullOrUndefined(moveTo) ? curIdx + direction : moveTo;
            if (nextIdx < 0) { nextIdx = 0; }
            if (nextIdx >= this._children.length) { nextIdx = this._children.length - 1; }
            this._children.splice(curIdx, 1);
            this._children.splice(nextIdx, 0, child);

            // update UI array
            let childElem: Element = this._elems.childrenContainer.children[curIdx]; 
            let nextSibling: Element = this._elems.childrenContainer.children[nextIdx + (direction === DirectionType.FORWARD? 1 : 0)];
            this._elems.childrenContainer.removeChild(childElem);
            if (nextSibling) {
                this._elems.childrenContainer.insertBefore(childElem, nextSibling);
            } else {
                this._elems.childrenContainer.appendChild(childElem);
            }
            
        }

        //#endregion

    }

    /**
     * Keep track of a child of an array in the form
     * @version 1.0
     */
    export class ArrayChildElement<T> extends SectionElement<T> {

        //#region PROPERTIES
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.ARRAY_CHILD; }
        protected get _defaultValue(): T { return {} as T; }
        protected get _defaultCls(): string { return "arrayChild"; }

        protected _orderlistener: ArrayElement<T>;

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem.arrayChild": {
                backgroundColor: "#FFF",
                borderRadius: "5px",
                boxShadow: "1px 1px 5px 2px rgba(0,0,0,.2)",
                marginRight: "20px",
                marginBottom: "10px",
                padding: "15px",

                nested: {
                    ".formChildren" : {
                        margin:"10px",
                        marginTop: "0"
                    },

                    ".kipBtn": {
                        position: "absolute",
                        cursor: "pointer",
                        top: "calc(50% - 8px)",
                        transition: "all ease-in-out .2",
                        padding: "2px",
                        boxShadow: "none",
                        backgroundColor: "none",
                        color: "#555",
                        opacity: "0.5",

                        nested: {
                            "&.close": {
                                top: "-10px",
                                opacity: "1",
                                color: "#FFF"
                            },
                            "&.next": {
                                left: "calc(100% - 20px)"
                            },

                            "&.prev": {
                                left: "0"
                            }, 
                            "&:hover": {
                                transform: "scale(1.1)",
                                opacity: "0.8"
                            }
                        }
                    },

                }
            },

            ".formChildren > div.arrayChild:first-child .prev.kipBtn": {
                display: "none"
            },

            ".formChildren > div.arrayChild:last-child .next.kipBtn": {
                display: "none"
            }

        }

        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(ArrayChildElement._uncoloredStyles, CollapsibleElement._uncoloredStyles, FormElement._uncoloredStyles);
        }

        protected _elems: {
            core: HTMLElement;
            title: HTMLElement;
            childrenContainer: HTMLElement;
            closeBtn: HTMLElement;
            nextBtn: HTMLElement;
            prevBtn: HTMLElement;
        }
        //#endregion

        //#region CONSTRUCT AN ARRAY CHILD ELEMENT
        /** create an element of an array */
        constructor(id: string, children: IFormElements<T> | FormElement<T>) {
            super(id.toString(), {}, children);
        }

        protected _onCreateElements(): void {
            this._elems.nextBtn = createElement({
                cls: "next kipBtn",
                content: ">",
                parent: this._elems.core,
                eventListeners: {
                    click: () => { this._changeOrder(DirectionType.FORWARD); }
                }
            });

            this._elems.prevBtn = createElement({
                cls: "prev kipBtn",
                content: "<",
                parent: this._elems.core,
                eventListeners: {
                    click: () => { this._changeOrder(DirectionType.BACKWARD); }
                }
            });

            this._elems.closeBtn = createSimpleElement("", "close kipBtn", "X", null, null, this._elems.core);
            this._elems.closeBtn.addEventListener("click", () => {
                this._delete();
            });

            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null, this._elems.core);
        }

        protected _createClonedElement(appendToID: string): ArrayChildElement<T> {
            return new ArrayChildElement<T>(this._id + appendToID, this._children);
        }

        protected _parseElement(child: FormElement<any>): FormElement<any> {
            return super._parseElement(child, "|" + this._id);
        }
        //#endregion

        //#region HANDLE DELETION
        protected _delete(): void {
            this._elems.core.parentNode.removeChild(this._elems.core);
            this._data = null;
            this._dispatchChangeEvent();
        }
        //#endregion

        //#region HANDLE ORDER CHANGING
        public addOrderingListener(orderListener: ArrayElement<T>): void {
            this._orderlistener = orderListener;
        }

        protected _changeOrder(direction: DirectionType): void {
            if (!this._orderlistener) { return; }
            this._orderlistener.onChangeOrder(this, direction)
        }
        //#endregion

    }
}