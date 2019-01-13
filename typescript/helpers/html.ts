/// <reference path="./styles.ts" />
/// <reference path="./css.ts" />
/// <reference path="./objects.ts" />

namespace KIP {

    export type IAttribute = IKeyValPair<string> | string | number;
    export interface IAttributes {
        [key: string]: IAttribute;
    }

    export type IChild = StandardElement | IElemDefinition;
    export type IChildren = IChild[];

    export interface IClasses {
        [key: string]: IClassDefinition | IKeyValPair<string>[];
    }

    export interface IClassDefinition {
        [key: string]: string;
    }

    /**...........................................................................
     * IElemDefinition
     * ...........................................................................
     * Interface for how elements are created
     * @version 1.2
     * ...........................................................................
     */
    export interface IElemDefinition {

        /** unique key for this element; used to return an element */
        key?: string;

        /** Id to use for the element */
        id?: string;

        /** CSS class to use for the element */
        cls?: string | IClasses;

        /** the type of HTML element we are creating */
        type?: "div" | "span" | "input" | "select" | "option" | "textarea" | "li" | "ul" | "p" | "br" | string;

        /** content that should be added to the element */
        content?: string;

        /** content that should specifically be added before the children of this element */
        before_content?: string;

        /** content that should specifically be added after the children of this element */
        after_content?: string;

        /** any additional attributes that should be applied to this element */
        attr?: IAttributes;

        /** any specific styles to apply to this element */
        style?: Styles.TypedClassDefinition;

        /** any children that should be added for this element */
        children?: IChildren;

        /** the parent element that this should be added to */
        parent?: StandardElement;

        /** allow callers to add event listeners while creating elements */
        eventListeners?: IEventListeners;

        /** if we're creating a namespaced element, allow for specifying it */
        namespace?: string;

        /** determine whether this element should be able to receive focus */
        focusable?: boolean;

        /** allow HTML contents to be bound dynamically */
        boundContent?: BoundEvalFunction<string>;

        /** builds a custom tooltip in lieu of the standard title */
        tooltip?: string;
    }

    /**
     * keep track of event listeners of a particular type
     */
    export type IEventListeners = {
        [key in keyof WindowEventMap]?: EventListener;
    }

    //#endregion

    //#region PUBLIC FUNCTIONS FOR CREATING ELEMENTS

    /**...........................................................................
     * CreateSimpleElement
     * ...........................................................................
     * Creates a div element with the provided id, class, content, and attributes.
     *
     * @param {string} id - The ID to assign the element {optional}
     * @param {string} cls - The class to assign the element {optional}
     * @param {string} content - What to include as the contents of the div {optional}
     * @param {arr} attr - An array of key-value pairs that sets all other attributes for the element
     *
     * @return {HTMLElement} The created element, with all specified parameters included.
     * ...........................................................................
     */
    export function createSimpleElement(id?: string, cls?: string | IClasses, content?: string, attr?: IAttributes, children?: IChildren, parent?: HTMLElement) {
        let obj: IElemDefinition;

        obj = {};
        obj.id = id;              // Set the element's ID
        obj.type = "div";         // Set the type of element to create
        obj.content = content;    // Set what the content of the element should be
        obj.cls = cls;            // Set the appropriate CSS class for the element
        obj.attr = attr;          // Set a list of attributes for the element
        obj.children = children;  // Attach children to to the element
        obj.parent = parent;      // Attach the created element to the appropriate parent

        // Use our standard function for creating elements
        return createElement(obj);
    };

    /**
     * createElement
     * ---------------------------------------------------------------------------
     * Creates an HTML element with the attributes that are passed in through the
     * object.
     *
     * @param   obj             The object to base the element off of
     * @param   [keyedElems]    If provided, the elements that were created with a key
     * 
     * @returns The HTML element with all attributes specified by the object
     */
    export function createElement(obj: IElemDefinition, keyedElems?: KIP.IDictionary<HTMLElement>): HTMLElement {
        if (!obj) { return; }
        return _createElementCore(obj) as HTMLElement;
    }

