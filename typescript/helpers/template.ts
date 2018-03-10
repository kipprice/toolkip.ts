
namespace KIP {

    export type ITemplate = any;    //TODO: actually define

    export enum TemplateTypeEnum {
        FILE = 0,
        TEXT = 1
    };

    export interface ITemplateBase<T> {
        type: TemplateTypeEnum;
        id: string;
        content?: string;
        name?: string
    }

    export interface ITemplateObj<T> {
        structure: any[];
        html: HTMLElement[];
        elems: T;
        suffix: number;
    }

    interface ITemplateStorage {
        [key: string]: ITemplate;
    }

    let templates: ITemplateStorage = {};

    // A templated object allows you to take some HTML pattern and dynamically fill it
    // It is loosely based on the jquery framework of templating
    // If an element does not have an ID, it is not replaceable

    /**
     * Create a templated HTML object
     * @param {object} inObj - All details needed to create the template
     * @param {string} inObj.type - Determines how the contents are loaded. Can be "file" or "text".
     * @param {string} inObj.id - The identifier to save for the template
     * @param {string} [inObj.content] - Contains free-text string for inOBjs of type "text"
     * @param {string} [inObj.name] - Contains the name of the file to load for inObjs of type "file"
     **/
    export function createTemplate<T>(inObj: ITemplateBase<T>): boolean {
        "use strict";
        let content: string;

        if (!inObj.id) { return false; }                // Quit if we don't have an ID for this template
        if (templates[inObj.id]) { return false; }      // Quit if the ID is already taken

        let template: ITemplateObj<T> = {                  // Create the template object
            structure: [],
            html: [],
            elems: {} as T,
            suffix: 0
        };
        
        if (inObj.type === TemplateTypeEnum.FILE) {     // Figure out where the content of the file lives
            loadFile(inObj.name, (data: string ) => {   // Try to load the file if it was passed in instead of a straight HTML string
                processContents(data, template);
            });      
        } else {                                        // Otherwise process the contents immediately
            content = inObj.content;
            processContents(content, template);
        }

        templates[inObj.id] = template;                 // save the template into the collection

    };

    /** parse all pieces of the template */
    function processContents<T>(data: string, template: ITemplateObj<T>): void {
        var temp: HTMLTemplateElement;

        // create the element we store information into
        temp = document.createElement("template");
        temp.innerHTML = data;

        // Loop through the children
        processChildren(temp.content.children, template, "", null);
    }

	/** Loops through children on an element and saves it to the template object we are creating */
    function processChildren<T>(children: HTMLCollection, obj: ITemplateObj<T>, parentID: string, parent: HTMLElement): void {
        let cIdx: number;
        let child: HTMLElement;

        // Quit if we don't have anything to save into
        if (!obj) return;

        // Loop through the children in this parent & add them to the object
        for (cIdx = 0; cIdx < children.length; cIdx += 1) {
            child = (children[cIdx] as HTMLElement);
            processChild(child, parentID, parent, obj);
        }
    }

    /** handle the processing of an individual child */
    function processChild <T> (child: HTMLElement, parentID: string, parent: HTMLElement, template: ITemplateObj<T>) : void {
        let id: string;
        let childClone: HTMLElement;

        childClone = (child.cloneNode() as HTMLElement);            // clone the element

        id = child.getAttribute("id");                              // if there is an ID, add it to the elems array
        if (id) {
            addToElemArray(id, childClone, parentID, template);     // call a helper to add the child
        }
        processChildren(child.children, template, id, childClone);  // Recurse on its children

        // Add it to our clones of the elements
        // If there's a parent element, append it
        if (parent) {
            parent.appendChild(childClone);

        // Otherwise add it to our top-level element array
        } else {
            template.html.push(childClone);
        }
    }

    /** add a particular element to the array of ID'd elements */
    function addToElemArray <T> (id: string, elem: HTMLElement, parentID: string, template: ITemplateObj<T>) : boolean {
        
        // If this is the first element with this ID 
        if (!template.elems[id]) {
            template.elems[id] = elem;
            return true;
        
        // If there is already an element with this id, add the parent ID into the mix
        } else if (parentID) {
            template.elems[parentID + "->" + id] = elem
            return true;
        
        // if there is no spot for this elem, return false;
        } else {
            return false;
        }
    }

