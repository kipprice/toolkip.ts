namespace KIP.Forms {

    /** represent the objects that will be selectable by this element */
    export interface IObjectSelectOptions<T> {
        [display: string]: T;
    }

    /** select-specific template options */
    export interface IFormObjectSelectTemplate<T> extends IFormElemTemplate<T> {
        options: IObjectSelectOptions<T>;
    }

    /** create options that correspond to an object */
    export interface IObjectOption<T> {
        display: string;
        value: T;
    }
    
    /**----------------------------------------------------------------------------
     * @class ObjectSelectElement
     * ----------------------------------------------------------------------------
     * create a dropdown for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class ObjectSelectElement<T> extends FormElement<T> {
        //.....................
        //#region PROPERTIES
        
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.SELECT; }

        protected get _defaultValue(): T { return null; }

        protected get _defaultCls(): string { return "select"; }

        protected _options: IObjectOption<T>[];

        protected _elems: {
            core: HTMLElement;
            input: HTMLSelectElement;
            lbl: HTMLElement;
        }
        
        //#endregion
        //.....................

        /** 
         * SelectElement
         * ----------------------------------------------------------------------------
         * Create the Select Element
         */
        constructor(id: string, template: IFormObjectSelectTemplate<T> | ObjectSelectElement<T>) {
            super(id, template);
        }

        /** 
         * _cloneFromFormElement
         * ----------------------------------------------------------------------------
         * Generate a cloned version of this form element
         */
        protected _cloneFromFormElement(data: ObjectSelectElement<T>): void {
            super._cloneFromFormElement(data);
            this._options = data._options;
        }

        /**
         * _parseElemTemplate
         * ----------------------------------------------------------------------------
         * Get additional details about how this select field should be set up
         */
        protected _parseElemTemplate(template: IFormObjectSelectTemplate<T>): void {
            super._parseElemTemplate(template);

            // parse options into an array instead of a dictionary
            this._options = [];
            KIP.map(template.options, (obj: T, display: string) => {
                this._options.push({
                    display: display,
                    value: obj
                });
            })
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * Create the elements needed for the select field
         */
        protected _onCreateElements(): void {

            // map the objects to the index in which they are stored
            let slimOptions: ISelectOptions = {};
            for (let oIdx = 0; oIdx < this._options.length; oIdx += 1) {
                let o = this._options[oIdx];
                slimOptions[oIdx] = o.display;
            }

            // create a standard select element
            this._elems.input = createSelectElement(this._id, "input", slimOptions);
            this._createStandardLabel();
            this._handleStandardLayout();
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * manage when details in this select field changed
         */
        protected _onChange(): boolean {
            let idx: string = this._elems.input.value;
            let value = this._options[idx];
            return this._standardValidation(value);
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Generate the cloned select element
         */
        protected _createClonedElement(appendToID: string): ObjectSelectElement<T> {
            return new ObjectSelectElement(this._id + appendToID, this);
        }
    }
}