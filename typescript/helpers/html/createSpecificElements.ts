namespace KIP {
    /**
     * createSimpleLabeledElement
     * ----------------------------------------------------------------------------
     * Create an element and an associated label
     * 
     * @param   id        ID to use for the labeled elem container
     * @param   cls       CSS class to use for the 
     * @param   lbl       Text of the label
     * @param   content   Content of the element that is being labeled
     * @param   children  Any additional child elements
     * @param   parent    The node this element should be added to
     * @param   skipZero  True if we should not draw anything if the content is 0
     *
     * @returns The created element + label
     * 
     */
    export function createSimpleLabeledElement(id: string, cls: string, lbl: string, content: any, attr: IAttributes, children: IChildren, parent: HTMLElement, skipZero: boolean): HTMLElement {
        ;
        let obj: any;
        let cLbl: any;
        let cContent: any;

        if (content === undefined || content === null) return;
        if ((typeof content === typeof "string") && (trim(content).length === 0)) {
            return;
        }
        if (skipZero && content === 0) { return; }
        // Create the wrapper
        obj = {};
        obj.id = id;
        obj.type = "div";
        obj.cls = cls;
        obj.attr = attr;
        obj.children = children;
        obj.parent = parent;

        // Create the label
        cLbl = {
            cls: "lbl",
            content: lbl,
            type: "span"
        };

        // Create the content
        cContent = {
            cls: "content",
            content: content,
            type: "span"
        };

        obj.children = [cLbl, cContent];

        return createElement(obj) as HTMLElement;
    };

    export interface ILabeledElement {
        data: HTMLElement;
        lbl: HTMLElement;
        wrapper: HTMLElement;
    }

    /**
     * createLabeledElement
     * ----------------------------------------------------------------------------
     * Create an element along with a label
     * 
     * @param   dataElem    Specs by which the data element should be created
     * @param   labelElem   Specs by which the label element should be created
     * 
     * @returns The labeled element
     * 
     */
    export function createLabeledElement(dataElem: IElemDefinition, labelElem: IElemDefinition): ILabeledElement {
        // quit if the 
        if (!dataElem || !labelElem) { return; }

        // create the actual element
        let data: HTMLElement = createElement(dataElem) as HTMLElement;

        // create the labeled element
        labelElem.cls = Styles.buildClassString(labelElem.cls as string, "lbl");
        let lbl: HTMLElement = createElement(labelElem) as HTMLElement;

        // craete the wrapper element
        let container: HTMLElement = createElement({ cls: "wrapper", children: [lbl, data] }) as HTMLElement;

        return {
            data: data,
            lbl: lbl,
            wrapper: container
        };
    }
}