    /**
     * Loads a template with the specified data
     * @param {string} id - The identifier of the template to load
     * @param {object} content - An object containing any additional data to load into the template.
     * @param {boolean} [excludeBlank] - If true, any element with an ID in the template that is not populated by 'content' will be removed
     * @param {string} [suffix] - If provided, the suffix added to element IDs to differentiate this iteration of the template. Defaults to the
     *														count of iterations of the template.
     * @param {string} [delim] - If provided, the delimiter between the ID and the delimiter. Defaults to "|".
     * @returns {array} Array of top-level HTML elements in the template
     **/
    export function loadTemplate <T> (id: string, content: T, excludeBlank?: boolean, suffix?: number, delim?: string) {
        "use strict";
        var elem, out, html, prop, pIdx, i, defaults;

        defaults = {};

        // Grab the template & quit if it isn't there
        let template: ITemplateObj<T> = templates[id];
        if (!template) return;

        // Set some defaults
        if (!delim) { delim = "|"; }
        if (!suffix && (suffix !== 0)) { suffix = ++template.suffix; }

        // Loop through each of the pieces in the template
        for (id in template.elems) {
            if (template.elems.hasOwnProperty(id)) {
                elem = template.elems[id];
                defaults[id] = {};

                // If we have data to fill, use it
                if (content[id]) {

                    // String content: just build the element without any id or class changes
                    if (typeof content[id] === typeof "abc") {
                        defaults[id].innerHTML = elem.innerHTML || "";
                        elem.innerHTML = content[id];
                    } else {

                        // Loop through each attribute in the element & set it
                        for (pIdx in content[id]) {
                            if (content[id].hasOwnProperty(pIdx)) {
                                prop = content[id][pIdx];

                                if (pIdx === "innerHTML") {
                                    defaults[id][pIdx] = elem.innerHTML || "";
                                    elem.innerHTML = prop;

                                } else if (pIdx === "value") {
                                    let inputElem: HTMLInputElement = elem as HTMLInputElement;
                                    defaults[id][pIdx] = inputElem.value || "";
                                    inputElem.value = prop;

                                } else {
                                    defaults[id][pIdx] = elem.getAttribute(pIdx) || "";
                                    elem.setAttribute(pIdx, prop);
                                }
                            }
                        }
                    }

                    // Flag elements that should be excluded
                } else if (excludeBlank) {
                    defaults[id].excluded = {
                        parent: elem.parentNode,
                        next: elem.nextSibling
                    }
                    elem.parentNode.removeChild(elem);
                }

                // Even if we don't have content for an element, we need to update the ID
                elem.setAttribute("id", id + delim + suffix);
                defaults[id].id = id;
            }
        }

        // Now loop through the structure & use it to create the output elements
        out = [];

        // Copy HTML elements
        for (i = 0; i < template.html.length; i += 1) {
            out[i] = template.html[i].cloneNode(true);
        }

        // Restore the default values to these elements
        restoreDefaults(template, defaults);

        return out;
    }

    function restoreDefaults <T> (template: ITemplateObj<T>, defaults: any): void {
        let id: string;
        let elem: HTMLElement;

         for (id in template.elems) {
            if (template.elems.hasOwnProperty(id)) {

                elem = template.elems[id];
                // Only do stuff with elements that changed from their default values
                if (defaults[id]) {

                    // Restore any deleted elements
                    if (defaults[id].excluded) {
                        defaults[id].excluded.parent.insertBefore(elem, defaults[id].excluded.next);
                    }

                    // Restore changed properties
                    else {
                        let pIdx: string;

                        for (pIdx in defaults[id]) {
                            if (defaults[id].hasOwnProperty(pIdx)) {


                                if (pIdx === "innerHTML") {
                                    elem.innerHTML = defaults[id][pIdx];
                                } else if (pIdx === "value") {
                                    let inputValue: HTMLInputElement = elem as HTMLInputElement;
                                    inputValue.value = defaults[id][pIdx]
                                } else {
                                    elem.setAttribute(pIdx, defaults[id][pIdx]);
                                }

                            }
                        }
                    }
                }
            }
        }
    }

}