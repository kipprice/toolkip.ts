/// <reference path="./sectionElement.ts" />

namespace KIP.Forms {

    export interface IFormArrayTemplate<T> extends IFormCollapsibleTemplate<T[]> {
        newLabel?: string;
        allowReordering?: boolean;
    }

    /**----------------------------------------------------------------------------
     * @class ArrayElement
     * ----------------------------------------------------------------------------
     * Create an element in the form that can be added to
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class ArrayElement<T> extends CollapsibleElement<T[]> {

        //.....................
        //#region PROPERTIES

        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.ARRAY; }
        protected get _defaultValue(): T[] { return []; }
        protected get _defaultCls(): string { return "array"; }
        protected _data: T[];


        protected _childTemplate: IFormElements<T> | FormElement<T>;
        public get childTemplate(): IFormElements<T> | FormElement<T> { return this._childTemplate; }

        protected _children: FormElement<T>[];

        /** elements contained within the array element */
        protected _elems: {
            core: HTMLElement;
            title: HTMLElement;
            collapseElem?: HTMLElement;
            titleContainer?: HTMLElement;
            childrenContainer: HTMLElement;
            newButton: HTMLElement;
        }

        protected _template: IFormArrayTemplate<T>;

        /** what to label the new button */
        protected _newLabel: string;

        /** if true,  */
        protected _allowReordering: boolean;

        //#endregion
        //.....................

        //..................
        //#region STYLES

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipBtn.new": {
                marginTop: "10px",
                marginBottom: "10px",
                backgroundColor: "<formTheme>",
                color: "#FFF",
                width: "calc(33% - 20px)",
                userSelect: "none",
                webkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",

                nested: {
                    ".mobile &": {
                        width: "calc(100% - 20px)"
                    }
                }
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