    /**
     * createSVGElement
     * ---------------------------------------------------------------------------
     * create a SVG element specifically
     */
    export function createSVGElement(obj: IElemDefinition, keyedElems?: KIP.IDictionary<SVGElement>): SVGElement {
        if (!obj) { return; }
        if (!obj.namespace) { obj.namespace = "http://www.w3.org/2000/svg"; }
        return _createElementCore(obj) as SVGElement;
    }


    //...................................................
    //#region INTERNAL FUNCTIONS FOR CREATING ELEMENTS

    /**
     * _createElementCore
     * ---------------------------------------------------------------------------
     * create a DOM element with the specified details
     */
    function _createElementCore(obj: IElemDefinition, keyedElems?: KIP.IDictionary<StandardElement>): StandardElement {

        let elem = _createStandardElement(obj);

        // set attributes of the element
        _setElemIdentfiers(elem, obj, keyedElems);
        _setElemClass(elem, obj);
        _setElemAttributes(elem, obj);
        _setElemStyle(elem, obj);
        _setEventListeners(elem, obj);
        _setKipTooltip(elem, obj);

        // set content of the element
        _setElemBaseContent(elem, obj);
        _addElemChildren(elem, obj, keyedElems);
        _setElemPostChildrenContent(obj, elem);

        // append the element to an appropriate parent
        _appendElemToParent(obj, elem);

        return elem;
    }

    /**
     * _createStandardElement
     * ---------------------------------------------------------------------------
     * create the approproate type of element
     */
    function _createStandardElement(obj: IElemDefinition): StandardElement {
        let elem: StandardElement;
        let type = obj.type || "div";

        if (obj.namespace) {
            elem = document.createElementNS(obj.namespace, type) as StandardElement;
        } else {
            elem = document.createElement(type);
        }

        return elem;
    }

    /**
     * _setElemIdentifiers
     * ---------------------------------------------------------------------------
     * assign an ID to this element, and add it to the keyed array if appropriate
     */
    function _setElemIdentfiers(elem: StandardElement, obj: IElemDefinition, keyedElems?: IDictionary<StandardElement>): void {
        // set the id on the newly created object
        if (obj.id) { elem.setAttribute("id", obj.id); }

        // if there is a key, add this element to the keyed elements
        if (obj.key && keyedElems) { keyedElems[obj.key] = elem; }
    }

    /**
     * _setElemClass
     * ---------------------------------------------------------------------------
     * set the CSS class of this element (including creating it if it doesn't
     * exist)
     */
    function _setElemClass(elem: StandardElement, obj: IElemDefinition): void {
        if (!obj.cls) { return; }

        // Check that the class is a string before setting it
        if (typeof obj.cls === typeof "string") {
            elem.setAttribute("class", obj.cls as string);

            // If it's an object, we need to create the class(es) first
        } else if (typeof obj.cls === "object") {
            map(obj.cls as IClasses, (value: IClassDefinition, selector: string) => {
                createClass(selector, value);
                addClass(elem, selector);
            });
        }

    }

    //...................................................
    //#region ATTRIBUTE SPECIFIC
    
    /**
     * _setElemAttributes
     * ---------------------------------------------------------------------------
     * set any additional attributes for the element that aren't defined as common
     * enough to be on the base elem definition
     */
    function _setElemAttributes(elem: StandardElement, obj: IElemDefinition): void {

        // if we don't have an attributes array, we want one
        if (!obj.attr) { obj.attr = {}; }

        // handle accessibility on elements that can be selected
        if (_isFocusable(obj)) { obj.focusable = true; }
        if (_needsTabIndex(obj)) { obj.attr.tabindex = 0; }

        // loop over all of the attributes
        map(obj.attr, (value: IAttribute, key: string) => {
            if (isNullOrUndefined(value)) { return; }

            if ((value as IKeyValPair<string>).key) {
                let pair: IKeyValPair<string> = value as IKeyValPair<string>;
                _setElemAttribute(elem, pair.key, pair.val);
            } else {
                _setElemAttribute(elem, key, value);
            }

        });
    }

