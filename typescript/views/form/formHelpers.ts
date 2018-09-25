///<reference path="formElement.ts" />

namespace KIP.Forms {

    export function cloneTemplate<D>(template: IFormElemTemplate<D>) : IFormElemTemplate<D> {
        let temp: IFormElemTemplate<D> = {
            type: template.type,
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
     * Creates a select element with associated options
     * @param id - ID to use for the select element
     * @param cls - the CSS class to use to style this select box
     * @param options - What options should be included in the select box
     * @param defaultSelection - What should be selected by default
     */
    export function createSelectElement(id: string, cls: string, options: ISelectOptions, defaultSelection?: string): HTMLSelectElement {
        let optionElems: IElemDefinition[] = [];
        let optKey: string;

        // turn the option array into something the createElement function will understand
        map(options, (lbl: string, value: string) => {
            let def: IElemDefinition = {
                type: "option",
                attr: {

                    value: value
                },
                content: lbl,
            };
            if (defaultSelection === value) { def.attr.selected = "true"; }
            optionElems.push(def);
        });

        // create the general definition for the select element
        let obj: IElemDefinition = {
            id: id,
            cls: cls,
            type: "select",
            children: optionElems
        };

        // return the created select box
        return createElement(obj) as HTMLSelectElement;
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
     * determine whether a particular parameter is a form element 
     * @param elem - Either a FormElement or a FormTemplate
     * @returns True if elem is a form Element
     */
    export function isFormElement<T>(elem: IFormElemTemplate<T> | FormElement<T>): elem is FormElement<T> {
        if (!elem) { return false; }
        
        return ((elem as FormElement<T>).id !== undefined) && 
            ((elem as FormElement<T>).type !== undefined) &&
            ((elem as FormElement<T>).template !== undefined);
    }

    export function isArrayChildElement<T>(elem: IFormElemTemplate<T> | FormElement<T>): elem is ArrayChildElement<T> {
        if (!elem) { return false; }
        if (isFormElement(elem)) { 
            return (elem.type === FormElementTypeEnum.ARRAY_CHILD);
        }
        return false;
    }
}