            ".kipFormElem.array.collapsed .kipBtn.new": {
                display: "none"
            }
        };

        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(ArrayElement._uncoloredStyles, CollapsibleElement._uncoloredStyles, FormElement._uncoloredStyles);
        }

        /** 
         * setThemeColor
         * ----------------------------------------------------------------------------
         * update the appropriate theme color for the form 
         */
        public setThemeColor(uniqueId: string, color: string, noReplace?: boolean): void {
            super.setThemeColor(uniqueId, color);

            // if there are no children yet, apply to the child template
            if (!this._children || this._children.length === 0) {
                if (isFormElement(this._childTemplate)) {
                    this._childTemplate.setThemeColor(uniqueId, color, noReplace);
                } else {
                    map(this._childTemplate, (child: FormElement<any>) => {
                        child.setThemeColor(uniqueId, color, noReplace);
                    });
                }
            }

            map(this._children, (child: FormElement<any>) => {
                child.setThemeColor(uniqueId, color, noReplace);
            });
        }

        //#endregion
        //..................

        //....................................
        //#region CONSTRUCT THE FORM ELEMENT

        /**
         * ArrayElement
         * ----------------------------------------------------------------------------
         * Generate a form element that can contain lots of copies 
         * @param id        Unique identifier for this array element
         * @param template  Details for the overall array
         * @param children  
         */
        constructor(id: string, template: IFormArrayTemplate<T> | ArrayElement<T>, children?: IFormElements<T> | FormElement<T>) {
            super(id, template);

            // copy old template over from an existing element
            if (isFormElement(template)) { this._childTemplate = (template as ArrayElement<T>).childTemplate; }

            // otherwise, use the children passed in as our template
            else { this._childTemplate = children; }

            // create the children array; this will be parsed after elements are created
            this._children = [];
        }

        /**
         * _parseElemTemplate
         * ----------------------------------------------------------------------------
         * Parse the details of our own template
         */
        protected _parseElemTemplate(template: IFormArrayTemplate<T>): void {
            super._parseElemTemplate(template);

            // customize the label to use for the new button
            this._newLabel = template.newLabel || "+ Add New Element";

            // determine whether children can be rearranged
            this._allowReordering = template.allowReordering;
            if (isNullOrUndefined(this._allowReordering)) { template.allowReordering = true; }
        }

        /** 
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * create the elements for the array 
         */
        protected _onCreateElements(): void {

            // show the title
            this._createCollapsibleTitle();

            // handle showing the children
            this._elems.childrenContainer = createSimpleElement("", "formChildren", "", null, null, this._elems.core);
            this._createNewButton();
            this._createStyles();
        }

        /**
         * _createNewButton
         * ----------------------------------------------------------------------------
         * Add the button to create a new entry into our array
         */
        protected _createNewButton(): void {
            this._elems.newButton = createElement({
                cls:"kipBtn new", 
                content: this._newLabel, 
                parent: this._elems.core,
                eventListeners: {
                    click: () => { this._createNewChild(); }
                }
            });
        }

        /** 
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * create a cloned version of this element 
         */
        protected _createClonedElement(appendToID: string): ArrayElement<T> {
            return new ArrayElement<T>(this._id + appendToID, this);
        }

        //#endregion
        //....................................

        //........................
        //#region HANDLE CHANGES

        /** 
         * _onChange
         * ----------------------------------------------------------------------------
         * array elements are always validated as true
         */
        protected _onChange(): boolean {
            return true;
        }

        /** 
         * update
         * ----------------------------------------------------------------------------
         * handle when an external force needs to update the form 
         */
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
        //........................

        //........................
        //#region HANDLE CHILDREN

        /** 
         * _createNewChild
         * ----------------------------------------------------------------------------
         * create a new child element in the array 
         */
        protected _createNewChild(): ArrayChildElement<T> {
            let elem: ArrayChildElement<T> = this._generateChildElement();
            this._addNewChildListeners(elem);
            this._finalizeNewChild(elem);
            return elem;
        }

        /**
         * _generateChildElement
         * ----------------------------------------------------------------------------
         * generate a new child array element
         */
        protected _generateChildElement(): ArrayChildElement<T> {
            let idx: number = this._children.length;
            let elem: ArrayChildElement<T>;
            
            // if this is already an element, just clone it
            if (isArrayChildElement(this._childTemplate)) {
                elem = this._cloneFormElement(this._childTemplate, this._id + "|" + idx.toString()) as ArrayChildElement<T>;
            
            // otherwise, spin up a new child altogether
            } else {
                elem = new ArrayChildElement(this._id + "|" + idx.toString(), this._childTemplate, { allowReordering: this._allowReordering});
            }
            return elem;
        }

        /**
         * _finalizeNewChild
         * ----------------------------------------------------------------------------
         * add the created child to our style map and our children
         */
        protected _finalizeNewChild(elem: ArrayChildElement<T>): void {
            this._applyColors(elem);
            this._children.push(elem);
            elem.render(this._elems.childrenContainer);

            window.setTimeout(() => { elem.focus(); }, 300);
        }

        /**
         * _addNewChildListeners
         * ----------------------------------------------------------------------------
         * make sure the child has the appropriate listeners
         */
        protected _addNewChildListeners(child: ArrayChildElement<T>): void {

            // handle when the child is rearranged in the order
            child.addOrderingListener(this);

            // handle the child updating
            formEventHandler.addEventListener(FORM_ELEM_CHANGE,
                {
                    func: (event: FormElemChangeEvent<any>) => {

                        let key: string = event.context.key;
                        if (key !== child.id) { return; }

                        window.setTimeout(() => {
                            this._updateInternalData(true);
                            this._dispatchChangeEvent();
                        }, 0);
                    },
                    uniqueId: this.id + "|" + child.id
                }
            );
        }

        /**
         * _updateInternalData
         * ----------------------------------------------------------------------------
         * Make sure we are aware of the contents of our children
         */
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

         /**
         * save
         * ----------------------------------------------------------------------------
         * Handle saving the section 
         * @param   internalOnly    If true, doesn't do all the updating that would 
         *                          happen on a real save
         * 
         * @returns The data contained in this sections child elements
         */
        public save<K extends keyof T>(internalOnly?: boolean): T[] {

            // save all of the child elements
            this._updateInternalData(internalOnly);

            // return the data that was created
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

        /** 
         * _onClear
         * ----------------------------------------------------------------------------
         * handle clearing out the array 
         */
        protected _onClear(): void {
            this._elems.childrenContainer.innerHTML = "";
            this._children = [];
        }

        /**
         * onChangeOrder
         * ----------------------------------------------------------------------------
         * Make sure we respect the new order of these 
         */
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

        /**
         * focus
         * ----------------------------------------------------------------------------
         * Give focus to the first field in our first child element
         */
        public focus(): boolean {
            if (!this._children) { return false; }
            
            for (let child of this._children) {
                if (!child) { continue; }
                if (child.focus()) { return true; }
            }
            return false; 
        }

        //#endregion

    }
}