    /**
     * _isFocusable
     * ---------------------------------------------------------------------------
     * checks if this element should be able to receive focus
     */
    function _isFocusable(obj: IElemDefinition): boolean {
        if (!isNullOrUndefined(obj.focusable)) { return obj.focusable; }
        if (!obj.eventListeners) { return false; }
        if (!obj.eventListeners.click) { return false; }
        return true;
    }

    /**
     * _needsTabIndex
     * ---------------------------------------------------------------------------
     * check if this element should be getting a tab index value
     */
    function _needsTabIndex(obj: IElemDefinition): boolean {
        if (!_isFocusable(obj)) { return false; }
        if (obj.attr.tabIndex) { return false; }
        return true;
    }

    /**
     * _setElemAttribute
     * ---------------------------------------------------------------------------
     * sets the actual contents of a particular attribute
     */
    function _setElemAttribute(elem: StandardElement, key: string, value: any): void {

        switch (key) {

            // value gets special handling
            case "value":
                (elem as HTMLInputElement).value = (value as string);
                break;

            // everything else goes through set attribute
            default:
                elem.setAttribute(key, (value as string));
                break;
        }
    }
    
    //#endregion
    //...................................................

    /**
     * _setElemStyle
     * ---------------------------------------------------------------------------
     * set the appropriate element-level styles for this element
     */
    function _setElemStyle(elem: StandardElement, obj: IElemDefinition): void {
        if (!obj.style) { return; }

        map(obj.style, (val: any, key: string) => {
            elem.style[key] = val;
        });
    }

    /**
     * _setEventListeners
     * ---------------------------------------------------------------------------
     * go through any registered event listeners on this element and assign them
     */
    function _setEventListeners(elem: StandardElement, obj: IElemDefinition): void {
        if (!obj.eventListeners) { return; }

        // if this is an accessible object and it can take focus, add keybaord listeners too
        if (obj.focusable && obj.eventListeners.click && !obj.eventListeners.keypress) {
            obj.eventListeners.keypress = (e: KeyboardEvent) => {
                if (e.keyCode !== 13 && e.keyCode !== 32) { return; }
                obj.eventListeners.click(e);
                e.preventDefault();
            }
        }

        // loop through all listeners to add them to the element
        map(obj.eventListeners, (listener: EventListener, key: keyof WindowEventMap) => {
            elem.addEventListener(key, listener);
        });

    }

    /**
     * _setKipTooltip
     * ---------------------------------------------------------------------------
     * set a more UI-focused tooltip on a particular element
     */
    function _setKipTooltip(elem: StandardElement, obj: IElemDefinition): void {
        if (!obj.tooltip) { return; }

        new Tooltip({ content: obj.tooltip }, elem as HTMLElement);
    }

    /**
     * _setElemBaseContent
     * ---------------------------------------------------------------------------
     * set the initial content of the element, which will be rendered before any
     * children are added
     */
    function _setElemBaseContent(elem: StandardElement, obj: IElemDefinition): void {

        // Set the first bit of content in the element (guaranteed to come before children)
        if (obj.before_content) { elem.innerHTML = obj.before_content; }

        // Also check for just plain "Content"
        if (obj.content) { elem.innerHTML += obj.content; }

        // also check for bound content; if we find it, add our own content updater
        if (obj.boundContent) {
            elem.innerHTML = bind(obj.boundContent, (newVal: string) => {
                elem.innerHTML = newVal;
            });
        }
    }

    /**
     * _addElemChildren
     * ---------------------------------------------------------------------------
     * add any appropriate children to this element
     */
    function _addElemChildren(elem: StandardElement, obj: IElemDefinition, keyedElems?: IDictionary<StandardElement>): void {
        if (!obj.children) { return; }

        // loop through each child
        for (let c of obj.children) {

            // make sure there is a child
            if (!c) {
                console.warn("cannot append non-existent child element");
                continue;
            }

            // if the child is already an element, just add it
            if ((c as HTMLElement).setAttribute) {
                elem.appendChild(c as HTMLElement);

                // otherwise, recurse to create this child
            } else {
                let def: IElemDefinition = c as IElemDefinition;
                if (obj.namespace) { def.namespace = obj.namespace; }
                let child = _createElementCore(def, keyedElems);
                elem.appendChild(child);
            }


        }

    }

