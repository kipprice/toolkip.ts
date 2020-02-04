namespace KIP.Forms {

    /** select-specific template options */
    export interface ISelectFieldTemplate<T extends string | number> extends IFieldConfig<T> {
        options: ISelectOptions;
    }
    
    /**----------------------------------------------------------------------------
     * @class SelectField
     * ----------------------------------------------------------------------------
     * create a dropdown for a form with either numeric or string backing data
     * @author  Kip Price
     * @version 2.0.0
     * ----------------------------------------------------------------------------
     */
    export class SelectField<M extends string | number, T extends ISelectFieldTemplate<M> = ISelectFieldTemplate<M>> extends Field<M, T> {
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.SELECT; }
        protected get _defaultValue(): M { return null; }
        protected get _defaultCls(): string { return "select"; }
        protected _options: ISelectOptions;

        protected _elems: {
            base: HTMLElement;
            input: HTMLSelectElement;
            lbl: HTMLElement;
        }

        /**
         * _parseFieldTemplate
         * ----------------------------------------------------------------------------
         * Get additional details about how this select field should be set up
         */
        protected _parseFieldTemplate(template: T): void {
            super._parseFieldTemplate(template);
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
        protected _getValueFromField(): M {
            let v: string = this._elems.input.value;
            let value: M = v as M;
            if (isNumeric(v)) { value = +v as M;}
            return value;
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Generate the cloned select element
         */
        protected _createClonedElement(appendToID: string): SelectField<M,T> {
            return new SelectField(this._id + appendToID, this);
        }
    }
}