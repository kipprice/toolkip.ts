/// <reference path="./sectionField.ts" />

namespace KIP.Forms {

    export interface IFormArrayTemplate<T> extends IFormCollapsibleTemplate<T[]> {
        newLabel?: string;
        allowReordering?: boolean;
    }

    export enum DirectionType {
        FORWARD = 1,
        BACKWARD = -1,
        MOVE = 0
    }

    /**----------------------------------------------------------------------------
     * @class ArrayField
     * ----------------------------------------------------------------------------
     * Create an element in the form that can be added to
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class ArrayField<M, T extends IFormArrayTemplate<M> = IFormArrayTemplate<M>> extends CollapsibleField<M[], T> {

        //.....................
        //#region PROPERTIES

        protected get _type(): FieldTypeEnum { return FieldTypeEnum.ARRAY; }
        protected get _defaultValue(): M[] { return []; }
        protected get _defaultCls(): string { return "array"; }
        protected _data: M[];


        protected _childTemplate: IFields<M> | Field<M>;
        public get childTemplate(): IFields<M> | Field<M> { return this._childTemplate; }

        protected _children: Field<M>[];

        /** elements contained within the array element */
        protected _elems: {
            base: HTMLElement;
            title: HTMLElement;
            collapseElem?: HTMLElement;
            titleContainer?: HTMLElement;
            childrenContainer: HTMLElement;
            newButton: HTMLElement;
        }

        /** what to label the new button */
        protected _newLabel: string;

        /** if true, allows card to be rearranged  */
        protected _allowReordering: boolean;

        //#endregion
        //.....................

        //..................
        //#region STYLES

        protected static _uncoloredStyles: Styles.IStandardStyles = {

            ".kipFormElem.array": {
                nested: {
                    "> .formChildren": {
                        // display: "flex",
                        // flexWrap: "wrap",
                        // alignItems: "top"

                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gridColumnGap: "10px",
                        gridRowGap: "10px"

                    },

                    ".array .formChildren": {
                        gridTemplateColumns: "100%"
                    },


                    "&.collapsed": {
                        nested: {
                            ".kipBtn.new": {
                                display: "none"
                            }
                        }
                    },

                    ".arrayChild.new": {
                        border: "1px dashed <formSubTheme>",
                        cursor: "pointer",
                        opacity: "0.5",
                        backgroundColor: "#FFF",
                        fontSize: "1.3em",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "<formSubTheme>",

                        userSelect: "none",
                        webkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",

                        nested: {
                            ".mobile &": {
                                width: "calc(100% - 20px)"
                            },

                            "&:hover": {
                                opacity: "1"
                            }
                        }
                    }
                }
            }
        };

        protected _getUncoloredStyles(): Styles.IStandardStyles {
            return this._mergeThemes(ArrayField._uncoloredStyles, CollapsibleField._uncoloredStyles, Field._uncoloredStyles);
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
                if (isField(this._childTemplate)) {
                    this._childTemplate.setThemeColor(uniqueId, color, noReplace);
                } else {
                    map(this._childTemplate, (child: Field<any>) => {
                        child.setThemeColor(uniqueId, color, noReplace);
                    });
                }
            }

