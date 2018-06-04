///<reference path="css.ts" />

namespace KIP {
    export interface IAttributes {
        [key: string]: any;
    }

    export interface IChildren {
        [key: number]: HTMLElement | IElemDefinition
    }

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

    /**...........................................................................
     * createElement
     * ...........................................................................
     * Creates an HTML element with the attributes that are passed in through the
     * object.
     *
     * @param   obj   The object to base the element off of
     * @returns The HTML element with all attributes specified by the object
     * ...........................................................................
     */
    export function createElement(obj: IElemDefinition): HTMLElement {
        if (!obj) { return; }
        return _createElementCore(obj) as HTMLElement;
    }

    export function createSVGElement(obj: IElemDefinition): SVGElement {
        if (!obj) { return; }
        if (!obj.namespace) { obj.namespace = "http://www.w3.org/2000/svg"; }
        return _createElementCore(obj) as SVGElement;
    }

    function _createElementCore(obj: IElemDefinition): StandardElement {

        // #region Variable declaration
        let elem: StandardElement;
        let a: string;
        let c: string;
        let selector: string;
        let child: StandardElement;
        let type: string;
        let namespace: string;
        // #endregion

        type = obj.type || "div";
        namespace = obj.namespace;
        if (namespace) {
            elem = document.createElementNS(namespace, type) as StandardElement;
        } else {
            elem = document.createElement(type);
        }

        if (obj.id) {
            elem.setAttribute("id", obj.id);
        }

        // Set the CSS class of the object
        if (obj.cls) {

            // Check that the class is a string before setting it
            if (typeof obj.cls === typeof "string") {
                elem.setAttribute("class", obj.cls as string);

                // If it's an object, we need to create the class(es) first
            } else if (typeof obj.cls === "object") {
                for (selector in (obj.cls as IClasses)) {
                    if (obj.cls.hasOwnProperty(selector)) {

                        // Create the CSS class using the specified parameters
                        createClass(selector, obj.cls[selector]);

                        // Add the CSS class to the element itself
                        addClass(elem, selector);
                    }
                }
            }

        }

        // Set the first bit of content in the element (guaranteed to come before children)
        if (obj.before_content) {
            elem.innerHTML = obj.before_content;
        }

        // Also check for just plain "Content"
        if (obj.content) {
            elem.innerHTML += obj.content;
        }

        // Loop through all of the children listed for this element
        if (obj.children) {
            for (c in obj.children) {
                if (obj.children.hasOwnProperty(c)) {

                    if (!obj.children[c]) {
                        throw new Error("cannot append non-existent child element");
                    }

                    if ((obj.children[c] as HTMLElement).setAttribute) {
                        elem.appendChild(obj.children[c] as HTMLElement);
                    } else {
                        let subArray: IElemDefinition = obj.children[c];
                        if (namespace) { subArray.namespace = namespace; }
                        child = createElement(subArray);
                        elem.appendChild(child);
                    }

                }
            }
        }

        // Loop through all other attributes that we should be setting
        if (obj.attr) {
            for (a in obj.attr) {
                if (obj.attr.hasOwnProperty(a)) {
                    if (!obj.attr[a]) continue;

                    if ((obj.attr[a] as IKeyValPair<string>).key) {
                        if ((obj.attr[a] as IKeyValPair<string>).key === "value") {
                            (elem as HTMLInputElement).value = (obj.attr[a] as IKeyValPair<string>).val;
                        } else {
                            elem.setAttribute((obj.attr[a] as IKeyValPair<string>).key, (obj.attr[a] as IKeyValPair<string>).val);
                        }

                    } else {
                        if (a === "value") {
                            (elem as HTMLInputElement).value = (obj.attr[a] as string);
                        } else {
                            elem.setAttribute(a, (obj.attr[a] as string));
                        }
                    }

                }
            }
        }

        // add style properties
        if (obj.style) {
            map(obj.style, (val: any, key: string) =>{
                elem.style[key] = val;
            });
        }

        // Add any after html
        if (obj.after_content) {
            elem.innerHTML += obj.after_content;
        }

        // Attach the object to a parent if appropriate
        if (obj.parent) {
            obj.parent.appendChild(elem);
        }

        // add any event listeners the user requested
        if (obj.eventListeners) {
            map(obj.eventListeners, (listener: EventListener, key: keyof WindowEventMap) => {
                elem.addEventListener(key, listener);
            });
        }

        return elem;
    }

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
  export function globalOffsetLeft(elem: HTMLElement, parent?: HTMLElement): number {
    return _auxGlobalOffset(elem, "offsetLeft", parent);
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
  export function globalOffsetTop(elem: HTMLElement, parent?: HTMLElement): number {
    return _auxGlobalOffset(elem, "offsetTop", parent);
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
  export function globalOffsets(elem: HTMLElement, parent?: HTMLElement): { left: number, top: number } {
    "use strict";
    return {
      left: globalOffsetLeft(elem, parent),
      top: globalOffsetTop(elem, parent)
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
  function _auxGlobalOffset(elem: HTMLElement, type: string, parent?: HTMLElement): number {
    let offset: number = 0;

    // Recursively loop until we no longer have a parent
    while (elem && (elem !== parent)) {
      if (elem[type]) {
        offset += elem[type];
      }
      elem = <HTMLElement>elem.offsetParent;
    }

    return offset;
  };

  //#endregion

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
    let elems: NodeList;
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

  /**...........................................................................
   * AppendChildren
   * ...........................................................................
   * Appends an arbitrary number of children to the specified parent node. Loops 
   * through all members of the argument list to get the appropriate children 
   * to add.
   * 
   * @param   parent  The parent element to add children to
   * @param   kids    Any children that should be appended
   * ...........................................................................
   */
  export function appendChildren(parent: HTMLElement, ...kids: HTMLElement[]): void {
    "use strict";
    let idx: number;

    for (idx = 1; idx < kids.length; idx += 1) {
      parent.appendChild(kids[idx]);
    }
  }

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
    let top: number = parseInt(elem.style.top);
    let left: number = parseInt(elem.style.left);

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
  export function getScrollPosition() : IPoint {
    let out: IPoint = {
      x: (window.pageXOffset) ? window.pageXOffset : document.body.scrollLeft,
      y: (window.pageYOffset) ? window.pageYOffset : document.body.scrollTop
    }

    return out;
  }
}