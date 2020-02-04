///<reference path="_field.ts" />

namespace KIP.Forms {

    export function cloneTemplate<D>(template: IFieldConfig<D>): IFieldConfig<D> {
        let temp: IFieldConfig<D> = {
            value: template.value,
            position: template.position,
            required: template.required,

            onValidate: template.onValidate,
            onOtherChange: template.onOtherChange,

            label: template.label,
            cls: template.cls,
            layout: template.layout
        };

        return temp;
    }

    /**
     * createSelectElement
     * ----------------------------------------------------------------------------
     * Creates a select element with associated options
     * @param id - ID to use for the select element
     * @param cls - the CSS class to use to style this select box
     * @param options - What options should be included in the select box
     * @param defaultSelection - What should be selected by default
     * 
     * @version 1.0.2
     */
    export function createSelectElement(id: string, cls: string, options: ISelectOptions, defaultSelection?: string | number): HTMLSelectElement {
       
        // turn the option array into something the createElement function will understand
        let optionElems = createSelectOptions(options, defaultSelection);

        // if there's no default, set the default to be -1
        if (isNullOrUndefined(defaultSelection)) { defaultSelection = -1; }

        // create the general definition for the select element
        let select: HTMLSelectElement = createElement({
            id: id,
            cls: cls,
            type: "select",
            children: optionElems
        }) as HTMLSelectElement;

        if (!isNullOrUndefined(defaultSelection)) {
            select.value = defaultSelection.toString();
        }

        // return the created select box
        return select;
    }

    /**
     * createSelectOptions
     * ----------------------------------------------------------------------------
     * create options that will sit in a select element
     */
    export function createSelectOptions(options: ISelectOptions, defaultSelection?: string | number): HTMLOptionElement[] {
        let optElems: HTMLOptionElement[] = [];

        // if there's no default, add a default blank option before anything else
        if (isNullOrUndefined(defaultSelection)) {
            let def: IElemDefinition = _createSelectOption("-- select an option --", -1, true);
            def.attr.disabled = "true";
            optElems.push(createElement(def) as HTMLOptionElement);
        }

        map(options, (lbl: string, value: string) => {
            let def: IElemDefinition = _createSelectOption(lbl, value, value === defaultSelection);
            optElems.push(createElement(def) as HTMLOptionElement);
        });
        
        return optElems;
    }

    /**
     * _createSelectOption
     * ----------------------------------------------------------------------------
     * Create a single select option
     * 
     * @param   label       Label to show for the option
     * @param   value       Value the option is linked to
     * @param   isDefault   True if the option should be selected by default
     * 
     * @returns The definition that will create this option
     */
    function _createSelectOption(label: string, value: string | number, isDefault?: boolean): IElemDefinition {
        let def: IElemDefinition = {
            type: "option",
            attr: {
                value: value
            },
            content: label
        };
        if (isDefault) { def.attr.selected = "true"; }
        return def;
    }

    export interface ICheckboxElems {
        wrapper: HTMLElement,
        checkbox: HTMLInputElement
    };

    /**
     * Creates a checkbox element & a wrapper around it
     * @param id - ID to use for the checkbox
     * @param cls - the CSS class to style this checkbox
     * @param lbl - What label to use for this checkbox
     * @param checked - True if the checkbox should be checked
     */
    export function createLabeledCheckbox(id: string, cls?: string, lbl?: string, checked?: boolean): ICheckboxElems {

        // create the wrapper to hold the checkbox + label
        let wrapperElem: HTMLElement = createSimpleElement(id + "|wrapper", cls + "|wrapper");

        // create the checkbox itself
        let checkboxDef: IElemDefinition = {
            type: "input",
            id: id,
            cls: cls,
            attr: {
                type: "checkbox",
                checked: checked.toString(),
                name: id
            },
            parent: wrapperElem
        };
        let checkboxElem: HTMLInputElement = createElement(checkboxDef) as HTMLInputElement;

        // create the label for the checkbox
        let lblElem: HTMLElement = createSimpleElement("", cls + "|lbl", lbl, { for: id }, null, wrapperElem);

        // return the wrapper + the checkbox
        return {
            wrapper: wrapperElem,
            checkbox: checkboxElem
        };
    }

    /** creates a label that will be clickable to select an associated input */
    export function createLabelForInput(lbl: string, labelFor: string, cls?: string, embedIn?: HTMLElement, attr?: IAttributes): HTMLLabelElement {
        if (!attr) { attr = {}; }

        attr.for = labelFor;

        let lblElement: HTMLLabelElement = createElement({
            type: "label",
            cls: cls,
            attr: attr,
            content: lbl,
            parent: embedIn
        }) as HTMLLabelElement;

        return lblElement;
    }

    export function createRadioButtons(): void {
        //TODO: IMPLEMENT
    }

    /**
     * Create an input element
     * @param id 
     * @param cls 
     * @param type 
     * @param value 
     * @param attr 
     * @param children 
     * @param parent 
     */
    export function createInputElement(id: string, cls: string, type: string, value?: any, attr?: IAttributes, children?: IChildren, parent?: HTMLElement): HTMLInputElement {

        let elemType: string = "input";

        // handle the type
        type = type.toLowerCase();
        if (type === "textarea") {
            type = "";
            elemType = "textarea";
        }

        // update the attribute array
        attr = attr || {};
        attr.type = type;
        if (value) {
            if (type === "checkbox" || type === "radio") {
                attr.checked = value;
            } else if (type === "date") {
                attr.value = Dates.inputDateFmt(value as Date);
            } else {
                attr.value = value;
            }
        }

        // create the appropriate element
        let elem: HTMLInputElement = createElement({
            type: elemType,
            id: id,
            cls: cls,
            attr: attr,
            children: children,
            parent: parent
        }) as HTMLInputElement;

        // return the element
        return elem;
    }

    /** 
     * isField
     * ----------------------------------------------------------------------------
     * determine whether a particular parameter is a form element 
     * @param elem - Either a FormElement or a FormTemplate
     * @returns True if elem is a form Element
     */
    export function isField<T>(elem: IFieldConfig<T> | Field<T> | IFields<any> ): elem is Field<T> {
        if (!elem) { return false; }

        return ((elem as Field<T>).id !== undefined) &&
            ((elem as Field<T>).type !== undefined) &&
            ((elem as Field<T>).template !== undefined);
    }

    export function isArrayChildElement<T>(elem: IFieldConfig<T> | Field<T>): elem is ArrayChildField<T> {
        if (!elem) { return false; }
        if (isField(elem)) {
            return (elem.type === FieldTypeEnum.ARRAY_CHILD);
        }
        return false;
    }
}