            map(this._children, (child: Field<any>) => {
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
        constructor(id: string, template: T | ArrayField<M, T>, children?: IFields<M> | Field<M>) {
            super(id, template);

            // copy old template over from an existing element
            if (isField(template)) { this._childTemplate = (template as ArrayField<M, T>).childTemplate; }

            // otherwise, use the children passed in as our template
            else { this._childTemplate = children; }

            // create the children array; this will be parsed after elements are created
            this._children = [];
        }

        /**
         * _parseFieldTemplate
         * ----------------------------------------------------------------------------
         * Parse the details of our own template
         */
        protected _parseFieldTemplate(template: T): void {
            super._parseFieldTemplate(template);

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
            this._elems.childrenContainer = createElement({ cls: "formChildren", parent: this._elems.base });
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
                cls: "arrayChild new",
                content: this._newLabel,
                parent: this._elems.childrenContainer,
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
        protected _createClonedElement(appendToID: string): ArrayField<M, T> {
            return new ArrayField<M, T>(this._id + appendToID, this);
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
        protected _getValueFromField(): M[] {
            return this._data;
        }

        /** 
         * update
         * ----------------------------------------------------------------------------
         * handle when an external force needs to update the form 
         */
        public update(data: M[], allowEvents: boolean): void {
        
            // First clear out the existing data
            this.clear();

            // quit if there's no other data to add
            if (!data) { return; }

            // recreate the children
            data.map((elem: M) => {
                let child: ArrayChildField<M> = this._createNewChild();
                child.update(elem, allowEvents);
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
        protected _createNewChild(): ArrayChildField<M> {
            let elem: ArrayChildField<M> = this._generateChildElement();
            this._addNewChildListeners(elem);
            this._finalizeNewChild(elem);
            return elem;
        }

        /**
         * _generateChildElement
         * ----------------------------------------------------------------------------
         * generate a new child array element
         */
        protected _generateChildElement(): ArrayChildField<M> {
            let idx: number = this._children.length;
            let elem: ArrayChildField<M>;

            // if this is already an element, just clone it
            if (isArrayChildElement(this._childTemplate)) {
                elem = this._cloneFormElement(this._childTemplate, this._id + "|" + idx.toString()) as ArrayChildField<M>;

            // otherwise, spin up a new child altogether
            } else {
                elem = new ArrayChildField(this._id + "|" + idx.toString(), this._childTemplate, { allowReordering: this._allowReordering });
            }
            return elem;
        }

        /**
         * _finalizeNewChild
         * ----------------------------------------------------------------------------
         * add the created child to our style map and our children
         */
        protected _finalizeNewChild(elem: ArrayChildField<M>): void {
            this._applyColors(elem);
            this._children.push(elem);

            removeElement(this._elems.newButton);
            elem.draw(this._elems.childrenContainer);
            this._elems.childrenContainer.appendChild(this._elems.newButton);

            window.setTimeout(() => { elem.focus(); }, 300);
        }

        /**
         * _addNewChildListeners
         * ----------------------------------------------------------------------------
         * make sure the child has the appropriate listeners
         */
        protected _addNewChildListeners(child: ArrayChildField<M>): void {

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
                            this._dispatchChangeEvent(child.id);
                        }, 0);
                    },
                    uniqueId: this.id + "|" + child.id,
                    target: child
                }
            );
        }

        /**
         * _updateInternalData
         * ----------------------------------------------------------------------------
         * Make sure we are aware of the contents of our children
         */
        protected async _updateInternalData(internalOnly?: boolean): Promise<any> {
            let data = [];
            let cnt: number = 0;

            let p: Promise<any>[] = [];
            for (let elem of this._children) {
                p.push(this._updateInternalField(elem, data, internalOnly));
            }
            await Promise.all(p);
            
            return data;
        }

        protected async _updateInternalField(elem: Field<M>, data: M[], internalOnly?: boolean): Promise<any> {
            if (isNullOrUndefined(elem)) { return Promise.resolve(); }

            let childData: any = await elem.save(internalOnly);
            if (isNullOrUndefined(childData)) { return Promise.resolve(); }
            
            data.push(childData);
        }


        //#endregion

        //...............................................................
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
        public async save<K extends keyof M>(internalOnly?: boolean): Promise<M[]> {

            // save all of the child elements
            this._data = await this._updateInternalData(internalOnly);

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
        public canSave<K extends keyof M>(): ICanSaveTracker {
            let canSave: ICanSaveTracker = {
                hasErrors: false,
                hasMissingRequired: false
            };
            map(
                this._children,
                (child: Field<M[K]>) => {
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
        public clear(): void {
            this._elems.childrenContainer.innerHTML = "";
            this._children = [];
        }

        /**
         * onChangeOrder
         * ----------------------------------------------------------------------------
         * Make sure we respect the new order of these 
         */
        public onChangeOrder(child: ArrayChildField<M>, direction: DirectionType, moveTo?: number): void {

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
            let nextSibling: Element = this._elems.childrenContainer.children[nextIdx + (direction === DirectionType.FORWARD ? 1 : 0)];
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
        //...............................................................

        //..........................................
        //#region GET ELEMENTS AFTER CREATION
        
        public getField(id: string): Field<any> {

            // first check this element
            if (id === this._id) { return this; }
            
            // then check child elements
            let result: Field<any>;
            for (let c of this._children) {
                if (result) { break; }
                result = c.getField(id);
            }
            return result;
        }
        
        //#endregion
        //..........................................

    }
}