    /**
     * _setElemPostChildrenContent
     * ---------------------------------------------------------------------------
     * if there is content specified after children, set it here
     */
    function _setElemPostChildrenContent(obj: IElemDefinition, elem: StandardElement): void {
        if (!obj.after_content) { return; }
            
        elem.innerHTML += obj.after_content;
    }

    /**
     * _appendElemToParent
     * ---------------------------------------------------------------------------
     * add this element to a parent element
     */
    function _appendElemToParent(obj: IElemDefinition, elem: StandardElement): void {
        if (!obj.parent) { return; }
        
        obj.parent.appendChild(elem);
    }

    

    //#endregion
    //...................................................

    /**...........................................................................
     * createSimpleLabeledElement
     * ...........................................................................
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
     * ...........................................................................
     */
    export function createSimpleLabeledElement(id: string, cls: string, lbl: string, content: any, attr: IAttributes, children: IChildren, parent: HTMLElement, skipZero: boolean): HTMLElement {
        "use strict";
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

    /**...........................................................................
     * createLabeledElement
     * ...........................................................................
     * Create an element along with a label
     * 
     * @param   dataElem    Specs by which the data element should be created
     * @param   labelElem   Specs by which the label element should be created
     * 
     * @returns The labeled element
     * ...........................................................................
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

    //....................................
    //#region CALCULATE OFFSET FUNCTIONS

    /**...........................................................................
     * GlobalOffsetLeft
     * ...........................................................................
     * Gets the offset left of this element in reference to the entire page
     *
     * @param   elem    The element to get the offset of
     * @param   parent  The parent element to use as the reference. If not 
     *                  included, it uses the document.body as the reference
     *
     * @returns The global offset of the elememt from the left of the page (or 
     *          parent, if included)
     * ...........................................................................
     */
    export function globalOffsetLeft(elem: HTMLElement, parent?: HTMLElement, useStandardParent?: boolean): number {
        return _auxGlobalOffset(elem, "offsetLeft", parent, useStandardParent);
    };

    /**...........................................................................
     * GlobalOffsetTop
     * ...........................................................................
     * Gets the offset top of this element in reference to the entire page
     *
     * @param   elem   The element to get the offset of
     * @param   parent The parent element to use as the reference. If not 
     *                 included, it uses the document.body as the reference 
     *
     * @returns The global offset of the elememt from the top of the page (or 
     *          parent, if included)
     * ...........................................................................
     */
    export function globalOffsetTop(elem: HTMLElement, parent?: HTMLElement, useStandardParent?: boolean): number {
        return _auxGlobalOffset(elem, "offsetTop", parent, useStandardParent);
    };

    /**...........................................................................
     * GlobalOffsets
     * ...........................................................................
     * Gets both the left and top offset
     *
     * @param   elem    The element to get the offsets for
     * @param   parent  The element to use as the reference frame
     *
     * @returns Object with the keys "left" and "top"
     * ...........................................................................
     */
    export function globalOffsets(elem: HTMLElement, parent?: HTMLElement, useStandardParent?: boolean): { left: number, top: number } {
        "use strict";
        return {
            left: globalOffsetLeft(elem, parent, useStandardParent),
            top: globalOffsetTop(elem, parent, useStandardParent)
        };
    };

    /**...........................................................................
     *  _auxGlobalOffset
     * ...........................................................................
     * Helper function to get a global offset
     *
     * @param   elem    The element to get the global offset for
     * @param   type    The type of offset we should look at (either "offsetTop"
     *                  or "offsetWidth")
     * @param   parent  The parent to use as the reference frame. Uses document.
     *                  body by default {optional}
     *
     * @return The specified offset for the element
     * ...........................................................................
     */
    function _auxGlobalOffset(elem: HTMLElement, type: string, parent?: HTMLElement, useStandardParent?: boolean): number {
        let offset: number = 0;

        // Recursively loop until we no longer have a parent
        while (elem && (elem !== parent)) {
            if (elem[type]) {
                offset += elem[type];
            }

            if (useStandardParent) {
                elem = elem.parentNode as HTMLElement;
            } else {
                elem = <HTMLElement>elem.offsetParent;
            }
        }

        return offset;
    };

    //#endregion
    //....................................

    //..........................................
    //#region RELATIVE TO OTHER ELEM FUNCTIONS

    /**...........................................................................
     * findCommonParent
     * ...........................................................................
     * Finds the closest shared parent between two arbitrary elements
     *
     * @param   elem_a    The first element to find the shared parent for
     * @param   elem_b    The second element to find the shared parent for
     *
     * @returns The closest shared parent, or undefined if it doesn't exist or 
     *          an error occurred.
     * ...........................................................................
     */
    export function findCommonParent(elem_a: HTMLElement, elem_b: HTMLElement): HTMLElement {
        let parent_a: HTMLElement;
        let parent_b: HTMLElement;

        // If eother element doesn't exist, no point in going further
        if (!elem_a || !elem_b) return undefined;

        // Set up the source parent, and quit if it doesn't exist
        parent_a = elem_a;

        // Set up the reference parent and quit if it doesn't exist
        parent_b = elem_b;

        // Loop through all parents of the source element
        while (parent_a) {

            // And all of the parents of the reference element
            while (parent_b) {

                // If they are the same parent, we have found our parent node
                if (parent_a === parent_b) return parent_a;

                // Otherwise, increment the parent of the reference element
                parent_b = <HTMLElement>parent_b.parentNode;
            }

            // Increment the source parent and reset the reference parent
            parent_a = <HTMLElement>parent_a.parentNode;
            parent_b = elem_b;
        }

        // return undefined if we never found a match
        return undefined;

    };

    /**...........................................................................
     * moveRelToElement
     * ...........................................................................
     * Moves a given element to a position relative to the reference element.
     *
     * This is for cases where you have two elements with different parents, and
     * you want to specify that element A is some number of pixels in some 
     * direction compared to element B.
     *
     * @param   elem    The element to move
     * @param   ref     The element to use as the reference element
     * @param   x       The x offset to give this element, relative to the reference
     * @param   y       The y offset to give this element, relative to the reference
     * @param   no_move If set to false, only returns the offset_x and offset_y that 
     *                  the element would have to be moved {optional}
     *
     * @returns An object containing the keys x and y, set to the offset applied to the element.
     * ...........................................................................
     */
    export function moveRelToElem(elem: HTMLElement, ref: HTMLElement, x?: number, y?: number, no_move?: boolean): { x: number, y: number } {
        let offset_me: { left: number, top: number };
        let offset_them: { left: number, top: number };
        let dx: number;
        let dy: number;

        // Find the offsets globally for each element
        offset_me = globalOffsets(elem);
        offset_them = globalOffsets(elem);

        // Find the difference between their global offsets
        dx = (offset_them.left + x) - offset_me.left;
        dy = (offset_them.top + y) - offset_me.top;

        // Adjust the element to the position specified
        if (!no_move) {
            elem.style.position = "absolute";
            elem.style.left = dx + "px";
            elem.style.top = dy + "px";
        }

        // Always return the offset we assigned this element.
        return { x: dx, y: dy };

    };

    //#endregion
    //..........................................

    /**...........................................................................
     * removeSubclassFromAllElenents
     * ...........................................................................
     * Allows you to easily remove a subclass from all elements that have a certain 
     * main class. Useful for things like button selection
     *
     * @param   cls       The main class to find all elements of
     * @param   subcls    The sub class to remove from all of those elements
     * @param   exception If needed, a single element that should 
     *                    not have its subclass removed.
     * ...........................................................................
     */
    export function removeSubclassFromAllElements(cls: string, subcls: string, exception?: HTMLElement): void {
        let elems: HTMLCollectionOf<Element>;
        let e: number;
        let elem: HTMLElement;

        elems = document.getElementsByClassName(cls);

        for (e = 0; e < elems.length; e += 1) {
            elem = <HTMLElement>elems[e];

            // Only remove it if it isn't the exception
            if (elem !== exception) {
                removeClass(elem, subcls);
            }
        }
    };

    /**...........................................................................
     * addResizingElement (UNIMPLEMENTED)
     * ...........................................................................
     * Adds an element to the document that should resize with the document
     * 
     * @param   elem        The element that should resize
     * @param   fixedRatio  If provided, keeps the image at this fixed ratio of w:h at all document sizes
     * @param   forceInitW  Optionally force the initial width to a certain value
     * @param   forceInitH  Optionally force the initial height to a certain value
     * ...........................................................................
     */
    function addResizingElement(elem, fixedRatio, forceInitW, forceInitH) {
        // TODO: implement
    };

    /**...........................................................................
     * resizeElement (UNIMPLEMENTED)
     * ...........................................................................
     * Resizes an element to be the same ratio as it previously was
     * @param   obj   The element to resize
     * ...........................................................................
     */
    function resizeElement(obj) {
        // TODO: implement
    };

    /**...........................................................................
   * isChildEventTarget
   * ...........................................................................
   * Checks if a child of the current task is being targeted by the event
   * 
   * @param   ev    The event that is being triggered
   * @param   root  The parent to check for
   * 
   * @returns True if the event is being triggered on a child element of the 
   *          root element, false otherwise
   * ...........................................................................
   */
    export function isChildEventTarget(ev: Event, root: HTMLElement): boolean {
        "use strict";
        return isChild(root, <HTMLElement>ev.target);
    };

    /**...........................................................................
     * isChild
     * ...........................................................................
     * Checks if an element is a child of the provided parent element
     * 
     * @param   root    The parent to check for
     * @param   child   The element to check for being a child of the root node
     * @param   levels  The maximum number of layers that the child can be 
     *                  separated from its parent. Ignored if not set.
     * 
     * @returns True if the child has the root as a parent
     * ...........................................................................
     */
    export function isChild(root: HTMLElement, child: HTMLElement): boolean {
        "use strict";
        let parent: HTMLElement;

        parent = child;

        // Loop through til we either have a match or ran out of parents
        while (parent) {
            if (parent === root) return true;
            parent = <HTMLElement>parent.parentNode;
        }

        return false;
    };

    //..........................................
    //#region ADD OR REMOVE ALL CHILDREN

    /**
     * appendChildren
     * ----------------------------------------------------------------------------
     * Appends an arbitrary number of children to the specified parent node. Loops 
     * through all members of the argument list to get the appropriate children 
     * to add.
     * 
     * @param   parent  The parent element to add children to
     * @param   kids    Any children that should be appended
     */
    export function appendChildren(parent: HTMLElement, ...kids: HTMLElement[]): void {
        "use strict";
        let idx: number;

        for (idx = 0; idx < kids.length; idx += 1) {
            parent.appendChild(kids[idx]);
        }
    }

    /**
     * clearChildren
     * ----------------------------------------------------------------------------
     * remove all children from the specified parent element
     */
    export function clearChildren(parent: HTMLElement): void {
        for (let idx = parent.children.length - 1; idx >= 0; idx -= 1) {
            let child: HTMLElement = parent.children[idx] as HTMLElement;
            parent.removeChild(child);
        }
    }

    //#endregion
    //..........................................

    /**...........................................................................
     * moveElemRelativePosition
     * ...........................................................................
     * Moves an element a relative anount
     * 
     * @param   elem      The element to move
     * @param   distance  The relative distance to move
     * ...........................................................................
     */
    export function moveElemRelativePosition(elem: HTMLElement, distance: IPoint): void {
        let top: number = parseInt(elem.style.top) || 0;
        let left: number = parseInt(elem.style.left) || 0;

        elem.style.top = (top + distance.y) + "px";
        elem.style.left = (left + distance.x) + "px";
    }

    /**...........................................................................
     * getScrollPosition
     * ...........................................................................
     * Determines how far we have scrolled down the page
     * 
     * @returns The point of the current scroll position
     * ...........................................................................
     */
    export function getScrollPosition(): IPoint {
        let out: IPoint = {
            x: (window.pageXOffset) ? window.pageXOffset : document.body.scrollLeft,
            y: (window.pageYOffset) ? window.pageYOffset : document.body.scrollTop
        }

        return out;
    }

    /**...........................................................................
     * measureElement
     * ...........................................................................
     * Measures how large an element is when rendered on the document
     * @param     elem    The element to measure 
     * @param     parent  The parent element to render this within
     * @returns   The client rect for the element 
     * ...........................................................................
     */
    export function measureElement(elem: HTMLElement, parent?: HTMLElement): ClientRect {

        // add to the document if not already present
        if (!elem.parentNode) {
            // save off the opacity originally, then set it to 0
            let origOpacity: string = elem.style.opacity;
            elem.style.opacity = "0";
            window.setTimeout(() => { elem.style.opacity = origOpacity; });

            // add the element to the parent
            if (!parent) { parent = document.body; }
            parent.appendChild(elem);
        }

        // measure the element on the parent
        let rect: ClientRect = elem.getBoundingClientRect();
        return rect;
    }

    /**...........................................................................
     * resetPageFocus
     * ...........................................................................
     * Reset where current focus is to the top of the page
     * ...........................................................................
     */
    export function resetPageFocus(): void {
        let oldTabIndex: number = -1;
        if (isNullOrUndefined(document.body.tabIndex)) {
            oldTabIndex = document.body.tabIndex;
        }
        document.body.tabIndex = 0;
        document.body.focus();
        document.body.tabIndex = oldTabIndex;
    }

    /**...........................................................................
     * removeElement
     * ...........................................................................
     * Remove an element from the DOM
     * @param   elem    The element to remove
     * ...........................................................................
     */
    export function removeElement(elem: HTMLElement): void {
        if (!elem.parentNode) { return; }
        elem.parentNode.removeChild(elem);
    }

    /**...........................................................................
     * select
     * ...........................................................................
     * Selects the contents of an HTML element, whether an input or a 
     * content-editable element.
     * 
     * @param   htmlElem    The element to select the contents of
     * ...........................................................................
     */
    export function select(htmlElem: HTMLElement): void {

        // elements that have select built in are easy: just use their function
        if (isSelectable(htmlElem)) {
            htmlElem.select();

            // conte-editable areas are trickier; use some range logic 
            // (taken from https://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element)
        } else {
            // get the range of the element
            let range = document.createRange();
            range.selectNodeContents(htmlElem);

            // set the window selection to be the range for the element
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    export const HTML_TAB = "&nbsp;&nbsp;&nbsp;&nbsp;";

    /**...........................................................................
     * encodeForHTML
     * ...........................................................................
     * Encode a string so that it can render appropriately in HTML contexts
     * @param   data    The data to encode
     * @returns The encoded data
     * ........................................................................... 
     */
    export function encodeForHTML(data: string): string {
        data = data.replace(/&/g, "&amp;");
        data = data.replace(/</g, "&lt;");
        data = data.replace(/>/g, "&gt;");

        // whitespace
        data = data.replace(/\\n/g, "<br>");
        data = data.replace(/\\t/g, HTML_TAB);
        return data;
    }

    /**
     * decodeFromHTML
     * ----------------------------------------------------------------------------
     * From an HTML-renderable string, convert back to standard strings
     * @param   data    The string to unencode
     * @returns The decoded data
     */
    export function decodeFromHTML(data: string): string {
        data = data.replace(/&amp;/g, "&");
        data = data.replace(/&lt;/g, "<");
        data = data.replace(/&gt;/g, ">");

        // some uncommon but possible control characters
        data = data.replace(/&quot;/g, "\"");
        data = data.replace(/&apos;/g, "'");

        // whitespace replacements
        data = data.replace(/<br>/g, "\n");
        data = data.replace(new RegExp(HTML_TAB, "g"), "\t");
        data = data.replace(/&nbsp;/g, " ");

        return data;
    }

    export function replaceElemWithElem(elemToReplace: HTMLElement, replacement: HTMLElement): void {
        if (!elemToReplace.parentNode) { return; }

        // grab the current references that we'll need to properly replace
        let nextChild = elemToReplace.nextSibling;
        let parent = elemToReplace.parentNode;

        // remove the current element and add our new one
        parent.removeChild(elemToReplace);
        parent.insertBefore(replacement, nextChild);

    }
}