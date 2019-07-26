namespace KIP {

    //..........................................
    //#region INTERFACES
    
    export interface ICreateElementFunc<T extends IKeyedElems = IKeyedElems, I extends IElemDefinition<T> = IElemDefinition<T>> {
        (obj: I, keyedElems?: T): StandardElement;
    }
    
    //#endregion
    //..........................................

    //................................................
    //#region PUBLIC FUNCTIONS FOR CREATING ELEMENTS

    /**
     * createSimpleElement
     * ----------------------------------------------------------------------------
     * Creates a div element with the provided id, class, content, and attributes.
     *
     * @param {string} id - The ID to assign the element {optional}
     * @param {string} cls - The class to assign the element {optional}
     * @param {string} content - What to include as the contents of the div {optional}
     * @param {arr} attr - An array of key-value pairs that sets all other attributes for the element
     *
     * @return {HTMLElement} The created element, with all specified parameters included.
     * 
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
    export function createElement<T extends IKeyedElems>(obj: IElemDefinition<T>, keyedElems?: T): HTMLElement {
        if (!obj) { return; }
        return _createElementCore(obj, keyedElems) as HTMLElement;
    }

    /**
     * createCustomElement
     * ----------------------------------------------------------------------------
     * Creates an HTML element with the specified attributes, but allows for 
     * additional processing on the element.
     * 
     * @param obj           The object to base the element off of
     * @param keyedElems    If provided, the elements that were created via a key
     * @param recurseVia    The custom function we should recurse through
     * 
     * @returns The created element
     */
    export function createCustomElement<T extends IKeyedElems, I extends IElemDefinition<T>>(obj: I, keyedElems?: T, recurseVia?: ICreateElementFunc<T>): HTMLElement {
        if (!obj) { return; }
        return _createElementCore(obj, keyedElems, recurseVia) as HTMLElement;
    }

    /**
     * createSVGElement
     * ---------------------------------------------------------------------------
     * create a SVG element specifically
     */
    export function createSVGElement<T extends IKeyedElems>(obj: IElemDefinition<T>, keyedElems?: T): SVGElement {
        if (!obj) { return; }
        if (!obj.namespace) { obj.namespace = "http://www.w3.org/2000/svg"; }
        return _createElementCore(obj, keyedElems) as SVGElement;
    }


    //...................................................
    //#region INTERNAL FUNCTIONS FOR CREATING ELEMENTS

    /**
     * _createElementCore
     * ---------------------------------------------------------------------------
     * create a DOM element with the specified details
     */
    function _createElementCore<T extends IKeyedElems = IKeyedElems>(obj: IElemDefinition<T>, keyedElems?: T, recurseVia?: ICreateElementFunc<T>): StandardElement {
        
        let elem: StandardElement;
        let drawable: Drawable;

        if (obj.drawable) {
            drawable = new obj.drawable();
            elem = drawable.base;
        } else {
            elem = _createStandardElement(obj);
        }

        // make sure we can recurse effectively
        if (!recurseVia) { recurseVia = _createElementCore; }

        // set attributes of the element
        _setElemIdentfiers(elem, obj, keyedElems, drawable);
        _setElemClass(elem, obj);
        _setElemAttributes(elem, obj);
        _setElemStyle(elem, obj);
        _setEventListeners(elem, obj);
        _setKipTooltip(elem, obj);

        // set content of the element
        _setElemBaseContent(elem, obj);
        _addElemChildren(elem, obj, keyedElems, recurseVia);
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
    function _createStandardElement<T extends IKeyedElems>(obj: IElemDefinition<T>): StandardElement {
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
    function _setElemIdentfiers<T extends IKeyedElems>(elem: StandardElement, obj: IElemDefinition<T>, keyedElems?: IKeyedElems, drawable?: Drawable): void {
        // set the id on the newly created object
        if (obj.id) { elem.setAttribute("id", obj.id); }

        // if there is a key, add this element to the keyed elements
        if (obj.key && keyedElems) { 
            if (drawable) { keyedElems[obj.key as any] = drawable; }
            else { keyedElems[obj.key as any] = elem; }
        }
    }

    /**
     * _setElemClass
     * ---------------------------------------------------------------------------
     * set the CSS class of this element (including creating it if it doesn't
     * exist)
     */
    function _setElemClass<T extends IKeyedElems>(elem: StandardElement, obj: IElemDefinition<T>): void {
        if (!obj.cls) { return; }

        // Check that the class is a string before setting it
        if (typeof obj.cls === typeof "string") {
            addClass(elem, obj.cls as string);

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
    function _setElemAttributes<T extends IKeyedElems>(elem: StandardElement, obj: IElemDefinition<T>): void {

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
    function _isFocusable<T extends IKeyedElems>(obj: IElemDefinition<T>): boolean {
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
    function _needsTabIndex<T extends IKeyedElems>(obj: IElemDefinition<T>): boolean {
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
    function _setElemStyle<T extends IKeyedElems>(elem: StandardElement, obj: IElemDefinition<T>): void {
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
    function _setEventListeners<T extends IKeyedElems>(elem: StandardElement, obj: IElemDefinition<T>): void {
        if (!obj.eventListeners) { return; }

        // if this is an accessible object and it can take focus, add keybaord listeners too
        if (obj.focusable && obj.eventListeners.click && !obj.eventListeners.keypress) {
            let clickFunc: Function = obj.eventListeners.click;
            obj.eventListeners.keypress = (e: KeyboardEvent) => {
                if (e.keyCode !== 13 && e.keyCode !== 32) { return; }
                clickFunc(e);
                e.preventDefault();
            }

            let preventFocus: boolean = false;
            obj.eventListeners.mousedown = (e: MouseEvent) => {
                preventFocus = true;
                elem.blur();
            }

            obj.eventListeners.mouseup = (e: MouseEvent) => {
                preventFocus = false;
            }

            obj.eventListeners.focus = (e: FocusEvent) => {
                if (preventFocus) { 
                    e.preventDefault(); 
                    elem.blur();
                    return false;
                }
                
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
    function _setKipTooltip<T extends IKeyedElems>(elem: StandardElement, obj: IElemDefinition<T>): void {
        if (!obj.tooltip) { return; }

        new Tooltip({ content: obj.tooltip }, elem as HTMLElement);
    }

    /**
     * _setElemBaseContent
     * ---------------------------------------------------------------------------
     * set the initial content of the element, which will be rendered before any
     * children are added
     */
    function _setElemBaseContent<T extends IKeyedElems>(elem: StandardElement, obj: IElemDefinition<T>): void {

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
    function _addElemChildren<T extends IKeyedElems>(elem: StandardElement, obj: IElemDefinition<T>, keyedElems?: T, recurseVia?: ICreateElementFunc<T>): void {
        if (!obj.children) { return; }

        // loop through each child
        for (let c of obj.children) {

            // make sure there is a child
            if (!c) {
                console.warn("cannot append non-existent child element");
                continue;
            }

            // if the child is a drawable, draw it on the base
            if ((isDrawable(c))) {
                c.draw(elem);

            // if the child is already an element, just add it
            } else if ((c as HTMLElement).setAttribute) {
                elem.appendChild(c as HTMLElement);

                // otherwise, recurse to create this child
            } else {
                let def: IElemDefinition<T> = c as IElemDefinition<T>;
                if (obj.namespace) { def.namespace = obj.namespace; }
                let child = recurseVia(def, keyedElems);
                elem.appendChild(child);
            }


        }

    }

    /**
     * _setElemPostChildrenContent
     * ---------------------------------------------------------------------------
     * if there is content specified after children, set it here
     */
    function _setElemPostChildrenContent<T extends IKeyedElems>(obj: IElemDefinition<T>, elem: StandardElement): void {
        if (!obj.after_content) { return; }
            
        elem.innerHTML += obj.after_content;
    }

    /**
     * _appendElemToParent
     * ---------------------------------------------------------------------------
     * add this element to a parent element
     */
    function _appendElemToParent<T extends IKeyedElems>(obj: IElemDefinition<T>, elem: StandardElement): void {
        if (!obj.parent) { return; }
        
        obj.parent.appendChild(elem);
    }

    

    //#endregion
    //...................................................

}