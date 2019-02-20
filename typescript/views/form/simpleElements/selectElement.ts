namespace KIP.Forms {

    /** select-specific template options */
    export interface IFormSelectTemplate<T extends string | number> extends IFormElemTemplate<T> {
        options: ISelectOptions;
    }
    
    /**----------------------------------------------------------------------------
     * @class SelectElement
     * ----------------------------------------------------------------------------
     * create a dropdown for a form with either numeric or string backing data
     * @author  Kip Price
     * @version 2.0.0
     * ----------------------------------------------------------------------------
     */
    export class SelectElement<T extends string | number> extends FormElement<T> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.SELECT; }
        protected get _defaultValue(): T { return null; }
        protected get _defaultCls(): string { return "select"; }
        protected _options: ISelectOptions;

        protected _elems: {
            core: HTMLElement;
            input: HTMLSelectElement;
            lbl: HTMLElement;
        }

        /** 
         * SelectElement
         * ----------------------------------------------------------------------------
         * Create the Select Element
         */
        constructor(id: string, template: IFormSelectTemplate<T> | SelectElement<T>) {
            super(id, template);
        }

        /** 
         * _cloneFromFormElement
         * ----------------------------------------------------------------------------
         * Generate a cloned version of this form element
         */
        protected _cloneFromFormElement(data: SelectElement<T>): void {
            super._cloneFromFormElement(data);
            this._options = data._options;
        }

        /**
         * _parseElemTemplate
         * ----------------------------------------------------------------------------
         * Get additional details about how this select field should be set up
         */
        protected _parseElemTemplate(template: IFormSelectTemplate<T>): void {
            super._parseElemTemplate(template);
            this._options = template.options;
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * Create the elements needed for the select field
         */
        protected _onCreateElements(): void {
            this._elems.input = createSelectElement(this._id, "input", this._options);
            this._createStandardLabel();
            this._handleStandardLayout();
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * manage when details in this select field changed
         */
        protected _onChange(): boolean {
            let v: string = this._elems.input.value;
            let value: T = v as T;
            if (isNumeric(v)) { value = +v as T;}
            return this._standardValidation(value);
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Generate the cloned select element
         */
        protected _createClonedElement(appendToID: string): SelectElement<T> {
            return new SelectElement(this._id + appendToID, this);
        }
    }
}