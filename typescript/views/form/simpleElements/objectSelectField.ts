namespace KIP.Forms {

    /** represent the objects that will be selectable by this element */
    export interface IObjectSelectOptions<T> {
        [display: string]: T;
    }

    /** select-specific template options */
    export interface IObjectSelectTemplate<T> extends IFieldConfig<T> {
        options: IObjectSelectOptions<T>;
    }

    /** create options that correspond to an object */
    export interface IObjectOption<T> {
        display: string;
        value: T;
    }
    
    /**----------------------------------------------------------------------------
     * @class ObjectSelectField
     * ----------------------------------------------------------------------------
     * create a dropdown for a form
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class ObjectSelectField<M, T extends IObjectSelectTemplate<M>> extends Field<M, T> {
        //.....................
        //#region PROPERTIES
        
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.SELECT; }

        protected get _defaultValue(): M { return null; }

        protected get _defaultCls(): string { return "select"; }

        protected _options: IObjectOption<M>[];

        protected _elems: {
            base: HTMLElement;
            input: HTMLSelectElement;
            lbl: HTMLElement;
        }
        
        //#endregion
        //.....................

        /**
         * _parseFieldTemplate
         * ----------------------------------------------------------------------------
         * Get additional details about how this select field should be set up
         */
        protected _parseFieldTemplate(template: T): void {
            super._parseFieldTemplate(template);

            // parse options into an array instead of a dictionary
            this._options = [];
            KIP.map(template.options, (obj: M, display: string) => {
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
        protected _getValueFromField(): M {
            let idx: string = this._elems.input.value;
            let value = this._options[idx];
            return value;
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Generate the cloned select element
         */
        protected _createClonedElement(appendToID: string): ObjectSelectField<M,T> {
            return new ObjectSelectField(this._id + appendToID, this);
        }
    }
}