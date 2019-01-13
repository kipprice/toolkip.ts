namespace KIP.Forms {

    /** select-specific template options */
    export interface IFormSelectTemplate extends IFormElemTemplate<number> {
        options: ISelectOptions;
    }
    
    /**----------------------------------------------------------------------------
     * @class SelectElement
     * ----------------------------------------------------------------------------
     * create a dropdown for a form
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class SelectElement extends FormElement<number> {
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.SELECT; }
        protected get _defaultValue(): number { return 0; }
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
        constructor(id: string, template: IFormSelectTemplate | SelectElement) {
            super(id, template);
        }

        /** 
         * _cloneFromFormElement
         * ----------------------------------------------------------------------------
         * Generate a cloned version of this form element
         */
        protected _cloneFromFormElement(data: SelectElement): void {
            super._cloneFromFormElement(data);
            this._options = data._options;
        }

        /**
         * _parseElemTemplate
         * ----------------------------------------------------------------------------
         * Get additional details about how this select field should be set up
         */
        protected _parseElemTemplate(template: IFormSelectTemplate): void {
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
            let value: number = +this._elems.input.value;
            return this._standardValidation(value);
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Generate the cloned select element
         */
        protected _createClonedElement(appendToID: string): SelectElement {
            return new SelectElement(this._id + appendToID, this);
        }
    }
}