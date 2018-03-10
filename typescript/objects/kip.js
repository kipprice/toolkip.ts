var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var KIP;
(function (KIP) {
    /**...........................................................................
     * NamedClass
     * ...........................................................................
     * A class that contains a set of names that apply to this class. Used for
     * easier typing.
     *
     * @version 1.0
     * ...........................................................................
     */
    var NamedClass = (function () {
        /**...........................................................................
         * Creates a named class
         *
         * @param	class_name		The initial class name to assign
         * ...........................................................................
         */
        function NamedClass(class_name) {
            this._class_name = class_name;
        }
        Object.defineProperty(NamedClass.prototype, "class_name", {
            get: function () {
                return this._class_name;
            },
            enumerable: true,
            configurable: true
        });
        ;
        /**...........................................................................
         * _addClassName
         * ...........................................................................
         * Adds a new layer to our class name
         *
         * @param	class_name		The new class name to add
         *
         * @returns	True if we added the class name
         * ...........................................................................
         */
        NamedClass.prototype._addClassName = function (class_name) {
            if (this._class_name.indexOf(class_name) !== -1) {
                return false;
            }
            this._class_name += " <-- " + class_name;
            return true;
        };
        return NamedClass;
    }());
    KIP.NamedClass = NamedClass;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    ;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //#region INTERFACES AND CONSTANTS
    KIP.StylesAdded = {
        Editable: false,
        ContextMenu: false,
        Draggable: false,
        Hidden: false,
        Unselectable: false,
        FullScreenTutorial: false,
        HelpTipTutorial: false
    };
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
    function createSimpleElement(id, cls, content, attr, children, parent) {
        var obj;
        obj = {};
        obj.id = id; // Set the element's ID
        obj.type = "div"; // Set the type of element to create
        obj.content = content; // Set what the content of the element should be
        obj.cls = cls; // Set the appropriate CSS class for the element
        obj.attr = attr; // Set a list of attributes for the element
        obj.children = children; // Attach children to to the element
        obj.parent = parent; // Attach the created element to the appropriate parent
        // Use our standard function for creating elements
        return createElement(obj);
    }
    KIP.createSimpleElement = createSimpleElement;
    ;
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
    function createElement(obj) {
        // #region Variable declaration
        var elem;
        var a;
        var c;
        var selector;
        var child;
        var type;
        // #endregion
        type = obj.type || "div";
        elem = document.createElement(type);
        if (obj.id) {
            elem.setAttribute("id", obj.id);
        }
        // Set the CSS class of the object
        if (obj.cls) {
            // Check that the class is a string before setting it
            if (typeof obj.cls === typeof "string") {
                elem.setAttribute("class", obj.cls);
                // If it's an object, we need to create the class(es) first
            }
            else if (typeof obj.cls === "object") {
                for (selector in obj.cls) {
                    if (obj.cls.hasOwnProperty(selector)) {
                        // Create the CSS class using the specified parameters
                        KIP.createClass(selector, obj.cls[selector]);
                        // Add the CSS class to the element itself
                        KIP.addClass(elem, selector);
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
                    if (!obj.children[c])
                        continue;
                    if (obj.children[c].setAttribute) {
                        elem.appendChild(obj.children[c]);
                    }
                    else {
                        child = createElement(obj.children[c]);
                        elem.appendChild(child);
                    }
                }
            }
        }
        // Loop through all other attributes that we should be setting
        if (obj.attr) {
            for (a in obj.attr) {
                if (obj.attr.hasOwnProperty(a)) {
                    if (!obj.attr[a])
                        continue;
                    if (obj.attr[a].key) {
                        if (obj.attr[a].key === "value") {
                            elem.value = obj.attr[a].val;
                        }
                        else {
                            elem.setAttribute(obj.attr[a].key, obj.attr[a].val);
                        }
                    }
                    else {
                        if (a === "value") {
                            elem.value = obj.attr[a];
                        }
                        else {
                            elem.setAttribute(a, obj.attr[a]);
                        }
                    }
                }
            }
        }
        // Add any after html
        if (obj.after_content) {
            elem.innerHTML += obj.after_content;
        }
        // Attach the object to a parent if appropriate
        if (obj.parent) {
            obj.parent.appendChild(elem);
        }
        return elem;
    }
    KIP.createElement = createElement;
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
    function createSimpleLabeledElement(id, cls, lbl, content, attr, children, parent, skipZero) {
        "use strict";
        var obj;
        var cLbl;
        var cContent;
        if (content === undefined || content === null)
            return;
        if ((typeof content === typeof "string") && (KIP.trim(content).length === 0)) {
            return;
        }
        if (skipZero && content === 0) {
            return;
        }
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
        return createElement(obj);
    }
    KIP.createSimpleLabeledElement = createSimpleLabeledElement;
    ;
    //#endregion
    //#region HELPER FUNCTIONS
    /**...........................................................................
     * map
     * ...........................................................................
     * Loop through all keys in an object or array and perform an action on each
     * element. Similar to Array.map.
     *
     * @param   object    The object to loop through
     * @param   callback  What to do with each element
     * ...........................................................................
     */
    function map(object, callback) {
        if (!object) {
            return;
        }
        // Use the default map function if available
        if (object.map) {
            object.map(callback);
            // Otherwise, do a standard object map
        }
        else {
            var cnt = 0;
            var key = void 0;
            // Do it safely with the appropriate checks
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    callback(object[key], key, cnt);
                    cnt += 1;
                }
            }
        }
    }
    KIP.map = map;
    //#endregion
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
    function globalOffsetLeft(elem, parent) {
        return _auxGlobalOffset(elem, "offsetLeft", parent);
    }
    KIP.globalOffsetLeft = globalOffsetLeft;
    ;
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
    function globalOffsetTop(elem, parent) {
        return _auxGlobalOffset(elem, "offsetTop", parent);
    }
    KIP.globalOffsetTop = globalOffsetTop;
    ;
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
    function globalOffsets(elem, parent) {
        "use strict";
        return {
            left: globalOffsetLeft(elem, parent),
            top: globalOffsetTop(elem, parent)
        };
    }
    KIP.globalOffsets = globalOffsets;
    ;
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
    function _auxGlobalOffset(elem, type, parent) {
        var offset = 0;
        // Recursively loop until we no longer have a parent
        while (elem && (elem !== parent)) {
            if (elem[type]) {
                offset += elem[type];
            }
            elem = elem.offsetParent;
        }
        return offset;
    }
    ;
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
    function findCommonParent(elem_a, elem_b) {
        var parent_a;
        var parent_b;
        // If eother element doesn't exist, no point in going further
        if (!elem_a || !elem_b)
            return undefined;
        // Set up the source parent, and quit if it doesn't exist
        parent_a = elem_a;
        // Set up the reference parent and quit if it doesn't exist
        parent_b = elem_b;
        // Loop through all parents of the source element
        while (parent_a) {
            // And all of the parents of the reference element
            while (parent_b) {
                // If they are the same parent, we have found our parent node
                if (parent_a === parent_b)
                    return parent_a;
                // Otherwise, increment the parent of the reference element
                parent_b = parent_b.parentNode;
            }
            // Increment the source parent and reset the reference parent
            parent_a = parent_a.parentNode;
            parent_b = elem_b;
        }
        // return undefined if we never found a match
        return undefined;
    }
    KIP.findCommonParent = findCommonParent;
    ;
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
    function moveRelToElem(elem, ref, x, y, no_move) {
        var offset_me;
        var offset_them;
        var dx;
        var dy;
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
    }
    KIP.moveRelToElem = moveRelToElem;
    ;
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
    function removeSubclassFromAllElements(cls, subcls, exception) {
        var elems;
        var e;
        var elem;
        elems = document.getElementsByClassName(cls);
        for (e = 0; e < elems.length; e += 1) {
            elem = elems[e];
            // Only remove it if it isn't the exception
            if (elem !== exception) {
                KIP.removeClass(elem, subcls);
            }
        }
    }
    KIP.removeSubclassFromAllElements = removeSubclassFromAllElements;
    ;
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
        "use strict";
        // TODO
    }
    ;
    /**...........................................................................
     * resizeElement (UNIMPLEMENTED)
     * ...........................................................................
     * Resizes an element to be the same ratio as it previously was
     * @param   obj   The element to resize
     * ...........................................................................
     */
    function resizeElement(obj) {
        // TODO
    }
    ;
    /**...........................................................................
     * removeElemFromArr
     * ...........................................................................
     * Finds & removes an element from the array if it exists.
     *
     * @param   arr     The array to remove from
     * @param   elem    The element to remove
     * @param   equal   The function that is used to test for equality
     * ...........................................................................
     */
    function removeElemFromArr(arr, elem, equal) {
        var idx;
        var outArr;
        // If we didn't get a function to test for equality, set it to the default
        if (!equal) {
            equal = function (a, b) { return (a === b); };
        }
        // Loop through the array and remove all equal elements
        for (idx = (arr.length - 1); idx >= 0; idx -= 1) {
            if (equal(arr[idx], elem)) {
                outArr = arr.splice(idx, 1);
            }
        }
        return outArr;
    }
    KIP.removeElemFromArr = removeElemFromArr;
    ;
    /**...........................................................................
     * roundToPlace
     * ...........................................................................
     * Helper function to round a number to a particular place
     *
     * @param   num     The number to round
     * @param   place   A multiple of 10 that indicates the decimal place to round
     *                  to. I.e., passing in 100 would round to the hundredths
     *                  place
     *
     * @returns The rounded number
     * ...........................................................................
     */
    function roundToPlace(num, place) {
        return (Math.round(num * place) / place);
    }
    KIP.roundToPlace = roundToPlace;
    ;
    /**...........................................................................
     * addLeadingZeros
     * ...........................................................................
     * Adds a number of leading zeroes before a number
     *
     * @param   count   The number of zeroes to add
     * @param   nums    The numbers to add zeroes to
     *
     * @returns All zero-padded numbers that were passed in
     * ...........................................................................
     */
    function addLeadingZeroes(count, unpadded) {
        "use strict";
        var out;
        if (typeof unpadded === "string") {
            out = unpadded;
        }
        else {
            out = unpadded.toString();
        }
        // Loop through the number of zeros we need to add and add them
        var z;
        for (z = out.length; z < count; z += 1) {
            out = "0" + out;
        }
        return out;
    }
    KIP.addLeadingZeroes = addLeadingZeroes;
    ;
    /**...........................................................................
     * transitionToDisplayNone (UNIMPLEMENTED)
     * ...........................................................................
     * @param   elem
     * @param   func
     * @param   disp
     * ...........................................................................
     */
    function transitionToDisplayNone(elem, func, disp) {
        // TODO
    }
    ;
    /**...........................................................................
     * isChildEventTarget
     *...........................................................................
     * Checks if a child of the current task is being targeted by the event
     *
     * @param   ev    The event that is being triggered
     * @param   root  The parent to check for
     *
     * @returns True if the event is being triggered on a child element of the
     *          root element, false otherwise
     */
    function isChildEventTarget(ev, root) {
        "use strict";
        return isChild(root, ev.target);
    }
    KIP.isChildEventTarget = isChildEventTarget;
    ;
    /**...........................................................................
     * isChild
     * ...........................................................................
     * Checks if an element is a child of the provided parent element
     *
     * @param   root    The parent to check for
     * @param   child   The element to check for being a child of the root node
     * @param   levels  The maximum number of layers that the child can be separated from its parent. Ignored if not set.
     *
     * @returns True if the child has the root as a parent
     * ...........................................................................
     */
    function isChild(root, child) {
        "use strict";
        var parent;
        parent = child;
        // Loop through til we either have a match or ran out of parents
        while (parent) {
            if (parent === root)
                return true;
            parent = parent.parentNode;
        }
        return false;
    }
    KIP.isChild = isChild;
    ;
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
    function appendChildren(parent) {
        "use strict";
        var kids = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            kids[_i - 1] = arguments[_i];
        }
        var idx;
        for (idx = 1; idx < kids.length; idx += 1) {
            parent.appendChild(kids[idx]);
        }
    }
    KIP.appendChildren = appendChildren;
    /**...........................................................................
     * combineObjects
     * ...........................................................................
     * Take two separate objects and combine them into one
     *
     * @param   objA    First object to combine
     * @param   objB    Second object to combine
     * @param   deep    True if this should be recursive
     *
     * @returns The combined object
     * ...........................................................................
     */
    function combineObjects(objA, objB, deep) {
        "use strict";
        var ret;
        var tmp;
        var loopThru;
        ret = {};
        // Define a function that will pull in relevant details from
        loopThru = function (array, retArr) {
            var key;
            // Loop thru each key in the array
            for (key in array) {
                if (array.hasOwnProperty(key)) {
                    // If doing a deep copy, make sure we recurse
                    if (deep && (typeof (array[key]) === "object")) {
                        tmp = {};
                        tmp.prototype = Object.create(array[key].prototype);
                        tmp = combineObjects(tmp, array[key]);
                        retArr[key] = tmp;
                        // Otherwise copy directly
                    }
                    else {
                        retArr[key] = array[key];
                    }
                }
            }
        };
        // Write the array copies for A & B
        loopThru(objA, ret);
        loopThru(objB, ret);
        // Return the appropriate output array
        return ret;
    }
    KIP.combineObjects = combineObjects;
    /**...........................................................................
     * reconcileOptions
     * ...........................................................................
     * Takes in two different option objects & reconciles the options between them
     *
     * @param   options    The user-defined set of option
     * @param   defaults   The default options
     *
     * @returns The reconciled option list
     * ...........................................................................
     */
    function reconcileOptions(options, defaults) {
        "use strict";
        var key;
        var opt;
        if (!options) {
            options = {};
        }
        ;
        for (key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                opt = options[key];
                if ((opt === undefined) || (opt === null)) {
                    options[key] = defaults[key];
                }
            }
        }
        return options;
    }
    KIP.reconcileOptions = reconcileOptions;
    /**...........................................................................
     * getScrollPosition
     * ...........................................................................
     * Determines how far we have scrolled down the page
     *
     * @returns The point of the current scroll position
     * ...........................................................................
     */
    function getScrollPosition() {
        var out = {
            x: (window.pageXOffset) ? window.pageXOffset : document.body.scrollLeft,
            y: (window.pageYOffset) ? window.pageYOffset : document.body.scrollTop
        };
        return out;
    }
    KIP.getScrollPosition = getScrollPosition;
    /**...........................................................................
     * moveElemRelativePosition
     * ...........................................................................
     * Moves an element a relative anount
     *
     * @param   elem      The element to move
     * @param   distance  The relative distance to move
     * ...........................................................................
     */
    function moveElemRelativePosition(elem, distance) {
        var top = parseInt(elem.style.top);
        var left = parseInt(elem.style.left);
        elem.style.top = (top + distance.y) + "px";
        elem.style.left = (left + distance.x) + "px";
    }
    KIP.moveElemRelativePosition = moveElemRelativePosition;
    /**...........................................................................
     * isNullOrUndefined
     * ...........................................................................
     * Determine whether the data passed in has value
     *
     * @param   value   The value to check for null / undefined
     *
     * @returns True if the value is null or undefined
     * ...........................................................................
     */
    function isNullOrUndefined(value) {
        if (value === undefined) {
            return true;
        }
        if (value === null) {
            return true;
        }
        return false;
    }
    KIP.isNullOrUndefined = isNullOrUndefined;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //#region INTERFACES
    /**--------------------------------------------------------------------------
     * enum to keep track of the types of AJAX requesr
     * @version 1.0
     * --------------------------------------------------------------------------
     */
    var AjaxTypeEnum;
    (function (AjaxTypeEnum) {
        AjaxTypeEnum[AjaxTypeEnum["POST"] = 1] = "POST";
        AjaxTypeEnum[AjaxTypeEnum["GET"] = 2] = "GET";
    })(AjaxTypeEnum = KIP.AjaxTypeEnum || (KIP.AjaxTypeEnum = {}));
    ;
    //#endregion
    //#region PUBLIC FUNCTIONS
    /**--------------------------------------------------------------------------
     * ajaxRequest
     * --------------------------------------------------------------------------
     * Sends an AJAX request to a url of our choice as either a POST or GET
     *
     * @param   type        Set to either "POST" or "GET" to indicate the type of response we want
     * @param   url         The URL to send the request to
     * @param   success     A function to run if the call succeeds
     * @param   error       A function to run if the request errors out
     * @param   params      An object with key value pairs
     *
     * @returns The request that was sent
     * --------------------------------------------------------------------------
    */
    function ajaxRequest(type, url, successCb, errorCb, params) {
        var request;
        request = _getXmlRequestObject(); // try to get an HTML Request
        if (!request)
            return null; // if we couldn't grab a request, quit
        _assignXmlRequestCallbacks(request, successCb, errorCb); // assign the callbacks upon request completion
        _sendXmlRequest(request, type, url, params); // send the XML request
        return request; // return the total request
    }
    KIP.ajaxRequest = ajaxRequest;
    ;
    /**--------------------------------------------------------------------------
     * loadFile
     * --------------------------------------------------------------------------
     * load a file from a particular URL
     *
     * @param   url         The URL to load a file from
     * @param   success     What to do when the file is loaded successfully
     * @param   error       What do do if the file can't be loaded
     * --------------------------------------------------------------------------
     */
    function loadFile(url, success, error) {
        var request = new XMLHttpRequest();
        // start the request to the remote file
        request.open('GET', url);
        // handle the file actually changing status
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                success(request.responseText);
            }
            else if (request.status === 404) {
                error(request.responseText);
            }
        };
        // actually send the appropriate request
        request.send();
    }
    KIP.loadFile = loadFile;
    ;
    //#endregion
    //#region HELPER FUNCTIONS
    /**--------------------------------------------------------------------------
     * _getXmlRequestObject
     * --------------------------------------------------------------------------
     * create the Xml request object
     *
     * @returns A created request, appropriate for the particular browser
     * --------------------------------------------------------------------------
     */
    function _getXmlRequestObject() {
        var request = null;
        try {
            request = new XMLHttpRequest();
        } // Try to create a non IE object
        catch (e) {
            try {
                request = new ActiveXObject("Msxml2.XMLHTTP");
            } // If it failed, it could be because we're in IE, so try that
            catch (e) {
                try {
                    request = new ActiveXObject("Microsoft.XMLHTTP");
                } // If that failed too, then we'll try the other IE specific method
                catch (e) {
                    return null; // And if we still can't get anything, then we're out of options
                }
            }
        }
        return request; // return the updated request
    }
    /**--------------------------------------------------------------------------
     * _assignXmlRequestCallbacks
     * --------------------------------------------------------------------------
     * handle the xml request getting back to us
     *
     * @param   request     The AJAX request, appropriate for the browser
     * @param   successCb   What to do if the request successfully returns
     * @param   errorCb     What to do if the request fails
     *
     * @returns The request, now configured to handle success + error states
     * --------------------------------------------------------------------------
     */
    function _assignXmlRequestCallbacks(request, successCb, errorCb) {
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status === 200) {
                    if (successCb) {
                        successCb(request.responseText);
                    }
                }
                else {
                    if (errorCb) {
                        errorCb(request.responseText);
                    }
                }
            }
        };
        return request; // return the appropriate request
    }
    /**--------------------------------------------------------------------------
     * _buildParameters
     * --------------------------------------------------------------------------
     * turn a param object into a string suitable for a URI
     *
     * @param   params      List of parameters that we will turn into an appropriate AJAX request string
     *
     * @returns The string containing all appropriate paramters
     * --------------------------------------------------------------------------
     */
    function _buildParameters(params) {
        var paramOut = "";
        var key;
        for (key in params) {
            if (params.hasOwnProperty(key)) {
                // Append the appropriate PHP delimiter
                if (paramOut.length > 0) {
                    paramOut += "&";
                }
                // Make sure we add the key-value pair, properly escaped
                paramOut += (encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
            }
        }
        return paramOut;
    }
    /**--------------------------------------------------------------------------
     * _sendXmlRequest
     * --------------------------------------------------------------------------
     * handle the actual sending of the request
     *
     * @param   request     The AJAX request to send
     * @param   type        Whether this is a POST or a GET request
     * @param   url         Where to send the request
     * @param   params      What parameters or data should be sent with the request
     *
     * @returns The sent request
     * --------------------------------------------------------------------------
     */
    function _sendXmlRequest(request, type, url, params) {
        if (type === AjaxTypeEnum.GET) {
            return _sendGetRequest(request, url);
        }
        else if (type === AjaxTypeEnum.POST) {
            return _sendPostRequest(request, url, params);
        }
    }
    /**--------------------------------------------------------------------------
     * _sendGetRequest
     * --------------------------------------------------------------------------
     * handle sending GET AJAX requests
     *
     * @param   request     The request to send
     * @param   url         The URL to which to send the requesr
     *
     * @returns The sent request
     * --------------------------------------------------------------------------
     */
    function _sendGetRequest(request, url) {
        request.open("GET", url, true);
        return request;
    }
    /**--------------------------------------------------------------------------
     * _sendPostRequest
     * --------------------------------------------------------------------------
     * handle sending POST AJAX queries
     *
     * @param   request     The request to send
     * @param   url         The URL to which to send the request
     * @param   params      The parameters or data to send with the request
     *
     * @returns The sent request
     * --------------------------------------------------------------------------
     */
    function _sendPostRequest(request, url, params) {
        var reqHeaderType = "application/x-www-form-urlencoded"; // save off the appropriate header
        var reqHeaderDisposition;
        var uriParams;
        request.open("POST", url, true); // open the connection
        if (params instanceof FormData) {
            uriParams = params;
            reqHeaderType = "";
        }
        else {
            uriParams = _buildParameters(params);
        }
        if (reqHeaderType) {
            request.setRequestHeader("Content-Type", reqHeaderType);
        } // pull in the data for the POST
        request.send(uriParams); // open request   
        return request; // return the completed request                                          
    }
    //#endregion
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /** check if the element is an HTML element */
    function isHTMLElement(test) {
        if (!test) {
            return false;
        }
        if (isDrawable(test)) {
            return false;
        }
        return (!!test.appendChild);
    }
    KIP.isHTMLElement = isHTMLElement;
    /** Check if the element is a string */
    function isString(test) {
        return (typeof test === "string");
    }
    KIP.isString = isString;
    /** check if the element is a number */
    function isNumber(test) {
        return (typeof test === "number");
    }
    KIP.isNumber = isNumber;
    /** check if the element is a boolean */
    function isBoolean(test) {
        return (typeof test === "boolean");
    }
    KIP.isBoolean = isBoolean;
    /** check if the element is a client rectangle */
    function isClientRect(test) {
        var rect = {
            top: 1,
            bottom: 1,
            left: 1,
            right: 1,
            height: 1,
            width: 1,
        };
        if (isInterface(test, rect)) {
            return true;
        }
        return false;
    }
    KIP.isClientRect = isClientRect;
    ;
    /** check if the element is a SVG rectangle */
    function isSVGRect(test) {
        var rect = {
            x: 1,
            y: 1,
            width: 1,
            height: 1
        };
        if (isInterface(test, rect)) {
            return true;
        }
        return false;
    }
    KIP.isSVGRect = isSVGRect;
    /** check if the element is a basic rectangle */
    function isIBasicRect(test) {
        var rect = {
            x: 1,
            y: 1,
            w: 1,
            h: 1
        };
        if (isInterface(test, rect)) {
            return true;
        }
        return false;
    }
    KIP.isIBasicRect = isIBasicRect;
    function isIPoint(test) {
        var pt = {
            x: 1,
            y: 1,
            z: 0
        };
        return isInterface(test, pt);
    }
    KIP.isIPoint = isIPoint;
    /** check if the element is an element definition implementation */
    function isIElemDefinition(test) {
        var out;
        var comp = {
            after_content: "",
            attr: null,
            before_content: "",
            children: null,
            cls: "",
            content: "",
            id: "",
            parent: null,
            type: ""
        };
        if (isInterface(test, comp)) {
            return true;
        }
        return false;
    }
    KIP.isIElemDefinition = isIElemDefinition;
    /** check if the element is an IExtrema implementation */
    function isIExtrema(test) {
        var extrema = {
            min: { x: 0, y: 0 },
            max: { x: 0, y: 0 }
        };
        return isInterface(test, extrema);
    }
    KIP.isIExtrema = isIExtrema;
    /** generic function to check if a given object implements a particular interface */
    function isInterface(test, full_imp) {
        // Loop through all of the properties of the full interface implementation & make sure at least one required elem is populated in the test
        var prop;
        var req_match = true;
        var val;
        for (prop in full_imp) {
            if (full_imp.hasOwnProperty(prop)) {
                val = full_imp[prop];
                if (val && (test[prop] === undefined)) {
                    req_match = false;
                    break;
                }
            }
        }
        if (!req_match) {
            return false;
        }
        // Now loop through all properties on the test to make sure there aren't extra props
        var has_extra = false;
        for (prop in test) {
            if (test.hasOwnProperty(prop)) {
                if (full_imp[prop] === undefined) {
                    has_extra = true;
                    break;
                }
            }
        }
        return (!has_extra);
    }
    KIP.isInterface = isInterface;
    /** check if the element implements the Editable class */
    function isEditable(test) {
        return isNamedClass(test, "Editable");
    }
    KIP.isEditable = isEditable;
    /** check if the element implements the drawable class */
    function isDrawable(test) {
        return isNamedClass(test, "BaseDrawable");
    }
    KIP.isDrawable = isDrawable;
    /** check if the element is one that can be used as a drawable base */
    function isDrawableElement(test) {
        return (!!(test.appendChild));
    }
    KIP.isDrawableElement = isDrawableElement;
    /** generic function to check if an element has a particular class name in its inheritance tree */
    function isNamedClass(test, name) {
        if (!name) {
            return false;
        }
        var test_name;
        test_name = test.class_name;
        if (!test_name) {
            return false;
        }
        return (test_name.indexOf(name) !== -1);
    }
    KIP.isNamedClass = isNamedClass;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    // Constants for theming colors
    KIP.THEME_BG_COLOR_CLS = "themeBGColor";
    KIP.THEME_COLOR_CLS = "themeColor";
    KIP.THEME_COLOR_HOVER_CLS = "themeBGHoverColor";
    /**
     * Allows a user to safely add a CSS class to an element's existing list of CSS classes
     * @param {HTMLElement}   elem      The element that should have its class updated
     * @param {string}        newClass  The class to add the element
     */
    function addClass(elem, newClass) {
        var cls;
        var e;
        if (!elem || !newClass)
            return;
        // Handle Drawables being passed in
        if (elem.draw !== undefined) {
            e = elem.base;
        }
        else {
            e = elem;
        }
        // Still suport setting the class if the class is not originally set
        cls = e.getAttribute("class");
        if (!cls) {
            e.setAttribute("class", newClass);
            return;
        }
        cls = " " + cls + " ";
        if (cls.indexOf(" " + newClass + " ") === -1) {
            cls = cls + newClass;
            e.setAttribute("class", KIP.trim(cls));
        }
    }
    KIP.addClass = addClass;
    ;
    /**
     * Allows a user to safely remove a CSS class to an element's existing list of CSS classes
     * @param {HTMLElement} elem      The element that should have its class updated
     * @param {string}      newClass  The class to remove from the element
     */
    function removeClass(elem, oldClass) {
        "use strict";
        var cls;
        var len;
        var e;
        // Quit if we're missing something
        if (!elem || !oldClass)
            return;
        // Handle Drawables being passed in
        if (elem.draw !== undefined) {
            e = elem.base;
        }
        else {
            e = elem;
        }
        // Pull out the CSS class
        cls = " " + e.getAttribute("class") + " ";
        len = cls.length;
        cls = cls.replace(" " + oldClass + " ", " ");
        // Only reset the class attribute if it actually changed
        if (cls.length !== len) {
            e.setAttribute("class", KIP.trim(cls));
        }
    }
    KIP.removeClass = removeClass;
    ;
    /**
     * Checks whether a provided HTML element has a CSS class applied
     * @param  {HTMLElement}  elem  The element to check
     * @param  {String}       cls   The CSS class to check for
     * @return {Boolean}            True if the element has the CSS class applied; false otherwise
     */
    function hasClass(elem, cls) {
        var e;
        var cur_cls;
        if (!elem)
            return;
        // Handle Drawables being passed in
        if (elem.draw !== undefined) {
            e = elem.base;
        }
        else {
            e = elem;
        }
        // Grab the current CSS class and check if the passed-in class is present
        cur_cls = " " + e.getAttribute("class") + " ";
        if (cur_cls.indexOf(" " + cls + " ") === -1) {
            return false;
        }
        return true;
    }
    KIP.hasClass = hasClass;
    ;
    /**
     * Sets the CSS definition for a given class and attribute.
     *
     * @param {string} cls   - The class to change
     * @param {string} item  - The attribute within the class to update
     * @param {string} val   - The new value to set the attribute to
     * @param {bool} force   - If true, will create the CSS attribute even if it doesn't exist
     *
     * @return {bool} True if the CSS was successfully set, false otherwise
     */
    function setProperty(cls, item, val, force) {
        var i;
        var css;
        var sIdx;
        var rules;
        var rule;
        // Loop through all of the stylesheets we have available
        for (sIdx = 0; sIdx < document.styleSheets.length; sIdx += 1) {
            // Pull in the appropriate index for the browser we're using
            css = document.all ? 'rules' : 'cssRules'; //cross browser
            rules = document.styleSheets[sIdx][css];
            // If we have rules to loop over...
            if (rules) {
                // ... loop through them and check if they are the class we are looking for
                for (i = 0; i < rules.length; i += 1) {
                    rule = rules[i];
                    // If we have a match on the class...
                    if (rule.selectorText === cls) {
                        // ... and the class has the item we're looking for ...
                        if ((rule.style[item]) || (force)) {
                            //... set it to our new value, and return true.
                            rule.style[item] = val;
                            return true;
                        }
                    }
                }
            }
        }
        // Return false if we didn't change anything
        return false;
    }
    KIP.setProperty = setProperty;
    ;
    /**
     * Grabs the value of a given CSS class's attribute
     *
     * @param {string} cls  - The CSS class to look within
     * @param {string} item - The attribute we want to grab the value for
     *
     * @return {string} The value of that particular CSS class's attribute
     */
    function getProperty(cls, item) {
        var i;
        var css;
        var sIdx;
        var rules;
        var rule;
        // Loop through all of the stylesheets we have available
        for (sIdx = 0; sIdx < document.styleSheets.length; sIdx += 1) {
            // Pull in the appropriate index for the browser we're using
            css = document.all ? 'rules' : 'cssRules'; //cross browser
            rules = document.styleSheets[sIdx][css];
            // If we have an index...
            if (rules) {
                // ... loop through all and check for the actual class
                for (i = 0; i < rules.length; i += 1) {
                    rule = rules[i];
                    // If we find the class...
                    if (rule.selectorText === cls) {
                        // ... return what the item is set to (if anything)
                        return (rule.style[item]);
                    }
                }
            }
        }
        // Return a blank string if it couldn't be found
        return "";
    }
    KIP.getProperty = getProperty;
    ;
    /**
     * Creates a CSS class and adds it to the style of the document
     * @param  {string}      selector   CSS selector to use to define what elements get this style
     * @param  {any}         attr       Array of css attributes that should be applied to the class
     * @param  {boolean}     [noAppend] True if we shouldn't actually add the class to the documment yet
     * @return {HTMLElement}            The CSS style tag that was created
     */
    function createClass(selector, attr, noAppend) {
        var cls;
        var a;
        var styles;
        // Grab the style node of this document (or create it if it doesn't exist)
        styles = document.getElementsByTagName("style");
        if (styles.length > 0) {
            cls = styles[0];
        }
        else {
            cls = document.createElement("style");
            cls.innerHTML = "";
        }
        // Loop through the attributes we were passed in to create the class
        cls.innerHTML += "\n" + selector + " {\n";
        for (a in attr) {
            if (attr.hasOwnProperty(a)) {
                if (attr[a].key) {
                    cls.innerHTML += "\t" + attr[a].key + ": " + attr[a].val + ";\n";
                }
                else {
                    cls.innerHTML += "\t" + a + " : " + attr[a] + ";\n";
                }
            }
        }
        cls.innerHTML += "\n}";
        // Append the class to the head of the document
        if (!noAppend)
            document.head.appendChild(cls);
        // Return the style node
        return cls;
    }
    KIP.createClass = createClass;
    /**
     * Gets the computed style of a given element
     *
     * @param {HTMLElement} elem - The element we are getting the style of
     * @param {string} attr - If passed in, the attribute to grab from the element's style
     *
     * @return {string} Either the particular value for the passed in attribute, or the whole style array.
     */
    function getComputedStyle(elem, attr) {
        var style;
        var e;
        // Handle Drawables being passed in
        if (elem.draw !== undefined) {
            e = elem.base;
        }
        else {
            e = elem;
        }
        // Use the library function on the window first
        if (window.getComputedStyle) {
            style = window.getComputedStyle(e);
            if (attr) {
                return style.getPropertyValue(attr);
            }
            else {
                return style;
            }
            // If that doesn't work, maybe it's through the currentStyle property
        }
        else if (e.currentStyle) {
            style = e.currentStyle;
            if (attr) {
                return style[attr];
            }
            else {
                return style;
            }
        }
        return null;
    }
    KIP.getComputedStyle = getComputedStyle;
    /** adds a generic hidden class to the document */
    function addHiddenClass() {
        var cls;
        cls = {
            "display": "none"
        };
        createClass(".hidden", cls);
    }
    KIP.addHiddenClass = addHiddenClass;
    /** Adds the "unselectable" class definition to the document */
    function addUnselectableClass() {
        var cls;
        cls = {
            "user-select": "none",
            "-moz-user-select": "none",
            "-webkit-user-select": "none",
            "khtml-user-select": "none",
            "o-user-select": "none"
        };
        createClass(".unselectable", cls);
    }
    KIP.addUnselectableClass = addUnselectableClass;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /**
     * Gets a piece of a delimited string
     *
     * @param {string} str The string to grab a piece from
     * @param {string} delim The character (or characters) that are delimiting the string
     * @param {number} piece The piece number to get. Defaults to 1 if not passed in.
     *
     * @return {string} The specified piece of the string, "" if it doesn't exist
     */
    function piece(str, delim, pc) {
        if (pc === void 0) { pc = 1; }
        var split_arr;
        split_arr = str.split(delim);
        return split_arr[pc] || "";
    }
    KIP.piece = piece;
    ;
    /**
     * Capitalizes the first letter of each word of a given string, and converts all else to lowercase
     *
     * @param {string} str   The string to convert to title case
     * @param {string} delim What separates the different words in this string
     *
     * @returns {string} The string, now in title case
     */
    function titleCase(str, delim) {
        if (delim === void 0) { delim = " "; }
        var words;
        var w;
        var out;
        out = "";
        words = str.split(delim);
        for (w = 0; w < words.length; w += 1) {
            if (w !== 0) {
                out += delim;
            }
            out += charAt(words[w], 0).toUpperCase();
            out += rest(words[w], 1).toLowerCase();
        }
        return out;
    }
    KIP.titleCase = titleCase;
    ;
    /**
     * Capitalizes the first letter of a given string, and converts the rest to lowercase
     *
     * @param {string} str   The string to capitalize
     *
     * @returns {string} The string, now in sentence case
     */
    function sentenceCase(str) {
        var out;
        out = charAt(str, 0).toUpperCase();
        out += rest(str, 1).toLowerCase();
        return out;
    }
    KIP.sentenceCase = sentenceCase;
    ;
    /**
     * Slightly more memorable way to get a character at a given position in a string
     *
     * @param {string} str - The string to take the character out of
     * @param {int} idx - What index of the string to get the character of
     *
     * @return {string} The character at the specified position
     */
    function charAt(str, idx) {
        return str.substr(idx, 1);
    }
    KIP.charAt = charAt;
    ;
    /**
     * Gets the substring of a string starting from a given index
     *
     * @param {string} str The string to get the substring of
     * @param {int} idx What index to start the substring at
     *
     * @return {string} The rest of the string after the provided index
     */
    function rest(str, idx) {
        return str.substring(idx, str.length);
    }
    KIP.rest = rest;
    ;
    /**
     * Trims all white space off of the beginning and end of a string
     *
     * @param {string} str The string to trim
     *
     * @return {string} The trimmed string
     */
    function trim(str) {
        var ret;
        ret = str.replace(/^\s*/g, ""); // Replace white space at the beginning
        ret = ret.replace(/\s*?$/g, ""); // Replace white space at the end
        return ret;
    }
    KIP.trim = trim;
    ;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Dates;
    (function (Dates) {
        /**
         * @file Helper functions for working with dates
         * @author Kip Price
         * @version 1.0
         * @since 1.1
         */
        /**
         *	Finds the difference in days between two date objects
         *	@param {Date} a - The first date to compare
         *	@param {Date} b - The second date to compare
         *	@param {Boolean} [signed] - If true, will take the difference in order passed in (e.g. A - B)
         *	@param {Boolean} [includeTime] - If true, will take the ms difference instead of the day difference
         *  @param {boolean} [returnMilli] - If true, returns a value in milliseconds even if milliseconds weren't compared
         **/
        function dateDiff(a, b, signed, includeTime, returnMilli) {
            var ms;
            var diff;
            var dir;
            ms = (1000 * 60 * 60 * 24);
            // clear time data if we don't care about it
            if (!includeTime) {
                a = clearTimeInfo(a, true);
                b = clearTimeInfo(b, true);
            }
            // calculate the date diff in milliseconds
            if ((a > b) || signed) {
                diff = (a - b);
            }
            else {
                diff = (b - a);
            }
            // if we don't want the response in milliseconds, return the days value (including fractional component if appropriate)
            if (!returnMilli) {
                diff = diff / ms;
            }
            return diff;
        }
        Dates.dateDiff = dateDiff;
        ;
        /**
         * Grabs the current day, default without any time data
         * @param  {boolean} include_time - True if we shouldn't exclude time data
         * @return {Date}                 Today's date
         */
        function getToday(include_time) {
            "use strict";
            var ret;
            ret = new Date();
            if (include_time)
                return ret;
            // Clear out time data
            ret = clearTimeInfo(ret);
            return ret;
        }
        Dates.getToday = getToday;
        ;
        /**
         * Clear out all time info associated with the date, including the timezone
         * @param date - the original date to clear data from
         * @returns The time-agnostic date
         */
        function clearTimeInfo(date, clearTZ) {
            var dateStr = shortDate(date);
            var outDate;
            if (clearTZ) {
                outDate = new Date(dateStr + " 00:00Z"); // Convert to this timezone and to the particular date
            }
            else {
                outDate = new Date(dateStr);
            }
            return outDate;
        }
        Dates.clearTimeInfo = clearTimeInfo;
        /**
         * Compares two dates to determine the business day difference between them
         * @param a - The first date to compare
         * @param b - The second date to compare
         * @param signed - True if we should compare the dates in order (e.g. Date A - Date B)
         * @param includeTime - If true, also compares the time
         * @param returnMilli - Returns the date difference in milliseconds instead of days
         * @returns The business-date diff between the 2 dates
         */
        function businessDateDiff(a, b, signed, includeTime, returnMilli) {
            "use strict";
            var diff;
            var dayOfWeek;
            var dir;
            var idx;
            // Calculate the standard date
            diff = dateDiff(a, b, signed, includeTime, returnMilli);
            // Grab the 2nd day of the week, because we skip the first day
            dayOfWeek = (b > a ? a.getDay() : b.getDay()) + 1;
            dayOfWeek %= 7;
            if (dayOfWeek < 0) {
                dayOfWeek = 6;
            }
            // Loop through the days between the two dates and pull out any weekend days
            var weekendDays = 0;
            for (idx = 0; idx < Math.abs(diff); idx += 1) {
                // If this day is a weekend, add it to the # of weekend days
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    weekendDays += 1;
                }
                // grab the next day, based on the date direction
                dayOfWeek += 1;
                dayOfWeek %= 7;
                if (dayOfWeek < 0) {
                    dayOfWeek = 6;
                }
            }
            // determine if we need to add or subtract to change the dates
            if (diff < 0) {
                dir = -1;
            }
            else {
                dir = 1;
            }
            return diff - (weekendDays * dir);
        }
        Dates.businessDateDiff = businessDateDiff;
        ;
        /**
         * Gets the display string of the date in a short format (MM/DD/YYYY)
         * @param {Date} dt - The date to get the short date for
         */
        function shortDate(dt) {
            "use strict";
            var yr;
            yr = getShortYear(dt);
            return (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + yr;
        }
        Dates.shortDate = shortDate;
        ;
        // InputDateFmt
        //-------------------------------------------
        /**
         * Converts the date into the format used by date inputs
         * @param {Date} dt - The date to convert
         */
        function inputDateFmt(dt) {
            "use strict";
            var m;
            var d;
            var y;
            y = dt.getFullYear();
            m = (dt.getMonth() + 1);
            if (m < 10)
                m = "0" + m;
            d = +dt.getDate();
            if (d < 10)
                d = "0" + d;
            return (dt.getFullYear() + "-" + m + "-" + d);
        }
        Dates.inputDateFmt = inputDateFmt;
        ;
        // InputToDate
        //-------------------------------------------
        /**
         * Takes a string returned by an input field for a date and converts it to a JS date
         * @param {string} iDt - The date string to convert (if available)
         * @param {string} iTime - The time string to convert (if available)
         */
        function inputToDate(iDt, iTime) {
            var outDate;
            // Handle the input date string
            if (iDt) {
                var dtArr = iDt.split("-");
                outDate = new Date(+dtArr[0], +dtArr[1] - 1, +dtArr[2]);
            }
            else {
                outDate = getToday();
            }
            // Handle the input time string
            if (iTime) {
                var timeArr = iTime.split(":");
                outDate.setHours(+timeArr[0]);
                outDate.setMinutes(+timeArr[1]);
            }
            return outDate;
        }
        Dates.inputToDate = inputToDate;
        ;
        /**
         * Gets the display string of the time in a short format (HH:MM)
         * @param {Date} dt - The date to extract the time from
         * @param {Boolean} withExtra - If true, will display as HH:MM AM/PM instead of military time
         */
        function shortTime(dt, withExtra) {
            "use strict";
            var min;
            var min_str;
            var hours;
            var half;
            //Get the minutes value for the current date
            min = +dt.getMinutes();
            hours = +dt.getHours();
            half = "";
            //We need to pad minutes to get a recognizable time format
            if (min < 10) {
                min_str = "0" + min;
            }
            else {
                min_str = min.toString();
            }
            if (withExtra) {
                half = " AM";
                if (hours >= 12)
                    half = " PM";
                if (hours > 12)
                    hours -= 12;
            }
            //Return unpadded hours (but in military time) and padded minutes.
            return hours + ":" + min_str + half;
        }
        Dates.shortTime = shortTime;
        ;
        /**
         * Gets the display string for a date and time
         * @param {Date} dt - The date to extract the formatted string from
         * @param {Boolean} withExtra - If true, uses AM/PM format instead of military time.
         */
        function shortDateTime(dt, with_extra) {
            "use strict";
            return shortDate(dt) + " " + shortTime(dt, with_extra);
        }
        Dates.shortDateTime = shortDateTime;
        ;
        function stopwatchDisplay(milli, noLeadingZeros, noBlanks) {
            "use strict";
            var seconds;
            var minutes;
            var hours;
            var days;
            var arr;
            var sec_str;
            var min_str;
            var hr_str;
            seconds = Math.floor(milli / 1000);
            milli %= 1000;
            minutes = Math.floor(seconds / 60);
            seconds %= 60;
            hours = Math.floor(minutes / 60);
            minutes %= 60;
            days = Math.floor(hours / 24);
            hours %= 24;
            // Add the leading zeros if appropriate
            if (!noLeadingZeros) {
                sec_str = KIP.addLeadingZeroes(2, seconds);
                min_str = KIP.addLeadingZeroes(2, minutes);
                hr_str = KIP.addLeadingZeroes(2, hours);
            }
            else {
                sec_str = seconds.toString();
                min_str = minutes.toString();
                hr_str = hours.toString();
            }
            return days + "D  " + hr_str + ":" + min_str + ":" + sec_str + " '" + milli;
        }
        Dates.stopwatchDisplay = stopwatchDisplay;
        ;
        function addToDate(date, counts) {
            "use strict";
            if (counts.milliseconds) {
                date.setMilliseconds(date.getMilliseconds() + counts.milliseconds);
            }
            if (counts.seconds) {
                date.setSeconds(date.getSeconds() + counts.seconds);
            }
            if (counts.minutes) {
                date.setMinutes(date.getMinutes() + counts.minutes);
            }
            if (counts.hours) {
                date.setHours(date.getHours() + counts.hours);
            }
            if (counts.days) {
                date.setDate(date.getDate() + counts.days);
            }
            return date;
        }
        Dates.addToDate = addToDate;
        ;
        /**
         * gets the name of the month given a particular date
         * @param date - the date to get the month from
         * @param [short] - If true, returns the short version of the month name
         * @returns string of month name
         */
        function getMonthName(date, short) {
            "use strict";
            switch (date.getMonth()) {
                case 0:
                    if (short)
                        return "Jan";
                    return "January";
                case 1:
                    if (short)
                        return "Feb";
                    return "February";
                case 2:
                    if (short)
                        return "Mar";
                    return "March";
                case 3:
                    if (short)
                        return "Apr";
                    return "April";
                case 4:
                    return "May";
                case 5:
                    if (short)
                        return "Jun";
                    return "June";
                case 6:
                    if (short)
                        return "Jul";
                    return "July";
                case 7:
                    if (short)
                        return "Aug";
                    return "August";
                case 8:
                    if (short)
                        return "Sept";
                    return "September";
                case 9:
                    if (short)
                        return "Oct";
                    return "October";
                case 10:
                    if (short)
                        return "Nov";
                    return "November";
                case 11:
                    if (short)
                        return "Dec";
                    return "December";
            }
            return "";
        }
        Dates.getMonthName = getMonthName;
        ;
        /**
         * Get Day Of Week
         * @param date - the date to grab the d.o.w. from
         * @param [short] - If true, returns the short version of the month name
         * @returns string of day-of-week name
         */
        function getDayOfWeek(date, short) {
            "use strict";
            switch (date.getDay()) {
                case 0:
                    if (short)
                        return "Sun";
                    return "Sunday";
                case 1:
                    if (short)
                        return "Mon";
                    return "Monday";
                case 2:
                    if (short)
                        return "Tues";
                    return "Tuesday";
                case 3:
                    if (short)
                        return "Wed";
                    return "Wednesday";
                case 4:
                    if (short)
                        return "Thurs";
                    return "Thursday";
                case 5:
                    if (short)
                        return "Fri";
                    return "Friday";
                case 6:
                    if (short)
                        return "Sat";
                    return "Saturday";
            }
            return "";
        }
        Dates.getDayOfWeek = getDayOfWeek;
        ;
        /** grab the short version of the year */
        function getShortYear(date) {
            return (+date.getFullYear() % 100);
        }
        Dates.getShortYear = getShortYear;
        function isWeekend(date) {
            var dayOfWeek = date.getDay();
            if (dayOfWeek === 0) {
                return true;
            } // SUNDAY
            if (dayOfWeek === 6) {
                return true;
            } // SATURDAY
            return false; // EVERYTHING ELSE
        }
        Dates.isWeekend = isWeekend;
        function isToday(date) {
            var today = getToday();
            var cloneDate = clearTimeInfo(date);
            return isSameDate(today, cloneDate);
        }
        Dates.isToday = isToday;
        function isSameDate(dateA, dateB) {
            if (shortDate(dateA) === shortDate(dateB)) {
                return true;
            }
            return false;
        }
        Dates.isSameDate = isSameDate;
    })(Dates = KIP.Dates || (KIP.Dates = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    // CreateTable
    //-------------------------------------------------------------------------------------
    /**
     * Creates a table with a specified set of cell elements
     * @param {string} tableID - The unique identifier to use for this table
     * @param {string} [tableClass] - The CSS class to use for the table
     * @param {array} elements - A 2D array of the indexing method [row][column] that contains the contents of the cell at this position that should be created within the table.
     *                         - Can come in three forms: a string of plain content, an already created element, or an object array with the following properties
     * @param {object} [elements[r][c].create] - An object to be passed into CreateElement, to generate the content of the cell
     * @param {string} [elements[r][c].content] - A string to be used as the content of the cell
     * @param {object} [elements[r][c].attr] - All additional attributes that should be applied to the cell (colspan & rowspan, e.g.)
     *
     * @returns {HTMLElement} The created HTML table
     *
     * */
    function createTable(tableID, tableClass, elements, rowNum, colNum) {
        "use strict";
        var tbl;
        var row;
        var cell;
        var elem;
        var rIdx;
        var cIdx;
        // Set a row number
        if (!rowNum) {
            rowNum = (elements && elements.length) || 0;
        }
        // Create the table
        tbl = KIP.createElement({
            type: "table",
            cls: tableClass
        });
        for (rIdx = 0; rIdx < rowNum; rIdx += 1) {
            // Grab the column number if we don't have it
            if (!colNum) {
                colNum = elements[rIdx].length;
            }
            row = tbl.insertRow(-1);
            for (cIdx = 0; cIdx < colNum; cIdx += 1) {
                // Check how this element should be added
                elem = elements[rIdx][cIdx];
                cell = row.insertCell(-1);
                processCellContents(elem, cell);
            }
        }
        return tbl;
    }
    KIP.createTable = createTable;
    /**
     * Processes data that can be used to populate a table cell
     * @param  {any}                  data The data to populate the cell with
     * @param  {HTMLTableCellElement} cell The cell to populate
     * @return {HTMLTableCellElement}      The cell, newly populated with contents
     */
    function processCellContents(data, cell) {
        "use strict";
        var content;
        var key;
        if (!data) {
            return cell;
        }
        // Check if this is a simple string, and if so, set it to be the cell content
        if (typeof data == "string") {
            cell.innerHTML = data;
            // Check if the content is an HTML element, in which case, append it
        }
        else if (data.appendChild) {
            cell.appendChild(data);
            // Check if the content is a custom object, in which case, parse it
        }
        else {
            if (data.create) {
                content = KIP.createElement(data.create);
                cell.appendChild(content);
            }
            else {
                cell.innerHTML = data.content;
            }
            // Handle additional properties on our custom element
            for (key in data.attr) {
                if (data.attr.hasOwnProperty(key)) {
                    cell.setAttribute(key, data.attr[key]);
                }
            }
        }
        return cell;
    }
    KIP.processCellContents = processCellContents;
    ;
    /**
     * Adds a row to an HTML table element
     * @param  {HTMLTableElement} table      The table element to add to
     * @param  {any[]}            [elements] Any elements that should be inccluded as cells in this row
     * @param  {number}           [idx]      The index at which this row should be added
     * @param  {number}           [colNum]   The number of columns that should be added to this row
     * @return {HTMLTableRowElement}       The row that was created
     */
    function addRow(table, elements, idx, colNum) {
        "use strict";
        var row;
        var cell;
        var cIdx;
        var data;
        if (!idx && (idx !== 0)) {
            idx = -1;
        }
        if (!colNum && colNum !== 0) {
            colNum = elements.length;
        }
        // Quit if we don't have a table
        if (!table)
            return;
        if (!table.insertRow)
            return;
        row = table.insertRow(idx);
        // Loop through columns to add cells
        for (cIdx = 0; cIdx < colNum; cIdx += 1) {
            cell = row.insertCell(-1);
            data = elements[cIdx] || "";
            processCellContents(data, cell);
        }
        return row;
    }
    KIP.addRow = addRow;
    ;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //#region INTERFACES
    var DEBUG = true;
    //#endregion
    // Public namespace wrapper for this functionality
    var Trig;
    (function (Trig) {
        //#region HELPER FUNCTIONS
        /**--------------------------------------------------------------------------
         * debugPoint
         * --------------------------------------------------------------------------
         * Print the coordinates contained in a point
         *
         * @param point 	the point to print for debugging
         * --------------------------------------------------------------------------
         */
        function debugPoint(point) {
            if (!point.z) {
                console.log("2D POINT: (" + point.x + ", " + point.y + ")");
            }
            else {
                console.log("3D POINT: (" + point.x + ", " + point.y + ", " + point.z + ")");
            }
        }
        Trig.debugPoint = debugPoint;
        /**--------------------------------------------------------------------------
         * degressToRadians
         * --------------------------------------------------------------------------
         * Convert degrees measure to the equivalent radians measure
         *
         * @param 	deg 	The degree value to convert
         *
         * @returns The approproate angle in radians
         * --------------------------------------------------------------------------
         */
        function degreesToRadians(deg) {
            var result = ((Math.PI * deg) / 180);
            return result;
        }
        Trig.degreesToRadians = degreesToRadians;
        /**--------------------------------------------------------------------------
         * getEndPoint
         * --------------------------------------------------------------------------
         * Calculate where a particular vector will end, given the start point, distance, and angle
         *
         * @param 	startPoint 	where the vector originates
         * @param 	deg 		the degree of angle
         * @param 	distance	how far the vector should extend
         * --------------------------------------------------------------------------
         */
        function getEndPoint(startPoint, deg, distance) {
            var rad = degreesToRadians(deg);
            var result = {
                x: (Math.cos(rad) * distance) + startPoint.x,
                y: (Math.sin(rad) * distance) + startPoint.y
            };
            return result;
        }
        Trig.getEndPoint = getEndPoint;
        //#endregion
        //#region VISUAL CHANGES
        /**--------------------------------------------------------------------------
         * arrangeRadially
         * --------------------------------------------------------------------------
         * Arrange a series of elements around a central element, making sure there is enough room for each element
         *
         * @param 	centralELem 	the element to use as the center point
         * @param 	fringeElems 	the elements to arrange around the central element
         * @param 	minAngle 		the angle at which to start (in degrees)
         * @param 	maxAngle 		the angle at which to stop (in degrees)
         * --------------------------------------------------------------------------
         */
        function arrangeRadially(centralELem, fringeElems, minAngle, maxAngle) {
            // The calculation for this needs to be as follows:
            //		1. Each element gets an angle assigned
            // 		2. each element has its dimensions determined, then the distance of circle that would be neede to fit all X
            // set defaults for angles
            minAngle = minAngle || 0;
            maxAngle = maxAngle || 360;
            var availableAngle = maxAngle - minAngle;
            var deltaAngle = availableAngle / fringeElems.length;
            var maxDistance = 0;
            var centralPoint = {
                x: centralELem.offsetWidth / 2,
                y: centralELem.offsetHeight / 2
            };
            var elem;
            // First calculate the max distance we need to move elements away
            for (var _i = 0, fringeElems_1 = fringeElems; _i < fringeElems_1.length; _i++) {
                elem = fringeElems_1[_i];
                var elemRadius = Math.max(elem.offsetWidth, elem.offsetHeight);
                var centralAngle = availableAngle / fringeElems.length;
                var internalAngle = 180 - centralAngle;
                var appropriateDistance = (elemRadius * Math.sin(degreesToRadians(internalAngle))) / Math.sin(degreesToRadians(centralAngle));
                if (appropriateDistance > maxDistance) {
                    maxDistance = appropriateDistance;
                }
            }
            if (DEBUG) {
                console.log("DISTANCE: " + maxDistance);
                console.log("CENTRAL POINT: " + "(" + centralPoint.x + ", " + centralPoint.y + ")");
            }
            // actually position the elements
            var i;
            for (i = 0; i < fringeElems.length; i += 1) {
                var pt = getEndPoint(centralPoint, minAngle + (deltaAngle * i), maxDistance);
                console.log(pt);
                elem = fringeElems[i];
                elem.style.left = (pt.x - (elem.offsetWidth / 2)) + "px";
                elem.style.top = (pt.y - (elem.offsetHeight / 2)) + "px";
            }
        }
        Trig.arrangeRadially = arrangeRadially;
        /**--------------------------------------------------------------------------
         * drawLine
         * --------------------------------------------------------------------------
         * Draws a line between two points
         *
         * @param 	start       	The start point of the line
         * @param 	end         	The end point of the line
         * @param 	host        	The element to draw the line on
         * @param 	lbl       		If included, what to label the line
         * @param 	lblNoRotate 	If true, doesn't rotate the text to match the line angle
         *
         * @returns The line that was drawn
         * --------------------------------------------------------------------------
         */
        function drawLine(start, end, host, lbl, lblNoRotate) {
            "use strict";
            var angle;
            var distance;
            var div;
            var cls;
            var lblElem;
            distance = getDistance(start, end);
            angle = getAngle(start, end);
            // Create a CSS class that can be overridden for general options
            cls = {
                "position": "absolute",
                "height": "1px",
                "transform-origin": "0px 0px"
            };
            KIP.createClass(".angledLine", cls);
            // Create the div and give it minimal styling to show the line
            div = KIP.createSimpleElement("", "angledLine");
            div.style.left = start.x + "px";
            div.style.top = start.y + "px";
            // Approriately assign the size of the element
            div.style.width = distance + "px";
            // Rotate to our specified degree
            div.style.transform = "rotate(" + angle + "deg)";
            // Add to the specified parent element
            host.appendChild(div);
            // If there is also a label, create that
            if (lbl) {
                lblElem = KIP.createSimpleElement("", "lbl", lbl);
                if (lblNoRotate) {
                    lblElem.style.transform = "rotate(" + (-1 * angle) + "deg)";
                    lblElem.style.transformOrigin = "(0, 0)";
                }
                div.appendChild(lblElem);
            }
            return div;
        }
        Trig.drawLine = drawLine;
        ;
        /**--------------------------------------------------------------------------
         * connectElements
         * --------------------------------------------------------------------------
         * Draws a line between the two provided elements
         *
         * @param 	start_elem 	The element to start the line at
         * @param 	end_elem   	The element to end the line at
         *
         * @return 	The line that gets drawn
         * --------------------------------------------------------------------------
         */
        function connectElements(start_elem, end_elem, lbl, lblNoRotate) {
            "use strict";
            var start_point;
            var end_point;
            var x_1;
            var x_2;
            var y_1;
            var y_2;
            var parent;
            // Set our parent to use when calculating the global offsets
            parent = KIP.findCommonParent(start_elem, end_elem);
            // Set the values to be the center of each element
            x_1 = KIP.globalOffsetLeft(start_elem, parent) + (start_elem.offsetWidth / 2);
            x_2 = KIP.globalOffsetLeft(end_elem, parent) + (end_elem.offsetWidth / 2);
            y_1 = KIP.globalOffsetTop(start_elem, parent) + (start_elem.offsetHeight / 2);
            y_2 = KIP.globalOffsetTop(end_elem, parent) + (end_elem.offsetHeight / 2);
            // Create the objects for these points
            start_point = { x: x_1, y: y_1 };
            end_point = { x: x_2, y: y_2 };
            return drawLine(start_point, end_point, parent, lbl, lblNoRotate);
        }
        Trig.connectElements = connectElements;
        ;
        //#endregion
        //#region CONVERSION FUNCTIONS
        /**--------------------------------------------------------------------------
         * clientRectToShape
         * --------------------------------------------------------------------------
         * Converts a Client Rect to a basic shape
         *
         * @param 	rect 	The rectangle to convert
         *
         * @returns The array of points that make up this shape
         * --------------------------------------------------------------------------
         */
        function clientRectToShape(rect) {
            var out;
            out = new Array();
            // Top-left corner
            out[0] = {
                x: rect.left,
                y: rect.top
            };
            // Top-right corner
            out[1] = {
                x: rect.left + rect.width,
                y: rect.top
            };
            // Bottom-right corner
            out[2] = {
                x: rect.left + rect.width,
                y: rect.top + rect.height
            };
            // Bottom-left corner
            out[3] = {
                x: rect.left,
                y: rect.top + rect.height
            };
            return out;
        }
        Trig.clientRectToShape = clientRectToShape;
        /**--------------------------------------------------------------------------
         * svgRectToShape
         * --------------------------------------------------------------------------
         * Converts a SVG Rect to a basic shape
         *
         * @param 	rect 	The rectangle to convert
         *
         * @returns The array of points that make up this shape
         * --------------------------------------------------------------------------
         */
        function svgRectToShape(rect) {
            var out;
            out = new Array();
            // Top-left corner
            out[0] = {
                x: rect.x,
                y: rect.y
            };
            // Top-right corner
            out[1] = {
                x: rect.x + rect.width,
                y: rect.y
            };
            // Bottom-right corner
            out[2] = {
                x: rect.x + rect.width,
                y: rect.y + rect.height
            };
            // Bottom-left corner
            out[3] = {
                x: rect.x,
                y: rect.y + rect.height
            };
            return out;
        }
        Trig.svgRectToShape = svgRectToShape;
        /**--------------------------------------------------------------------------
         * svgRectToBasicRect
         * --------------------------------------------------------------------------
         * Convert a SVG rectangle to a basic rectangle
         *
         * @param 	rect 	The rectangle to convert
         *
         * @returns The resulting IBasicRect representation of the passed in rect
         * --------------------------------------------------------------------------
         */
        function svgRectToBasicRect(rect) {
            var out;
            out = {
                x: rect.x,
                y: rect.y,
                w: rect.width,
                h: rect.height
            };
            return out;
        }
        Trig.svgRectToBasicRect = svgRectToBasicRect;
        ;
        /**--------------------------------------------------------------------------
         * clientRectToBasicRect
         * --------------------------------------------------------------------------
         * Convert a client rectangle to a basic rectangle
         *
         * @param 	rect 	The rectangle to convert
         *
         * @returns The resulting IBasicRect representation of the passed in rect
         * --------------------------------------------------------------------------
         */
        function clientRectToBasicRect(rect) {
            var out;
            out = {
                x: rect.left,
                y: rect.top,
                w: rect.width,
                h: rect.height
            };
            return out;
        }
        Trig.clientRectToBasicRect = clientRectToBasicRect;
        /**--------------------------------------------------------------------------
         * toBasicRect
         * --------------------------------------------------------------------------
         * Converts any supported rectangle to a basic rectangle
         *
         * @param 	rect 	The rectangle to convert
         *
         * @returns The basic rect version of this client / svg rect
         * --------------------------------------------------------------------------
         */
        function toBasicRect(rect) {
            var r;
            if (KIP.isIBasicRect(rect)) {
                r = rect;
            }
            else if (KIP.isClientRect(rect)) {
                r = clientRectToBasicRect(rect);
            }
            else if (KIP.isSVGRect(rect)) {
                r = svgRectToBasicRect(rect);
            }
            return r;
        }
        Trig.toBasicRect = toBasicRect;
        ;
        //#endregion
        //#region CALCULATION FUNCTIONS
        /**--------------------------------------------------------------------------
         * getAngle
         * --------------------------------------------------------------------------
         * Finds the angle between two points
         *
         * @param {Object} start - The origin point of an angle
         * @param {Number} start.x - The x position of the origin point
         * @param {Number} start.y - The y position of the origin point
         * @param {Object} end - The destination point of an angle
         * @param {Number} end.x - The x position of the end point
         * @param {Number} end.y - The y position of the end point
         *
         * @return {Number} The angle (in degrees) between the two points
         * --------------------------------------------------------------------------
         */
        function getAngle(start, end) {
            "use strict";
            var dx;
            var dy;
            var q_sign;
            var q_ang;
            var angle;
            dx = (end.x - start.x);
            dy = (end.y - start.y);
            // Don't divide by zero
            if (dx === 0)
                return (dy < 0) ? 270 : 90;
            // Handle horizontals too
            if (dy === 0)
                return (dx < 0) ? 180 : 0;
            // Atan requires that all elements are positive
            q_sign = ((dx * dy) > 0) ? 1 : -1;
            q_ang = (dx < 0) ? Math.PI : 0;
            angle = Math.atan(Math.abs(dy) / Math.abs(dx));
            angle = ((angle * q_sign) + q_ang);
            return (angle * (180 / Math.PI));
        }
        Trig.getAngle = getAngle;
        ;
        /**--------------------------------------------------------------------------
         * getDistance
         * --------------------------------------------------------------------------
         * Finds the distance between the two provided points
         *
         * @param 	start 	The first endpoint of the segment we are measuring
         * @param 	end 	The second enpoint of the segment we are measuring
         *
         * @return The distance between the two points
         * --------------------------------------------------------------------------
         */
        function getDistance(start, end) {
            "use strict";
            var distance;
            var dx;
            var dy;
            dx = (start.x - end.x);
            dy = (start.y - end.y);
            distance = Math.sqrt((dx * dx) + (dy * dy));
            return distance;
        }
        Trig.getDistance = getDistance;
        ;
        /**--------------------------------------------------------------------------
         * calculatePolygonInternalAngle
         * --------------------------------------------------------------------------
         * calculate the internal angle for a given polygon
         *
         * @param 	numberOfSides 	The number of sides that the polygon has
         *
         * @returns the internal angle for this polygon, in radians
         * --------------------------------------------------------------------------
         */
        function calculatePolygonInternalAngle(numberOfSides) {
            return KIP.roundToPlace(degreesToRadians(360 / numberOfSides), 1000);
        }
        Trig.calculatePolygonInternalAngle = calculatePolygonInternalAngle;
        //#endregion
        //#region CONTAINMENT FUNCTIONS
        /**--------------------------------------------------------------------------
         * isWithin
         * --------------------------------------------------------------------------
         * Checks whether a value is within a max/min range
         *
         * @param 	val           	The value to check for inclusion
         * @param 	min           	The max value
         * @param 	max           	The min value
         * @param 	non_inclusive 	True if we shouldn't include the end points
         *
         * @returns True if the value is contained in the range
         * --------------------------------------------------------------------------
         */
        function isWithin(val, min, max, non_inclusive) {
            "use strict";
            if (non_inclusive)
                return (val < max && val > min);
            return (val <= max && val >= min);
        }
        Trig.isWithin = isWithin;
        /**-------------------------------------------------------------------------
         * isPointContained
         * --------------------------------------------------------------------------
         * Determines whether a point is contained within a particular rectangle
         *
         * @param 	pt 		The point to check for containment
         * @param 	rect 	The rectangle to check
         *
         * @returns True if the point is contained in the rectangle
         ----------------------------------------------------------------------------*/
        function isPointContained(pt, rect) {
            "use strict";
            var r = toBasicRect(rect);
            if (pt.x < r.x) {
                return false;
            }
            if (pt.x > (r.x + r.w)) {
                return false;
            }
            if (pt.y < r.y) {
                return false;
            }
            if (pt.y > r.y + r.h) {
                return false;
            }
            return true;
        }
        Trig.isPointContained = isPointContained;
        /**----------------------------------------------------------------------------
         * isRectContained
         * ----------------------------------------------------------------------------
         * Checks whether a client rect is entirely contained within another
         *
         * @param 	rect      	The element to check for containement
         * @param 	container 	The element to check if the rect is contained within
         *
         * @returns True if rect is completely contained by container
         ------------------------------------------------------------------------------*/
        function isRectContained(rect, container) {
            var r;
            var c;
            // Convert the first rect to a basic rect
            r = toBasicRect(rect);
            // Convert the second rect to a basic rect
            c = toBasicRect(container);
            // Too far left
            if (r.x < c.x)
                return false;
            // Too far right
            if ((r.x + r.w) > (c.w + c.x))
                return false;
            // Too far up
            if (r.y < c.y)
                return false;
            // Too far down
            if ((r.y + r.h) > (c.h + c.y))
                return false;
            // Just right
            return true;
        }
        Trig.isRectContained = isRectContained;
        /**-----------------------------------------------------------------------------
         * isElementContained
         *------------------------------------------------------------------------------
         * Checks if an element is completely contained by another element
         *
         * @param 	elem      	The element to check for containment
         * @param 	container 	The element to check if it contains the other elem
         *
         * @returns True if the element is completely contained
         -------------------------------------------------------------------------------
         */
        function isElementContained(elem, container) {
            var rect = elem.getBoundingClientRect();
            var bounds = elem.getBoundingClientRect();
            return isRectContained(rect, bounds);
        }
        Trig.isElementContained = isElementContained;
        ;
        /**--------------------------------------------------------------------------
         * isShapeContained
         * --------------------------------------------------------------------------
         * Checks if a given shape is contained within a given bounding box
         *
         * @param 	shape 	The collection of points to check
         * @param 	bounds 	The bounding box to be within
         *
         * @returns True if the shape is completely contained in the bounding box
         * --------------------------------------------------------------------------
         */
        function isShapeContained(shape, bounds) {
            var pt;
            for (var _i = 0, shape_1 = shape; _i < shape_1.length; _i++) {
                pt = shape_1[_i];
                if (!isPointContained(pt, bounds)) {
                    return false;
                }
            }
            return true;
        }
        Trig.isShapeContained = isShapeContained;
        //#endregion
        //#region OVERLAP FUNCTIONS
        /**--------------------------------------------------------------------------
         * doElementsOverlap
         * --------------------------------------------------------------------------
         * Checks if two given elements overlap
         *
         * @param 	elem1 	The first element to check
         * @param 	elem2 	The second element to check
         *
         * @returns True if the elements overlap, false otherwise
         * --------------------------------------------------------------------------
         */
        function doElementsOverlap(elem1, elem2) {
            "use strict";
            var rect1;
            var rect2;
            rect1 = elem1.getBoundingClientRect();
            rect2 = elem2.getBoundingClientRect();
            return doRectsOverlap(rect1, rect2);
        }
        Trig.doElementsOverlap = doElementsOverlap;
        ;
        /**--------------------------------------------------------------------------
         * doRectsOverlap
         * --------------------------------------------------------------------------
         * Checks if two rectangles overlap at all
         *
         * @param 	rect1 	The first rectangle to check
         * @param 	rect2 	The second rectangle to check
         *
         * @returns True if there is any overlap between the rectangles
         * --------------------------------------------------------------------------
         */
        function doRectsOverlap(rect1, rect2) {
            var r1 = toBasicRect(rect1);
            var r2 = toBasicRect(rect2);
            return false;
        }
        Trig.doRectsOverlap = doRectsOverlap;
        /**--------------------------------------------------------------------------
         * doBasicRectsOverlap
         * --------------------------------------------------------------------------
         * detect if two rectangles overlap
         *
         * @param 	rect1	the first rectangle to compare
         * @param 	rect2	the second rectangle to compare
         *
         * @returns true if the two rectangles do overlap
         * --------------------------------------------------------------------------
         */
        function doBasicRectsOverlap(rect1, rect2) {
            var x_overlap;
            var y_overlap;
            if (rect1.x >= rect2.x && rect1.x <= (rect2.w + rect2.x)) {
                x_overlap = true;
            }
            if (rect2.x >= rect1.x && rect2.x <= (rect1.w + rect1.x)) {
                x_overlap = true;
            }
            if (rect1.y >= rect2.y && rect1.y <= (rect2.h + rect2.y)) {
                y_overlap = true;
            }
            if (rect2.y >= rect1.y && rect2.y <= (rect1.h + rect1.y)) {
                y_overlap = true;
            }
            return (x_overlap && y_overlap);
        }
        Trig.doBasicRectsOverlap = doBasicRectsOverlap;
        //#endregion
        //#region INTERSECTION FUNCTIONS
        /**--------------------------------------------------------------------------
         * findBasicRectIntersection
         * --------------------------------------------------------------------------
         * calculate the overlap section for 2 given basic rectangles
         *
         * @param rect1 - the first rectangle to check
         * @param rect2 - the second rectangle to check
         *
         * @returns The rectangle of overlap
         * --------------------------------------------------------------------------
         */
        function findBasicRectIntersection(rect1, rect2) {
            var out;
            var min_x = Math.max(rect1.x, rect2.x);
            var max_x = Math.min(rect1.x + rect1.w, rect2.x + rect2.w);
            var min_y = Math.max(rect1.y, rect2.y);
            var max_y = Math.min(rect1.y + rect1.h, rect2.y + rect2.h);
            out = {
                x: min_x,
                y: min_y,
                w: (max_x - min_x),
                h: (max_y - min_y)
            };
            return out;
        }
        Trig.findBasicRectIntersection = findBasicRectIntersection;
        //#endregion
    })(Trig = KIP.Trig || (KIP.Trig = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    function cloneRect(rect) {
        var out = {
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h
        };
        return out;
    }
    KIP.cloneRect = cloneRect;
    function clonePoint(point) {
        var out = {
            x: point.x,
            y: point.y
        };
        return out;
    }
    KIP.clonePoint = clonePoint;
    function clonePointArray(points) {
        var out = [];
        var pt;
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            pt = points_1[_i];
            var clone = clonePoint(pt);
            out.push(clone);
        }
        return out;
    }
    KIP.clonePointArray = clonePointArray;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var testDiv = KIP.createElement({ cls: "tests" });
    var group = testDiv;
    var createdUI = false;
    function assert(name, actualResult, expectedResult, message) {
        var pass = (actualResult === expectedResult);
        var value = actualResult.toString() + " " + (pass ? "===" : "!==") + " " + expectedResult.toString();
        message = message || "";
        constructTestUI(name, pass, value, message);
        logTest(name, pass, value, message);
    }
    KIP.assert = assert;
    function startGroup(groupName) {
        console.log("\n=== " + groupName + " ===");
        group = KIP.createElement({ cls: "group", parent: testDiv });
        KIP.createElement({ cls: "groupName", parent: group, content: groupName });
    }
    KIP.startGroup = startGroup;
    function test(actualResult, expectedResult) {
        return (actualResult === expectedResult);
    }
    KIP.test = test;
    /**
     * Shows all test results
     */
    function showResults() {
        if (!testDiv.parentNode) {
            document.body.appendChild(testDiv);
        }
        KIP.removeClass(testDiv, "hidden");
    }
    KIP.showResults = showResults;
    /**
     * Hides all test results
     */
    function hideResults() {
        KIP.addClass(testDiv, "hidden");
    }
    KIP.hideResults = hideResults;
    /**
     * Creates a test element for the div
     * @param {boolean} pass    True if the test passed
     * @param {string}  message Message to display with test
     */
    function buildTestString(name, pass, value_string, message) {
        var content;
        content = passToString(pass).toUpperCase();
        content += ": " + name;
        content += (!pass ? " [" + value_string + "]" : "");
        content += (message ? " - " + message : "");
        return content;
    }
    function passToString(pass) {
        return (pass ? "pass" : "fail");
    }
    function constructTestUI(name, pass, value_string, message) {
        var pass_str = passToString(pass);
        var test = KIP.createElement({ cls: "test", parent: group });
        if (!createdUI) {
            createUI();
        }
        KIP.createElement({ cls: pass_str, content: pass_str.toUpperCase(), parent: test });
        KIP.createElement({ cls: "name", content: name, parent: test });
        if (!pass) {
            KIP.createElement({ cls: "err", content: value_string, parent: test });
            KIP.createElement({ cls: "message", content: message, parent: test });
        }
    }
    function logTest(name, pass, value_str, message) {
        var content = buildTestString(name, pass, value_str, message);
        console.log(content);
    }
    //==============
    // BUILD CLASSES
    function createUI() {
        if (createdUI) {
            return;
        }
        createTestsClass();
        createGroupClass();
        createGroupNameClass();
        createHiddenClass();
        createTestClass();
        createSubTestClass();
        createTestPassClass();
        createTestFailClass();
        createTestNameClass();
        createErrClass();
        createTestMessageClass();
        createdUI = true;
    }
    function createHiddenClass() {
        var cls;
        cls = {
            display: "none",
        };
        KIP.createClass(".hidden", cls);
    }
    function createGroupClass() {
        var cls;
        cls = {
            "margin-bottom": "10px",
            "display": "table",
            "border-collapse": "collapse"
        };
        KIP.createClass(".group", cls);
    }
    function createGroupNameClass() {
        var cls;
        cls = {
            "font-size": "1.3em",
            "color": "#666",
            "display": "table-caption"
        };
        KIP.createClass(".groupName", cls);
    }
    function createTestsClass() {
        var cls;
        cls = {
            position: "absolute",
            left: "100px",
            top: "100px",
            "font-family": "'Segoe UI', 'Calibri', 'Helvetica'"
        };
        KIP.createClass(".tests", cls);
    }
    function createTestClass() {
        var cls;
        cls = {
            "display": "table-row"
        };
        KIP.createClass(".test", cls);
    }
    function createSubTestClass() {
        var cls;
        cls = {
            "border": "solid transparent",
            "border-width": "10px",
            "margin-right": "10px",
            "display": "table-cell"
        };
        KIP.createClass(".test > div", cls);
    }
    function createTestFailClass() {
        var cls;
        cls = {
            color: "rgb(190,50,30)",
            "font-weight": "bold",
        };
        KIP.createClass(".test .fail", cls);
    }
    function createTestPassClass() {
        var cls;
        cls = {
            color: "rgb(50,190,30)",
            "font-weight": "bold",
            "margin-right": "10px",
            "display": "table-cell"
        };
        KIP.createClass(".test .pass", cls);
    }
    function createTestNameClass() {
        var cls;
        cls = {
            color: "#333",
            "margin-right": "10px",
            "display": "table-cell"
        };
        KIP.createClass(".test .name", cls);
    }
    function createErrClass() {
        var cls;
        cls = {
            "text-style": "italic",
            "color": "#666",
            "font-size": "0.8em"
        };
        KIP.createClass(".test .err", cls);
    }
    function createTestMessageClass() {
        var cls;
        cls = {
            color: "#888",
            "margin-right": "10px",
            "display": "table-cell"
        };
        KIP.createClass(".test .message", cls);
    }
    //==============
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Helpers;
    (function (Helpers) {
        /** how frequently we should loop in order to calculate the new scroll position */
        var LOOP_INTERVAL = 20;
        /** number of steps we should use in scrolling */
        var NUM_STEPS = 100;
        /**--------------------------------------------------------------------------
         * scrollTo
         * --------------------------------------------------------------------------
         * animate a scroll to a particular element
         *
         * @param 	elem  	the element to scroll to
         * @param 	toTop 	if true, ensures that the top of the element is at the top of the screen
         * --------------------------------------------------------------------------
         */
        function scrollTo(elem, toTop) {
            // figure out how far we need to scroll
            var top = _calculateScrollTarget(elem, toTop);
            // now adjust by the amount we've scrolled thus far
            var curAmt = _calculateCurAmt(top);
            var isNegative = (curAmt < 0);
            // calculate what a step looks like in this state
            var stepAmt = curAmt / (NUM_STEPS * NUM_STEPS);
            // We're going to emulate an exponential curve by
            //	1. picking an arbitrary number of steps
            //	2. pick an arbitrary distance to move
            //	3. once we hit halfway, reverse
            //	4. decelerate to find the right point
            window.setTimeout(function () {
                _loop(top, curAmt, 0, isNegative, stepAmt);
            }, LOOP_INTERVAL);
        }
        Helpers.scrollTo = scrollTo;
        /**--------------------------------------------------------------------------
         * _calculateScrollTarget
         * --------------------------------------------------------------------------
         * figure out where we should be targeting as the top of the scroll
         *
         * @param	elem	The element to calculate the distance for
         * @param	toTop	If true, scrolls to the top of the page
         *
         * @returns	The Y value that should be scrolled to
         * --------------------------------------------------------------------------
         */
        function _calculateScrollTarget(elem, toTop) {
            var top = elem.offsetTop; // find where the elem is on the screen
            var height = (Math.min(window.innerHeight, elem.offsetHeight)); // figure out if the height should be the window or the elem
            top += height; // add the height to the top
            if (!toTop) {
                return top;
            } // if we dont; care about sending the elem to the top, just quit now
            if (elem.offsetTop < 0) {
                top -= (window.innerHeight / 2);
            }
            else if (elem.offsetTop > (window.innerHeight / 2)) {
                top += (window.innerHeight / 2);
            }
            else {
                //TODO: Finish this case
            }
            return top; // return the appriate value
        }
        /**--------------------------------------------------------------------------
         * _loop
         * --------------------------------------------------------------------------
         * estimate an exponential curve to emulate a smooth scrolling experience
         *
         * @param	top			The current position of the top of the page
         * @param	totalAmt	The total amount we need to scroll
         * @param	iteration	How many times we've looped
         * @param	isNegative	True if we should scroll up
         * @param	stepAmt		How much we should scroll per iteration
         * @param	half		True if we have passed the halfway mark
         * --------------------------------------------------------------------------
         */
        function _loop(top, totalAmt, iteration, isNegative, stepAmt, half) {
            // Increment our counter & calculate how much space we have left
            var curAmt = _calculateCurAmt(top);
            iteration += 1;
            // verify that we haven't gone too far
            var wentTooFar;
            if (isNegative) {
                wentTooFar = (curAmt >= 0);
            }
            else {
                wentTooFar = (curAmt <= 0);
            }
            // check if we still havene't moved, as that's. apretty good sign that we can't or won't
            var canMove;
            canMove = !((iteration !== 1) && (curAmt === totalAmt));
            // TODO: make this work
            // If we've either exceed our target, or we've hit the # of steps, quit
            if (wentTooFar || (iteration === NUM_STEPS)) {
                return;
            }
            // Figure out if we are accelerating or decelerating, based on whether we are halfway yet
            var dy;
            if ((curAmt / totalAmt) > (1 / 2)) {
                dy = iteration;
            }
            else {
                if (!half) {
                    half = iteration;
                }
                dy = ((half * 2) - iteration);
            }
            // Calculate how much we should move this time
            dy = stepAmt * (dy * dy);
            window.scrollBy(0, dy);
            window.setTimeout(function () {
                _loop(top, totalAmt, iteration, isNegative, stepAmt, half);
            }, LOOP_INTERVAL);
        }
        /**--------------------------------------------------------------------------
         * _calculateCurAmt
         * --------------------------------------------------------------------------
         * calculate how much distance is remaining to close in the scrolling pattern
         *
         * @param	top		The top value for the element we are scrolling to
         *
         * @returns	How much distance there is between the current position and the target
         * --------------------------------------------------------------------------
         */
        function _calculateCurAmt(top) {
            var scrollPosition = KIP.getScrollPosition();
            var curAmt = top - (scrollPosition.y + window.innerHeight);
            return curAmt;
        }
    })(Helpers = KIP.Helpers || (KIP.Helpers = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Styles;
    (function (Styles) {
        var Stylable = (function (_super) {
            __extends(Stylable, _super);
            function Stylable() {
                var _this = _super.call(this, "Stylable") || this;
                _this._colors = [];
                return _this;
            }
            Object.defineProperty(Stylable.prototype, "styles", {
                get: function () { return this._styles; },
                enumerable: true,
                configurable: true
            });
            Stylable.prototype.setThemeColor = function (idx, color, skipDupCheck) {
                if (!color) {
                    return;
                }
                if (!skipDupCheck && (this._colors[idx] === color)) {
                    return;
                }
                this._generalReplace("<" + idx + ">", this._colors[idx], color);
                this._colors[idx] = color;
                this._createStyles(true);
            };
            /** create the styles for this class */
            Stylable.prototype._createStyles = function (forceOverride) {
                // run through our particular classes
                if (!this._styles) {
                    return;
                }
                KIP.map(this.styles, function (cssDeclaration, selector) {
                    Styles.createClass(selector, cssDeclaration, false, forceOverride);
                });
            };
            Stylable.prototype._mergeThemes = function () {
                var themes = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    themes[_i] = arguments[_i];
                }
                var out = {};
                themes.map(function (style) {
                    KIP.map(style, function (def, selector) {
                        out[selector] = def;
                    });
                });
                return out;
            };
            Stylable.prototype._replaceThemeColors = function (oldTheme, newTheme) {
                this._generalReplace("theme", oldTheme, newTheme);
            };
            ;
            Stylable.prototype._replaceSubThemeColors = function (oldColor, newColor) {
                this._generalReplace("subTheme", oldColor, newColor);
            };
            Stylable.prototype._generalReplace = function (placeholder, oldVal, newVal) {
                var _this = this;
                if (!newVal) {
                    return;
                }
                KIP.map(this._styles, function (cssDeclaration, selector) {
                    KIP.map(cssDeclaration, function (value, key) {
                        var valArray = value.split(" ");
                        var replaced = false;
                        valArray.map(function (val, idx) {
                            if ((val === placeholder) || (val === oldVal)) {
                                valArray[idx] = newVal;
                                replaced = true;
                            }
                        });
                        if (!replaced) {
                            return;
                        }
                        _this._styles[selector][key] = valArray.join(" ");
                        console.log(newVal + " " + _this._styles[selector][key]);
                    });
                });
            };
            Stylable.prototype._applyColors = function (otherElem) {
                var idx = 0;
                for (idx; idx < this._colors.length; idx += 1) {
                    if (!this._colors[idx]) {
                        continue;
                    }
                    if (!otherElem) {
                        this.setThemeColor(idx, this._colors[idx], true);
                    }
                    else {
                        otherElem.setThemeColor(idx, this._colors[idx]);
                    }
                }
            };
            return Stylable;
        }(KIP.NamedClass));
        Styles.Stylable = Stylable;
        //#region HANDLE THE CLASS CREATION
        function createClass(selector, attr, noAppend, forceOverride) {
            var cls;
            var a;
            var styleString = "";
            // If this style already exists, append to it
            var cssRule = getExistingSelector(selector);
            if (!cssRule) {
                cssRule = { style: {} };
            }
            // Loop through the attributes we were passed in to create the class
            styleString += "\n" + selector + " {\n";
            var addedSomething = false;
            KIP.map(attr, function (value, a) {
                // quit if this rule has already been added for this selector
                if (cssRule.style[a]) {
                    return;
                }
                if (attr[a] === "theme") {
                    return;
                }
                if (attr[a] === "subTheme") {
                    return;
                }
                styleString += "\t" + getPropertyName(a) + " : " + attr[a] + ";\n";
                addedSomething = true;
            });
            styleString += "\n}";
            // If we created an empty class, just get our
            if (!addedSomething && !forceOverride) {
                return null;
            }
            // Append the class to the head of the document
            if (!noAppend) {
                cls = createStyleElement();
                cls.innerHTML += styleString;
                if (!cls.parentNode) {
                    document.head.appendChild(cls);
                }
            }
            // Return the style node
            return cls;
        }
        Styles.createClass = createClass;
        /** create the element that will then be added to the document */
        function createStyleElement() {
            var styles;
            var cls;
            styles = document.getElementsByTagName("style");
            if (styles.length > 0) {
                cls = styles[0];
            }
            else {
                cls = document.createElement("style");
                cls.innerHTML = "";
            }
            return cls;
        }
        /** grab the appropriate property name for the CSS class */
        function getPropertyName(jsFriendlyName) {
            if (jsFriendlyName.toLowerCase() === jsFriendlyName) {
                return jsFriendlyName;
            }
            var chars = jsFriendlyName.split("");
            var char;
            for (var idx = 0; idx < chars.length; idx++) {
                char = chars[idx];
                if (char.toLowerCase() !== char) {
                    chars[idx] = "-" + char.toLowerCase();
                }
            }
            return chars.join("");
        }
        /** return the appropriate class */
        function buildClassString() {
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i] = arguments[_i];
            }
            var outCls = "";
            for (var idx = 0; idx < classes.length; idx += 1) {
                if (!classes[idx]) {
                    continue;
                }
                if (outCls.length > 0) {
                    outCls += " ";
                }
                outCls += classes[idx];
            }
            return outCls;
        }
        Styles.buildClassString = buildClassString;
        function getExistingSelector(selector) {
            var css;
            var rules;
            var rule;
            // Loop through all of the stylesheets we have available
            for (var sIdx = 0; sIdx < document.styleSheets.length; sIdx += 1) {
                // Pull in the appropriate index for the browser we're using
                css = document.all ? 'rules' : 'cssRules'; //cross browser
                rules = document.styleSheets[sIdx][css];
                // If we have an index...
                if (rules) {
                    // ... loop through all and check for the actual class
                    for (var i = 0; i < rules.length; i += 1) {
                        rule = rules[i];
                        // If we find the class...
                        if (rule.selectorText === selector) {
                            return rule;
                        }
                    }
                }
            }
        }
    })(Styles = KIP.Styles || (KIP.Styles = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /**...........................................................................
     * @class Drawable
     * Creates an element
     * ...........................................................................
     */
    var Drawable = (function (_super) {
        __extends(Drawable, _super);
        /**...........................................................................
         * Create a Drawable element
         * @param	baseElemTemplate	If provided, the template upon which to create the base element
         * ...........................................................................
         */
        function Drawable(baseElemTemplate) {
            var _this = 
            // Initialize both the stylable parts of this and the 
            _super.call(this) || this;
            _super.prototype._addClassName.call(_this, "Drawable");
            // initialize our elements
            _this._elems = {};
            // Handle when we are passed an element to form the base of 
            if (baseElemTemplate) {
                _this._elems.base = KIP.createElement(baseElemTemplate);
            }
            // actually create the elements associated with this class
            _this._createElements();
            return _this;
        }
        /**...........................................................................
         * draw
         * ...........................................................................
         * Draws the element of this Drawable & all children + siblings
         * @param 	parent  	The element this Drawable should be added to
         * @param 	force 		True if we need to remove & redraw this element
         * ...........................................................................
         */
        Drawable.prototype.draw = function (parent, force) {
            // Quit if we don't have anything to draw
            if (!this._elems || !this._elems.base) {
                return;
            }
            // Refresh our contents
            this._refresh();
            // Save off this parent & quit if there is no parent
            this._parent = parent || this._parent;
            if (!this._parent) {
                return;
            }
            // Draw the base element
            this._drawHelper();
        };
        ;
        /**...........................................................................
         * _drawHelper
         * ...........................................................................
         * Draws a Drawable or HTML Element
         * ...........................................................................
         */
        Drawable.prototype._drawHelper = function () {
            var elem_draw = elem;
            var elem_html = elem;
            // If it's a drawable, just draw it
            if (elem_draw.draw) {
                elem_draw.draw(parent, force, iBefore);
                return;
            }
            // If we are redrawing or have never drawn the element, do so
            if (force || (!elem_html.parentNode)) {
                // Remove first from the parent if we need to
                if (force && elem_html.parentNode) {
                    if (!iBefore) {
                        iBefore = elem_html.nextSibling;
                    }
                    elem_html.parentNode.removeChild(elem_html);
                }
                // If there's no parent, quit
                if (!parent) {
                    return;
                }
                // Add back to the parent
                if (iBefore) {
                    parent.insertBefore(elem_html, iBefore);
                }
                else {
                    parent.appendChild(elem_html);
                }
            }
        };
        /**...........................................................................
         * erase
         * ...........................................................................
         * Remove this drawable from the canvas
         * ...........................................................................
         */
        Drawable.prototype.erase = function () {
            var base = this._elems.base;
            if (base.parentNode) {
                base.parentNode.removeChild(base);
            }
        };
        ;
        /**
         * Overridable function that refreshes the UI of this Drawable. Does not guarantee that the element has been drawn.
         */
        Drawable.prototype._refresh = function () {
        };
        ;
        return Drawable;
    }(KIP.Styles.Stylable));
    KIP.Drawable = Drawable;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //===========================
    // EDITABLE CLASS
    //===========================
    /**
     * Drawable element that also allows for editing inline
     * @class Editable
     */
    var Editable = (function (_super) {
        __extends(Editable, _super);
        //===================================
        // INITIALIZE OUR EDITABLE
        //===================================
        /**
         * Creates an Editable object
         * @param {string}              [id]       Unique identifier for the Editable
         * @param {string}              [type]     The type of content contained in the Editable
         * @param {T}                   [value]    The initial value of the Editable
         * @param {ValidateFunction}    [validate] What function we should use to validate the Editable
         * @param {UpdateFunction}      [update]   The function we should call when the Editable updates
         * @param {FormatFunction<T>}   [format]   The function we should call to format data to a string
         * @param {UnformatFunction<T>} [unformat] The function we should use to convert data to the appropriate data type
         */
        function Editable(id, type, value, onValidate, onUpdate, onFormat, onUnformat) {
            var _this = 
            // Call the Drawable constructor
            _super.call(this, id, "editable", (onFormat ? onFormat(value) : value.toString())) || this;
            _this.addClassName("Editable");
            // Store our properties
            _this.type = type;
            _this.value = value;
            _this.onValidate = onValidate;
            _this.onUpdate = onUpdate;
            _this.formatFunc = onFormat;
            _this.onUnformat = onUnformat;
            // Default the format functions
            if (!_this.formatFunc) {
                _this.formatFunc = function (value) {
                    return value.toString();
                };
            }
            if (!_this.onUnformat) {
                _this.onUnformat = function (value) {
                    return value;
                };
            }
            // Initialize our modifying flag
            _this.isModifying = false;
            // Create the elements, along with their listeners
            _this.createElements();
            _this.addListeners();
            return _this;
        }
        //=================================
        // CREATE ELEMENTS & LISTENERS
        //=================================
        /** Create elements for the editable */
        Editable.prototype.createElements = function () {
            var val_str;
            val_str = this.formatFunc(this.value);
            this.elems = {
                display: KIP.createSimpleElement("", "", val_str, null, null, this.base),
                input: KIP.createElement({
                    type: "input",
                    attr: {
                        "type": this.type,
                        "value": this.value
                    }
                })
            };
            // Create styles
            this.__createStyles();
        };
        /** Add event listeners to the editable */
        Editable.prototype.addListeners = function () {
            var _this = this;
            // Click event on our base element
            this.base.addEventListener("click", function (e) {
                if (!_this.isModifying) {
                    _this.modify();
                }
                // Make sure we prevent other events from being propagated (but why?)
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
                if (e.cancelBubble) {
                    e.cancelBubble = true;
                }
            });
            // Enter key recognition on our input element
            this.elems.input.addEventListener("keydown", function (ev) {
                if (ev.keyCode === 13 && _this.isModifying) {
                    _this.__save();
                }
            });
            // Blur recognition on our input element
            this.elems.input.addEventListener("blur", function () {
                if (_this.isModifying) {
                    _this.__save();
                }
            });
        };
        //===================================
        // HANDLE CHANGES TO THE ELEMENT
        //===================================
        /**
         * Save the contents of the Editable
         * @returns {boolean} True if the editable was successfully saved
         */
        Editable.prototype.__save = function () {
            var validated;
            var content = this.elems.input.value;
            validated = this.__validate(content);
            // Update UI / saved data based on whether validation passed
            if (!validated.passed) {
                return this.__onValidationFailed(validated.allowLeave);
            }
            else {
                return this.__onValidationPassed(content);
            }
        };
        //=====================================
        // VALIDATE USER INPUT IN THE ELEMENT
        //=====================================
        /** validate whether the current data in the input field is valid */
        Editable.prototype.__validate = function (content) {
            var validated;
            // Check if the editable could be validated
            if (this.onValidate) {
                validated = this.onValidate(content);
            }
            else {
                validated = { passed: true };
            }
            return validated;
        };
        /** validation failing for this element */
        Editable.prototype.__onValidationFailed = function (allowLeave) {
            // Add the error class
            KIP.addClass(this.elems.input, "error");
            // If we won't allow the user to leave, don't
            if (!allowLeave) {
                this.elems.input.select();
                this.elems.input.focus();
            }
            return false;
        };
        /** handle validation passing for this element */
        Editable.prototype.__onValidationPassed = function (content) {
            // Remove any error hiliting if we did it
            KIP.removeClass(this.elems.input, "error");
            // Resave our value through our unformat function
            this.value = this.onUnformat(content);
            // Call our update function in order to notify our parent
            if (this.onUpdate) {
                this.onUpdate(this.value);
            }
            return true;
        };
        //=================================
        // ENABLE THE ELEMENT FOR EDITING
        //=================================
        /**
         * Modifies the Editable element
         * @returns {boolean} True if we were able to start modifying the element
         */
        Editable.prototype.modify = function () {
            // Don't start modifying again if we are already modifying
            if (this.isModifying) {
                return false;
            }
            // Set our property to true
            this.isModifying = true;
            // Grab the appropriately formatted string for this element
            this.elems.input.value = this.formatFunc(this.value, true);
            // Update the HTML to have an editable field
            this.base.removeChild(this.elems.display);
            this.base.appendChild(this.elems.input);
            // Select our input
            this.elems.input.select();
            this.elems.input.focus();
            return true;
        };
        //=============================
        // CREATE STANDARD STYLES
        //=============================
        /** Creates CSS styles for the editable */
        Editable.prototype.__createStyles = function () {
            // Don't create styles twice
            if (KIP.StylesAdded.Editable) {
                return;
            }
            // Create all of the styles we need for editables
            this.__regularEditableStyle();
            this.__inputStyle();
            this.__focusedStyle();
            this.__errorStyle();
            // Track that we added styles for editables
            KIP.StylesAdded.Editable = true;
        };
        /** create styles for the regular editable elements  */
        Editable.prototype.__regularEditableStyle = function () {
            var cls = {
                "font-family": "Segoe UI, Calibri, sans-serif",
                "font-size": "1em",
                "cursor": "pointer"
            };
            KIP.createClass(".editable", cls);
        };
        /** create styles for input elements within an element */
        Editable.prototype.__inputStyle = function () {
            var cls = {
                "font-family": "Segoe UI, Calibri, sans-serif",
                "font-size": "1em",
                "background-color": "#EEE",
                "border": "1px solid #AAA"
            };
            KIP.createClass(".editable input", cls);
        };
        /** create the style that will be used for a focused element */
        Editable.prototype.__focusedStyle = function () {
            var cls = {
                "outline": "none"
            };
            KIP.createClass(".editable input:focus", cls);
        };
        /** create the style that will be used for an element with an error */
        Editable.prototype.__errorStyle = function () {
            var cls = {
                "border-color": "#C30"
            };
            KIP.createClass(".editable input.error", cls);
        };
        return Editable;
    }(KIP.Drawable));
    KIP.Editable = Editable;
    ;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /**
     * Items for grabbing color conversions and new colors
     * @file Color.js
     * @version 1.0
     * @author Kip Price
     */
    /** @type {Number} The amount the hue should increase when cycling through new colors */
    KIP.HUE_INTERVAL = 22;
    /** @type {Number} The amount that the lightness should increase when cycling through new colors */
    KIP.LIGHT_INTERVAL = 20;
    /** @type {Number} The amount that the saturation should increase when cycling through new colors */
    KIP.SATURATION_INTERVAL = 20;
    /** @type {Object} The max and min saturation value that should be used for cycling colors */
    KIP.SATURATION_LIMITS = {
        Max: 100,
        Min: 20
    };
    /** @type {Object} The max and min lightness values that should be used for cycling colors */
    KIP.LIGHTNESS_LIMITS = {
        Max: 80,
        Min: 35
    };
    var HSLPieceEnum;
    (function (HSLPieceEnum) {
        HSLPieceEnum[HSLPieceEnum["Saturation"] = 0] = "Saturation";
        HSLPieceEnum[HSLPieceEnum["Lightness"] = 1] = "Lightness";
        HSLPieceEnum[HSLPieceEnum["Hue"] = 2] = "Hue";
    })(HSLPieceEnum = KIP.HSLPieceEnum || (KIP.HSLPieceEnum = {}));
    var RGBEnum;
    (function (RGBEnum) {
        RGBEnum[RGBEnum["Red"] = 0] = "Red";
        RGBEnum[RGBEnum["Green"] = 1] = "Green";
        RGBEnum[RGBEnum["Blue"] = 2] = "Blue";
    })(RGBEnum = KIP.RGBEnum || (KIP.RGBEnum = {}));
    var used_colors;
    // GenerateColor
    //---------------------------------------------
    /**
     * Generates the next color in the global color object
     *
     * @param {string} [id] - An identifier for the color
     *
     * @returns {string} The next hex string for the color selector
     */
    function generateColor(id, firstRotate) {
        "use strict";
        var color;
        var color_str;
        // Initialize the "Used Colors" array if we haven't yet
        if (!used_colors) {
            used_colors = {};
        }
        // Initialize the global color object if we haven't yet
        if (!KIP.color_global) {
            KIP.color_global = new Color();
            KIP.color_global.parseFromHslColor("hsl(330, 80%, 50%)");
        }
        // Grab the next available color
        color_str = KIP.color_global.getNextHue(firstRotate || 0);
        color = new Color();
        color.parseFromHexColor(color_str, 1);
        // If we received an identifier, use it
        if (id) {
            used_colors[id] = color_str;
        }
        return color;
    }
    KIP.generateColor = generateColor;
    ;
    /**
     * Finds the current color of the color object & returns it
     */
    function getCurrentColor() {
        // Initialize the global color object if we haven't yet
        if (!KIP.color_global) {
            KIP.color_global = new Color();
            KIP.color_global.parseFromHslColor("hsl(330, 80%, 50%)");
        }
        return KIP.color_global.getCurrentHue();
    }
    KIP.getCurrentColor = getCurrentColor;
    ;
    /**
     * Calculates the non-opacity value of the semi-transparent front color when placed over another color
     * @param {string} frontColor - A color string including an alpha value
     * @param {[type]} backColor - The color that appears in the background
     * @param {number} [opacity] - The opacity of the first color, if not included in the color string
     */
    function getApparentColor(front_color, back_color, opacity) {
        "use strict";
        var col;
        // Create the color object
        col = new Color();
        col.parseColorString(front_color, opacity);
        // Calculate the new color
        col.getApparentColor(back_color);
        return col.hexString();
    }
    KIP.getApparentColor = getApparentColor;
    function getComplementaryColor(color, cutoff) {
        "use strict";
        var col;
        var lightness;
        cutoff = cutoff || 45;
        // Grab the appropriate color
        col = new Color();
        col.parseColorString(color);
        // Grab the current lightness value
        lightness = col.getLightness();
        if (lightness < cutoff) {
            col.lightness = 95;
        }
        else {
            col.lightness = 5;
        }
        col.generateRgbValues();
        return col.rgbaString();
    }
    KIP.getComplementaryColor = getComplementaryColor;
    // HexToRGB
    //-------------------------------------------
    /**
     * Converts a hex color string to a RGB color string
     *
     * @param {string} hex - The hex string to convert
     *
     * @returns {string} The appropriate RGB string
     */
    function hexToRgb(hex) {
        "use strict";
        var c;
        c = new Color();
        c.parseFromHexColor(hex);
        return c.rgbString();
    }
    KIP.hexToRgb = hexToRgb;
    ;
    // HexToRGBA
    //-----------------------------------------------
    /**
     * Converts a hex color string to rgba color string
     *
     * @param {string} hex - The hex string to parse
     *
     * @param {number} alpha - The alpha value to give the color
     */
    function hexToRgba(hex, alpha) {
        "use strict";
        var c;
        // Use our color object to handle this
        c = new Color();
        c.parseFromHexColor(hex, alpha);
        return c.rgbaString();
    }
    KIP.hexToRgba = hexToRgba;
    ;
    // HSLToRGB
    //-----------------------------------------
    /**
     * Converts a HSL string to RGB string
     *
     * @param {string} hsl - The HSL string to parse
     *
     * @returns {string} The RGB string that corresponds
     */
    function hslToRgb(hsl) {
        "use strict";
        var c;
        c = new Color();
        c.parseFromHslColor(hsl);
        return c.rgb_string();
    }
    KIP.hslToRgb = hslToRgb;
    ;
    // HSLAToRGBA
    //-------------------------------------------------
    /**
     * Converts a HSLA string to a RGB string
     *
     * @param {string} hsl - The HSL string to convert
     * @param {number} alpha - The alpha value to use, if the hsl string doesn't include it
     *
     * @returns {string} The appropriate RGBA string
     */
    function hslaToRgba(hsl, alpha) {
        var c;
        c = new Color();
        c.ParseFromHSLColor(hsl, alpha);
        return c.RGBAString();
    }
    KIP.hslaToRgba = hslaToRgba;
    ;
    // FullHexString
    //-----------------------------------------------
    /**
     * Grabs the hex value for a given number and ensures it is a certain length
     *
     * @param {number} val - The number to convert to Hex
     * @param {number} [l] - How long the hex string should be
     *
     * @returns {string} The hex value of the passed in number
     */
    function fullHexString(val, l) {
        "use strict";
        var out, i;
        l = l || 0;
        out = val.toString(16);
        if (out.length < l) {
            for (i = 0; i < (l - out.length); i += 1) {
                out = "0" + out;
            }
        }
        return out;
    }
    KIP.fullHexString = fullHexString;
    ;
    // Color
    //-------------------------------------------
    /**
     * @class Color
     */
    var Color = (function (_super) {
        __extends(Color, _super);
        // Color
        //--------------------------------------------------------------
        /**
            * Creates an object that can handle color conversions
            * @constructor
            * @param {number} [r] - The red value for the color
            * @param {number} [g] - The green value for the color
            * @param {number} [b] - The blue value for the color
            * @param {number} [a] - The alpha value for the color
            */
        function Color(r, g, b, a) {
            var _this = _super.call(this, "Color") || this;
            _this.red = r || 0;
            _this.green = g || 0;
            _this.blue = b || 0;
            _this.alpha = a || 1;
            return _this;
        }
        ;
        // Color.rgba_string
        //-----------------------------------------------------
        /**
         * Gets the appropriate RGBA string for this color
         *
         * @returns {string} RGBA string for the color
         */
        Color.prototype.rgbaString = function () {
            "use strict";
            return this.rgbString(true);
        };
        ;
        // Color.rgb_string
        //------------------------------------------------------------
        /**
         * Grabs the RGB string (with A element if appropriate) for this color
         *
         * @param {boolean} withAlpha - If true, include the alpha element in the returned string
         *
         * @returns {string} The appropriate color string
         */
        Color.prototype.rgbString = function (with_alpha) {
            "use strict";
            var out;
            // Start the string regardless of alpha value
            out = "rgb" + (with_alpha ? "a" : "") + "(" + this.red + ", " + this.green + ", " + this.blue;
            // Add the alpha value if appropriate
            if (with_alpha) {
                out += ", " + this.alpha;
            }
            // Close up the string and send it out
            out += ")";
            return out;
        };
        ;
        // Color.hsl_string
        //-------------------------------------------------------------
        /**
         * From the color object, creates a hue-saturation-lightness string
         *
         * @param {boolean} withAlpha - If true, also adds an alpha element to the end of the string
         */
        Color.prototype.hslString = function (with_alpha) {
            "use strict";
            var out;
            // Generate HSL if we need to
            if (!this.hue)
                this.generateHslValues();
            // String starts out the same regardless of whether we are including alpha
            out = "hsl" + (with_alpha ? "a" : "") + "(" + this.hue + ", " + this.saturation + "%, " + this.lightness + "%";
            // Grab the alpha piece if appropriate
            if (with_alpha) {
                out += ", " + this.alpha;
            }
            // Return the HSL string
            out += ")";
            return out;
        };
        ;
        // Color.hsla_string
        //-----------------------------------------------------
        /**
         * From the color object, create a HSLA string
         *
         * @returns {string} A string for the color
         */
        Color.prototype.hslaString = function () {
            "use strict";
            return this.hslString(true);
        };
        ;
        // Color.HexString
        //----------------------------------------------------------
        /**
         * From the color object, creates a hex color string
         *
         * @param {boolean} [withAlpha] - True if alpha should be added to the hex string
         *
         * @returns {string} The appropriate hex string
         */
        Color.prototype.hexString = function (with_alpha) {
            "use strict";
            var out;
            out = "#";
            out += fullHexString(this.red, 2);
            out += fullHexString(this.green, 2);
            out += fullHexString(this.blue, 2);
            if (with_alpha) {
                out += fullHexString(this.alpha, 2);
            }
            return out;
        };
        ;
        // Color.GenerateHSLValues
        //-------------------------------------------------------------
        /**
         * Calculates the HSL values for this RGB color and saves it off in the color.
         * Relies on the rgb values already having been set
         */
        Color.prototype.generateHslValues = function () {
            "use strict";
            var r;
            var g;
            var b;
            var delta;
            var max;
            var min;
            var hue;
            var saturation;
            var lightness;
            r = this.red / 255;
            g = this.green / 255;
            b = this.blue / 255;
            // Find the max, min, and the difference between them.
            // We need these values to calculate HSL equivalents
            max = Math.max(r, g, b);
            min = Math.min(r, g, b);
            delta = max - min;
            // Lightness is the average between the two extremes
            lightness = (max + min) / 2;
            // If the max and min are the same, all three are actually the same value,
            // so we can quit now with our grayscale color
            if (max === min) {
                this.hue = 0;
                this.saturation = 0;
                this.lightness = Math.round(lightness * 100);
                return;
            }
            // The saturation is a ratio of the delta of the extremes
            // over a version of the sum of the extremes.
            // It changes when lightness is less or more than 50%.
            if (lightness > .5) {
                saturation = delta / (2 - max - min);
            }
            else {
                saturation = delta / (max + min);
            }
            // The hue is calculated from the two non-max values
            // If two values match the max, then we just evaluate in order red -> green -> blue
            // Red was the max.
            if (max === r) {
                hue = (g - b) / delta;
                // We need an additional kick if green is less than blue
                if (g < b) {
                    hue += 6;
                }
                // Green was the max
            }
            else if (max === g) {
                hue = (b - r) / delta + 2;
                // Blue was the max
            }
            else {
                hue = (r - g) / delta + 4;
            }
            // Divide by six to get the appropriate average
            hue /= 6;
            // -- Save off the member variables for this color --
            //
            // All values are currently in the range [0,1].
            // Hue needs to be multiplied by 360 to get the appropriate value.
            // Saturation and lightness both need to be multiplied by 100.
            this.hue = Math.round(hue * 3600) / 10;
            this.saturation = Math.round(saturation * 1000) / 10;
            this.lightness = Math.round(lightness * 1000) / 10;
            if (!this.start_hue) {
                this.start_hue = this.hue;
                this.start_saturation = this.saturation;
                this.start_lightness = this.lightness;
            }
        };
        ;
        // Color.GenerateRGBValues
        //------------------------------------------------------------
        /**
         * Saves off the appropriate RGB values for this color based on its hex values.
         * Relies on the hex colors being set
         */
        Color.prototype.generateRgbValues = function () {
            "use strict";
            var hue;
            var saturation;
            var lightness;
            var p;
            var q;
            var t;
            var i;
            hue = this.hue / 360;
            saturation = this.saturation / 100;
            lightness = this.lightness / 100;
            // If there is not saturation, it's grayscale, so the colors are all equal to the lightness
            if (saturation === 0) {
                this.red = this.green = this.blue = lightness;
                this.red *= 255;
                this.green *= 255;
                this.blue *= 255;
            }
            //If we do have a saturated value, we need to convert it to RGB
            // Get the value of the q coefficient
            if (lightness < 0.5) {
                q = lightness * (1 + saturation);
            }
            else {
                q = lightness + saturation - (lightness * saturation);
            }
            // And calculate p from q
            p = (2 * lightness) - q;
            for (i = -1; i <= 1; i += 1) {
                t = hue + (-i / 3);
                // Check for the extremes and adjust them
                if (t < 0) {
                    t += 1;
                }
                else if (t > 1) {
                    t -= 1;
                }
                // Find the appropriate case to treat this value as
                if (t < (1 / 6)) {
                    this.setAppropriateColor(i + 1, (p + ((q - p) * 6 * t)) * 255);
                }
                else if (t < (1 / 2)) {
                    this.setAppropriateColor(i + 1, q * 255);
                }
                else if (t < (2 / 3)) {
                    this.setAppropriateColor(i + 1, (p + ((q - p) * (2 / 3 - t) * 6)) * 255);
                }
                else {
                    this.setAppropriateColor(i + 1, p * 255);
                }
            }
        };
        ;
        // Color.ParseFromHexColor
        //----------------------------------------------------------------------
        /**
         * Takes in a hex string and saves it internally
         *
         * @param {string} hex - The hex string to parse in
         * @param {number} [alpha] - The alpha value to use
         *
         * @returns {boolean} True if the parsing succeeds, false otherwise
         */
        Color.prototype.parseFromHexColor = function (hex, alpha) {
            "use strict";
            var idx;
            var col;
            var pc;
            var a_included;
            var h_reg;
            var inc;
            h_reg = /^#?(?:[0-9A-Fa-f]{3,4}){1,2}$/;
            if (!h_reg.test(hex)) {
                return false;
            }
            // Strip out the # character if it was there
            if (KIP.charAt(hex, 0) === "#") {
                hex = KIP.rest(hex, 1);
            }
            if (hex.length < 6) {
                inc = 1;
            }
            else {
                inc = 2;
            }
            // Flip through each of the possible columns
            for (idx = 0; idx < hex.length; idx += inc) {
                pc = hex.substr(idx, inc);
                if (inc === 1) {
                    pc += pc;
                }
                // Parse out the color and set it appropriately
                col = parseInt(pc, 16);
                this.setAppropriateColor((idx / inc), col);
                // If we hit alpha values,
                if (idx > 4) {
                    a_included = true;
                }
            }
            // Set the alpha value if it wasn't included in the hex string
            if (!a_included) {
                this.alpha = alpha || 0;
            }
            return true;
        };
        ;
        // Color.ParseFromRGBColor
        //----------------------------------------------------------------------
        /**
         * Takes in a rgb color string and parses it into our internal format
         *
         * @param {string} rgb   - The RGB string to parse
         * @param {number} [alpha] - The alpha value to parse in, if the rgb string doesn't have it
         *
         * @returns {boolean} True if the parsing succeeds, false otherwise
         */
        Color.prototype.parseFromRgbColor = function (rgb, alpha) {
            "use strict";
            var rgb_reg;
            var rgba_reg;
            var match;
            rgb_reg = /rgb\((?:([0-9]{1-3}), ?){3}\)/;
            rgba_reg = /rgba\((?:([0-9]{1-3}), ?){3}, ?([0-9]{0,1}(?:\.[0-9]+)?)\)/;
            if (!rgb_reg.test(rgb)) {
                if (!rgba_reg.test(rgb)) {
                    return false;
                }
                else {
                    match = rgba_reg.exec(rgb);
                }
            }
            else {
                match = rgb_reg.exec(rgb);
            }
            this.red = +match[1];
            this.green = +match[2];
            this.blue = +match[3];
            if ((match[4] !== undefined) || (alpha !== undefined)) {
                this.alpha = +match[4] || alpha;
            }
            return true;
        };
        ;
        // Color.ParseFromHSLColor
        //-------------------------------------------------------------------
        /**
         * Takes in a HSL string and converts it to the color object's internal format
         *
         * @param {string} hsl - The HSL string to convert. Can also be a HSLA string
         * @param {number} [a] - The alpha value to set, if it is not included in the HSLA string
         *
         * @returns {boolean} True if the color was successfully parsed, false otherwise.
         */
        Color.prototype.parseFromHslColor = function (hsl, a) {
            "use strict";
            var hsl_reg;
            var hsla_reg;
            var match;
            var hue;
            var saturation;
            var lightness;
            var q;
            var p;
            var i;
            var t;
            hsl_reg = /hsl\(([0-9]{1,3}), ?([0-9]{1,3})%, ?([0-9]{1,3})%\)/;
            hsla_reg = /hsla\(([0-9]{1,3}), ?([0-9]{1,3})%, ?([0-9]{1,3})%, ?([0-9]{0,1}(?:\.[0-9]+)?)\)/;
            // Quit if the regex doesn't match
            if (!hsl_reg.test(hsl)) {
                if (!hsla_reg.test(hsl)) {
                    return false;
                }
                else {
                    match = hsla_reg.exec(hsl);
                }
            }
            else {
                match = hsl_reg.exec(hsl);
            }
            // Save off the values parsed out of the string
            this.hue = Math.round(parseFloat(match[1]) * 10) / 10;
            this.saturation = Math.round(parseFloat(match[2]) * 10) / 10;
            this.lightness = Math.round(parseFloat(match[3]) * 10) / 10;
            // Only set the alpha if something is available
            if ((match[4] !== undefined) || (a !== undefined)) {
                this.alpha = parseFloat(match[4]) || a;
            }
            // Make sure the RGB values are updated too
            this.generateRgbValues();
            return true;
        };
        ;
        /**
         * Tries to parse a given string into an internal color object
         *
         * @param {string} str - The string to parse
         * @param {number} [alpha] - The alpha value to use, if not included in the string
         *
         * @returns {boolean} True if the parsing succeeds, false otherwise
         */
        Color.prototype.parseColorString = function (str, alpha) {
            "use strict";
            var success;
            // Try to parse the string as a RGB value
            success = this.parseFromRgbColor(str, alpha);
            if (success)
                return true;
            // Try to parse the string as a Hex value
            success = this.parseFromHexColor(str, alpha);
            if (success)
                return true;
            // Try to parse the string as a HSL value
            success = this.parseFromHslColor(str, alpha);
            if (success)
                return true;
            // If nothing worked, return false
            return false;
        };
        ;
        // Color.SetAppropriateColor
        //----------------------------------------------------------------------
        /**
         * Sets a color value based on the index of the color (ie, red = 0, green = 1)
         *
         * @param {number} idx - The index of the color we are saving
         * @param {number} val - The value that the color should be set to
         */
        Color.prototype.setAppropriateColor = function (idx, val) {
            "use strict";
            if (idx < 3) {
                val = Math.min(255, Math.max(0, Math.round(val)));
            }
            else {
                val = Math.min(1, Math.max(0, val));
            }
            switch (idx) {
                case 0:
                    this.red = val;
                    break;
                case 1:
                    this.green = val;
                    break;
                case 2:
                    this.blue = val;
                    break;
                case 3:
                    this.alpha = val;
                    break;
            }
        };
        ;
        // Color.GetNextHue
        //-------------------------------------------------------------
        /**
         * Grabs the next hue available for this color selector.
         * Can be used as a random color generator
         *
         * @param {boolean} withAlpha - True if the alpha value should also be included in the output string
         *
         * @returns {string} The hex color string for the new color
         */
        Color.prototype.getNextHue = function (firstRotate, withAlpha) {
            "use strict";
            var toCycle = [], idx;
            // First, convert our internal format to HSL (if needed)
            if (!this.start_hue)
                this.generateHslValues();
            // Fill in our array of the order in which we will cycle the values
            toCycle[0] = firstRotate;
            toCycle[1] = (firstRotate + 1) % 3;
            toCycle[2] = (firstRotate + 2) % 3;
            // Loop through the cycles and set their values
            for (idx = 0; idx < toCycle.length; idx += 1) {
                // Rotate and quit if we don't have to rotate another piece
                if (!this.rotateAppropriateHSLValue(toCycle[idx])) {
                    break;
                }
            }
            // Update the RGB values too
            this.generateRgbValues();
            return this.hexString(withAlpha);
        };
        ;
        /**
         * Grabs the current HSL String for the color
         * @param {boolean} [withAlpha] True if the string should include the alpha value
         * @returns {string}						The appropriate hext string for the color
         */
        Color.prototype.getCurrentHue = function (withAlpha) {
            return this.hexString(withAlpha);
        };
        ;
        // Color.RotateAppropriateHSLValue
        //-----------------------------------------------------------------------
        /**
         * Calculates the next appropriate value for the HSL type, and
         * @param {[type]} idx [description]
         */
        Color.prototype.rotateAppropriateHSLValue = function (idx) {
            "use strict";
            var val, start;
            // Grab the appropriate current value and start value
            switch (idx) {
                case HSLPieceEnum.Saturation:
                    val = this.rotateSaturation();
                    start = this.start_saturation;
                    break;
                case HSLPieceEnum.Lightness:
                    val = this.rotateLightness();
                    start = this.start_lightness;
                    break;
                case HSLPieceEnum.Hue:
                    val = this.rotateHue();
                    start = this.start_hue;
                    break;
            }
            // Return true if we'd made a full circle
            if (val === start) {
                return true;
            }
            return false;
        };
        ;
        /**
         * Rotates our current hue value a set amount
         * @returns {number} The new hue value for the color
         */
        Color.prototype.rotateHue = function () {
            "use strict";
            this.hue = this.rotateHslValue(this.hue, KIP.HUE_INTERVAL, 360);
            return this.hue;
        };
        ;
        Color.prototype.rotateSaturation = function () {
            "use strict";
            return this.saturation = this.rotateHslValue(this.saturation, KIP.SATURATION_INTERVAL, 100, KIP.SATURATION_LIMITS.Max, KIP.SATURATION_LIMITS.Min);
        };
        ;
        Color.prototype.rotateLightness = function () {
            return this.lightness = this.rotateHslValue(this.lightness, KIP.LIGHT_INTERVAL, 100, KIP.LIGHTNESS_LIMITS.Max, KIP.LIGHTNESS_LIMITS.Min);
        };
        // Color.RotateHSLValue
        //---------------------------------------------------------------------------------------
        /**
         * Rotates a given HSL value by an appropriate interval to get a new color
         *
         * @param {number} startVal -The value the HSL value started with
         * @param {number} inc - How much the HSL value should be incremented
         * @param {number} modBy - What the mod of the HSL value should be
         * @param {number} [max] - The maximum this HSL value can be
         * @param {number} [min] - The minimum this HSL value can be
         *
         * @returns {number} The newly rotate HSL value
         */
        Color.prototype.rotateHslValue = function (startVal, inc, modBy, max, min) {
            "use strict";
            var out;
            // Increment and mod
            out = startVal += inc;
            out %= modBy;
            // If we have neither max nor min, quit now
            if (!max) {
                return KIP.roundToPlace(out, 10);
            }
            if (!min && (min !== 0)) {
                return KIP.roundToPlace(out, 10);
            }
            // Loop until we have an acceptable value
            while ((out < min) || (out > max)) {
                out = startVal += inc;
                out %= modBy;
            }
            // Return the appropriate value
            return KIP.roundToPlace(out, 10);
        };
        ;
        // Color.GetApparentColor
        //-------------------------------------------------------
        /**
         * Calculates what the display color of this color would be without setting an alpha value.
         * Can calculate what the RGB value should be given a background color instead of RGBA
         *
         * @param {variant} backColor - Either the color object or color string for the background color
         *
         * @returns {boolean} True if we were successfully able to calculate the apparent color.
         */
        Color.prototype.getApparentColor = function (back_color) {
            "use strict";
            var c;
            var antiAlpha;
            // Parse the backColor if it is a string, or just leave it if it is an object
            if (back_color.red) {
                c = back_color;
            }
            else {
                c = new Color();
                if (!c.parseColorString(back_color)) {
                    return false;
                }
            }
            antiAlpha = 1 - this.alpha;
            this.red = Math.round((this.red * this.alpha) + (c.red * antiAlpha));
            this.green = Math.round((this.green * this.alpha) + (c.green * antiAlpha));
            this.blue = Math.round((this.blue * this.alpha) + (c.blue * antiAlpha));
            this.alpha = 1;
            return true;
        };
        ;
        // Color.Compare
        //------------------------------------------------------------------------
        /**
         * Finds how similar two colors are based on their HSL values
         * @param {Color} otherColor  - The color we are comparing to
         * @param {object} [multipliers] - The multipliers we should use to calculate the diff
         * @returns An object containing the total diff calculation as well as the raw diff values
         */
        Color.prototype.compare = function (other_color, multipliers) {
            "use strict";
            var diffs;
            // If we didn't get multiplers, set some defaults
            if (!multipliers) {
                multipliers = {
                    hue: 1,
                    saturation: 0.04,
                    lightness: 0.04,
                    alpha: 0.04
                };
            }
            // Make sure we have HSL for both colors
            other_color.generateHslValues();
            this.generateHslValues();
            // Grab the differences between the values
            diffs = {
                hue: (other_color.hue - this.hue),
                saturation: (other_color.saturation - this.saturation),
                lightness: (other_color.lightness - this.lightness),
                alpha: (other_color.alpha - this.alpha)
            };
            // Calculate the total diff
            diffs.total = 0;
            diffs.total += (Math.abs(diffs.hue) * (multipliers.hue || 0));
            diffs.total += (Math.abs(diffs.saturation) * (multipliers.saturation || 0));
            diffs.total += (Math.abs(diffs.lightness) * (multipliers.lightness || 0));
            diffs.total += (Math.abs(diffs.alpha) * (multipliers.alpha || 0));
            // return our diffs array
            return diffs;
        };
        /**
         * Averages in another color into this one
         * @param   {Color}   other_color The other color to average in
         * @param   {boolean} no_merge    True if we should just return the averages instead of merging them in to this color
         * @returns {Color}               The resulting merged color
         */
        Color.prototype.averageIn = function (other_color, no_merge) {
            "use strict";
            var avgs;
            // Make sure we have HSL values for both colors
            other_color.generateHslValues();
            this.generateHslValues();
            // Calculate the averages
            avgs = {
                hue: ((this.hue + other_color.hue) / 2),
                saturation: ((this.saturation + other_color.saturation) / 2),
                lightness: ((this.lightness + other_color.lightness) / 2),
                alpha: ((this.alpha + other_color.alpha) / 2)
            };
            if (no_merge) {
                return avgs;
            }
            // Set these averaged values as our colors new colors
            this.hue = Math.round(avgs.hue);
            this.saturation = (Math.floor(avgs.saturation * 10) / 10);
            this.lightness = (Math.floor(avgs.lightness * 10) / 10);
            this.alpha = (Math.floor(avgs.alpha * 10) / 10);
            return this;
        };
        // Color.isDark
        //----------------------------------------------------
        /**
         * Checks if this color object is more dark than light
         * @returns {boolean} True if the color is dark
         */
        Color.prototype.isDark = function () {
            "use strict";
            if (!this.hue)
                this.generateHslValues();
            return (this.lightness <= 50);
        };
        ;
        // Color.isLight
        //------------------------------------------------------
        /**
         * Checks if this color object is more light than dark
         * @returns {boolean} True if the color is light
         */
        Color.prototype.isLight = function () {
            "use strict";
            if (!this.hue)
                this.generateHslValues();
            return (this.lightness > 50);
        };
        ;
        /**
         * Grabs the lightness value of this color
         * @returns {number} The value of this color's lightness
         */
        Color.prototype.getLightness = function () {
            "use strict";
            if (!this.hue)
                this.generateHslValues();
            return this.lightness;
        };
        return Color;
    }(KIP.NamedClass));
    KIP.Color = Color;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var CollectionTypeEnum;
    (function (CollectionTypeEnum) {
        CollectionTypeEnum[CollectionTypeEnum["ReplaceDuplicateKeys"] = 1] = "ReplaceDuplicateKeys";
        CollectionTypeEnum[CollectionTypeEnum["AddToDuplicateKeys"] = 2] = "AddToDuplicateKeys";
        CollectionTypeEnum[CollectionTypeEnum["IgnoreDuplicateKeys"] = 3] = "IgnoreDuplicateKeys";
    })(CollectionTypeEnum = KIP.CollectionTypeEnum || (KIP.CollectionTypeEnum = {}));
    var Collection = (function (_super) {
        __extends(Collection, _super);
        /**
         * Creates the collection
         * @param  {boolean} replace True if we should override the values in the list
         * @return Collection
         */
        function Collection(type, eq_test) {
            var _this = _super.call(this, "Collection") || this;
            // Initialize our arrays
            _this.data = {};
            _this.sorted_data = new Array();
            // Store whether we should be replacing
            _this.type = type || CollectionTypeEnum.IgnoreDuplicateKeys;
            _this.equality_test = eq_test;
            if (!_this.equality_test) {
                _this.equality_test = (function (a, b) {
                    return (a === b);
                });
            }
            return _this;
        }
        Object.defineProperty(Collection.prototype, "length", {
            // Getters & Setters
            get: function () { return this.sorted_data.length; },
            enumerable: true,
            configurable: true
        });
        /**
         * Adds an element to the collection
         * @param  {string}  key  The key to uniquely identify this element
         * @param  {T}       val The element to add to our collection
         * @return {boolean}      True if the element was successfully added
         */
        Collection.prototype.addElement = function (key, val) {
            var idx;
            var elem;
            var sorted_idx;
            // Verify that there isn't anything currently linked to this key
            if ((this.type === CollectionTypeEnum.IgnoreDuplicateKeys) && (this.data[key])) {
                return -1;
            }
            // if we already have a value & the type is right, remove the existing value
            if ((this.type === CollectionTypeEnum.ReplaceDuplicateKeys) && (this.data[key])) {
                this.removeElement(key);
            }
            // Grab the spot that this element will be added to in our sorted index
            sorted_idx = this.sorted_data.length;
            // Create our new object
            elem = {
                key: key,
                value: val,
                sorted_idx: sorted_idx,
                orig_idx: sorted_idx
            };
            // If there isn't anything in this index (or we should replace it), save our new value
            this.data[key] = elem;
            // Push to our sorted index
            this.sorted_data.push(key);
            return sorted_idx;
        };
        /** inserts an element at a particular index */
        Collection.prototype.insertElement = function (key, elem, index) {
            //TODO
            return true;
        };
        /** combination function to handle all overloads */
        Collection.prototype.removeElement = function (param) {
            if (typeof param === "string") {
                return this.__removeElementByKey(param);
            }
            else if (typeof param === "number") {
                return this.__removeElementByIndex(param);
            }
            else {
                return this.__removeElementByValue(param);
            }
        };
        /** removes an element by key */
        Collection.prototype.__removeElementByKey = function (key) {
            var elem;
            elem = this.data[key];
            if (!elem)
                return null;
            // Remove from the sorted array
            this.sorted_data.splice(elem.sorted_idx, 1);
            // Reset sorted keys for all others in the array
            this.__resetSortedKeys(elem.sorted_idx);
            // Remove from the actual data array
            delete this.data[key];
            // Return the grabbed data
            return elem;
        };
        /** removes an element by index */
        Collection.prototype.__removeElementByIndex = function (idx) {
            var key;
            if ((idx > this.length) || (idx < 0)) {
                return null;
            }
            key = this.sorted_data[idx];
            return this.__removeElementByKey(key);
        };
        /** removes an element by matching the element to the provided element */
        Collection.prototype.__removeElementByValue = function (val) {
            var key;
            var e;
            e = this.__findElement(val);
            return this.__removeElementByKey(e && e.key);
        };
        /** Ensure that the key stored with the element matches its location in the sorted array */
        Collection.prototype.__resetSortedKeys = function (start_from, end_with) {
            // Set some defaults
            if (!start_from) {
                start_from = 0;
            }
            if (!end_with && (end_with !== 0)) {
                end_with = this.sorted_data.length;
            }
            if (start_from > end_with) {
                return;
            }
            if (start_from > end_with) {
                var tmp = start_from;
                start_from = end_with;
                end_with = tmp;
            }
            var e;
            var k;
            for (var i = start_from; i < end_with; i += 1) {
                k = this.sorted_data[i];
                if (!k)
                    continue;
                e = this.data[k];
                if (!e)
                    continue;
                e.sorted_idx = i;
            }
        };
        Collection.prototype.clear = function () {
            this.data = {};
            this.sorted_data = [];
        };
        /**
         * Sorts the collection
         * @param {CollectionSortFunction<T>} sort_func   The function we should use to sort
         * @param {boolean}                   private_arr Whether we should sort in a different array than our current one
         */
        Collection.prototype.sort = function (sort_func) {
            var _this = this;
            var s_temp;
            // Generate our wrapper sort function to guarantee we have the real elements
            // sent to the passed-in sort function
            s_temp = (function (a, b) {
                var a_tmp;
                var b_tmp;
                a_tmp = _this.data[a];
                b_tmp = _this.data[b];
                return sort_func(a_tmp, b_tmp);
            });
            // Sort the data appropriately
            this.sorted_data.sort(s_temp);
            // Make sure we update our indices appropriately
            this.__resetSortedKeys();
        };
        // Resets our iteration counter
        Collection.prototype.resetLoop = function (reverse) {
            if (reverse) {
                this.iteration = (this.length + 1);
            }
            else {
                this.iteration = -1;
            }
        };
        /**
         * Checks if we have a next element available for getting
         * @param   {boolean}     reverse True if we should loop backwards
         * @returns {boolean}     				True if there is a next element available
         */
        Collection.prototype.hasNext = function (reverse) {
            if (reverse) {
                return ((this.iteration - 1) >= 0);
            }
            else {
                return ((this.iteration + 1) < this.sorted_data.length);
            }
        };
        /**
         * Finds the next element in our loop
         * @param   {boolean}               reverse True if we should loop backwards
         * @returns {ICollectionElement<T>}         The element next in our array
         */
        Collection.prototype.getNext = function (reverse) {
            // Grab the next appropriate index
            if (reverse) {
                this.iteration -= 1;
            }
            else {
                this.iteration += 1;
            }
            // Get the data from that index
            return this.data[this.sorted_data[this.iteration]];
        };
        // Return a sorted array of the elements in this collection
        Collection.prototype.toArray = function () {
            var arr;
            var key;
            for (var _i = 0, _a = this.sorted_data; _i < _a.length; _i++) {
                key = _a[_i];
                arr.push(this.data[key]);
            }
            return arr;
        };
        Collection.prototype.getElement = function (param) {
            var out;
            // Handle the param being a key
            if (typeof param === "string") {
                out = this.data[param];
                // Handle the parm being index
            }
            else if (typeof param === "number") {
                if ((param < 0) || (param > this.sorted_data.length)) {
                    return null;
                }
                out = this.data[this.sorted_data[param]];
            }
            return out;
        };
        Collection.prototype.getValue = function (param) {
            var pair;
            pair = this.getElement(param);
            if (!pair) {
                return null;
            }
            return pair.value;
        };
        Collection.prototype.getIndex = function (param) {
            if (typeof param === "string") {
                return (this.data[param] && this.data[param].sorted_idx);
            }
            else {
                var e = void 0;
                e = this.__findElement(param);
                return (e && e.sorted_idx);
            }
        };
        Collection.prototype.__findElement = function (val) {
            var key;
            var elem;
            // loop over everything in our data array
            for (key in this.data) {
                if (this.data.hasOwnProperty(key)) {
                    elem = this.data[key];
                    if (this.equality_test(elem.value, val)) {
                        return elem;
                    }
                }
            }
            return null;
        };
        Collection.prototype.getKey = function (param) {
            if (typeof param === "number") {
                return this.sorted_data[param];
            }
            else {
                var e = void 0;
                e = this.__findElement(param);
                return (e && e.key);
            }
        };
        Collection.prototype.hasElement = function (param) {
            if (typeof param === "string") {
                return (!!this.data[param]);
            }
            else if (typeof param === "number") {
                return ((!!this.sorted_data[param]) && (!!this.data[this.sorted_data[param]]));
            }
            else {
                return (this.__findElement(param) !== null);
            }
        };
        /** handle looping through the collection to get each element */
        Collection.prototype.map = function (mapFunc) {
            if (!mapFunc) {
                return;
            }
            this.resetLoop();
            while (this.hasNext()) {
                var pair = this.getNext();
                if (!pair) {
                    continue;
                }
                var value = pair.value;
                var key = pair.key;
                var idx = this.getIndex(key);
                mapFunc(value, key, idx);
            }
        };
        return Collection;
    }(KIP.NamedClass));
    KIP.Collection = Collection;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Events;
    (function (Events) {
        var Event = (function () {
            function Event(details) {
                this._numOfListeners = 0;
                this._name = details.name;
                this._key = details.key;
                this._listeners = new KIP.Collection(KIP.CollectionTypeEnum.ReplaceDuplicateKeys);
            }
            Object.defineProperty(Event.prototype, "context", {
                get: function () { return this._context; },
                enumerable: true,
                configurable: true
            });
            /** add a listener to our collection (with the option to replace if using a unique key) */
            Event.prototype.addListener = function (listenerFunc, uniqueID) {
                uniqueID = uniqueID || (this._key + this._numOfListeners.toString());
                this._listeners.addElement(uniqueID, listenerFunc);
                this._numOfListeners += 1;
            };
            /** allow a listener to be skipped */
            Event.prototype.removeEventListener = function (uniqueID) {
                if (!uniqueID) {
                    return;
                }
                this._listeners.removeElement(uniqueID);
            };
            Event.prototype.notifyListeners = function (context) {
                var _this = this;
                this._context = context;
                this._listeners.map(function (elem, key) {
                    if (!elem) {
                        return;
                    }
                    elem(_this);
                });
                this._context = null;
            };
            return Event;
        }());
        Events.Event = Event;
    })(Events = KIP.Events || (KIP.Events = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Events;
    (function (Events) {
        var EventHandler = (function () {
            function EventHandler() {
            }
            /** create a new event with a partular key and name */
            EventHandler.createEvent = function (details) {
                var evt = new Events.Event(details);
                return (this._events.addElement(details.key, evt) !== -1);
            };
            /** handle notifying listeners about an event that occurred */
            EventHandler.dispatchEvent = function (key, context) {
                var evt = this._events.getValue(key);
                if (!evt) {
                    return;
                }
                evt.notifyListeners(context);
            };
            /** register an additional listener with a particular event */
            EventHandler.addEventListener = function (key, listener, uniqueID) {
                var evt = this._events.getValue(key);
                if (!evt) {
                    return;
                }
                evt.addListener(listener, uniqueID);
            };
            /** remove a particular event listener */
            EventHandler.removeEventListener = function (uniqueID, key) {
                if (!uniqueID) {
                    return;
                }
                // If it's only a particular type of event that is being removed, do so
                if (key) {
                    var evt = this._events.getValue(key);
                    if (!evt) {
                        return;
                    }
                    evt.removeEventListener(uniqueID);
                    // Otherwise, remove this uniqueID from all events
                }
                else {
                    this._events.map(function (evt) {
                        evt.removeEventListener(uniqueID);
                    });
                }
            };
            EventHandler._events = new KIP.Collection();
            return EventHandler;
        }());
        function createEvent(details) {
            return EventHandler.createEvent(details);
        }
        Events.createEvent = createEvent;
        function dispatchEvent(key, context) {
            EventHandler.dispatchEvent(key, context);
        }
        Events.dispatchEvent = dispatchEvent;
        function addEventListener(key, listener, uniqueID) {
            EventHandler.addEventListener(key, listener, uniqueID);
        }
        Events.addEventListener = addEventListener;
    })(Events = KIP.Events || (KIP.Events = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /** creates a custom context menu */
    var ContextMenu = (function (_super) {
        __extends(ContextMenu, _super);
        /**
         * Creates a custom context (right-click) menu for a given element
         * @param {HTMLElement} target    	The element to create the custom menu for
         * @param {boolean}     [no_styles] True if we shouldn't create css classes for the standard menu styles
         */
        function ContextMenu(target, no_styles) {
            var _this = 
            // Initialize our Drawable
            _super.call(this, "", "ctxMenu") || this;
            _this.addClassName("ContextMenu");
            // Set our initial properties
            _this.__target = target;
            _this.__no_styles = no_styles;
            // Initialize the option array
            _this.__options = new KIP.Collection();
            // Create our other elements
            _this.__createElements();
            // Add listeners
            _this.__addEventListeners();
            return _this;
        }
        /** adds an option to our context menu */
        ContextMenu.prototype.addOption = function (opt, subOptions, parent) {
            // Make sure the option label is unique
            if (this.__options.hasElement(opt.label)) {
                return false;
            }
            // Create the element for the option if not included
            if (!opt.elems) {
                opt.elems = {};
            }
            ;
            if (!opt.elems.base) {
                if (!parent) {
                    parent = this.elems.option_container;
                }
                opt.elems.base = KIP.createSimpleElement("", "ctxOption", opt.label, null, null, parent);
                opt.elems.base.onclick = opt.callback;
            }
            // Add the option to our collection
            this.__options.addElement(opt.label, opt);
            // Loop through suboptions and add them as well
            var sub_success = true;
            for (var _i = 0, subOptions_1 = subOptions; _i < subOptions_1.length; _i++) {
                var s_opt = subOptions_1[_i];
                if (!this.addSubOption(opt, s_opt)) {
                    sub_success = false;
                }
            }
            if (!sub_success) {
                return false;
            }
            // Making it this far means we added everything ok
            return true;
        };
        /** creates a submenu under a particular option */
        ContextMenu.prototype.addSubOption = function (srcOption, subOption) {
            // Try to grab the option from our collection if not passed in correctly
            if (!srcOption.elems) {
                // If this is a new option, create it first
                if (!this.__options.hasElement(srcOption.label)) {
                    this.addOption(srcOption);
                }
                // Try to grab the option from our collection
                srcOption = this.__getOption(srcOption.label);
                // Quit if we couldn't find an option
                if (!srcOption) {
                    return false;
                }
            }
            // Quit if the option hasn't been appropriately initialized
            if (!srcOption.elems) {
                return false;
            }
            // Create the submenu div if it's missing
            if (!srcOption.elems.sub_menu) {
                this.__buildSubMenu(srcOption);
            }
            // Add the actual sub menu
            this.addOption(subOption, [], srcOption.elems.sub_menu);
        };
        /** creates a sub menu */
        ContextMenu.prototype.__buildSubMenu = function (srcOption) {
            srcOption.elems.sub_menu = KIP.createSimpleElement("", "subMenu hidden", "", null, null, srcOption.elems.base);
            srcOption.elems.base.innerHTML += "...";
            if (!this.__no_styles) {
                return;
            }
            // Handle mouse-over only if we didn't add standard classes
            srcOption.elems.sub_menu.style.display = "none";
            srcOption.elems.base.addEventListener("mouseover", function () {
                srcOption.elems.sub_menu.style.display = "block";
            });
            srcOption.elems.base.addEventListener("mouseout", function () {
                srcOption.elems.sub_menu.style.display = "none";
            });
        };
        /** grabs a particular option from our menu */
        ContextMenu.prototype.__getOption = function (lbl) {
            if (!lbl) {
                return null;
            }
            var iCol = this.__options.getElement(lbl);
            // Grab the value of the element in our collection
            if (iCol) {
                return iCol.value;
            }
            else {
                return null;
            }
        };
        /** removes an option from our menu */
        ContextMenu.prototype.removeOption = function (lbl) {
            var opt;
            var iCol;
            iCol = this.__options.removeElement(lbl);
            if (!iCol) {
                return false;
            }
            opt = iCol.value;
            // Also remove the HTML element added by this option
            if (opt.elems.base.parentNode) {
                opt.elems.base.parentNode.removeChild(opt.elems.base);
            }
            else {
                return false;
            }
            // Return true if we made it this far
            return true;
        };
        ;
        /** Removes all of our options */
        ContextMenu.prototype.clearOptions = function () {
            this.__options.resetLoop(true);
            var opt;
            var iCol;
            // Remove all HTML ELements
            while (this.__options.hasNext(true)) {
                iCol = this.__options.getNext(true);
                if (!iCol) {
                    continue;
                }
                opt = iCol.value;
                if (opt.elems.base.parentNode) {
                    opt.elems.base.parentNode.removeChild(opt.elems.base);
                }
            }
            // Clear the collection
            this.__options.clear();
        };
        ;
        /** Adds css classes for the elements used in the context menu */
        ContextMenu.prototype.__addStandardStyles = function () {
            // Quit if we shouldn't create styles or we already have
            if (this.__no_styles) {
                return;
            }
            if (KIP.StylesAdded.ContextMenu) {
                return;
            }
            this.__addMainCtxMenuClass();
            this.__addSubMenuClass();
            this.__addNestedSubMenuClass();
            this.__addMenuOptionClass();
            this.__addMenuOptionHoverClass();
            KIP.addHiddenClass();
        };
        ;
        ContextMenu.prototype.__addMainCtxMenuClass = function () {
            var cls;
            cls = {
                "background-color": "rgba(60, 60, 60, 1)",
                "color": "#FFF",
                "font-family": "\"Calibri Light\", Sans-Serif",
                "box-shadow": "1px 1px 3px 2px rgba(0,0,0,0.1)",
                "font-size": "14px",
                "border-radius": "4px",
                "padding-top": "2px",
                "padding-bottom": "2px",
                "width": "10%",
                "position": "absolute"
            };
            KIP.createClass(".ctxMenu", cls);
        };
        ContextMenu.prototype.__addSubMenuClass = function () {
            var cls;
            cls = {
                "background-color": "rgba(40, 40, 40, 0.9)",
                "width": "100%",
                "top": "-2px",
                "box-shadow": "1px 1px 1px 1px rgba(0,0,0,0.1)",
                "left": "calc(100% - 1px)",
                "border-left": "1px solid #777"
            };
            KIP.createClass(".ctxMenu .subMenu", cls);
        };
        ContextMenu.prototype.__addNestedSubMenuClass = function () {
            var cls;
            cls = {
                "background-color": "rgba(40, 40, 40, 0.85)",
                "border-left": "1px solid #888"
            };
            KIP.createClass(".ctxMenu .subMenu .subMenu", cls);
        };
        ContextMenu.prototype.__addMenuOptionClass = function () {
            var cls;
            cls = {
                "padding": "4px 10px",
                "cursor": "pointer",
                "position": "relative"
            };
            KIP.createClass(".ctxMenu .ctxOption", cls);
        };
        ContextMenu.prototype.__addMenuOptionHoverClass = function () {
            var cls;
            cls = {
                "background-color": "#505050",
                "color": "#FFF",
                "border-left": "7px solid #999"
            };
            KIP.createClass(".ctxMenu .ctxOption:hover", cls);
        };
        /** Adds event listeners to the relevant pieces to show and/or hide the context menu */
        ContextMenu.prototype.__addEventListeners = function () {
            var _this = this;
            // Erase the currently showing context menu always on mousedown and on right-click
            if (!ContextMenu.__windowListenersAdded) {
                window.addEventListener("contextmenu", function () {
                    _this.__hideExistingMenu();
                });
                window.addEventListener("mousedown", function () {
                    _this.__hideExistingMenu();
                });
                ContextMenu.__windowListenersAdded;
            }
            // Show this menu when it's target is hit
            this.__target.addEventListener("contextmenu", function (e) {
                var pos_x;
                var pos_y;
                _this.erase();
                // Show the normal rclick menu when holding control
                if (e.ctrlKey) {
                    return true;
                }
                // Stop bubbling since we have found our target
                e.stopPropagation();
                e.preventDefault();
                // Grab the approximate position
                pos_x = e.clientX;
                pos_y = e.clientY;
                // Adjust the display
                _this.base.style.left = (pos_x + "px");
                _this.base.style.top = (pos_y + "px");
                // Draw in our best guess position
                _this.draw(document.body);
                // If we're too far over, shift it.
                if ((pos_x + _this.base.offsetWidth) > window.innerWidth) {
                    pos_x = (window.innerWidth - _this.base.offsetWidth);
                }
                // If we're too low, move up
                if ((pos_y + _this.base.offsetHeight) > window.innerHeight) {
                    pos_y = (window.innerHeight - _this.base.offsetHeight);
                }
                // Adjust the display
                _this.base.style.left = (pos_x + "px");
                _this.base.style.top = (pos_y + "px");
                // prevent the real r-click menu
                return false;
            });
        };
        ;
        /** Creates the basic elements of the context menu & optionally adds the standard classes */
        ContextMenu.prototype.__createElements = function () {
            this.elems = {};
            this.elems.option_container = KIP.createSimpleElement("", "optionContainer", "", null, null, this.base);
            if (!this.__no_styles) {
                this.__addStandardStyles();
            }
        };
        ;
        /** Hides whatever context menu is currently showing */
        ContextMenu.prototype.__hideExistingMenu = function () {
            if (ContextMenu.__showingMenu) {
                if (ContextMenu.__showingMenu.base.parentNode) {
                    ContextMenu.__showingMenu.base.parentNode.removeChild(ContextMenu.__showingMenu.base);
                }
            }
        };
        return ContextMenu;
    }(KIP.Drawable));
    KIP.ContextMenu = ContextMenu;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /**
     * @file Functions that allow for easier creation of SVG elements
     * @author Kip Price
     * @version 1.0
     * @since 1.1
     */
    /**
     * Creates an SVG parent that can be added to dynamically
     *
     * @param {String} id      The ID for the SVG element created
     * @param {Number} width   The width at which the SVG should display {optional: 0}
     * @param {Number} height  The height at which the SVG should display {optional: 0}
     * @param {String} view    The viewBox parameter that should be set for the created element {optional: "0 0 0 0"}
     * @param {String} content The contents of the SVG that should displayed {optional: ""}
     *
     * @returns {SVGElement} The SVG element that was created
     */
    function createSVG(id, width, height, view, content, aspect) {
        "use strict";
        try {
            // Create the element and set its ID
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("version", "1.1");
            // Set the various sizing variables, or use defaults
            if (id) {
                svg.setAttribute("id", id);
            }
            if (width !== undefined) {
                svg.setAttribute("width", width.toString() || "0");
            }
            if (height !== undefined) {
                svg.setAttribute("height", height.toString() || "0");
            }
            svg.setAttribute("viewBox", view || "0 0 0 0");
            // Give the new content
            if (content)
                svg.innerHTML = content;
            // Set a default for the aspect ratio
            svg.setAttribute("preserveAspectRatio", aspect || "xMinYMin meet");
            return svg;
        }
        catch (e) {
            throw new Error("svg creation failed");
        }
    }
    KIP.createSVG = createSVG;
    ;
    /**
     * Creates a piece of an SVG drawing
     *
     * @param {String} type - What type of SVG element we are drawing
     * @param {Object} attr - An object of key-value pairs of attributes to set for this element
     *
     * @returns {SVGElement} The element to be added to the SVG drawing
     */
    function createSVGElem(type, attr) {
        "use strict";
        try {
            var elem, key;
            // Create an element within the appropriate namespace
            elem = document.createElementNS("http://www.w3.org/2000/svg", type);
            // Loop through the various attributes and assign them out
            for (key in attr) {
                if (attr.hasOwnProperty(key)) {
                    elem.setAttribute(key, attr[key]);
                }
            }
            // Return the resultant element
            return elem;
        }
        catch (e) {
            console.log("Error creating SVG element");
            return null;
        }
    }
    KIP.createSVGElem = createSVGElem;
    ;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var DraggableFunctions;
    (function (DraggableFunctions) {
        DraggableFunctions[DraggableFunctions["DragEnter"] = 0] = "DragEnter";
        DraggableFunctions[DraggableFunctions["DragLeave"] = 1] = "DragLeave";
        DraggableFunctions[DraggableFunctions["Drop"] = 2] = "Drop";
        DraggableFunctions[DraggableFunctions["Move"] = 3] = "Move";
    })(DraggableFunctions = KIP.DraggableFunctions || (KIP.DraggableFunctions = {}));
    var Draggable = (function (_super) {
        __extends(Draggable, _super);
        function Draggable(param1, param2, param3, param4, param5) {
            var _this = this;
            var target;
            var use_non_standard;
            // Constructor definition with HTMLElement passed in
            if (KIP.isHTMLElement(param1)) {
                _this = _super.call(this, param1, param2) || this;
                target = param3;
                use_non_standard = param4;
                // Constructor definition with IElemDefinition passed in
            }
            else if (KIP.isIElemDefinition(param1)) {
                _this = _super.call(this, param1) || this;
                target = param2;
                use_non_standard = param3;
                // Constructor definition with strings passed in
            }
            else {
                _this = _super.call(this, param1, param2, param3) || this;
                target = param4;
                use_non_standard = param5;
            }
            // Set our class name
            _this.addClassName("Draggable");
            // Set our internal properties
            _this.__use_non_standard = use_non_standard;
            _this.__targets = new Array();
            // Add the target if it was passed in, or the document body if it wasn't
            if (target) {
                _this.__targets.push(target);
            }
            else {
                _this.__targets.push(document.body);
            }
            // Make sure the element is positionable
            KIP.addClass(_this.base, "draggable");
            _this.__addStandardStyles();
            // Add the default event handlers
            _this.__addDefaultEventFunctions();
            // Add the appropriate listeners after the current stack is empty
            _this.__isDragging = false;
            window.setTimeout(function () {
                if (!use_non_standard) {
                    _this.__addStandardDragEventListeners();
                }
                else {
                    _this.__addNonStandardDragEventListeners();
                }
            }, 0);
            return _this;
        }
        Object.defineProperty(Draggable.prototype, "dragEnterFunc", {
            set: function (func) { this._dragEnterFunc = func; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Draggable.prototype, "dragLeaveFunc", {
            set: function (func) { this._dragLeaveFunc = func; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Draggable.prototype, "dropFunc", {
            set: function (func) { this._dropFunc = func; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Draggable.prototype, "moveFunc", {
            set: function (func) { this._moveFunc = func; },
            enumerable: true,
            configurable: true
        });
        Draggable.prototype.__addStandardStyles = function () {
            var cls;
            if (KIP.StylesAdded.Draggable) {
                return;
            }
            KIP.StylesAdded.Draggable = true;
            // Create the general draggable class
            cls = {
                'position': "absolute !important",
                "cursor": "-webkit-grab"
            };
            KIP.createClass(".draggable", cls);
            // Create the grabbing class
            cls = {
                "cursor": "-webkit-grabbing",
            };
            KIP.createClass(".draggable.grabbing", cls);
            // Create the droppable class
            cls = {
                "cursor": "pointer"
            };
            KIP.createClass(".droppable", cls);
        };
        Draggable.prototype.__addDefaultEventFunctions = function () {
            var _this = this;
            // MOVE FUNCTION
            this._moveFunc = function (delta) {
                // Default implementation : adjust position
                var new_pt = {
                    x: ((parseInt(_this.base.style.left) || 0) + delta.x),
                    y: ((parseInt(_this.base.style.top) || 0) + delta.y)
                };
                _this.base.style.left = new_pt.x + "px";
                _this.base.style.top = new_pt.y + "px";
            };
            // DRAG ENTER FUNCTION
            this._dragEnterFunc = function (target, e) {
                e.preventDefault();
            };
            // DRAG LEAVE FUNCTION
            this._dragLeaveFunc = function (target, e) {
                e.preventDefault();
            };
            // DROP FUNCTION
            this._dropFunc = function (target, e) {
                // Prevent the default
                e.preventDefault();
                //Default implementation - add to the target
                if (_this.base.parentNode === target) {
                    return;
                }
                if (_this.base.parentNode) {
                    _this.base.parentNode.removeChild(_this.base);
                }
                target.appendChild(_this.base);
            };
        };
        Draggable.prototype.__addStandardDragEventListeners = function () {
            var _this = this;
            // Make sure we have the attribute on the draggable
            this.base.setAttribute("draggable", "true");
            this.base.addEventListener("dragstart", function (e) {
                _this.__isDragging = true;
                _this.__updateMousePoint(e);
                e.dataTransfer.dropEffect = "move";
                //e.preventDefault();
            });
            this.base.addEventListener('drag', function (e) {
            });
            this.base.addEventListener("dragend", function (e) {
                _this.__isDragging = false;
            });
            var target;
            for (var _i = 0, _a = this.__targets; _i < _a.length; _i++) {
                target = _a[_i];
                this.__addStandardTargetEventListeners(target);
            }
        };
        Draggable.prototype.__addNonStandardDragEventListeners = function () {
            var _this = this;
            this.base.addEventListener("mousedown", function (e) {
                _this.__isDragging = true;
                // Set our initial point
                _this.__updateMousePoint(e);
                // Add the additional listeners we care about
                window.addEventListener("mousemove", mousemove);
                window.addEventListener("mouseup", mouseup);
                window.addEventListener("mouseout", mouseout);
            });
            var mousemove = function (e) {
                if (!_this.__isDragging) {
                    return;
                }
                var delta = _this.__getDelta(e);
                // update our point
                _this.__updateMousePoint(e);
                // Call our overridable move function
                _this._onMove(delta);
            };
            var mouseup = function (e) {
                __stopDragging();
            };
            var mouseout = function (e) {
                if (e.relatedTarget)
                    return;
                __stopDragging();
            };
            // Remove all listeners & reset our var
            var __stopDragging = function () {
                // Quit if we've already removed these events
                if (!_this.__isDragging) {
                    return;
                }
                // Set our internal variable to false
                _this.__isDragging = false;
                // Remove listeners
                window.removeEventListener("mousemove", mousemove);
                window.removeEventListener("mouseup", mouseup);
                window.removeEventListener("mouseout", mouseout);
            };
            var target;
            for (var _i = 0, _a = this.__targets; _i < _a.length; _i++) {
                target = _a[_i];
                this.__addNonStandardTargetEventListeners(target);
            }
        };
        Draggable.prototype.__addNonStandardTargetEventListeners = function (target) {
            var _this = this;
            target.addEventListener("mouseup", function (e) {
                if (!_this.__isDragging) {
                    return;
                }
                _this._onDropOnTarget(target, e);
            });
            target.addEventListener("mouseover", function (e) {
                if (!_this.__isDragging) {
                    return;
                }
                _this._onDragEnterTarget(target, e);
            });
            target.addEventListener("mouseout", function (e) {
                if (!_this.__isDragging) {
                    return;
                }
                _this._onDragLeaveTarget(target, e);
            });
        };
        Draggable.prototype.__addStandardTargetEventListeners = function (target) {
            var _this = this;
            target.addEventListener("dragover", function (e) {
                _this._onDragEnterTarget(target, e);
            });
            target.addEventListener("dragexit", function (e) {
                _this._onDragLeaveTarget(target, e);
            });
            target.addEventListener("drop", function (e) {
                _this._onDropOnTarget(target, e);
            });
        };
        /**
         * Adds a new element that can receive the draggable element
         * @param {HTMLElement} target The new target to allow drop events on
         */
        Draggable.prototype.addDragTarget = function (target) {
            this.__targets.push(target);
            if (!this.__use_non_standard) {
                this.__addStandardTargetEventListeners(target);
            }
            else {
                this.__addNonStandardTargetEventListeners(target);
            }
        };
        Draggable.prototype._onDragEnterTarget = function (target, e) {
            this._dragEnterFunc(target, e);
        };
        Draggable.prototype._onDragLeaveTarget = function (target, e) {
            this._dragLeaveFunc(target, e);
        };
        Draggable.prototype._onMove = function (delta) {
            this._moveFunc(delta);
        };
        Draggable.prototype._onDropOnTarget = function (target, e) {
            this._dropFunc(target, e);
        };
        Draggable.prototype.overrideFunctions = function (dragEnter, dragLeave, drop, move, no_replace) {
            if (dragEnter) {
                this.__overrideFunction(DraggableFunctions.DragEnter, this._dragEnterFunc, dragEnter, no_replace);
            }
            if (dragLeave) {
                this.__overrideFunction(DraggableFunctions.DragLeave, this._dragLeaveFunc, dragLeave, no_replace);
            }
            if (drop) {
                this.__overrideFunction(DraggableFunctions.Drop, this._dropFunc, drop, no_replace);
            }
            if (move) {
                this.__overrideFunction(DraggableFunctions.Move, this._moveFunc, move, no_replace);
            }
        };
        Draggable.prototype.__overrideFunction = function (func, def, override, no_replace) {
            var _this = this;
            var wrapper;
            switch (func) {
                //override or augment the drag enter function
                case DraggableFunctions.DragEnter:
                    wrapper = function (target, e) {
                        if (no_replace) {
                            def.call(_this, target, e);
                        }
                        override.call(_this, target, e);
                    };
                    this._dragEnterFunc = wrapper;
                    break;
                // override or augment the drag leave function
                case DraggableFunctions.DragLeave:
                    wrapper = function (target, e) {
                        if (no_replace) {
                            def.call(_this, target, e);
                        }
                        override.call(_this, target, e);
                    };
                    this._dragLeaveFunc = wrapper;
                    break;
                // Override or augment the drop function
                case DraggableFunctions.Drop:
                    wrapper = function (target, e) {
                        if (no_replace) {
                            def.call(_this, target, e);
                        }
                        override.call(_this, target, e);
                    };
                    this._dropFunc = wrapper;
                    break;
                // Override or augment the move function
                case DraggableFunctions.Move:
                    wrapper = function (delta) {
                        if (no_replace) {
                            def.call(_this, delta);
                        }
                        override.call(_this, delta);
                    };
                    this._moveFunc = wrapper;
                    break;
            }
        };
        /**
         * Gets the delta from the last measurement and this point
         * @param   {MouseEvent} e The event we are measuring from
         * @returns {IPoint}       The delta represented as a point
         */
        Draggable.prototype.__getDelta = function (e) {
            var delta;
            // Create the delta element
            delta = {
                x: (e.clientX - this.__mousePoint.x),
                y: (e.clientY - this.__mousePoint.y)
            };
            return delta;
        };
        /**
         * Updates our internal tracking for the last mouse point
         * @param {MouseEvent} e The event we are using to set the point
         */
        Draggable.prototype.__updateMousePoint = function (e) {
            this.__mousePoint = {
                x: e.clientX,
                y: e.clientY
            };
        };
        return Draggable;
    }(KIP.Drawable));
    KIP.Draggable = Draggable;
    /**
     * Makes a particular element draggable
     * @param {HTMLElement} elem         		The element to make draggable
     * @param {HTMLElement} [target]       	The drop-target of the draggable
     * @param {boolean}     [non_standard] 	True if we should use non-standard events
     */
    function makeDraggable(elem, target, non_standard, dragEnterFunc, dragLeaveFunc, dropFunc, moveFunc) {
        // Behind the scenes, we create a draggable to get this
        var drg;
        drg = new Draggable(elem, target, non_standard);
        drg.overrideFunctions(dragEnterFunc, dragLeaveFunc, dropFunc, moveFunc);
        // Return the element of the Draggable
        return drg.base;
    }
    KIP.makeDraggable = makeDraggable;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    ;
    var FillTypeEnum;
    (function (FillTypeEnum) {
        FillTypeEnum[FillTypeEnum["solid"] = 0] = "solid";
        FillTypeEnum[FillTypeEnum["none"] = 1] = "none";
    })(FillTypeEnum = KIP.FillTypeEnum || (KIP.FillTypeEnum = {}));
    var FontWeightEnum;
    (function (FontWeightEnum) {
        FontWeightEnum[FontWeightEnum["regular"] = 0] = "regular";
        FontWeightEnum[FontWeightEnum["bold"] = 1] = "bold";
        FontWeightEnum[FontWeightEnum["italic"] = 2] = "italic";
        FontWeightEnum[FontWeightEnum["light"] = 3] = "light";
    })(FontWeightEnum = KIP.FontWeightEnum || (KIP.FontWeightEnum = {}));
    var StrokeTypeEnum;
    (function (StrokeTypeEnum) {
        StrokeTypeEnum[StrokeTypeEnum["solid"] = 0] = "solid";
        StrokeTypeEnum[StrokeTypeEnum["dashed"] = 1] = "dashed";
        StrokeTypeEnum[StrokeTypeEnum["dotted"] = 2] = "dotted";
    })(StrokeTypeEnum = KIP.StrokeTypeEnum || (KIP.StrokeTypeEnum = {}));
    var SVGGradientTypeEnum;
    (function (SVGGradientTypeEnum) {
        SVGGradientTypeEnum[SVGGradientTypeEnum["linear"] = 0] = "linear";
        SVGGradientTypeEnum[SVGGradientTypeEnum["radial"] = 1] = "radial";
    })(SVGGradientTypeEnum = KIP.SVGGradientTypeEnum || (KIP.SVGGradientTypeEnum = {}));
    var SVGShapeEnum;
    (function (SVGShapeEnum) {
        SVGShapeEnum[SVGShapeEnum["checkmark"] = 0] = "checkmark";
        SVGShapeEnum[SVGShapeEnum["ex"] = 1] = "ex";
        SVGShapeEnum[SVGShapeEnum["plus"] = 2] = "plus";
    })(SVGShapeEnum = KIP.SVGShapeEnum || (KIP.SVGShapeEnum = {}));
    ;
    ;
    var SVGDrawable = (function (_super) {
        __extends(SVGDrawable, _super);
        function SVGDrawable(id, param2, opts) {
            var _this = _super.call(this, true) || this;
            //  If we didn't get bounds, calculate
            if (KIP.isHTMLElement(param2)) {
                _this.parent = param2;
                // Add a fake element to measure
                var t_elem = KIP.createElement({ parent: param2 });
                // Set the bounds to fill the dimensions of the parent
                _this.__bounds = {
                    x: 0,
                    y: 0,
                    w: (_this.parent.offsetLeft - t_elem.offsetLeft),
                    h: (_this.parent.offsetTop - t_elem.offsetTop)
                };
                // Remove the element
                _this.parent.removeChild(t_elem);
            }
            else {
                _this.__bounds = param2;
            }
            // Create the base element
            _this.base = KIP.createSVG(id, _this.__bounds.w, _this.__bounds.h);
            // Create the definitions element
            _this.__definitionsElement = KIP.createSVGElem("defs");
            _this.base.appendChild(_this.__definitionsElement);
            // Initialize the default maxima / minima
            _this.__extrema = {
                min: {
                    x: 1000000,
                    y: 1000000
                },
                max: {
                    x: 0,
                    y: 0
                }
            };
            // Initialize the viewport
            _this.__view = {
                x: 0,
                y: 0,
                w: 0,
                h: 0
            };
            // Reconcile options
            var defaults = {
                gutter: 1,
                auto_resize: true,
                zoom_x: 0.08,
                zoom_y: 0.08,
                pan_x: true,
                pan_y: true,
                prevent_events: false
            };
            _this.__options = KIP.reconcileOptions(opts, defaults);
            // Initiate collections
            _this.__elems = new KIP.Collection();
            _this.__nonScaled = new Array();
            // Add event listeners
            _this.__addEventListeners();
            return _this;
        }
        Object.defineProperty(SVGDrawable.prototype, "fillStyle", {
            get: function () { return this.__fillStyle; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SVGDrawable.prototype, "strokeStyle", {
            get: function () { return this.__strokeStyle; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SVGDrawable.prototype, "fontStyle", {
            get: function () { return this.__fontStyle; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SVGDrawable.prototype, "width", {
            /**
             * Sets the real-world width of the canvas
             * @param {number} w The width to set
             */
            set: function (w) {
                this.__bounds.w = w;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SVGDrawable.prototype, "height", {
            /**
             * Sets the real-world height of the canvas
             * @param {number} h The height to set
             */
            set: function (h) {
                this.__bounds.h = h;
            },
            enumerable: true,
            configurable: true
        });
        /** Adds the relevant event listeners for the SVG object */
        SVGDrawable.prototype.__addEventListeners = function () {
            var _this = this;
            // Add the wheel listener to the SVG element
            this.base.addEventListener("wheel", function (e) {
                var delta = e.deltaY;
                delta = (delta > 0) ? 1 : -1;
                _this._onZoom(delta);
            });
            // Add the drag listeners
            KIP.makeDraggable(this.base, document.body, true, null, null, null, function (delta) {
                _this._onPan(delta);
            });
        };
        /** handle zooming in & out */
        SVGDrawable.prototype._onZoom = function (direction) {
            var xAmt = this.__options.zoom_x * direction;
            var yAmt = this.__options.zoom_y * direction;
            var xUnit = this.__view.w * xAmt;
            var yUnit = this.__view.h * yAmt;
            // Resize appropriately in the x-dimension
            if (this.__options.zoom_x) {
                this.__view.x -= xUnit;
                this.__view.w += (2 * xUnit);
            }
            // Resive appropriately in the y-dimension
            if (this.__options.zoom_y) {
                this.__view.y -= yUnit;
                this.__view.h += (2 * yUnit);
            }
            // refresh the viewbox attribute
            this.generateViewboxAttribute(true);
        };
        /** handle panning the SVG canvas */
        SVGDrawable.prototype._onPan = function (delta) {
            if (this.__options.pan_x) {
                this.__view.x += delta.x;
            }
            if (this.__options.pan_y) {
                this.__view.y += delta.y;
            }
            // Update the view box
            this.generateViewboxAttribute(true);
        };
        /**
         * Create a string that can be used in the viewbox attribute for the SVG
         * @param  {boolean} [set]	True if we should also set the attribute after generating it
         * @return {string}      		The viewbox attribute for the current view
         */
        SVGDrawable.prototype.generateViewboxAttribute = function (set) {
            var v_box = "";
            // Make sure we have no negative widths or heights
            if (this.__view.w < 0) {
                this.__view.w = 1;
            }
            if (this.__view.h < 0) {
                this.__view.h = 1;
            }
            // Generate the view box string
            v_box = this.__view.x + " " + this.__view.y + " " + this.__view.w + " " + this.__view.h;
            // Set the attribute if requested
            if (set) {
                this.base.setAttribute("viewbox", v_box);
            }
            // Return the viewbox value
            return v_box;
        };
        /**
         * Calculate what the view of the SVG should be, based on the extrema
         * @return {boolean} True if the extrema were appropriately calculated
         */
        SVGDrawable.prototype.__calculateView = function () {
            // If we shouldn't auto-resize,
            if (!this.__options.auto_resize) {
                return false;
            }
            // Update to the extrema
            this.__view.x = this.__extrema.min.x;
            this.__view.y = this.__extrema.min.y;
            this.__view.w = (this.__extrema.max.x - this.__extrema.min.x);
            this.__view.h = (this.__extrema.max.y - this.__extrema.min.y);
            // Return that we successfully updated the view
            return true;
        };
        /**
         * Updates the extreme points of this SVG element after adding an element
         */
        SVGDrawable.prototype.__updateExtrema = function (local_extrema) {
            var extrema;
            // Convert to an IExtrema
            if (KIP.isIBasicRect(local_extrema)) {
                extrema = {
                    min: {
                        x: local_extrema.x,
                        y: local_extrema.y,
                    },
                    max: {
                        x: (local_extrema.x + local_extrema.w),
                        y: (local_extrema.y + local_extrema.h)
                    }
                };
                // Convert to an IExtrema
            }
            else if (KIP.isIPoint(local_extrema)) {
                extrema = {
                    max: local_extrema,
                    min: local_extrema
                };
                // No conversion needed
            }
            else {
                extrema = local_extrema;
            }
            // Update the minima if appropriate
            if (extrema.min.x < this.__extrema.min.x) {
                this.__extrema.min.x = extrema.min.x;
            }
            if (extrema.min.y < this.__extrema.min.y) {
                this.__extrema.min.y = extrema.min.y;
            }
            // Update the maxima is appropriate
            if (extrema.max.x > this.__extrema.max.x) {
                this.__extrema.max.x = extrema.max.x;
            }
            if (extrema.max.y > this.__extrema.max.y) {
                this.__extrema.max.y = extrema.max.y;
            }
        };
        SVGDrawable.prototype.calculateSVGCoordinates = function (pt_or_x, y) {
            var pt;
            // Convert to a point if we received numbers first
            if (KIP.isNumber(pt_or_x)) {
                pt = {
                    x: pt_or_x,
                    y: y
                };
            }
            else {
                pt = pt_or_x;
            }
            // Convert to the appropriate coordinates
            return this.__convertCoordinates(pt, this.__view, this.__bounds);
        };
        SVGDrawable.prototype.calculateScreenCoordinates = function (pt_or_x, y) {
            var pt;
            // Convert to a point if we received numbers first
            if (KIP.isNumber(pt_or_x)) {
                pt = {
                    x: pt_or_x,
                    y: y
                };
            }
            else {
                pt = pt_or_x;
            }
            return this.__convertCoordinates(pt, this.__bounds, this.__view);
        };
        SVGDrawable.prototype.__convertCoordinates = function (pt, numerator, denominator) {
            var out;
            var x_ratio = (numerator.w / denominator.w);
            var y_ratio = (numerator.h / denominator.h);
            out = {
                x: (x_ratio * (pt.x - denominator.x)) + numerator.x,
                y: (y_ratio * (pt.y - denominator.y)) + numerator.y
            };
            return out;
        };
        SVGDrawable.prototype.__convertDistance = function (measure, numerator, denominator) {
            var ratio = numerator / denominator;
            return (measure * ratio);
        };
        SVGDrawable.prototype.calculateSVGWidth = function (width) {
            return this.__convertDistance(width, this.__view.w, this.__bounds.w);
        };
        SVGDrawable.prototype.calculateSVGHeight = function (height) {
            return this.__convertDistance(height, this.__view.h, this.__bounds.h);
        };
        SVGDrawable.prototype.calculateScreenWidth = function (width) {
            return this.__convertDistance(width, this.__bounds.w, this.__view.w);
        };
        SVGDrawable.prototype.calculateScreenHeight = function (height) {
            return this.__convertDistance(height, this.__bounds.h, this.__view.h);
        };
        SVGDrawable.prototype.__addChild = function (type, attributes, parentGroup) {
            // Throw an error if no data was provided
            if (type === "") {
                throw new Error("no SVG element type provided");
            }
            var elem = KIP.createSVGElem(type, attributes);
            // Add to the appropriate parent
            if (parentGroup) {
                parentGroup.appendChild(elem);
            }
            else {
                this.base.appendChild(elem);
            }
            // Add to our collections
            if (attributes["noScale"]) {
                this.__nonScaled.push(elem);
            }
            if (attributes["id"]) {
                this.__elems.addElement(attributes["id"], elem);
            }
            return elem;
        };
        SVGDrawable.prototype.__checkForCurrentPath = function () {
            if (!this.__currentPath) {
                throw new Error("no path started");
            }
        };
        SVGDrawable.prototype.__constructPathAttribute = function (prefix, point) {
            var out = "";
            out = prefix + this.__pointToAttributeString(point) + "\n";
            return out;
        };
        SVGDrawable.prototype.__pointToAttributeString = function (point) {
            var out = point.x + " " + point.y;
            return out;
        };
        SVGDrawable.prototype.__addToPathAttribute = function (suffix) {
            this.__checkForCurrentPath();
            var d = this.__currentPath.getAttribute("d");
            d += suffix;
            this.__currentPath.setAttribute("d", d);
            return true;
        };
        SVGDrawable.prototype.startPath = function (attr, parentGroup) {
            this.__currentPath = this.__addChild("path", attr, parentGroup);
            return this.__currentPath;
        };
        SVGDrawable.prototype.lineTo = function (point) {
            this.__checkForCurrentPath();
            this.__addToPathAttribute(this.__constructPathAttribute("L", point));
        };
        SVGDrawable.prototype.moveTo = function (point) {
            this.__checkForCurrentPath();
            this.__addToPathAttribute(this.__constructPathAttribute("M", point));
        };
        SVGDrawable.prototype.curveTo = function (destination, control1, control2) {
            this.__checkForCurrentPath();
            var d;
            d = "C" + this.__pointToAttributeString(control1) + ", ";
            d += this.__pointToAttributeString(control2) + ", ";
            d += this.__pointToAttributeString(destination) + "\n";
            this.__addToPathAttribute(d);
        };
        SVGDrawable.prototype.arcTo = function (destination, radius, xRotation, largeArc, sweepFlag) {
            var d;
            d = "A" + this.__pointToAttributeString(radius) + " ";
            d += xRotation + " " + largeArc + " " + sweepFlag + " ";
            d += this.__pointToAttributeString(destination) + "\n";
            this.__addToPathAttribute(d);
        };
        /** closes the path so it creates an enclosed space */
        SVGDrawable.prototype.closePath = function () {
            this.__checkForCurrentPath();
            this.__addToPathAttribute(" Z");
            this.finishPathWithoutClosing();
        };
        /** indicates the path is finished without closing the path */
        SVGDrawable.prototype.finishPathWithoutClosing = function () {
            delete this.__currentPath;
        };
        /**
         * Adds a path to the SVG canvas
         * @param   {IPathPoint[]} points   The points to add to the path
         * @param   {IAttributes}  attr     Any attributes that should be applied
         * @param   {SVGElement}   group    The group this path should be added to
         * @param   {boolean}      noFinish True if we should finish the path without closing
         * @returns {SVGElement}            The path that was created
         */
        SVGDrawable.prototype.addPath = function (points, attr, group, noFinish) {
            if (!attr) {
                attr = {};
            }
            var path = this.startPath(attr, group);
            var firstPt = true;
            for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
                var pathPt = points_2[_i];
                if (firstPt) {
                    this.moveTo(pathPt.point);
                    firstPt = false;
                }
                else if (pathPt.controls) {
                    this.curveTo(pathPt.point, pathPt.controls[0], pathPt.controls[1]);
                }
                else if (pathPt.radius) {
                    this.arcTo(pathPt.point, pathPt.radius, pathPt.xRotation, pathPt.largeArc, pathPt.sweepFlag);
                }
                else {
                    this.lineTo(pathPt.point);
                }
                if (this.__options.auto_resize) {
                    this.__updateExtrema(pathPt.point);
                }
            }
            if (!noFinish) {
                this.closePath();
            }
            else {
                this.finishPathWithoutClosing();
            }
            return path;
        };
        SVGDrawable.prototype.addRectangle = function (param1, param2, param3, param4, param5, param6) {
            var rect;
            var group;
            var attr;
            if (typeof param1 === "number") {
                rect = {
                    x: param1,
                    y: param2,
                    w: param3,
                    h: param4
                };
                group = param6;
                attr = param5;
            }
            else {
                rect = param1;
                attr = param2;
                group = param3;
            }
            return this.__addRectangleHelper(rect, attr, group);
        };
        SVGDrawable.prototype.__addRectangleHelper = function (points, attr, group) {
            this.__checkBasicRectForBadData(points);
            if (!attr) {
                attr = {};
            }
            attr["x"] = points.x;
            attr["y"] = points.y;
            attr["width"] = points.w;
            attr["height"] = points.h;
            var elem = this.__addChild("rect", attr, group);
            if (this.__options.auto_resize) {
                this.__updateExtrema(this.__basicRectToExtrema(points));
            }
            return elem;
        };
        /** adds a circle to the SVG canvas */
        SVGDrawable.prototype.addCircle = function (centerPt, radius, attr, group) {
            if (!attr) {
                attr = {};
            }
            // Set our appropriate attribute
            attr["cx"] = centerPt.x;
            attr["cy"] = centerPt.y;
            attr["r"] = radius;
            var elem = this.__addChild("circle", attr, group);
            // Auto-resize if appropriate
            if (this.__options.auto_resize) {
                this.__updateExtrema(this.__extremaFromCenterPointAndRadius(centerPt, radius));
            }
            // Add the child
            return elem;
        };
        /** Adds a perfect arc to the SVG canvas */
        SVGDrawable.prototype.addPerfectArc = function (centerPt, radius, startDegree, endDegree, direction, noRadii, attr, group) {
            var padding = 0; //TODO
            var angleDiff = (endDegree - startDegree);
            var adjust = this.__strokeStyle.width * Math.sqrt(2);
            var adjustedPoint = {
                x: centerPt.x + adjust,
                y: centerPt.y + adjust
            };
            var start = this.__calculatePolygonPoint(adjustedPoint, KIP.Trig.degreesToRadians(startDegree), radius);
            var end = this.__calculatePolygonPoint(adjustedPoint, KIP.Trig.degreesToRadians(endDegree), radius);
            if (!attr) {
                attr = {};
            }
            var path = this.startPath(attr, group);
            this.moveTo(start);
            this.arcTo(end, { x: radius, y: radius }, 0, (angleDiff > 180) ? 1 : 0, direction);
            // auto-resize if appropriate
            if (this.__options.auto_resize) {
                var extrema = this.__arcToExtrema(start, end, centerPt, radius, startDegree, endDegree);
                this.__updateExtrema(extrema);
            }
            // If we aren't showing the radius, quit now
            if (noRadii) {
                this.finishPathWithoutClosing();
                return path;
            }
            // Otherwise close the segment path
            this.lineTo(centerPt);
            this.closePath();
            return path;
        };
        /**
         * creates a regular polygon to the SVG canvas
         * @param   {IPoint}      centerPt The central point of the polygon
         * @param   {number}      sides    The number of sides of the polygon
         * @param   {number}      radius   The radius of the polygon
         * @param   {IAttributes} attr     Any additional attributes
         * @param   {SVGElement}  group    The group the polygon should be added to
         * @returns {SVGElement}           The created polygon on the SVG Canvas
         */
        SVGDrawable.prototype.regularPolygon = function (centerPt, sides, radius, attr, group) {
            // Generate the point list for the polygon
            var points;
            var curAngle = 0;
            var intAngle = KIP.Trig.calculatePolygonInternalAngle(sides);
            for (var i = 0; i < sides; i += 1) {
                var pt = this.__calculatePolygonPoint(centerPt, curAngle, radius);
                curAngle += intAngle;
                points += pt.x + "," + pt.y + " ";
            }
            // Set our attributes to include the points
            if (!attr) {
                attr = {};
            }
            attr["points"] = points;
            var elem = this.__addChild("polygon", attr, group);
            // Auto-resize if appropriate
            if (this.__options.auto_resize) {
                this.__updateExtrema(this.__extremaFromCenterPointAndRadius(centerPt, radius));
            }
            return elem;
        };
        /**
         * Creates a regular star on the SVG canvas
         * @param   {IPoint}      centerPt      	The point at the center of the star
         * @param   {number}      numberOfPoints 	The number of points of this star
         * @param   {number}      radius        	[description]
         * @param   {number}      innerRadius   	[description]
         * @param   {IAttributes} attr          	[description]
         * @param   {SVGElement}  group         	[description]
         * @returns {SVGElement}                	[description]
         */
        SVGDrawable.prototype.addRegularStar = function (centerPt, numberOfPoints, radius, innerRadius, attr, group) {
            var curAngle = 0;
            var intAngle = (KIP.Trig.calculatePolygonInternalAngle(numberOfPoints) / 2);
            var points = "";
            for (var i = 0; i < numberOfPoints; i += 1) {
                var pt = void 0;
                // Outer point
                pt = this.__calculatePolygonPoint(centerPt, curAngle, radius);
                curAngle += intAngle;
                points += pt.x + "," + pt.y + " ";
                // Inner point
                pt = this.__calculatePolygonPoint(centerPt, curAngle, innerRadius);
                curAngle += intAngle;
                points += pt.x + "," + pt.y + " ";
            }
            // Set the points value into our attributes
            if (!attr) {
                attr = {};
            }
            attr["points"] = points;
            var elem = this.__addChild("polygon", attr, group);
            // Auto-resize if appropriate
            if (this.__options.auto_resize) {
                this.__updateExtrema(this.__extremaFromCenterPointAndRadius(centerPt, radius));
            }
            return elem;
        };
        /**
         * Adds a text element to the SVG canvas
         * @param   {string}      text     The text to add
         * @param   {IPoint}      point    The point at which to add the point
         * @param   {IPoint}      originPt If provided, the origin point within the text element that defines where the text is drawn
         * @param   {IAttributes} attr     Any attributes that should be applied to the element
         * @param   {SVGElement}  group    The group to add this element to
         * @returns {SVGElement}           The text element added to the SVG
         */
        SVGDrawable.prototype.addText = function (text, point, originPt, attr, group) {
            if (!attr) {
                attr = {};
            }
            attr["x"] = point.x;
            attr["y"] = point.y;
            var textElem = this.__addChild("text", attr, group);
            textElem.innerHTML = text;
            var box;
            if (originPt) {
                box = this.measureElement(textElem);
                var newPt = {
                    x: box.w * originPt.x,
                    y: (box.h * originPt.y) - box.h
                };
                textElem.setAttribute("x", newPt.x.toString());
                textElem.setAttribute("y", newPt.y.toString());
                box.x = newPt.x;
                box.y = newPt.y;
            }
            if (this.__options.auto_resize) {
                if (!box) {
                    this.measureElement(textElem);
                }
                this.__updateExtrema(box);
            }
            // Make sure we add the unselectable class
            KIP.addClass(textElem, "unselectable");
            return textElem;
        };
        SVGDrawable.prototype.addFlowableText = function (text, bounds, attr, group) {
            //TODO
            return null;
        };
        SVGDrawable.prototype.addGroup = function (attr, group) {
            return this.__addChild("g", attr, group);
        };
        /**
         * Adds a gradient to the SVG canvas
         * @param   {SVGGradientTypeEnum} type       The type of gradient to add
         * @param   {IGradientPoint[]}    points     What points describe the gradient
         * @param   {IPoint}            transforms 	 ???
         * @returns {string}                         The created gradient
         */
        SVGDrawable.prototype.addGradient = function (type, points, transforms) {
            var id = "gradient" + this.__gradients.length;
            var attr = {
                id: id
            };
            var gradient;
            gradient = KIP.createSVGElem(SVGGradientTypeEnum[type] + "Gradient", attr);
            // Apply the points
            for (var _i = 0, points_3 = points; _i < points_3.length; _i++) {
                var point = points_3[_i];
                var ptElem = KIP.createSVGElem("stop");
                ptElem.style.stopColor = point.color;
                ptElem.style.stopOpacity = point.opacity.toString();
                ptElem.setAttribute("offset", point.offset);
                gradient.appendChild(ptElem);
            }
            // Add to our element & our collection
            this.__definitionsElement.appendChild(gradient);
            this.__gradients.push(gradient);
            // Add transform points (BROKEN?)
            if (transforms) {
                var tID = "gradient" + this.__gradients.length;
                var tGrad = KIP.createSVGElem(type + "Gradient", { id: tID });
                tGrad.setAttribute("x1", transforms.start.x.toString());
                tGrad.setAttribute("x2", transforms.end.x.toString());
                tGrad.setAttribute("y1", transforms.start.y.toString());
                tGrad.setAttribute("y2", transforms.end.y.toString());
                tGrad.setAttribute("xlink:href", "#" + id);
                this.__definitionsElement.appendChild(tGrad);
                this.__gradients.push(tGrad);
                id = tID;
            }
            return id;
        };
        SVGDrawable.prototype.addPattern = function () {
            // TODO
        };
        SVGDrawable.prototype.addStipplePattern = function () {
            // TODO
        };
        /**
         * Adds a particular shape to the SVG canvas
         * @param   {SVGShapeEnum} shapeType The type of shape to add
         * @param   {number}       scale     What scale the shape should be drawn at
         * @param   {IAttributes}  attr      Any attributes that should be applied to the element
         * @param   {SVGElement}   group     What group the element should be added to
         * @returns {SVGElement}             The created shape
         */
        SVGDrawable.prototype.addShape = function (shapeType, scale, attr, group) {
            // Use our default scale if one wasn't passed in
            if (!scale) {
                scale = 1;
            }
            // Draw the appropriate shape
            switch (shapeType) {
                case SVGShapeEnum.checkmark:
                    return this.__addCheckShape(scale, attr, group);
                case SVGShapeEnum.ex:
                    return this.__addExShape(scale, attr, group);
                case SVGShapeEnum.plus:
                    return this.__addPlusShape(scale, attr, group);
            }
        };
        /**
         * Adds a checkmark to the canvas with the provided scale
         */
        SVGDrawable.prototype.__addCheckShape = function (scale, attr, group) {
            scale *= (1 / 4);
            var basePoints = [
                { x: -0.15, y: 2.95 },
                { x: 1, y: 4 },
                { x: 1.25, y: 4 },
                { x: 3, y: 0.25 },
                { x: 2.4, y: 0 },
                { x: 1, y: 3 },
                { x: 0.3, y: 2.3 }
            ];
            var points = this.__convertPointsToPathPoints(basePoints, scale);
            return this.addPath(points, attr, group);
        };
        /**
         * Adds an 'ex' to the canvas with the provided scale
         */
        SVGDrawable.prototype.__addExShape = function (scale, attr, group) {
            scale *= (1 / 3.75);
            var basePoints = [
                { x: 0.25, y: 0.6 },
                { x: 1, y: 0 },
                { x: 2, y: 1.1 },
                { x: 3, y: 0 },
                { x: 3.75, y: 0.6 },
                { x: 2.66, y: 1.75 },
                { x: 3.75, y: 2.9 },
                { x: 3, y: 3.5 },
                { x: 2, y: 2.5 },
                { x: 1, y: 3.5 },
                { x: 0.25, y: 2.9 },
                { x: 1.33, y: 1.75 }
            ];
            var points = this.__convertPointsToPathPoints(basePoints, scale);
            return this.addPath(points, attr, group);
        };
        /**
         * Adds a plus to the canvas with the provided scale
         */
        SVGDrawable.prototype.__addPlusShape = function (scale, attr, group) {
            scale *= (1 / 5);
            var basePoints = [
                { x: 2, y: 2 },
                { x: 2, y: 0 },
                { x: 3, y: 0 },
                { x: 3, y: 2 },
                { x: 5, y: 2 },
                { x: 5, y: 3 },
                { x: 3, y: 3 },
                { x: 3, y: 5 },
                { x: 2, y: 5 },
                { x: 2, y: 3 },
                { x: 0, y: 3 },
                { x: 0, y: 2 }
            ];
            var points = this.__convertPointsToPathPoints(basePoints, scale);
            return this.addPath(points, attr, group);
        };
        /**
         * Helper function to turn an array of IPoint elements to IPathPoint elements
         * @param   {IPoint[]}     points The points to convert
         * @param   {number}       scale  The scale that should be applied to the IPoint before turning into a IPathPoint
         * @returns {IPathPoint[]}        Array of scaled IPathPoints
         */
        SVGDrawable.prototype.__convertPointsToPathPoints = function (points, scale) {
            if (!scale) {
                scale = 1;
            }
            var pathPoints = [];
            // Loop through each of the points
            for (var _i = 0, points_4 = points; _i < points_4.length; _i++) {
                var pt = points_4[_i];
                pt.x *= scale; // Scale the x dimension
                pt.y *= scale; // Scale the y dimension
                pathPoints.push({
                    point: pt
                });
            }
            return pathPoints;
        };
        SVGDrawable.prototype.adjustStyle = function () { };
        /**
         * Rotates an element around a particular point
         * @param   {SVGElement} elem         The element to rotate
         * @param   {number}     degree       How many degrees to rotate the element
         * @param   {IPoint}     rotateAround What point to rotate around
         * @returns {SVGElement}              The rotated SVG Element
         */
        SVGDrawable.prototype.rotateElement = function (elem, degree, rotateAround) {
            var box;
            // If we don't have a point around which to rotate, set it to be the center of the element
            if (!rotateAround) {
                box = this.measureElement(elem);
                rotateAround = {
                    x: box.x + (box.w / 2),
                    y: box.y + (box.h / 2)
                };
            }
            elem.setAttribute("transform", "rotate(" + degree + ", " + rotateAround.x + ", " + rotateAround.y + ")");
            return elem;
        };
        SVGDrawable.prototype.animateElement = function () { };
        /**
         * Measures an element in the SVG canvas
         * @param   {SVGElement} element The element to measure
         * @returns {IBasicRect}         The dimensions of the element, in SVG coordinates
         */
        SVGDrawable.prototype.measureElement = function (element) {
            var box;
            var addedParent;
            // Add our base element to the view if it doesn't have anything
            if (!this.base.parentNode) {
                document.body.appendChild(this.base);
                addedParent = true;
            }
            // Get the bounding box for element
            box = element.getBBox();
            // If we had to add the base element to the document, remove it
            if (addedParent) {
                document.body.removeChild(this.base);
            }
            // Build our return rectangle
            var rect = {
                x: box.x,
                y: box.y,
                w: box.width,
                h: box.height
            };
            return rect;
        };
        /** helper function to check that a rectangle is actually renderable */
        SVGDrawable.prototype.__checkBasicRectForBadData = function (rect) {
            var err = false;
            // check for null values first
            if (rect.x !== 0 && !rect.x) {
                err = true;
            }
            if (rect.y !== 0 && !rect.y) {
                err = true;
            }
            if (rect.w !== 0 && !rect.w) {
                err = true;
            }
            if (rect.h !== 0 && !rect.h) {
                err = true;
            }
            // Then for non-sensical
            if (rect.w < 0) {
                err = true;
            }
            if (rect.h < 0) {
                err = true;
            }
            if (err) {
                throw new Error("invalid basic rectangle values");
            }
        };
        /** helper function to turn a basic rect to extrema */
        SVGDrawable.prototype.__basicRectToExtrema = function (rect) {
            var extrema = {
                min: { x: rect.x, y: rect.y },
                max: { x: rect.x + rect.w, y: rect.y + rect.h }
            };
            return extrema;
        };
        /** helper function to calculate extrema from a central point and radius */
        SVGDrawable.prototype.__extremaFromCenterPointAndRadius = function (center, radius) {
            var extrema = {
                max: { x: center.x + radius, y: center.y + radius },
                min: { x: center.x - radius, y: center.y - radius }
            };
            return extrema;
        };
        /** helper function to calculate a polygon's point at a certain angle */
        SVGDrawable.prototype.__calculatePolygonPoint = function (centerPt, currentAngle, radius) {
            var out = {
                x: centerPt.x + KIP.roundToPlace(Math.sin(currentAngle) * radius, 10),
                y: centerPt.y + KIP.roundToPlace(-1 * Math.cos(currentAngle) * radius, 10)
            };
            return out;
        };
        /** helper function to convert arc params to extrema */
        SVGDrawable.prototype.__arcToExtrema = function (startPt, endPt, centerPt, radius, startDeg, endDeg) {
            var extrema = {
                max: {
                    x: Math.max(startPt.x, endPt.x),
                    y: Math.max(startPt.y, endPt.y)
                },
                min: {
                    x: Math.min(startPt.x, endPt.x),
                    y: Math.min(startPt.y, endPt.y)
                }
            };
            // O DEGREES : STRAIGHT UP
            if (startDeg < 0 && endDeg > 0) {
                var maxY = centerPt.y - radius;
                if (maxY > extrema.max.y) {
                    extrema.max.y = maxY;
                }
            }
            // 90 DEGREES : TO THE RIGHT
            if (startDeg < 90 && endDeg > 90) {
                var maxX = centerPt.x + radius;
                if (maxX > extrema.max.x) {
                    extrema.max.x = maxX;
                }
            }
            // 180 DEGREES : STRAIGHT DOWN
            if (startDeg < 180 && endDeg > 180) {
                var minY = centerPt.y + radius;
                if (minY < extrema.min.y) {
                    extrema.min.y = minY;
                }
            }
            // 270 DEGREES : TO THE LEFT
            if (startDeg < 270 && endDeg > 270) {
                var minX = centerPt.x - radius;
                if (minX < extrema.min.x) {
                    extrema.min.x = minX;
                }
            }
            return extrema;
        };
        return SVGDrawable;
    }(BaseDrawable));
    KIP.SVGDrawable = SVGDrawable;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /** create the class for the actual tutorial */
    var Tutorial = (function (_super) {
        __extends(Tutorial, _super);
        //========================
        // INITIALIZE THE CLASS
        //========================
        /** create the actual tutorial class */
        function Tutorial(options) {
            var _this = _super.call(this, "", "tutorial") || this;
            _this.__initializeVariables();
            _this.__reconcileOptions(options);
            _this.__createElements();
            _this.__addStandardStyles();
            return _this;
        }
        /** initiailize our properties */
        Tutorial.prototype.__initializeVariables = function () {
            this.__steps = [];
            this.__currentStep = -1;
        };
        /** take options passed to the tutorial & reconcile with our defaults */
        Tutorial.prototype.__reconcileOptions = function (options) {
            var defaults = {
                loopAround: true,
                useStandardStyles: true,
                inlineMargin: 5
            };
            KIP.reconcileOptions(options, defaults);
        };
        //===========================
        // CREATE STANDARD STYLES
        //===========================
        /** create the HTML pieces of the tutorial */
        Tutorial.prototype.__createElements = function () {
            // Each individual implementation should implement this
        };
        ;
        /** create the container for the individual steps */
        Tutorial.prototype.__createStepContainer = function () {
            this.__stepContainer = KIP.createSimpleElement("", "tutorialSteps");
            this.base.appendChild(this.__stepContainer);
        };
        //=============================
        // ADD A STEP TO THE TUTORIAL
        //=============================
        /** adds a step to the tutorial */
        Tutorial.prototype.addStep = function (title, details) {
            // This should be overridden by a child class
            return null;
        };
        /** add the step we created to our internal collection */
        Tutorial.prototype.__addStepToCollection = function (step) {
            // Add to our collection
            var idx = this.__steps.length;
            this.__steps[idx] = step;
            return idx;
        };
        //==========================
        // SHOW A PARTICULAR STEP
        //==========================
        /** show a particular step in this tutorial */
        Tutorial.prototype.showStep = function (idx) {
            var curStep;
            // Check if we're already showing a tutorial step
            if (this.__currentStep !== -1) {
                curStep = this.__steps[this.__currentStep];
            }
            // Stop showing the current step
            if (curStep) {
                curStep.erase();
                this.__currentStep = -1;
            }
            // Get the next step that we want to show
            var step = this.__steps[idx];
            // Quit if there is no step to show
            if (!step) {
                return;
            }
            // Show the next step
            step.draw(this.base);
            // Track the currently shown step
            this.__currentStep = idx;
        };
        /** show the next step in the tutorial */
        Tutorial.prototype.nextStep = function () {
            var idx = this.__currentStep;
            idx += 1;
            if (this.__options.loopAround) {
                idx %= this.__steps.length;
            }
            this.showStep(idx);
        };
        /** show the previous step in the tutorial */
        Tutorial.prototype.previousStep = function () {
            var idx = this.__currentStep;
            idx -= 1;
            if (idx < 0 && this.__options.loopAround) {
                idx = (this.__steps.length - 1);
            }
            this.showStep(idx);
        };
        //===========================
        // SHOW / HIDE THE TUTORIAL
        //===========================
        /** show the tutorial */
        Tutorial.prototype.show = function () {
            // Make sure we show at least one step
            if (this.__currentStep === -1) {
                this.showStep(0);
            }
            // Draw the tutorial if needed
            this.draw(document.body);
            // Add the appropriate class
            KIP.addClass(this.base, "visible");
        };
        /** remove the tutorial from view */
        Tutorial.prototype.hide = function () {
            if (!this.base.parentNode) {
                return;
            }
            KIP.removeClass(this.base, "visible");
            // Call the callback if anyone is listening
            if (this.onTutorialHidden) {
                this.onTutorialHidden();
            }
        };
        //========================
        // ADD STANDARD STYLES
        //========================
        Tutorial.prototype.__addStandardStyles = function () {
            // Override in the child classes
        };
        ;
        return Tutorial;
    }(KIP.Drawable));
    KIP.Tutorial = Tutorial;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /** generic class to show a tutorial step */
    var TutorialStep = (function (_super) {
        __extends(TutorialStep, _super);
        /** create this particular step */
        function TutorialStep(parent, title) {
            var _this = _super.call(this, "", "tutorialStep") || this;
            _this.__defaultDetailsClass = "details";
            _this.__title = title;
            _this.__parent = parent;
            _this.__details = [];
            _this.__createElements();
            return _this;
        }
        //==================
        // CREATE ELEMENTS
        //==================
        /** create generic version of the createElements set */
        TutorialStep.prototype.__createElements = function () {
            // Implemented by sub classes
        };
        ;
        /** create the title for the step */
        TutorialStep.prototype.__createTitle = function () {
            var title = KIP.createSimpleElement("", "title", this.__title);
            this.base.appendChild(title);
        };
        /** create the details container of the tutorial details */
        TutorialStep.prototype.__createDetailContainer = function () {
            this.__detailContainer = KIP.createSimpleElement("", "details");
            this.base.appendChild(this.__detailContainer);
        };
        /** create details of the step */
        TutorialStep.prototype.__createDetailElement = function (pair) {
            if (!pair) {
                return;
            }
            // Default the class
            pair.cls = pair.cls || this.__defaultDetailsClass;
            // Create the detail element & add it to our container
            var detailElem = KIP.createSimpleElement("", pair.cls, pair.details);
            this.__detailContainer.appendChild(detailElem);
        };
        ;
        //==================
        // ADD TO THE STEP
        //==================
        /** set the hilited element for the tutorial */
        TutorialStep.prototype.addHilitedElement = function (elem) {
            // Implemented by sub-classes
        };
        /** add details to the step */
        TutorialStep.prototype.addDetails = function (content, cssClass) {
            var pair = {
                details: content,
                cls: cssClass
            };
            // Add to our array
            this.__details.push(pair);
            // Add the UI for the details
            this.__createDetailElement(pair);
        };
        return TutorialStep;
    }(KIP.Drawable));
    KIP.TutorialStep = TutorialStep;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //=======================
    // FULL-SCREEN TUTORIAL
    //=======================
    var FullScreenTutorial = (function (_super) {
        __extends(FullScreenTutorial, _super);
        function FullScreenTutorial() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //=======================
        // CREATE ALL ELEMENTS
        //=======================
        /** create the elements to actually show the tutorial */
        FullScreenTutorial.prototype.__createElements = function () {
            this.__createOverlay();
            this.__createStepContainer();
            this.__createCloseButton();
            this.__createNavigationalElements();
        };
        ;
        /** creates the background element */
        FullScreenTutorial.prototype.__createOverlay = function () {
            var overlay = KIP.createSimpleElement("", "overlay");
            this.base.appendChild(overlay);
        };
        /** create the close button for the tutorial */
        FullScreenTutorial.prototype.__createCloseButton = function () {
            var _this = this;
            var closeBtn = KIP.createSimpleElement("", "close btn", "CLOSE");
            this.base.appendChild(closeBtn);
            closeBtn.addEventListener("click", function () {
                _this.hide();
            });
        };
        /** create buttons to navigate the tutorial */
        FullScreenTutorial.prototype.__createNavigationalElements = function () {
            var navContainer = KIP.createSimpleElement("", "tutorialNavButtons");
            // Previous button
            this.__createPreviousBtn(navContainer);
            // Holds the dots for each step
            this.__navStepContainer = KIP.createSimpleElement("", "tutorialStepsNav");
            // Next button
            this.__createNextBtn(navContainer);
        };
        /** create the previous button */
        FullScreenTutorial.prototype.__createPreviousBtn = function (parent) {
            var _this = this;
            var prevBtn = KIP.createSimpleElement("", "prev btn", "PREV");
            parent.appendChild(prevBtn);
            prevBtn.addEventListener("click", function () {
                _this.previousStep();
            });
        };
        /** create the next button */
        FullScreenTutorial.prototype.__createNextBtn = function (parent) {
            var _this = this;
            var nextBtn = KIP.createSimpleElement("", "next btn", "NEXT");
            parent.appendChild(nextBtn);
            nextBtn.addEventListener("click", function () {
                _this.nextStep();
            });
        };
        //========================
        // ADD A PARTICULAR STEP
        //========================
        /** add a particular step to the tutorial */
        FullScreenTutorial.prototype.addStep = function (title, details) {
            var screen = new KIP.TutorialScreen(this, title);
            screen.addDetails(details);
            // Add to our collection of steps
            var idx = this.__addStepToCollection(screen);
            // Add a step in our navigator
            this.__addStepNavigator(idx);
            // Return the screen we created
            return screen;
        };
        /** show a particular step in the tutorial */
        FullScreenTutorial.prototype.__addStepNavigator = function (idx) {
            var _this = this;
            var stepNav = KIP.createSimpleElement("", "navStep");
            this.__navStepContainer.appendChild(stepNav);
            stepNav.addEventListener("click", function () {
                _this.showStep(idx);
            });
        };
        //==============================================
        // ADD CSS STYLES FOR THE FULL-SCREEN TUTORIAL
        //==============================================
        /** add all standard styles for the full-screen tutorial */
        FullScreenTutorial.prototype.__addStandardStyles = function () {
            // Quit if we've added these tutorial classes before
            if (KIP.StylesAdded.FullScreenTutorial) {
                return;
            }
            KIP.StylesAdded.FullScreenTutorial = true;
            this.__addTutorialClass();
            this.__addVisibleTutorialClass();
            this.__addOverlayClass();
            this.__addTitleClass();
        };
        /** add the classes for the core classes */
        FullScreenTutorial.prototype.__addTutorialClass = function () {
            var cls;
            cls = {
                "top": "0",
                "left": "0",
                "position": "fixed",
                "width": "100%",
                "height": "100%",
                "opacity": "0",
                "transition": "opacity .2s ease-in-out",
                "font-family": '"Segoe UI", "Calibri", sans-serif',
                "user-select": "none",
                "-moz-user-select": "none",
                "-webkit-user-select": "none",
                "khtml-user-select": "none",
                "o-user-select": "none",
                "pointer-events": "none"
            };
            KIP.createClass(".tutorial", cls);
        };
        /** add the visible pieces of the tutorial classes */
        FullScreenTutorial.prototype.__addVisibleTutorialClass = function () {
            var cls;
            cls = {
                opacity: "1",
                "pointer-events": "auto"
            };
            KIP.createClass(".tutorial.visible", cls);
        };
        /** add the full-screen overlay */
        FullScreenTutorial.prototype.__addOverlayClass = function () {
            var cls;
            cls = {
                "background-color": "rgba(0,0,0,.8)",
                "position": "absolute",
                "left": "0",
                "top": "0"
            };
            KIP.createClass(".tutorial .overlay", cls);
        };
        /** add the title for the tutorial */
        FullScreenTutorial.prototype.__addTitleClass = function () {
            var cls;
            cls = {
                color: "#FFF",
                "font-size": "2em"
            };
            KIP.createClass(".tutorial .content .title", cls);
        };
        return FullScreenTutorial;
    }(KIP.Tutorial));
    KIP.FullScreenTutorial = FullScreenTutorial;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //=========================
    // TUTORIAL OF HELP TIPS
    //=========================
    var HelpTipTutorial = (function (_super) {
        __extends(HelpTipTutorial, _super);
        function HelpTipTutorial() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //=======================
        // CREATE ALL ELEMENTS
        //=======================
        /** create the elements to actually show the tutorial */
        HelpTipTutorial.prototype.__createElements = function () {
            this.__createStepContainer();
        };
        //========================
        // ADD A PARTICULAR STEP
        //========================
        /** add a particular step to the the tutorial */
        HelpTipTutorial.prototype.addStep = function (title, details) {
            var tip = new KIP.TutorialTip(this, title);
            tip.addDetails(details);
            // Add to our collection of steps
            this.__addStepToCollection(tip);
            // Return the help tip we created
            return tip;
        };
        //============================================
        // ADD CSS STYLES FOR THE HELP-TIP TUTORIAL
        //============================================
        /** add all standard styles for the help-tip tutorial */
        HelpTipTutorial.prototype.__addStandardStyles = function () {
            // Quit if we've added these tutorial classes before
            if (KIP.StylesAdded.HelpTipTutorial) {
                return;
            }
            KIP.StylesAdded.HelpTipTutorial = true;
            // Add the classes for inline help
            //================
            // BODY CLASSES
            //================
            this.__addInlineHelpClass();
            this.__addInlineHelpTitleClass();
            this.__addInlineHelpContentClass();
            //==================
            // HILITE CLASSES
            //==================
            this.__addInlineHelpHiliteClass();
            this.__addInlineHelpHiliteBackdrop();
            //==================
            // BUTTON CLASSES
            //==================
            this.__addInlineHelpBtnContainerClass();
            this.__addInlineHelpButtonClass();
            this.__addInlineHelpButtonHoverClass();
            this.__addInlineHelpCloseButtonClass();
        };
        /** basic inline help class */
        HelpTipTutorial.prototype.__addInlineHelpClass = function () {
            var cls;
            cls = {
                position: "absolute",
                "background-color": "#eee",
                padding: "10px",
                "box-shadow": "1px 1px 13px 5px rgba(0,0,0,.1)",
                "border-radius": "3px",
                "max-width": "35%"
            };
            KIP.createClass(".inlineHelp", cls);
        };
        /** title for the inline help class */
        HelpTipTutorial.prototype.__addInlineHelpTitleClass = function () {
            var cls;
            cls = {
                "font-size": "1.1em",
                "font-weight": "bold",
                "text-transform": "uppercase",
                "margin-bottom": "5px"
            };
            KIP.createClass(".inlineHelp .title", cls);
        };
        /** content for the inline help class */
        HelpTipTutorial.prototype.__addInlineHelpContentClass = function () {
            var cls;
            cls = {
                display: "block"
            };
            KIP.createClass(".tutorial .inlineHelp .content", cls);
        };
        /** indicate the element we're pointing to */
        HelpTipTutorial.prototype.__addInlineHelpHiliteClass = function () {
            var cls;
            cls = {
                border: "5px #333 dotted",
                "box-shadow": "1px 1px 8px 4px rgba(0,0,0, 0.2)"
            };
            KIP.createClass(".tutorialHilite", cls);
        };
        /** background for the hilited element */
        HelpTipTutorial.prototype.__addInlineHelpHiliteBackdrop = function () {
            var cls;
            cls = {
                content: '""',
                position: "absolute",
                width: "140%",
                height: "140%",
                top: "-20%",
                left: "-20%",
                "z-index": "-1",
                "background-color": "rgba(0,0,0,.1)",
                "box-shadow": "1px 1px 25px 10px rgba(0,0,0,.1)"
            };
            KIP.createClass(".tutorialHilite:before", cls);
        };
        /** container for buttons */
        HelpTipTutorial.prototype.__addInlineHelpBtnContainerClass = function () {
            var cls;
            cls = {
                display: "flex",
                "justify-content": "space-between",
                "margin-top": "10px"
            };
            KIP.createClass(".inlineBtns", cls);
        };
        /** generic button */
        HelpTipTutorial.prototype.__addInlineHelpButtonClass = function () {
            var cls;
            cls = {
                cursor: "pointer",
                transition: "all .1s ease-in-out"
            };
            KIP.createClass(".inlineBtn", cls);
        };
        /** hover class for generic button */
        HelpTipTutorial.prototype.__addInlineHelpButtonHoverClass = function () {
            var cls;
            cls = {
                transform: "scale(1.1)"
            };
            KIP.createClass(".inlineBtn:hover", cls);
        };
        /** close button to hide the tutorial */
        HelpTipTutorial.prototype.__addInlineHelpCloseButtonClass = function () {
            var cls;
            cls = {
                position: "absolute",
                left: "calc(100% - 18px)",
                top: "-5px",
                "border-radius": "15px",
                padding: "2px 7px"
            };
            KIP.createClass(".close.inlineBtn", cls);
        };
        return HelpTipTutorial;
    }(KIP.Tutorial));
    KIP.HelpTipTutorial = HelpTipTutorial;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //=====================
    // TUTORIAL HELP TIP
    //=====================
    /** display a particular help tip for the tutorial */
    var TutorialTip = (function (_super) {
        __extends(TutorialTip, _super);
        function TutorialTip() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.__defaultDetailsClass = "inlineDetails";
            return _this;
        }
        //==================================
        // CREATE ELEMENTS FOR INLINE HELP
        //==================================
        /** create the elements for this particular step */
        TutorialTip.prototype.__createElements = function () {
            this.__createTitle();
            this.__createDetailContainer();
            this.__createButtonContainer();
            this.__createCloseButton();
        };
        /** create the close button for inline help */
        TutorialTip.prototype.__createCloseButton = function () {
            var closeBtn = KIP.createSimpleElement("", "close btn", "X");
            this.base.appendChild(closeBtn);
        };
        /** create the container for the buttons */
        TutorialTip.prototype.__createButtonContainer = function () {
            var btns = KIP.createSimpleElement("", "buttonContainer");
            this.base.appendChild(btns);
            this.__createPreviousButton(btns);
            this.__createNextButton(btns);
        };
        /** create the next button for the inline help step */
        TutorialTip.prototype.__createNextButton = function (parent) {
            var _this = this;
            var nextBtn = KIP.createSimpleElement("", "next btn", "NEXT");
            parent.appendChild(nextBtn);
            nextBtn.addEventListener("click", function () {
                _this.__parent.nextStep();
            });
        };
        /** create the previous button for the inline help step */
        TutorialTip.prototype.__createPreviousButton = function (parent) {
            var _this = this;
            var prevBtn = KIP.createSimpleElement("", "prev btn", "PREVIOUS");
            parent.appendChild(prevBtn);
            prevBtn.addEventListener("click", function () {
                _this.__parent.previousStep();
            });
        };
        //=======================
        // ADD DETAILS
        //=======================
        /** add a particular element to hilite */
        TutorialTip.prototype.addHilitedElement = function (elem) {
            this.__hilitedElement = elem;
            // Resize the 
        };
        TutorialTip.prototype.__findAppropriatePoint = function () {
            var srcBox, pt, needsSourceMeasure, max, bblPt;
            //TODO: fix
            // Measure the hilited element
            var tmpBox = this.__hilitedElement.getBoundingClientRect();
            var elemBox = {
                x: tmpBox.left - this.__options.inlineMargin,
                y: tmpBox.top,
                w: tmpBox.width + (2 * this.__options.inlineMargin),
                h: tmpBox.height
            };
            max = {
                x: (window.innerWidth - elemBox.w),
                y: (window.innerHeight - elemBox.h)
            };
            pt = { x: null, y: null };
            var obj;
            // FIRST LOOK TO THE ACTUAL POINTS SET BY THE USER (AS LONG AS THEY ARE WITHIN BOUNDS)
            if (obj.x !== undefined) {
                pt.x = Math.min(obj.x, max.x);
            }
            if (obj.y !== undefined) {
                pt.y = Math.min(obj.y, max.y);
            }
            // IF THERE IS NO SOURCE ELEMENT, THIS IS THE BEST WE CAN DO
            if (!obj.srcElem) {
                return pt;
            }
            // CALCULATE THE SIZE OF THE SOURCE ELEMENT
            srcBox = obj.srcElem.getBoundingClientRect();
            // USE THE SOURCE ELEMENT TO DETERMINE THE BEST POINTS
            //bblPt = KIP.Functions.FindBestPositionForBubbleAroundElement(srcBox, elemBox);
            if (pt.x === null) {
                pt.x = bblPt.x;
            }
            if (pt.y === null) {
                pt.y = bblPt.y;
            }
            return pt;
        };
        return TutorialTip;
    }(KIP.TutorialStep));
    KIP.TutorialTip = TutorialTip;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //============================
    // FULL SCREEN TUTORIAL PAGE
    //============================
    /** display a particular screen of a tutorial */
    var TutorialScreen = (function (_super) {
        __extends(TutorialScreen, _super);
        function TutorialScreen() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.__defaultDetailsClass = "fullscreenDetails";
            return _this;
        }
        //=================================
        // CREATE ELEMENTS FOR FULLSCREEN
        //=================================
        /** create the elements for this particular step */
        TutorialScreen.prototype.__createElements = function () {
            this.__createTitle();
            this.__createDetailContainer();
        };
        //======================
        // ADD TO THE TUTORIAL
        //======================
        /** add a particular element to hilite */
        TutorialScreen.prototype.addHilitedElement = function (elem, text) {
        };
        return TutorialScreen;
    }(KIP.TutorialStep));
    KIP.TutorialScreen = TutorialScreen;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var SVGProject = (function (_super) {
        __extends(SVGProject, _super);
        function SVGProject(options) {
            var _this = _super.call(this, "project", "project") || this;
            _this.__projectLines = new KIP.Collection();
            // Initialize options
            var defaults = _this.__generateDefaultOptions();
            KIP.reconcileOptions(options, defaults);
            return _this;
        }
        SVGProject.prototype.addProjectLine = function (id, lbl, segments, srcObject) {
            var line;
            // Create the basics of the 
            this.__projectLines.addElement(id, line);
            return line;
        };
        SVGProject.prototype.__addSegmentElements = function (segments) {
        };
        SVGProject.prototype.getProjectLine = function (id) {
            var out;
            var pair = this.__projectLines.getElement(id);
            if (!pair) {
                return out;
            }
            out = pair.value;
            return out;
        };
        SVGProject.prototype.addProjectMilestone = function (lineID, id, lbl, date, color, srcObject) {
            var milestone;
            return milestone;
        };
        SVGProject.prototype.__generateDefaultOptions = function () {
            var defaults = {
                showTitles: true,
                showHoverBubbles: false
            };
            return defaults;
        };
        return SVGProject;
    }(KIP.Drawable));
    KIP.SVGProject = SVGProject;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    //================
    // ENUMS
    //================
    var FormStandardButtons;
    (function (FormStandardButtons) {
        FormStandardButtons[FormStandardButtons["OK"] = 1] = "OK";
        FormStandardButtons[FormStandardButtons["Accept"] = 2] = "Accept";
        FormStandardButtons[FormStandardButtons["Cancel"] = 3] = "Cancel";
        FormStandardButtons[FormStandardButtons["Next"] = 4] = "Next";
        FormStandardButtons[FormStandardButtons["Previous"] = 5] = "Previous";
        FormStandardButtons[FormStandardButtons["Custom"] = 99] = "Custom";
    })(FormStandardButtons = KIP.FormStandardButtons || (KIP.FormStandardButtons = {}));
    ;
    var FieldTypeEnum;
    (function (FieldTypeEnum) {
        FieldTypeEnum[FieldTypeEnum["Text"] = 0] = "Text";
        FieldTypeEnum[FieldTypeEnum["Date"] = 1] = "Date";
        FieldTypeEnum[FieldTypeEnum["Numeric"] = 2] = "Numeric";
        FieldTypeEnum[FieldTypeEnum["Range"] = 3] = "Range";
        FieldTypeEnum[FieldTypeEnum["Color"] = 4] = "Color";
        FieldTypeEnum[FieldTypeEnum["TextArea"] = 5] = "TextArea";
        FieldTypeEnum[FieldTypeEnum["Checkbox"] = 6] = "Checkbox";
        FieldTypeEnum[FieldTypeEnum["Radio"] = 7] = "Radio";
        FieldTypeEnum[FieldTypeEnum["Select"] = 8] = "Select";
    })(FieldTypeEnum = KIP.FieldTypeEnum || (KIP.FieldTypeEnum = {}));
    //==========================
    // FORM CLASS
    //==========================
    /**
     * @class Form
     * Creates a generic form class that can collect lots of pieces of information
     */
    var Form = (function (_super) {
        __extends(Form, _super);
        //=========================================
        // SETUP THE FORM INITIALLY
        //=========================================
        function Form(config) {
            var _this = _super.call(this, config.id, "form") || this;
            _this.__title = config.title;
            _this.__saveCb = config.saveCb;
            _this.__tables = [];
            _this.__fields = new KIP.Collection();
            // Handle options for the form
            var defaults = _this.__buildDefaultOptions();
            KIP.reconcileOptions(config.options, defaults);
            // Create elements for the form
            _this.__createElements();
            // Process buttons
            _this.__processButtons(config.buttons);
            return _this;
        }
        Form.prototype.__buildDefaultOptions = function () {
            var opt = {
                useStandardStyles: true,
                themeColor: "#22A174"
            };
            return opt;
        };
        //=================================
        // CREATE ELEMENTS
        //=================================
        Form.prototype.__createElements = function () {
            this.__createTitleBar();
            this.__createContent();
            this.__createButtonContainer();
        };
        Form.prototype.__createTitleBar = function () {
            var titleBar = KIP.createSimpleElement("", "titleBar " + KIP.THEME_BG_COLOR_CLS, this.__title);
            this.appendChild(titleBar);
        };
        Form.prototype.__createButtonContainer = function () {
            var cls = "btnBar " + KIP.THEME_BG_COLOR_CLS;
            this.__btns = KIP.createSimpleElement("", cls);
        };
        Form.prototype.__createContent = function () {
            var elem = KIP.createSimpleElement(this._id + "-content", "content");
            this.appendChild(elem);
            this.__content = elem;
        };
        //=================================
        // BUTTON HANDLING
        //=================================
        Form.prototype.__processButtons = function (btns) {
            var btn;
            for (var _i = 0, btns_1 = btns; _i < btns_1.length; _i++) {
                btn = btns_1[_i];
                switch (btn) {
                    case FormStandardButtons.Accept:
                        this.__setupSavingButton("Accept");
                        break;
                    case FormStandardButtons.OK:
                        this.__setupSavingButton("OK");
                        break;
                    case FormStandardButtons.Cancel:
                        this.__setupHidingButton("Cancel");
                        break;
                    default:
                        break;
                }
            }
        };
        Form.prototype.__setupSavingButton = function (lbl) {
            var _this = this;
            var btn = KIP.createSimpleElement("", "btn save", lbl);
            btn.addEventListener("click", function () {
                _this.save();
            });
            this.__btns.appendChild(btn);
        };
        Form.prototype.__setupHidingButton = function (lbl) {
            var _this = this;
            var btn = KIP.createSimpleElement("", "btn hide", lbl);
            btn.addEventListener("click", function () {
                _this.reset();
            });
            this.__btns.appendChild(btn);
        };
        Form.prototype.addButton = function (btnDef) {
            var btn = KIP.createSimpleElement("", "btn", btnDef.lbl);
            btn.addEventListener('click', function () {
                btnDef.onClick();
            });
            this.__btns.appendChild(btn);
        };
        //========================================
        // HANDLE SECTION CREATION AND SWITCHING
        //========================================
        Form.prototype.createSection = function (title, numberOfColumns) {
            // Create the general section UI
            var sec = KIP.createSimpleElement("", "section");
            // Create the header text if appropriate
            var secHeader;
            if (title) {
                secHeader = KIP.createSimpleElement("", "secHeader " + KIP.THEME_COLOR_CLS, title);
                sec.appendChild(secHeader);
            }
            // Create the appropriate table
            numberOfColumns = numberOfColumns || 2;
            var tIdx = this.__createTable(numberOfColumns);
            var table = this.__tables[tIdx];
            // Add the table + section to our collections
            sec.appendChild(table);
            this.__content.appendChild(sec);
            this.__currentSection = tIdx;
            // Return the index of the table created for this section
            return tIdx;
        };
        Form.prototype.swapSection = function (index) {
            if (index >= this.__tables.length) {
                return;
            }
            this.__currentSection = index;
        };
        //=============================================
        // HANDLE FIELD CREATION
        //=============================================
        /** creates a new field to be used in the form */
        Form.prototype.createField = function (config) {
        };
        //======================================================
        // PRIVATE CREATION FUNCTIONS
        //======================================================
        Form.prototype.__createTable = function (numberOfColumns) {
            var tIdx = this.__tables.length;
            var table = KIP.createTable("", "columnContainer", null, 0, numberOfColumns);
            // Add to our set of tables
            this.__tables[tIdx] = table;
            // Return the index of the created table
            return tIdx;
        };
        Form.prototype.__createDefaultForm = function (definition) {
            var def;
            var key;
            for (key in definition) {
                if (definition.hasOwnProperty(key)) {
                    def = definition[key];
                    this.createField(def);
                }
            }
        };
        Form.prototype.__createCheckbox = function (definition) {
        };
        Form.prototype.__createLabel = function (lbl) {
            var out = KIP.createSimpleElement("", "lbl", lbl);
            return out;
        };
        //=====================================
        // SHOW OR HIDE THE FORM
        //=====================================
        Form.prototype.save = function () {
        };
        Form.prototype.reset = function () {
        };
        //=================================
        // STANDARD CSS STYLES
        //=================================
        Form.prototype.__addStandardStyles = function () {
            //TODO
        };
        return Form;
    }(KIP.Drawable));
    KIP.Form = Form;
})(KIP || (KIP = {}));
/*globals KIP,window*/
// Form.CreateBtnBar
//----------------------------------------------------------
// // Form.AddField
// //---------------------------------------------------------------------------------------
// /**
//  * Adds an input field to the form
//  * @param {string} id          The identifier for the field
//  * @param {string} field       The type of input we are creating
//  * @param {string} position    Where the field should be placed
//  * @param {string} lbl         What label to use for the field
//  * @param {string} lblPosition Where the label for the field should be positioned
//  * @returns {HTMLElement} The created field
//  */
// KIP.Objects.Form.prototype.AddField = function (id, field, position, lbl, lblPosition, original) {
//   "use strict";
//   // Default label position to be the same as the regular position
//   if (!lblPosition && lblPosition !== 0) {
//     lblPosition = position;
//   }
//   if (lbl) {
//     this.AddElement(lbl, lblPosition);
//   }
//   this.AddElement(field, position);
//   if (field) {
//     this.fields.AddElement(id, {
//       "elem": field,
//       "id": id,
//       "resetValue" : original
//     });
//   }
//   if (this.div.parentNode) {
//     this.Draw();
//   }
//   return field;
// };
// // Form.AddElement
// //----------------------------------------------------------------------
// /*
//  *@description Adds an HTML element to the given position on the form
//  *@param {HTMLElement} element - The HTML element to add to the form
//  *@param {variant} position - The position at which an element should appear in the form
// */
// KIP.Objects.Form.prototype.AddElement = function (element, position) {
//   "use strict";
//   var row, table, col, data, rowNum, colNum, tableData, added;
//   // Default positions
//   if (!position) {
//     position = {
//       table: (this.currentSection || (this.tables.length - 1)),
//       col: 0
//     };
//   } else {
//     // Table defaults: first current section, then last added
//     if (!position.table && (position.table !== 0)) {
//       position.table = this.currentSection;
//     }
//     if (!position.table && (position.table !== 0)) {
//       position.table = this.tables.length - 1;
//     }
//     // Column defaults to 0
//     position.col = position.col || 0;
//   }
//   // Positions are now objects with a specified table & column
//   table = position.table;
//   col = position.col;
//   // Quit if we don't actually have a table
//   if (table < 0) return false;
//   if (!this.tables[table]) return false;
//   // Grab the pieces of data about the table
//   rowNum = this.tables[table].rowNum;
//   colNum = this.tables[table].colNum;
//   tableData = this.tables[table].data;
//   // Check if we're adding a new cell to an existing row
//   if (rowNum > 0 && tableData[rowNum - 1]) {
//     row = tableData[rowNum - 1];
//     // If this row doesn't yet have data in this cell, update it
//     if (!row.children[col] || !row.children[col].innerHTML) {
//       KIP.Functions.ProcessCellContents(element, row.children[col]);
//       added = true;
//     }
//   }
//   // If we didn't handle this in the existing cell update, create a new row
//   if (!added) {
//     data = [];
//     data[col] = element;
//     row = KIP.Functions.AddRow(this.tables[table].table, data, "", colNum);
//     rowNum += 1;
//     tableData.push(row);
//   }
//   // Update our globals
//   this.tables[table].rowNum = rowNum;
//   this.tables[table].data = tableData;
// };
// // Form.AddExpandingInput
// //--------------------------------------------------------------------------------------------------------------------------------------------
// /*
//  * Add an input that, when data is entered, expands to an extra field
//  * @param {string} id - THe unique identifier for
//  * @param {string} subID
//  * @param {string} [type]
//  * @param {string} position
//  * @param {string} [value]
//  * @param {object} [attr]
//  * @param {string} [lbl]
//  * @param {string} [cls]
//  * @param {function} [changeCb]
//  * @param {function} [blurCb]
//  * @param {array} [addlListeners]
//  * @returns {HTMLElement} The expandable field that was created
//  */
// KIP.Objects.Form.prototype.AddExpandingInput = function (id, subID, type, position, value, attr, lbl, cls, changeCb, blurCb, addlListeners) {
//   "use strict";
//   var field, that, a, aList;
//   that = this;
//   // Make sure we have an ID & a subID
//   if (!subID) subID = 0;
//   // Create the field
//   field = this.AddInput(id + "." + subID, type || "text", value, attr, lbl, cls, position, position);
//   // Add a content listener that adds fields
//   field.addEventListener("keyup", changeCb || function (e) {
//     var next;
//     next = document.getElementById(id + "." + (subID + 1));
//     if (!next && this.value.length > 0) {
//       that.AddExpandingTextInput(id, subID + 1, txt, position, ghostTxt, lbl);
//     }
//     this.focus();
//   });
//   // Add a content listener to remove fields on lost focus when they are empty
//   field.addEventListener("blur", blurCb || function () {
//     if (this.value.length === 0) {
//       that.RemoveField(this.id + "." + this.subID);
//     }
//   });
//   // Add any additional listeners
//   if (addlListeners) {
//     for (a = 0; a < addlListeners.length; a += 1) {
//       aList = addlListeners[a];
//       if (!aList) continue;
//       field.addEventListener(aList.type, aList.func);
//     }
//   }
// };
// // Form.AddExpandingInputTable
// //-----------------------------------------------------------------------------------------------------------------------------------------
// /* Creates a table that expands when the user adds details */
// KIP.Objects.Form.prototype.AddExpandingInputTable = function (ids, subID, types, positions, values, attrs, lbls, classes, addlListeners) {
//   "use strict";
//   var c, field, that, changeCb, blurCb, cb;
//   that = this;
//   // Function for adding new rows
//   changeCb = function () {
//     var next;
//     next = document.getElementById(ids[0] + "." + (subID + 1));
//     if (!next && this.value.length > 0) {
//       that.AddExpandingInputTable(ids, subID + 1, types, positions, values, attrs, lbls, classes, addlListeners);
//     }
//     this.focus();
//   };
//   // Function for removing empy rows
//   blurCb = function () {
//     var i, empty, f, k;
//     empty = true;
//     for (i = 0; i < ids.length; i += 1) {
//       f = that.fields.GetElement(ids[i] + "." + subID).value;
//       if (f.elem.value.length > 0) {
//         empty = false;
//         break;
//       }
//     }
//     // Only clear the row if everything is empty
//     if (!empty) return;
//     // Remove the entire row
//     for (i = 0; i < ids.length; i += 1) {
//       k = ids[i] + "." + subID;
//       that.RemoveField(k);
//     }
//   };
//   // Loop through the columns we received
//   for (c = 0; c < ids.length; c += 1) {
//     this.AddExpandingInput(ids[c], subID, types && types[c] || "", positions && positions[c] || 0, values && values[c] || "", attrs && attrs[c] || {}, lbls && lbls[c] || "", classes && classes[c] || "", changeCb, blurCb, addlListeners && addlListeners[c]);
//   }
// };
// KIP.Objects.Form.prototype.RemoveField = function (id, ignoreContent) {
//   "use strict";
//   var field;
//   field = this.fields.GetElement(id).value;
//   if (!field) return false;
//   if (field.elem.value && !ignoreContent) return false;
//   // Remove from view
//   if (field.elem.parentNode) {
//     field.elem.parentNode.removeChild(field.elem);
//   }
//   // Remove from collection
//   this.fields.RemoveElement(id);
//   return true;
// };
// // Form.AddInput
// //-----------------------------------------------------------------------------------------------------------------------------
// /*
//  @description Adds an input element to the form with the provided parameters
//  @param {variant} id - If a string, treated as the identifier for the element. If an object, used to grab values for all parameters.
//  @param {string} [type] - What type of input is being created. Defaults to "text".
//  @param {string} [value] - What value, if any, should be set initially in this field
//  @param {obj} [addlAttr] - An object containing key-value pairs of any additional attributes that need to be set for this input.
//  @param {string} [lbl] - What label should be used to describe this element.
//  @param {string} [cls] - What class should be applied for this input
//  @param {string} position - The position at which this input should be placed.
//  @param {string} [lblPosition] - THe position at which the label for this input should be placed. Defaults to the position value.
//  @returns {HTMLElement} The field that was created.
// */
// KIP.Objects.Form.prototype.AddInput = function (id, type, value, addlAttr, lbl, cls, position, lblPosition, tooltip) {
//   "use strict";
//   var input, lblElem, elem;
//   // Check if an object was passed in instead of individual parts
//   if (typeof id === "object") {
//     type = id.type;
//     value = id.value;
//     addlAttr = id.attr;
//     lbl = id.lbl;
//     cls = id.cls;
//     position = id.position;
//     lblPosition = id.lblPosition;
//     id = id.id;
//   }
//   if (!addlAttr) {
//     addlAttr = {};
//   }
//   addlAttr.type = type;
//   if (type === "checkbox" || type === "radio") {
//     addlAttr.checked = value;
//   } else {
//     addlAttr.value = value;
//   }
//   input = KIP.Functions.CreateElement({
//     type: "input",
//     cls: cls,
//     id: id,
//     attr : addlAttr
//   });
//   if (lbl) {
//     lblElem = KIP.Functions.CreateSimpleElement(id + "lbl", "lbl", lbl);
//   }
//   // Add both of these new elements to our form
//   elem = this.AddField(id, input, position, lblElem, lblPosition, value);
//   if (tooltip) {
//     elem.parentNode.parentNode.setAttribute("title", tooltip);
//   }
//   return elem;
// };
// KIP.Objects.Form.prototype.UpdateFieldValue = function (id, value) {
//   "use strict";
//   var fld, f, type;
//   f = this.fields.GetElement(id);
//   if (!f) return;
//   fld = f.value.elem;
//   type = fld.getAttribute(fld, "type");
//   if (type === "checkbox" || type === "radio") {
//     fld.checked = value;
//   } else {
//     fld.value = value;
//   }
// }
// KIP.Objects.Form.prototype.UpdateFieldAttribute = function (id, attr, newValue) {
//   "use strict";
//   var fld, f;
//   f = this.fields.GetElement(id);
//   if (!f) return;
//   fld = f.value.elem;
//   fld.setAttribute(attr, newValue);
// }
// // Form.Reset
// //-----------------------------------------------
// /**
//  * Clears all fields in the form
//  */
// KIP.Objects.Form.prototype.Reset = function () {
//   "use strict";
//   var fIdx, field, type;
//   for (fIdx = 0; fIdx < this.fields.Length(); fIdx += 1) {
//     field = this.fields.GetElement("", fIdx).value;
//      type = field.elem.getAttribute("type");
//     if (type === "checkbox" || type === "radio") {
//       field.elem.checked = field.resetValue;
//     } else {
//       field.elem.value = field.resetValue;
//     }
//   }
// };
// // Form.Save
// //--------------------------------------------------
// /**
//  * Saves all data detailed in the form, as specified by the callback function
//  */
// KIP.Objects.Form.prototype.Save = function () {
//   "use strict";
//   var fIdx, field, values, type;
//   values = {};
//   // Loop through all of our fields
//   for (fIdx = 0; fIdx < this.fields.Length(); fIdx += 1) {
//     field = this.fields.GetElement("", fIdx).value; //Pull out of our collection
//     type = field.elem.getAttribute("type");
//     if (type === "checkbox" || type === "radio") {
//       values[field.id] = field.elem.checked;
//     } else {
//       values[field.id] = field.elem.value;
//     }
//   }
//   if (this.saveCb) {
//     this.saveCb(values);
//   }
// };
// //Form.CloseForm
// //---------------------------------------------------
// /**
//   * Closes the form without saving any data. It can also be called by Save
//   */
// KIP.Objects.Form.prototype.CloseForm = function () {
//   "use strict";
//   if (this.overlay && this.overlay.parentNode) {
//     this.overlay.parentNode.removeChild(this.overlay);
//   }
//   if (this.div.parentNode) {
//     this.div.parentNode.removeChild(this.div);
//   }
// };
// // Form.AfterDrawChildren
// //---------------------------------------------------------------------------
// /**
//   * Makes sure to create the standard CSS styles unless the caller disabled it
//   */
// KIP.Objects.Form.prototype.AfterDrawChildren = function () {
//   "use strict";
//   if ((this.standardStyle) && (!this.stylesCreated)) {
//     this.ApplyStandardStyles();
//     this.stylesCreated = true;
//   }
// };
// // Form.ApplyStandardStyles
// //---------------------------------------------------------------------------
// /**
//   * Creates standard CSS classes for each of the elements in the form. Can be overridden with more specific CSS.
//   */
// KIP.Objects.Form.prototype.ApplyStandardStyles = function () {
//   "use strict";
//   var ov, form, input, title, btns, pStyle, lbl, column, cPerc, t, tbl, hd, w, l, top, max_w;
//   // Force parent to have an explicit display
//   pStyle = KIP.Functions.GetComputedStyle(this.parent, "position");
//   if (pStyle === "static") {
//     pStyle = "relative";
//   }
//   this.parent.style.position = pStyle;
//   // Overlay styles
//   ov = {
//     "position": "fixed",
//     "left": 0,
//     "top" : 0,
//     "width": "100%",
//     "height" : "100%",
//     "background-color": "rgba(0,0,0,0.7)",
//     "z-index" : "1"
//   };
//   ov = KIP.Functions.CreateCSSClass(".overlay", ov);
//   // form formatting
//   form = {
//     "background-color": "#FFF",
//     "box-shadow" : "1px 1px 13px 4px rgba(0,0,0,.2);",
//     "font-family" : "Segoe UI, Calibri, sans",
//     "z-index" : "2",
//     "position" : "absolute",
//     "display" : "block",
//     "padding" : "10px",
//     "box-sizing" : "border-box"
//   };
//   form = KIP.Functions.CreateCSSClass(".form", form);
//   form = {
//     "left":"30%",
//     "top":"9%",
//     "max-width": "80%",
//     "width":"40%",
//     "max-height": "82%"
//   };
//   form = KIP.Functions.CreateCSSClass(".form:not(.embedded)", form);
//   form = {
//     "left":"0",
//     "top":"0",
//     "max-width": "100%",
//     "width":"100%" 
//   };
//   form = KIP.Functions.CreateCSSClass(".form.embedded", form);
//   // input formatting
//   input = {
//     "background-color" : "rgba(0,0,0,.1)",
//     "border" : "1px solid rgba(0,0,0,.25)",
//     "font-family" : "Segoe UI, Calibri, sans",
//   };
//   input = KIP.Functions.CreateCSSClass(".form input", input);
//   input = {
//     "width": "250px",
//     "outline" : "none"
//   };
//   input = KIP.Functions.CreateCSSClass(".form input[type=text]", input);
//   // title bar
//   title = {
//     "width" : "calc(100% - 10px)",
//     "text-align" : "center",
//     "background-color" : this.themeColor,
//     "color" : "#FFF",
//     "padding" : "5px",
//     "font-size" : "20px",
//     "position" : "absolute",
//     "top" : "-30px",
//     "left" : "0px"
//   };
//   title = KIP.Functions.CreateCSSClass(".form .titleBar", title);
//   title = {
//     "float" : "right",
//     "display" : "inline-block",
//     "opacity": "0.7",
//     "font-size": "15px",
//     "padding-top" : "2px",
//     "padding-right" : "5px"
//   };
//   title = KIP.Functions.CreateCSSClass(".form .titleBar .close", title);
//   title = {
//     "opacity": "1",
//     "cursor" : "pointer"
//   };
//   title = KIP.Functions.CreateCSSClass(".form .titleBar .close:hover", title);
//   // button bar
//   btns = {
//     "width" : "100%",
//     "display" : "flex",
//     "flex-direction" : "row",
//     "justify-content" : "flex-end",
//     "font-size" : "20px"
//   };
//   btns = KIP.Functions.CreateCSSClass(".form .btnBar", btns);
//   btns = {
//     "padding" : "5px",
//     "box-shadow": "1px 1px 1px 1px rgba(0,0,0,.2)",
//     "border-radius" : "3px",
//     "font-size" : "15px",
//     "opacity" : "0.7",
//     "margin" : "5px"
//   };
//   btns = KIP.Functions.CreateCSSClass(".form .btnBar .btn", btns);
//   btns = {
//       "opacity" : "1",
//       "cursor" : "pointer"
//   };
//   btns = KIP.Functions.CreateCSSClass(".form .btnBar .btn:hover", btns);
//   // Labels
//   lbl = {
//     "color": "#666",
//     "display" : "inline-block",
//     "text-align": "right",
//     "padding-left" : "5px",
//     "padding-right" : "5px"
//   }
//   lbl = KIP.Functions.CreateCSSClass(".form .lbl", lbl);
//   // Headers
//   hd = {
//     "color" : this.themeColor,
//     "font-weight" : "bold",
//     "font-size" : "22px",
//     "margin-bottom": "10px",
//     "margin-top": "10px"
//   }
//   hd = KIP.Functions.CreateCSSClass(".form .secHeader", hd);
//   // Columns
//   column = {
//     "display" : "table",
//     "width" : "100%"
//   }
//   column = KIP.Functions.CreateCSSClass(".form .columnContainer", column);
//   column = {
//     "display" : "table-cell"
//   };
//   column = KIP.Functions.CreateCSSClass(".form .column", column);
//   // Calculate the appropriate width for each table column
//   for (t = 0; t < this.tables.length; t += 1) {
//     tbl = this.tables[t];
//     cPerc = 100 / tbl.colNum;
//     column = {
//       "width" : cPerc + "%",
//     };
//     column = KIP.Functions.CreateCSSClass(".form #" + tbl.id + " .column", column);
//   }
// };
// 	}
// } 
var KIP;
(function (KIP) {
    var StyleChangeEnum;
    (function (StyleChangeEnum) {
        StyleChangeEnum[StyleChangeEnum["FILL_COLOR"] = 0] = "FILL_COLOR";
        StyleChangeEnum[StyleChangeEnum["STROKE_COLOR"] = 1] = "STROKE_COLOR";
        StyleChangeEnum[StyleChangeEnum["FONT_FAMILY"] = 2] = "FONT_FAMILY";
        StyleChangeEnum[StyleChangeEnum["FONT_VARIANT"] = 3] = "FONT_VARIANT";
        StyleChangeEnum[StyleChangeEnum["FONT_SIZE"] = 4] = "FONT_SIZE";
        StyleChangeEnum[StyleChangeEnum["STROKE_SIZE"] = 5] = "STROKE_SIZE";
        StyleChangeEnum[StyleChangeEnum["TEXT_ALIGN"] = 6] = "TEXT_ALIGN";
        StyleChangeEnum[StyleChangeEnum["FONT"] = 7] = "FONT";
    })(StyleChangeEnum = KIP.StyleChangeEnum || (KIP.StyleChangeEnum = {}));
    ;
    var CanvasElementStyle = (function () {
        /** nothing to construct */
        function CanvasElementStyle(style) {
            this._listeners = [];
            // clone the existing style
            if (style) {
                this._fillColor = style.fillColor;
                this._strokeColor = style.strokeColor;
                this._font = style.font;
                this._fontFamily = style.fontFamily;
                this._fontSize = style.fontSize;
                this._fontVariant = style.fontVariant;
                this._strokeSize = style.strokeSize;
                this._textAlign = style.textAlign;
                // or just use defaults
            }
            else {
                this._fillColor = "#000";
                this._strokeColor = "#000";
                this._strokeSize = 1;
                this._fontFamily = "Helvetica";
                this._fontSize = 40;
                this._textAlign = "left";
            }
        }
        Object.defineProperty(CanvasElementStyle.prototype, "fillColor", {
            get: function () { return this._fillColor; },
            set: function (color) {
                this._fillColor = color;
                this._onChange(StyleChangeEnum.FILL_COLOR);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElementStyle.prototype, "strokeColor", {
            get: function () { return this._strokeColor; },
            set: function (color) {
                this._strokeColor = color;
                this._onChange(StyleChangeEnum.STROKE_COLOR);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElementStyle.prototype, "fontFamily", {
            get: function () { return this._fontFamily; },
            set: function (family) {
                this._fontFamily = family;
                this._onChange(StyleChangeEnum.FONT_FAMILY);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElementStyle.prototype, "fontVariant", {
            get: function () { return this._fontVariant; },
            set: function (variant) {
                this._fontVariant = variant;
                this._onChange(StyleChangeEnum.FONT_VARIANT);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElementStyle.prototype, "fontSize", {
            get: function () { return this._fontSize; },
            set: function (size) {
                this._fontSize = size;
                this._onChange(StyleChangeEnum.FONT_SIZE);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElementStyle.prototype, "strokeSize", {
            get: function () { return this._strokeSize; },
            set: function (size) {
                this._strokeSize = size;
                this._onChange(StyleChangeEnum.STROKE_SIZE);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElementStyle.prototype, "textAlign", {
            get: function () { return this._textAlign; },
            set: function (align) {
                this._textAlign = align;
                this._onChange(StyleChangeEnum.TEXT_ALIGN);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElementStyle.prototype, "font", {
            get: function () {
                if (this._font) {
                    return this._font;
                }
                var variant = (this._fontVariant ? this._fontVariant + " " : "");
                var size = (this._fontSize ? this._fontSize + "px " : "");
                return variant + size + this._fontFamily;
            },
            set: function (font) {
                this._font = font;
                this._onChange(StyleChangeEnum.FONT);
            },
            enumerable: true,
            configurable: true
        });
        CanvasElementStyle.prototype.addStyleChangeListener = function (changeType, func) {
            if (!this._listeners[changeType]) {
                this._listeners[changeType] = [];
            }
            // Add to the array of listeners
            this._listeners[changeType].push(func);
        };
        CanvasElementStyle.prototype._onChange = function (changeType) {
            if (!this._listeners[changeType]) {
                return;
            }
            var listener;
            for (var _i = 0, _a = this._listeners[changeType]; _i < _a.length; _i++) {
                listener = _a[_i];
                listener();
            }
        };
        CanvasElementStyle.prototype.setStyle = function (context) {
            this._saveOffOldStyle(context);
            this._applyStyleToContext(context, this);
        };
        CanvasElementStyle.prototype.restoreStyle = function (context) {
            this._applyStyleToContext(context, this._oldStyle);
        };
        CanvasElementStyle.prototype._saveOffOldStyle = function (context) {
            this._oldStyle = new CanvasElementStyle();
            this._oldStyle.fillColor = context.fillStyle;
            this._oldStyle.strokeColor = context.strokeStyle;
            this._oldStyle.font = context.font;
            this._oldStyle.strokeSize = context.lineWidth;
            this._oldStyle.textAlign = context.textAlign;
        };
        CanvasElementStyle.prototype._applyStyleToContext = function (context, style) {
            context.fillStyle = style.fillColor;
            context.strokeStyle = style.strokeColor;
            context.textAlign = style.textAlign;
            context.font = style.font;
            context.lineWidth = style.strokeSize;
        };
        return CanvasElementStyle;
    }());
    KIP.CanvasElementStyle = CanvasElementStyle;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /** The type of element we're drawing  */
    var ElementType;
    (function (ElementType) {
        ElementType[ElementType["Rectangle"] = 0] = "Rectangle";
        ElementType[ElementType["Text"] = 1] = "Text";
        ElementType[ElementType["Circle"] = 2] = "Circle";
        ElementType[ElementType["Path"] = 3] = "Path";
        ElementType[ElementType["Group"] = 4] = "Group";
    })(ElementType = KIP.ElementType || (KIP.ElementType = {}));
    /** Handle all of the events we might need */
    var EventTypeEnum;
    (function (EventTypeEnum) {
        EventTypeEnum[EventTypeEnum["CLICK"] = 0] = "CLICK";
        EventTypeEnum[EventTypeEnum["HOVER"] = 1] = "HOVER";
        EventTypeEnum[EventTypeEnum["LEAVE"] = 2] = "LEAVE";
        EventTypeEnum[EventTypeEnum["R_CLICK"] = 3] = "R_CLICK";
        EventTypeEnum[EventTypeEnum["DBL_CLICK"] = 4] = "DBL_CLICK";
        EventTypeEnum[EventTypeEnum["KEY_PRESS"] = 5] = "KEY_PRESS";
        EventTypeEnum[EventTypeEnum["FOCUS"] = 6] = "FOCUS";
        EventTypeEnum[EventTypeEnum["BLUR"] = 7] = "BLUR";
    })(EventTypeEnum = KIP.EventTypeEnum || (KIP.EventTypeEnum = {}));
    ;
    /** create a canvas element */
    var CanvasElement = (function () {
        function CanvasElement(id, isEffect) {
            /** layer at which the element should appear.
             * 	Defaults to 1
             */
            this._layer = 1;
            this._id = id;
            this._isEffect = isEffect;
            this._eventFunctions = [];
            this._style = new KIP.CanvasElementStyle();
        }
        Object.defineProperty(CanvasElement.prototype, "id", {
            get: function () { return this._id; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElement.prototype, "canvas", {
            set: function (canvas) { this._setCanvas(canvas); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElement.prototype, "parent", {
            set: function (grp) { this._parent = grp; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElement.prototype, "style", {
            get: function () { return this._style; },
            set: function (s) { this._style = s; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElement.prototype, "layer", {
            get: function () { return this._layer; },
            set: function (layer) { this._layer = layer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElement.prototype, "isOffScreen", {
            get: function () { return this._isOffScreen; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElement.prototype, "dimensions", {
            get: function () { return this._dimensions; },
            set: function (dim) { this._setDimensions(dim); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElement.prototype, "displayDimensions", {
            get: function () { return this._displayDimensions; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasElement.prototype, "isHoverTarget", {
            get: function () { return this._isHoverTarget; },
            set: function (value) { this._isHoverTarget = value; },
            enumerable: true,
            configurable: true
        });
        /**
         * create the initial display rectangle
         */
        CanvasElement.prototype._initializeRects = function () {
            this._displayDimensions = {
                x: this._dimensions.x,
                y: this._dimensions.y,
                w: this._dimensions.w,
                h: this._dimensions.h
            };
        };
        /** update the context to use this element's style */
        CanvasElement.prototype._applyStyle = function (context) {
            this._style.setStyle(context);
        };
        /** set the context style back to what it originally was */
        CanvasElement.prototype._restoreStyle = function (context) {
            this._style.restoreStyle(context);
        };
        /** handle a temporary transform for the element */
        CanvasElement.prototype.transform = function (transformDetails) {
            // we need a canvas object to have been assigned
            if (!this._parent) {
                return;
            }
            // create a clone of this element
            var clone = this._cloneForEffect(this.id + "|e");
            clone._isEffect = true;
            clone._layer = this._layer;
            clone.style = this._cloneStyle();
            // apply the appropriate transformations to that element
            if (transformDetails.color) {
                clone._style.fillColor = transformDetails.color;
            }
            // apply the scale transformation
            if (transformDetails.scale) {
                clone._scale(transformDetails.scale);
            }
            // add the cloned element to the same layer we're on
            this._parent.addElement(clone);
        };
        /** copy style from one elem for use in another */
        CanvasElement.prototype._cloneStyle = function () {
            return new KIP.CanvasElementStyle(this._style);
        };
        /** standard scale algorithm */
        CanvasElement.prototype._scale = function (scaleAmt) {
            // This is only allowed for effect elements
            if (!this._isEffect) {
                return;
            }
            // calculate the width offset and value
            var newWidth = scaleAmt * this._dimensions.w;
            var xOffset = (newWidth - this._dimensions.w) / 2;
            // calculate the height offset and value
            var newHeight = scaleAmt * this._dimensions.h;
            var yOffset = (newHeight - this._dimensions.h) / 2;
            // update the dimensions to be appropriate for this scaling element
            this._dimensions = {
                x: this._dimensions.x - xOffset,
                y: this._dimensions.y - yOffset,
                w: newWidth,
                h: newHeight
            };
        };
        /** update the internal dimensions of the element */
        CanvasElement.prototype.updateDimensions = function (canvasDimensions) {
            this._displayDimensions = this._canvas.convertAbsoluteRectToRelativeRect(this._dimensions);
            // Update our tracking variable to determine whether 
            // we should be showing this element
            this._setIsOffScreen(canvasDimensions);
        };
        /** shift the dimensions of the element based on the reference point */
        CanvasElement.prototype.adjustDimensions = function (adjustPt) {
            if (this._isEffect) {
                return;
            }
            this._dimensions.x += adjustPt.x;
            this._dimensions.y += adjustPt.y;
        };
        /** abstract method that each child element will implement */
        CanvasElement.prototype.draw = function () {
            // Don't do anything if we're offscreen or don't have a canvas
            if (this._isOffScreen) {
                return;
            }
            if (!this._canvas) {
                return;
            }
            // Get the context from the canvas, as appropriate for this particular element
            var context;
            if (!this._isEffect) {
                context = this._canvas.context;
            }
            else {
                context = this._canvas.effectContext;
            }
            this._applyStyle(context); // Set the appropriate style
            this._onDraw(context); // Call on the child class to draw their specific stuff
            this._restoreStyle(context); // Restore original style
            this._isDrawn = true;
        };
        /** determine whether this element is off screen */
        CanvasElement.prototype._setIsOffScreen = function (canvasDimensions) {
            this._isOffScreen = !KIP.Trig.doBasicRectsOverlap(canvasDimensions, this._dimensions);
        };
        /** allow outsiders to update the internal set of dimensions for this element */
        CanvasElement.prototype._setDimensions = function (dim) {
            this._dimensions = dim;
            if (this._canvas) {
                this._canvas.needsRedraw = true;
            }
        };
        CanvasElement.prototype._setCanvas = function (canvas) {
            this._canvas = canvas;
        };
        //===================================
        // EVENT HANDLING FOR CANVAS ELEMENTS
        /** collect event listeners */
        CanvasElement.prototype.addEventListener = function (eventType, eventFunc) {
            var list = this._eventFunctions[eventType];
            if (!list) {
                list = [];
                this._eventFunctions[eventType] = list;
            }
            list.push(eventFunc);
        };
        /** handle click events */
        CanvasElement.prototype.click = function (pt, e) {
            this.handleEvent(EventTypeEnum.CLICK, pt, e);
        };
        /** handle double clicks */
        CanvasElement.prototype.doubleClick = function (pt, e) {
            this.handleEvent(EventTypeEnum.DBL_CLICK, pt, e);
        };
        /** handle the right click */
        CanvasElement.prototype.rightClick = function (pt, e) {
            this.handleEvent(EventTypeEnum.R_CLICK, pt, e);
        };
        /** handle when the mouse enters the element */
        CanvasElement.prototype.hover = function (pt, e) {
            this.handleEvent(EventTypeEnum.HOVER, pt, e);
        };
        /** handle when the mouse leaves the element */
        CanvasElement.prototype.leave = function (pt, e) {
            this.handleEvent(EventTypeEnum.LEAVE, pt, e);
        };
        /** handle the keypress event */
        CanvasElement.prototype.keyPress = function (pt, e) {
            this.handleEvent(EventTypeEnum.KEY_PRESS, pt, e);
        };
        /** handle the focus event */
        CanvasElement.prototype.focus = function (pt, e) {
            this.handleEvent(EventTypeEnum.FOCUS, pt, e);
        };
        /** handle the blur event */
        CanvasElement.prototype.blur = function (pt, e) {
            this.handleEvent(EventTypeEnum.BLUR, pt, e);
        };
        /** generic handler for all events */
        CanvasElement.prototype.handleEvent = function (eventType, pt, e) {
            // Make sure we apply properties regardless of whether there are additional handlers
            if ((eventType === EventTypeEnum.BLUR) || (eventType === EventTypeEnum.LEAVE)) {
                if (this._parent) {
                    this._parent.removeElement(this.id + "|e");
                }
                this._isHoverTarget = false;
            }
            else if (eventType === EventTypeEnum.HOVER) {
                this._isHoverTarget = true;
            }
            // Add the event to the list
            var list = this._eventFunctions[eventType];
            if (!list) {
                return;
            }
            // handle all of the callbacks
            var func;
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                func = list_1[_i];
                func(pt, e);
            }
            // If we have a canvas, tell it to redraw
            if (!this._canvas) {
                this._canvas.needsRedraw = true;
            }
        };
        //===================================
        //====================
        // DEBUGGING FUNCTIONS
        /** display dimensions for debugging purposes */
        CanvasElement.prototype._debugDimensions = function () {
            console.log("CANVAS ELEM: " + this._id);
            console.log("x: " + Math.round(this._displayDimensions.x) + " (from " + this._dimensions.x + ")");
            console.log("y: " + Math.round(this._displayDimensions.y) + " (from " + this._dimensions.y + ")");
            console.log("w: " + Math.round(this._displayDimensions.w) + " (from " + this._dimensions.w + ")");
            console.log("h: " + Math.round(this._displayDimensions.h) + " (from " + this._dimensions.h + ")");
            console.log("\nparent: " + (this._parent ? this._parent.id : "none"));
            console.log("===\n");
            if (this._canvas) {
                this._canvas.debugRelativeDimensions();
            }
            console.log("offscreen? " + this._isOffScreen);
            console.log("--------------------\n\n");
        };
        /** public function for debugging purposes */
        CanvasElement.prototype.debugDimensions = function () {
            this._debugDimensions();
        };
        return CanvasElement;
    }());
    KIP.CanvasElement = CanvasElement;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var RectangleElement = (function (_super) {
        __extends(RectangleElement, _super);
        /** create a rectangle element
         * @param id - unique ID for the rectangle
         * @param dimensions - the size of the rectangle (in canvas coordinates)
         */
        function RectangleElement(id, dimensions) {
            var _this = _super.call(this, id) || this;
            _this._type = KIP.ElementType.Rectangle;
            _this._borderRadius = 0;
            _this._dimensions = dimensions;
            _this._initializeRects();
            return _this;
        }
        Object.defineProperty(RectangleElement.prototype, "borderRadius", {
            set: function (bRad) { this._borderRadius = bRad; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RectangleElement.prototype, "type", {
            get: function () { return KIP.ElementType.Rectangle; },
            enumerable: true,
            configurable: true
        });
        /** actually draw the rectangle */
        RectangleElement.prototype._onDraw = function (context) {
            if (this._borderRadius === 0) {
                this._unroundedRect(context);
            }
            else {
                this._roundedRect(context);
            }
        };
        RectangleElement.prototype._unroundedRect = function (context) {
            context.fillRect(// Create the actual rectangle
            this._displayDimensions.x, // ...
            this._displayDimensions.y, // ...
            this._displayDimensions.w, // ...
            this._displayDimensions.h // ...
            ); // ...
        };
        RectangleElement.prototype._roundedRect = function (context) {
            context.beginPath();
            var dim = this._displayDimensions;
            var radius = this._displayBorderRadius;
            // top straight line
            context.moveTo(dim.x + radius.x, dim.y);
            context.lineTo(dim.x + dim.w - radius.x, dim.y);
            // top right rounded corner
            context.quadraticCurveTo(dim.x + dim.w, dim.y, dim.x + dim.w, dim.y + radius.y);
            // right vertical side
            context.lineTo(dim.x + dim.w, dim.y + dim.h - radius.y);
            // bottom right rounded corner
            context.quadraticCurveTo(dim.x + dim.w, dim.y + dim.h, dim.x + dim.w - radius.x, dim.y + dim.h);
            // bottom straight line
            context.lineTo(dim.x + radius.x, dim.y + dim.h);
            // bottom left rounded corner
            context.quadraticCurveTo(dim.x, dim.y + dim.h, dim.x, dim.y + dim.h - radius.y);
            // left straight line
            context.lineTo(dim.x, dim.y + radius.y);
            // top left rounded corner
            context.quadraticCurveTo(dim.x, dim.y, dim.x + radius.x, dim.y);
            context.closePath();
            context.fill();
        };
        RectangleElement.prototype.updateDimensions = function (canvasDimensions) {
            _super.prototype.updateDimensions.call(this, canvasDimensions);
            this._displayBorderRadius = {
                x: this._borderRadius * this._canvas.zoomFactor.x,
                y: this._borderRadius * this._canvas.zoomFactor.y
            };
        };
        /** clone an element for an effect to be applied */
        RectangleElement.prototype._cloneForEffect = function (id) {
            var dim = KIP.cloneRect(this._dimensions);
            var clone = new RectangleElement(id, dim);
            return clone;
        };
        return RectangleElement;
    }(KIP.CanvasElement));
    KIP.RectangleElement = RectangleElement;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var TextElement = (function (_super) {
        __extends(TextElement, _super);
        /** create the text element */
        function TextElement(id, text, point) {
            var _this = _super.call(this, id) || this;
            _this._type = KIP.ElementType.Text;
            _this._text = text;
            _this._dimensions = {
                x: point.x,
                y: point.y,
                w: 10,
                h: 10 // Same for height
            };
            _this._initializeRects();
            _this._addStyleChangeListener();
            return _this;
        }
        Object.defineProperty(TextElement.prototype, "text", {
            set: function (txt) { this._text = txt; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextElement.prototype, "fixed", {
            set: function (fixed) { this._fixed = fixed; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextElement.prototype, "type", {
            get: function () { return KIP.ElementType.Text; },
            enumerable: true,
            configurable: true
        });
        /** handle the canvas being assigned to the  */
        TextElement.prototype._setCanvas = function (canvas) {
            _super.prototype._setCanvas.call(this, canvas);
            this._calculateTextMetrics();
        };
        TextElement.prototype._addStyleChangeListener = function () {
            var _this = this;
            this._style.addStyleChangeListener(KIP.StyleChangeEnum.FONT_SIZE, function () {
                _this._dimensions.h = _this._style.fontSize;
            });
        };
        /** determine how big the text should be */
        TextElement.prototype._calculateTextMetrics = function () {
            if (!this._canvas) {
                return;
            }
            var context = this._canvas.context;
            this._applyStyle(context);
            var metrics = context.measureText(this._text);
            this._restoreStyle(context);
            // Set the real measurements
            this._dimensions.w = metrics.width;
            this._dimensions.h = this.style.fontSize;
            // set the display dimensions to be this statically
            this._displayDimensions.w = metrics.width;
            this._displayDimensions.h = this.style.fontSize;
        };
        /** draw the text element on the canvas */
        TextElement.prototype._onDraw = function (context) {
            // draw the actual text of the element
            context.fillText(this._text, this._displayDimensions.x, this._displayDimensions.y + (this._fixed ? this._dimensions.h : this._displayDimensions.h));
            // consider the display dimensions the same as the original calculation
            this._displayDimensions.w = this._dimensions.w;
            this._displayDimensions.h = this._dimensions.h;
        };
        /** clone a text effect */
        TextElement.prototype._cloneForEffect = function (id) {
            var pt = {
                x: this._dimensions.x,
                y: this._dimensions.y
            };
            var out = new TextElement(id, this._text, pt);
            return out;
        };
        return TextElement;
    }(KIP.CanvasElement));
    KIP.TextElement = TextElement;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var CircleElement = (function (_super) {
        __extends(CircleElement, _super);
        function CircleElement(id, center, temp) {
            var _this = _super.call(this, id) || this;
            var radius;
            if (KIP.isNumber(temp)) {
                radius = {
                    x: temp,
                    y: temp
                };
            }
            else {
                radius = temp;
            }
            _this._dimensions = {
                x: center.x - radius.x,
                y: center.y - radius.y,
                w: radius.x * 2,
                h: radius.y * 2
            };
            _this._center = center;
            _this._radius = radius;
            _this._initializeRects();
            return _this;
        }
        Object.defineProperty(CircleElement.prototype, "type", {
            get: function () { return KIP.ElementType.Circle; },
            enumerable: true,
            configurable: true
        });
        CircleElement.prototype._onDraw = function (context) {
            // TODO: HANDLE SCALING IF NEED BE
            // draw the actual text of the element
            context.beginPath();
            context.arc(this._displayDimensions.x + this._displayRadius.x, this._displayDimensions.y + this._displayRadius.y, this._displayRadius.x, 0, 2 * Math.PI);
            context.fill();
            // return style to norm
            this._restoreStyle(context);
        };
        /** change the dimensions based on a pan / zoom change on the canvas */
        CircleElement.prototype.updateDimensions = function (canvasDimensions) {
            _super.prototype.updateDimensions.call(this, canvasDimensions);
            this._displayRadius = {
                x: this._radius.x * this._canvas.zoomFactor.x,
                y: this._radius.y * this._canvas.zoomFactor.y
            };
        };
        /** override default dimensions for circle specific dimensions */
        CircleElement.prototype._debugDimensions = function () {
            console.log("CIRCLE:");
            console.log("center pt: " + Math.round(this._displayDimensions.x + this._displayRadius.x) + ", " + Math.round(this._displayDimensions.y + this._displayRadius.y));
            console.log("radius: " + Math.round(this._displayRadius.x));
            this._canvas.debugRelativeDimensions();
        };
        /** create a clone to be used in effect calculations */
        CircleElement.prototype._cloneForEffect = function (id) {
            // clone relevant data 
            var center = {
                x: this._dimensions.x + this._radius.x,
                y: this._dimensions.y + this._radius.y
            };
            var radius = KIP.clonePoint(this._radius);
            var elem = new CircleElement(id, center, radius);
            return elem;
        };
        /** allow effect elements to be resized */
        CircleElement.prototype._scale = function (scaleAmt) {
            if (!this._isEffect) {
                return;
            }
            _super.prototype._scale.call(this, scaleAmt);
            // Update this radius
            this._radius = {
                x: this._radius.x * scaleAmt,
                y: this._radius.y * scaleAmt
            };
        };
        return CircleElement;
    }(KIP.CanvasElement));
    KIP.CircleElement = CircleElement;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var PathElement = (function (_super) {
        __extends(PathElement, _super);
        function PathElement(id, points) {
            var _this = _super.call(this, id) || this;
            _this._initializeRects();
            if (points) {
                _this._points = points;
                _this._updateExtremaFromPoints();
            }
            else {
                _this._points = [];
            }
            return _this;
        }
        Object.defineProperty(PathElement.prototype, "type", {
            get: function () { return KIP.ElementType.Path; },
            enumerable: true,
            configurable: true
        });
        /** create an empty dimensions rect */
        PathElement.prototype._initializeRects = function () {
            this._dimensions = {
                x: 0,
                y: 0,
                w: 0,
                h: 0
            };
            _super.prototype._initializeRects.call(this);
            this._needsInitialDimensions = true;
        };
        /** add a new point to this path */
        PathElement.prototype.addPoint = function (point) {
            this._points.push(point);
            // Update extrema
            this._updateExtremaFromPoint(point);
        };
        /** loop through and update extremas based on all points */
        PathElement.prototype._updateExtremaFromPoints = function () {
            var point;
            for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                point = _a[_i];
                this._updateExtremaFromPoint(point);
            }
        };
        /** check if extrema need to be updated for a single point */
        PathElement.prototype._updateExtremaFromPoint = function (point) {
            // Check for x extremes
            if (this._needsInitialDimensions || point.x < this._dimensions.x) {
                this._dimensions.x = point.x;
            }
            else if (point.x > (this._dimensions.x + this._dimensions.w)) {
                this._dimensions.w = (point.x - this._dimensions.x);
            }
            // Check for y extremes
            if (this._needsInitialDimensions || point.y < this._dimensions.y) {
                this._dimensions.y = point.y;
            }
            else if (point.y > (this._dimensions.y + this._dimensions.h)) {
                this._dimensions.h = (point.y - this._dimensions.y);
            }
            this._needsInitialDimensions = false;
        };
        /** actually create the path on the canvas */
        PathElement.prototype._onDraw = function (context) {
            context.beginPath();
            // Add each point
            var point;
            for (var _i = 0, _a = this._displayPoints; _i < _a.length; _i++) {
                point = _a[_i];
                context.lineTo(point.x, point.y); //TODO: [future] add curves and arcs as well
            }
            context.closePath();
            context.fill();
        };
        /**  */
        PathElement.prototype.updateDimensions = function (canvasDimensions) {
            _super.prototype.updateDimensions.call(this, canvasDimensions);
            // We need to update each of our points
            this._displayPoints = [];
            var point;
            for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                point = _a[_i];
                //let displayPoint: IPoint = this._canvas.convertAbsolutePointToRelativePoint(point);
                var displayPoint = {
                    x: (point.x - canvasDimensions.x) * this._canvas.zoomFactor.x,
                    y: (point.y - canvasDimensions.y) * this._canvas.zoomFactor.y
                };
                this._displayPoints.push(displayPoint);
            }
        };
        PathElement.prototype.adjustDimensions = function (adjustPt) {
            if (this._isEffect) {
                return;
            }
            _super.prototype.adjustDimensions.call(this, adjustPt);
            var point;
            for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                point = _a[_i];
                point.x += adjustPt.x;
                point.y += adjustPt.y;
            }
        };
        /** clone in order to be able to apply various effects */
        PathElement.prototype._cloneForEffect = function (id) {
            var out = new PathElement(id, KIP.clonePointArray(this._points));
            return out;
        };
        PathElement.prototype._scale = function (scaleAmt) {
            if (!this._isEffect) {
                return;
            }
            // calculate the central point (defined as the center of each extrema)
            var center = {
                x: this._dimensions.x + (this._dimensions.w / 2),
                y: this._dimensions.y + (this._dimensions.h / 2)
            };
            // Scale each point to be some amount further from the center
            var pt;
            var tmpPoints = [];
            for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                pt = _a[_i];
                var tmpPt = this._scalePoint(pt, center, scaleAmt);
                tmpPoints.push(tmpPt);
            }
            // set our points array to the new points array
            this._points = tmpPoints;
            this._updateExtremaFromPoints();
        };
        PathElement.prototype._scalePoint = function (pt, center, scaleAmt) {
            var angle = KIP.Trig.getAngle(center, pt);
            var distance = KIP.Trig.getDistance(center, pt);
            var newDistance = distance * scaleAmt;
            var newPt = KIP.Trig.getEndPoint(center, angle, newDistance);
            return newPt;
        };
        return PathElement;
    }(KIP.CanvasElement));
    KIP.PathElement = PathElement;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /** class that stores collections of other canvas elements */
    var CanvasGroup = (function (_super) {
        __extends(CanvasGroup, _super);
        /** create a group element that joins other elements together */
        function CanvasGroup(id, refPoint) {
            var _this = _super.call(this, id) || this;
            _this._respondToScale = false;
            _this._elements = new KIP.Collection();
            if (refPoint) {
                _this._referencePoint = {
                    x: refPoint.x,
                    y: refPoint.y
                };
            }
            else {
                _this._referencePoint = {
                    x: 0,
                    y: 0
                };
            }
            _this._initializeRects();
            return _this;
        }
        Object.defineProperty(CanvasGroup.prototype, "type", {
            get: function () { return KIP.ElementType.Group; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasGroup.prototype, "referencePoint", {
            set: function (refPt) {
                this.adjustDimensions({
                    x: (refPt.x - this._referencePoint.x),
                    y: (refPt.y - this._referencePoint.y)
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CanvasGroup.prototype, "isHoverTarget", {
            /** groups handle whether they are a hover target a little differently */
            get: function () {
                var isHoverTarget = false;
                this._elements.map(function (elem) {
                    if (elem.isHoverTarget) {
                        isHoverTarget = true;
                        return;
                    }
                });
                return isHoverTarget;
            },
            enumerable: true,
            configurable: true
        });
        /** handle the initial rects needed by the group */
        CanvasGroup.prototype._initializeRects = function () {
            this._dimensions = {
                x: this._referencePoint.x,
                y: this._referencePoint.y,
                w: 0,
                h: 0
            };
            this._needsInitialDimensions = true;
            _super.prototype._initializeRects.call(this);
        };
        /** handle drawing the group */
        CanvasGroup.prototype._onDraw = function (context) {
            // draw the elements relative to the group
            this._elements.map(function (elem) {
                elem.draw();
            });
        };
        /** update the space occupied by this group */
        CanvasGroup.prototype.updateDimensions = function (visibleWindow) {
            _super.prototype.updateDimensions.call(this, visibleWindow);
            // No need to update if elems will be offscreen
            if (this._isOffScreen) {
                return;
            }
            // Add to each of the elements
            var elem;
            this._elements.map(function (elem) {
                elem.updateDimensions(visibleWindow);
            });
        };
        /** add an element to this group  */
        CanvasGroup.prototype.addElement = function (elem) {
            // Make sure each element is appropriately shifted
            elem.adjustDimensions(this._referencePoint);
            // Add the element to our internal array, and ensure it has a way to get back to us
            this._elements.addElement(elem.id, elem);
            elem.parent = this;
            // If we have a canvas assigned, also add it to this element
            if (this._canvas) {
                elem.canvas = this._canvas;
                this._canvas.needsRedraw = true;
            }
            // make sure we know how big this group is
            this._updateInternalDimensionsFromElement(elem);
        };
        /** make sure our internal dimensions match what our elements */
        CanvasGroup.prototype._updateInternalDimensionsFromElement = function (elem) {
            var relDim = {
                x: this._dimensions.x,
                y: this._dimensions.y,
                w: this._dimensions.w,
                h: this._dimensions.h
            };
            // Check if x extrema need updated
            if (elem.dimensions.x < relDim.x) {
                relDim.x = elem.dimensions.x;
            }
            if ((elem.dimensions.x + elem.dimensions.w) > (relDim.x + relDim.w)) {
                relDim.w = ((elem.dimensions.x + elem.dimensions.w) - relDim.x);
            }
            // Check if y extrema need updated
            if (elem.dimensions.y < relDim.y) {
                relDim.y = elem.dimensions.y;
            }
            if ((elem.dimensions.y + elem.dimensions.h) > (relDim.y + relDim.h)) {
                relDim.h = ((elem.dimensions.y + elem.dimensions.h) - relDim.y);
            }
            // Update the real dimensions
            this._dimensions = {
                x: relDim.x,
                y: relDim.y,
                w: relDim.w,
                h: relDim.h
            };
            // Don't set these dimensions as default again
            this._needsInitialDimensions = false;
        };
        /** groups need some special handling since they need to pass on their events */
        CanvasGroup.prototype.handleEvent = function (eventType, pt, e) {
            // Run any event-handling that directly applies to me
            _super.prototype.handleEvent.call(this, eventType, pt, e);
            // Quit if there's no point specified
            if (!pt) {
                return;
            }
            // clear any hover effects that may be happening
            if ((eventType === KIP.EventTypeEnum.LEAVE) || (eventType === KIP.EventTypeEnum.HOVER)) {
                this._clearHover(pt, e);
            }
            // Find the affected elements
            var elems = this._findElementsAtPoint(pt);
            // Loop through affected elements to apply the event to them
            var elem;
            for (var _i = 0, elems_1 = elems; _i < elems_1.length; _i++) {
                elem = elems_1[_i];
                elem.handleEvent(eventType, pt, e);
            }
            // TODO: apply a group event to all child elements
        };
        /** clear hover styles that may have been applied already */
        CanvasGroup.prototype._clearHover = function (relativePoint, e) {
            // loop through all of our elements and apply the unhover class
            this._elements.map(function (el) {
                if (!el.isHoverTarget) {
                    return;
                }
                el.leave(relativePoint, e);
            });
        };
        /** find the elements that are located at the provided point */
        CanvasGroup.prototype._findElementsAtPoint = function (pt) {
            var out = [];
            this._elements.map(function (elem) {
                if (elem.isOffScreen) {
                    return;
                }
                // if the point is contained, consider it an 
                if (!KIP.Trig.isPointContained(pt, elem.displayDimensions)) {
                    return;
                }
                // If the event happened at this element, add it to the array
                out.push(elem);
            });
            return out;
        };
        /** remove elements from layers */
        CanvasGroup.prototype.removeElement = function (id) {
            var tmp = this._elements.removeElement(id);
            if (!tmp) {
                return false;
            }
            this._canvas.needsRedraw = true;
            return true;
        };
        // cloning a group requires cloning its innards
        CanvasGroup.prototype._cloneForEffect = function (id) {
            var refPt = KIP.clonePoint(this._referencePoint);
            var clonedGrp = new CanvasGroup(id);
            // Loop through children & clone
            this._elements.map(function (elem) {
                var clone = elem._cloneForEffect(elem.id + "|e");
                clonedGrp.addElement(clone);
            });
            return clonedGrp;
        };
        // groups scale by each of their parts scaling
        CanvasGroup.prototype._scale = function (scaleAmt) {
            if (!this._isEffect) {
                return;
            }
            this._elements.map(function (elem) {
                elem._scale(scaleAmt);
            });
            return;
        };
        /** adjust the dimensions of this group + its children */
        CanvasGroup.prototype.adjustDimensions = function (adjustPt) {
            _super.prototype.adjustDimensions.call(this, adjustPt);
            this._referencePoint.x += adjustPt.x;
            this._referencePoint.y += adjustPt.y;
            this._elements.map(function (elem) {
                elem.adjustDimensions(adjustPt);
            });
        };
        CanvasGroup.prototype._setCanvas = function (canvas) {
            var _this = this;
            _super.prototype._setCanvas.call(this, canvas);
            this._elements.map(function (elem) {
                elem.canvas = _this._canvas;
                _this._updateInternalDimensionsFromElement(elem);
            });
        };
        return CanvasGroup;
    }(KIP.CanvasElement));
    KIP.CanvasGroup = CanvasGroup;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    ;
    //===========
    /** class that represents a set of tools around the HTML5 canvas */
    var HTML5Canvas = (function () {
        //===========
        //============
        // CONSTRUCTOR
        /** Create a HTML5 canvas element */
        function HTML5Canvas(id, options) {
            if (id) {
                this._id = id;
            }
            else {
                this._id = "canvas";
            }
            // initialize the layers property
            this._layers = [];
            this._needsInitialDimensions = true;
            this._reconcileOptions(options); // Pull in user options
            this._initializeRectangles(); // Initialize the viewing rectangles
            this._createElements(); // Create elements
            this._addEventListeners(); // Add all relevant event listeners
        }
        Object.defineProperty(HTML5Canvas.prototype, "relativeView", {
            get: function () { return this._relativeView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTML5Canvas.prototype, "zoomFactor", {
            get: function () { return this._zoomFactor; },
            set: function (zoom) { this._zoomFactor = zoom; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTML5Canvas.prototype, "needsRedraw", {
            set: function (value) { this._needsRedraw = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTML5Canvas.prototype, "canvas", {
            get: function () { return this._canvas; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTML5Canvas.prototype, "effectCanvas", {
            get: function () { return this._effectCanvas; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTML5Canvas.prototype, "context", {
            get: function () { return this._context; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTML5Canvas.prototype, "effectContext", {
            get: function () { return this._effectContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTML5Canvas.prototype, "layers", {
            get: function () { return this._layers; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HTML5Canvas.prototype, "onPreRender", {
            set: function (preRender) { this._onPreRender = preRender; },
            enumerable: true,
            configurable: true
        });
        //============
        //======================
        // HANDLE INITIALIZATION
        /** pull in default options */
        HTML5Canvas.prototype._reconcileOptions = function (userOptions) {
            if (!userOptions) {
                userOptions = {};
            }
            var defaults = this._createDefaultOptions();
            this._options = KIP.reconcileOptions(userOptions, defaults);
        };
        /** set our default options */
        HTML5Canvas.prototype._createDefaultOptions = function () {
            var _this = this;
            var defaults = {
                RENDER_RATE: 30,
                ZOOM_DELTA: function () {
                    var out = {
                        x: 0.03 * _this._zoomFactor.x,
                        y: 0.03 * _this._zoomFactor.y
                    };
                    return out;
                },
                SIZE: {
                    width: 600,
                    height: 450
                },
                MAX_ZOOM: {
                    x: 15,
                    y: 15
                },
                MIN_ZOOM: {
                    x: 0.1,
                    y: 0.1
                }
            };
            return defaults;
        };
        /** create the rectangles that the canvas needs to care about */
        HTML5Canvas.prototype._initializeRectangles = function () {
            // ABSOLUTE
            this._absoluteDimensions = {
                x: 0,
                y: 0,
                w: this._options.SIZE.width,
                h: this._options.SIZE.height
            };
            // RELATIVE
            this._relativeView = {
                x: 0,
                y: 0,
                w: this._options.SIZE.width,
                h: this._options.SIZE.height
            };
            // ZOOM SCALE
            this._zoomFactor = {
                x: 1,
                y: 1
            };
        };
        /** create the canvas element */
        HTML5Canvas.prototype._createElements = function () {
            // create the canvas elements
            this._canvas = this._createCanvas();
            this._effectCanvas = this._createCanvas(true);
            // create the contexts for each
            this._context = this._canvas.getContext("2d");
            this._effectContext = this._effectCanvas.getContext("2d");
        };
        /**
         * create an actual canvas element
         * @param [isForEffects] - If true, creates an effect canvas instead
         */
        HTML5Canvas.prototype._createCanvas = function (isForEffects) {
            var canvas;
            // Create a canvas of the right size
            canvas = document.createElement("canvas");
            canvas.setAttribute("width", this._options.SIZE.width.toString());
            canvas.setAttribute("height", this._options.SIZE.height.toString());
            // give the canvas the right class
            var cls = "canvas";
            if (isForEffects) {
                cls += " effects";
            }
            KIP.addClass(canvas, cls);
            return canvas;
        };
        //======================
        //=================
        // DRAWING COMMANDS
        /** draws the canvas element */
        HTML5Canvas.prototype.draw = function (parent) {
            parent.appendChild(this._canvas);
            parent.appendChild(this._effectCanvas);
            // flag that we need to redraw instead of calling it directly
            this._needsRedraw = true;
        };
        /** clear the canvases */
        HTML5Canvas.prototype.clear = function () {
            this._context.clearRect(0, 0, this._options.SIZE.width, this._options.SIZE.height);
            this._effectContext.clearRect(0, 0, this._options.SIZE.width, this._options.SIZE.height);
        };
        /** loop through every element in the canvas */
        HTML5Canvas.prototype._drawEachElement = function () {
            // first clear the canvas
            this.clear();
            // then loop through each of the layers in order
            var layer;
            for (var _i = 0, _a = this._layers; _i < _a.length; _i++) {
                layer = _a[_i];
                if (!layer) {
                    continue;
                }
                layer.updateDimensions(this._relativeView);
                layer.draw();
            }
        };
        /** make sure we actually draw something */
        HTML5Canvas.prototype._renderFrame = function () {
            var _this = this;
            // Make sure we only do this kind of stuff if something changed
            if (this._needsRedraw) {
                if (this._onPreRender) {
                    this._onPreRender();
                } // Call pre-render code
                this._drawEachElement(); // actually draw elements
                this._needsRedraw = false; // Set that we no longer need to redraw
            }
            // Add animation listeners
            window.requestAnimationFrame(function () { _this._renderFrame(); });
        };
        //=================
        //====================
        // ADD/REMOVE ELEMENTS
        /** add an element to the canvas */
        HTML5Canvas.prototype.addElement = function (elem) {
            // grab the appropriate layer to add to (or create it if it doesn't yet exist)
            var layer = this._getOrCreateLayer(elem.layer);
            // Add the element to the appropriate layer
            layer.addElement(elem);
            // Update the absolute dimensions
            this._updateAbsoluteDimensionsFromElem(elem.dimensions);
            // Mark that we need to redraw
            this._needsRedraw = true;
        };
        /** remove an element from our internal collection */
        HTML5Canvas.prototype.removeElement = function (id) {
            var success;
            // rely on the layers to remove their own elements
            var layer;
            for (var _i = 0, _a = this._layers; _i < _a.length; _i++) {
                layer = _a[_i];
                if (!layer) {
                    continue;
                }
                success = layer.removeElement(id);
                if (success) {
                    break;
                }
            }
            return success;
        };
        // TODO: Does this need to exist?
        HTML5Canvas.prototype._updateAbsoluteDimensionsFromElem = function (addedDimensions) {
            // Check for x extrema changes
            if (this._needsInitialDimensions || addedDimensions.x < this._absoluteDimensions.x) {
                this._absoluteDimensions.x = addedDimensions.x;
            }
            if ((addedDimensions.x + addedDimensions.w) > (this._absoluteDimensions.x + this._absoluteDimensions.w)) {
                this._absoluteDimensions.w = ((addedDimensions.x + addedDimensions.w) - this._absoluteDimensions.x);
            }
            // Check for y extrema changes
            if (this._needsInitialDimensions || addedDimensions.y < this._absoluteDimensions.y) {
                this._absoluteDimensions.y = addedDimensions.y;
            }
            if ((addedDimensions.y + addedDimensions.h) > (this._absoluteDimensions.y + this._absoluteDimensions.h)) {
                this._absoluteDimensions.h = ((addedDimensions.y + addedDimensions.h) - this._absoluteDimensions.y);
            }
            this._needsInitialDimensions = false;
        };
        /** find the existing layer or create it if it doesn't exist */
        HTML5Canvas.prototype._getOrCreateLayer = function (layerIdx) {
            var layer = this._layers[layerIdx];
            if (!layer) {
                layer = new KIP.CanvasGroup("layer" + layerIdx);
                this._layers[layerIdx] = layer;
                layer.canvas = this;
            }
            return layer;
        };
        //====================
        //==================
        // ZOOM HANDLING
        /** zooming controls */
        HTML5Canvas.prototype._onMouseWheel = function (event) {
            var delta = event.wheelDelta;
            delta = (Math.abs(delta) / delta);
            this.zoom(delta);
        };
        /** actually zoom the canvas an appropriate amount */
        HTML5Canvas.prototype.zoom = function (delta) {
            // Get the standard zoom we should be applying
            var zoomDelta = this._options.ZOOM_DELTA();
            // how much has the zoom value changed?
            var zoomXDelta = this._zoomFactor.x + (delta * zoomDelta.x);
            zoomXDelta = this._normalizeValue(zoomXDelta, this._options.MIN_ZOOM.x, this._options.MAX_ZOOM.x);
            var zoomYDelta = this._zoomFactor.y + (delta * zoomDelta.y);
            zoomYDelta = this._normalizeValue(zoomYDelta, this._options.MIN_ZOOM.y, this._options.MAX_ZOOM.y);
            // The actual width is equal to:
            //	physical dimension * (1 / zoom value)
            var physicalDim = this._options.SIZE;
            var newWidth = KIP.roundToPlace(physicalDim.width * (1 / zoomXDelta), 10);
            this._zoomFactor.x = zoomXDelta;
            var newHeight = KIP.roundToPlace(physicalDim.height * (1 / zoomYDelta), 10);
            this._zoomFactor.y = zoomYDelta;
            // Now calculate how different that is from the current dimensions
            var widthDelta = newWidth - this._relativeView.w;
            var heightDelta = newHeight - this._relativeView.h;
            // Create the new view based on the appropriate deltas
            var newView = {
                x: this._relativeView.x - (widthDelta / 2),
                y: this._relativeView.y - (heightDelta / 2),
                w: this._relativeView.w + widthDelta,
                h: this._relativeView.h + heightDelta
            };
            this._relativeView = newView;
            this._needsRedraw = true;
        };
        /** make sure a value is not past the relevant extrema */
        HTML5Canvas.prototype._normalizeValue = function (val, min, max) {
            if (val < min) {
                val = min;
            }
            if (val > max) {
                val = max;
            }
            return val;
        };
        /** update the view being displayed on the canvas */
        HTML5Canvas.prototype.changeView = function (newDisplay) {
            this._relativeView = newDisplay;
        };
        //==================
        //==================
        // PAN HANDLING
        /** move the canvas around via a mouse drag */
        HTML5Canvas.prototype._onDrag = function (delta) {
            if (!delta) {
                return;
            }
            var newCorner = this._calculateNewCornerFromDelta(delta);
            this.pan(newCorner);
        };
        /** take zoom into account when calculating the new corner of the canvas */
        HTML5Canvas.prototype._calculateNewCornerFromDelta = function (delta) {
            var newCorner = {
                x: this._relativeView.x - (delta.x / this._zoomFactor.x),
                y: this._relativeView.y - (delta.y / this._zoomFactor.y)
            };
            return newCorner;
        };
        /** handle a pan event */
        HTML5Canvas.prototype.pan = function (cornerPoint) {
            this._relativeView.x = cornerPoint.x;
            this._relativeView.y = cornerPoint.y;
            this._needsRedraw = true;
        };
        //==================
        //==============
        //EVENT HANDLING
        /** add all event listeners for the canvas itself */
        HTML5Canvas.prototype._addEventListeners = function () {
            var _this = this;
            // Add zoom listeners
            window.addEventListener("mousewheel", function (event) {
                _this._onMouseWheel(event);
            });
            // Add pan listeners
            window.addEventListener("mousedown", function (event) {
                _this._canvas.style.cursor = "-webkit-grabbing";
                _this._startDragPoint = {
                    x: event.screenX,
                    y: event.screenY
                };
            });
            window.addEventListener("mousemove", function (event) {
                if (!_this._startDragPoint) {
                    return;
                }
                _this._deltaDragPoint = {
                    x: event.screenX - _this._startDragPoint.x,
                    y: event.screenY - _this._startDragPoint.y
                };
                _this._startDragPoint = {
                    x: event.screenX,
                    y: event.screenY
                };
                _this._onDrag(_this._deltaDragPoint);
            });
            window.addEventListener("mouseup", function () {
                _this._startDragPoint = null;
                _this._deltaDragPoint = {
                    x: 0,
                    y: 0
                };
                _this._canvas.style.cursor = "-webkit-grab";
            });
            this._canvas.addEventListener("click", function (e) {
                var pt = {
                    x: e.pageX,
                    y: e.pageY
                };
                _this._onClick(e, pt);
            });
            this._canvas.addEventListener("mousemove", function (e) {
                var pt = {
                    x: e.pageX,
                    y: e.pageY
                };
                _this._onHover(e, pt);
            });
            // Add animation listeners
            window.requestAnimationFrame(function () {
                _this._renderFrame();
            });
        };
        /** handle clicks on the canvas */
        HTML5Canvas.prototype._onClick = function (e, point) {
            this._handleEvent(KIP.EventTypeEnum.CLICK, point, e);
        };
        /** handle hovering over elements on the canvas */
        HTML5Canvas.prototype._onHover = function (e, point) {
            this._handleEvent(KIP.EventTypeEnum.HOVER, point, e);
        };
        /** handle the general event */
        HTML5Canvas.prototype._handleEvent = function (eventType, point, e) {
            //let relativePt: IPoint = this.convertPhysicalPointToRelativePoint(point);
            var layer;
            for (var _i = 0, _a = this._layers; _i < _a.length; _i++) {
                layer = _a[_i];
                if (!layer) {
                    continue;
                }
                layer.handleEvent(eventType, point, e);
            }
        };
        //==============
        //============================
        // POINT CONVERSION FUNCTIONS
        /** convert a point from our relative canvas frame (e.g. visible frame) and the physical space */
        HTML5Canvas.prototype.convertRelativePointToPhysicalPoint = function (relativePt) {
            var out;
            // Grab dimensions of the canvas
            // TODO: make more versatile
            var canvasLeft = this._canvas.offsetLeft;
            var canvasTop = this._canvas.offsetTop;
            var canvasWidth = this._canvas.offsetWidth;
            var canvasHeight = this._canvas.offsetHeight;
            var x = (((relativePt.x - this._relativeView.x) * canvasWidth) / this._relativeView.w) + canvasLeft;
            var y = (((relativePt.y - this._relativeView.y) * canvasHeight) / this._relativeView.h) + canvasTop;
            out = {
                x: x,
                y: y
            };
            return out;
        };
        /** convert a physical point to one within the visible canvas frame */
        HTML5Canvas.prototype.convertPhysicalPointToRelativePoint = function (physicalPt) {
            var out;
            // Grab dimensions of the canvas
            // TODO: make more versatile
            var canvasLeft = this._canvas.offsetLeft;
            var canvasTop = this._canvas.offsetTop;
            var canvasWidth = this._canvas.offsetWidth;
            var canvasHeight = this._canvas.offsetHeight;
            // convert each aspect of the point
            var x = (((physicalPt.x - canvasLeft) * this._relativeView.w) / canvasWidth) + this._relativeView.x;
            var y = (((physicalPt.y - canvasTop) * this._relativeView.h) / canvasHeight) + this._relativeView.y;
            out = {
                x: x,
                y: y
            };
            return out;
        };
        /** convert a point from absolute position to a visible point */
        HTML5Canvas.prototype.convertAbsolutePointToRelativePoint = function (absolutePt) {
            var out;
            // absolute position may exist outside of vsiible rect, but will be visible at some point in the canvas
            out = {
                x: KIP.roundToPlace((absolutePt.x - this._relativeView.x) * this._zoomFactor.x, 10),
                y: KIP.roundToPlace((absolutePt.y - this._relativeView.y) * this._zoomFactor.y, 10)
            };
            return out;
        };
        /** convert a point from a visible point to an absolute point */
        HTML5Canvas.prototype.convertRelativePointToAbsolutePoint = function (relativePt) {
            var out;
            out = {
                x: KIP.roundToPlace(((relativePt.x / this._zoomFactor.x) + this._relativeView.x), 10),
                y: KIP.roundToPlace(((relativePt.y / this._zoomFactor.y) + this._relativeView.y), 10)
            };
            return out;
        };
        HTML5Canvas.prototype.convertAbsoluteRectToRelativeRect = function (absoluteRect) {
            // calculate the top left corner
            var leftTopCorner = {
                x: absoluteRect.x,
                y: absoluteRect.y
            };
            var relLeftTopCorner = this.convertAbsolutePointToRelativePoint(leftTopCorner);
            // calculate the bottom-right corner
            var rightBottomCorner = {
                x: absoluteRect.x + absoluteRect.w,
                y: absoluteRect.y + absoluteRect.h
            };
            var relRightBottomCorner = this.convertAbsolutePointToRelativePoint(rightBottomCorner);
            // return a rect based on the corners we calculated
            return {
                x: relLeftTopCorner.x,
                y: relLeftTopCorner.y,
                w: relRightBottomCorner.x - relLeftTopCorner.x,
                h: relRightBottomCorner.y - relLeftTopCorner.y
            };
        };
        //============================
        //======================
        // HELPERS
        /** debug the current view of the canvas */
        HTML5Canvas.prototype.debugRelativeDimensions = function () {
            console.log("CANVAS DIMENSIONS:");
            console.log(Math.round(this.relativeView.x) + ", " + Math.round(this.relativeView.y));
            console.log(Math.round(this.relativeView.w) + " x " + Math.round(this.relativeView.h));
        };
        return HTML5Canvas;
    }());
    KIP.HTML5Canvas = HTML5Canvas;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var ProjectDayFormatting;
    (function (ProjectDayFormatting) {
        ProjectDayFormatting[ProjectDayFormatting["NORMAL"] = 0] = "NORMAL";
        ProjectDayFormatting[ProjectDayFormatting["WEEKEND"] = 1] = "WEEKEND";
        ProjectDayFormatting[ProjectDayFormatting["HOLIDAY"] = 2] = "HOLIDAY";
        ProjectDayFormatting[ProjectDayFormatting["TODAY"] = 3] = "TODAY";
    })(ProjectDayFormatting = KIP.ProjectDayFormatting || (KIP.ProjectDayFormatting = {}));
    ;
    var Timeline = (function (_super) {
        __extends(Timeline, _super);
        //===========
        //==================
        // CONSTRUCTOR STEPS
        /** create a representation of timelines */
        function Timeline(options) {
            var _this = _super.call(this, "timeline", options) || this;
            _this._handleCanvasForTimeline();
            return _this;
        }
        Object.defineProperty(Timeline.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        /** create the default options for a project plan */
        Timeline.prototype._createDefaultOptions = function () {
            var _this = this;
            var options = _super.prototype._createDefaultOptions.call(this);
            options.DAY_HEIGHT = 20;
            options.DAY_WIDTH = 20;
            options.CENTRAL_DATE = KIP.Dates.getToday();
            options.SIZE = {
                width: window.innerWidth - 15,
                height: window.innerHeight - 15
            };
            options.MONTH_COLORS = [
                "#D30",
                "#D70",
                "#EA0",
                "#AD0",
                "#0C3",
                "#0D9",
                "#0DC",
                "#05D",
                "#40D",
                "#80D",
                "#A0D",
                "#C07"
            ];
            options.DAY_FORMATTING = {
                NORMAL: "#fafafa",
                WEEKEND: "#ccc",
                HOLIDAY: "#ccc",
                TODAY: "#333"
            };
            options.ZOOM_DELTA = function () {
                var out = {
                    x: 0.03 * _this.zoomFactor.x,
                    y: 0.01 * _this.zoomFactor.y
                };
                return out;
            };
            options.DATE_BG_COLOR = "#FFF";
            options.BORDER_COLOR = "#bbb";
            options.FONT_SIZE = 12;
            options.BETWEEN_GROUP_GAP = 10;
            options.MAX_ZOOM.y = Math.pow(1.01, Math.log(options.MAX_ZOOM.x / 1.03));
            options.MIN_ZOOM.y = Math.pow(1.01, Math.log(options.MIN_ZOOM.x) / Math.log(1.03));
            return options;
        };
        /** reconcile default options with user options */
        Timeline.prototype._reconcileOptions = function (options) {
            this._options = KIP.reconcileOptions(options, this._createDefaultOptions());
        };
        /** create the canvas upon which we will be drawing our project plan */
        Timeline.prototype._handleCanvasForTimeline = function () {
            var _this = this;
            // save off the central point and coordinate for date - point conversions
            this._centralDateLocation = (this._options.SIZE.width / 2);
            // make sure we draw the right UI as we move around
            this.onPreRender = function () {
                _this._createVisibleBackground();
            };
            // ensure that we have a layer for all of our elements
            this._layers[1] = this._getOrCreateLayer(1);
            this._elemLayer = this._layers[1];
        };
        //==================
        //===================
        // HANDLE CONVERSIONS
        /** given a date, turn it into a point on the canvas */
        Timeline.prototype.convertDateToPoint = function (date, absolute) {
            var diff = KIP.Dates.dateDiff(date, this._options.CENTRAL_DATE, true, true);
            var scaledDayWidth = this._options.DAY_WIDTH;
            if (absolute) {
                scaledDayWidth *= this.zoomFactor.x;
            }
            var outPt = {
                x: this._centralDateLocation + (diff * scaledDayWidth),
                y: 0
            };
            return outPt;
        };
        /** given a point, turn it into a date on the timeline */
        Timeline.prototype.convertPointToDate = function (point, absolute) {
            // figure out how far this date is from the central location
            var diff = point.x - this._centralDateLocation;
            // figure out how wide a day is currently
            var scaledDayWidth = this._options.DAY_WIDTH;
            if (absolute) {
                scaledDayWidth *= this.zoomFactor.x;
            }
            // Create the out date and shift by the appropriate amount
            var outDate = new Date(this._options.CENTRAL_DATE);
            KIP.Dates.addToDate(outDate, { days: (diff / scaledDayWidth) });
            return outDate;
        };
        //===================
        //================
        // MANIPULATE DATA
        /** add a new project item to the canvas */
        Timeline.prototype.addTimelineElement = function (item) {
            // calculate the appropriate height for the element
            item.adjustDimensions({
                x: 0,
                y: this._elemLayer.dimensions.h + this._options.BETWEEN_GROUP_GAP
            });
            this._elemLayer.addElement(item);
            return true;
        };
        //=
        //======================
        // HANDLE THE BACKGROUND
        Timeline.prototype._createVisibleBackground = function () {
            // calculate the min date visible & max date visible
            var extrema = this._getDateExtrema();
            // create the group to add to
            var bgGroup = new KIP.CanvasGroup("bg", { x: 0, y: 0 });
            bgGroup.layer = 0;
            var headerGroup = new KIP.CanvasGroup("header", { x: 0, y: 0 });
            headerGroup.layer = 99;
            // handle month tracking
            var curMonthStart = this._relativeView.x;
            var curMonthRefDate = extrema.min;
            // figure out what the non-scaled version of our day-height would be
            var unscaledDay = KIP.roundToPlace(this._options.DAY_HEIGHT / this._zoomFactor.y, 10);
            // loop through all dates in this time range
            var diff = KIP.Dates.dateDiff(extrema.max, extrema.min, false, false, false) + 1;
            for (var i = 0; i < diff; i += 1) {
                // create the date to draw currently
                var refDate = KIP.Dates.addToDate(new Date(extrema.min), { days: i });
                refDate = KIP.Dates.clearTimeInfo(refDate);
                // Create the reference point position for the day display
                var refPt = this.convertDateToPoint(refDate);
                refPt.y = this._relativeView.y + unscaledDay;
                // for the first element, the reference point is going to be a little different
                if (i === 0) {
                    refPt.x = this._relativeView.x;
                }
                var lastElem = (i === (diff - 1));
                // Create the day column
                var dayDivGrp = this._createDayDivisions(refDate, refPt);
                bgGroup.addElement(dayDivGrp);
                // create the month header
                var dateMismatch = refDate.getMonth() !== curMonthRefDate.getMonth();
                if (dateMismatch) {
                    var monthGrp = this._createMonthHeader(curMonthRefDate, {
                        x: curMonthStart,
                        y: this._relativeView.y
                    }, {
                        x: refPt.x,
                        y: this._relativeView.y + unscaledDay
                    });
                    curMonthRefDate = refDate;
                    curMonthStart = refPt.x;
                    headerGroup.addElement(monthGrp);
                }
                if (lastElem) {
                    var monthGrp = this._createMonthHeader(curMonthRefDate, {
                        x: curMonthStart,
                        y: this._relativeView.y
                    }, {
                        x: this._relativeView.x + this._relativeView.w,
                        y: this._relativeView.y + unscaledDay
                    });
                    curMonthRefDate = refDate;
                    curMonthStart = refPt.x;
                    headerGroup.addElement(monthGrp);
                }
                // create the day header
                var dayGroup = this._createDayHeader(refDate, refPt);
                if (dayGroup !== null) {
                    headerGroup.addElement(dayGroup);
                }
            }
            // remove the old
            this.removeElement("bg");
            this.removeElement("header");
            // and insert the new
            this.addElement(bgGroup);
            this.addElement(headerGroup);
        };
        /** calculate the max & min dates that are visible */
        Timeline.prototype._getDateExtrema = function () {
            var viewport = this._relativeView;
            var min = {
                x: viewport.x,
                y: viewport.y
            };
            var max = {
                x: viewport.x + viewport.w,
                y: viewport.y + viewport.h
            };
            var out = {
                max: this.convertPointToDate(max),
                min: this.convertPointToDate(min)
            };
            return out;
        };
        /** create a particular header for a month */
        Timeline.prototype._createMonthHeader = function (refDate, start, end) {
            var monthName = KIP.Dates.getMonthName(refDate, true);
            var year = KIP.Dates.getShortYear(refDate);
            // LABEL ELEMENT
            var monthLbl = new KIP.TextElement("month|lbl|" + KIP.Dates.shortDate(refDate), (monthName + " " + year), {
                x: 5,
                y: 0
            });
            monthLbl.style.fillColor = "#FFF";
            monthLbl.style.fontSize = 14;
            monthLbl.fixed = true;
            // COLOR ELEMENT
            var monthColor = new KIP.RectangleElement("month|rect|" + KIP.Dates.shortDate(refDate), {
                x: 0,
                y: 0,
                w: (end.x - start.x),
                h: (end.y - start.y)
            });
            monthColor.style.fillColor = this._getMonthColor(refDate.getMonth());
            // GROUP AROUND BOTH
            var monthGrp = new KIP.CanvasGroup("month|" + KIP.Dates.shortDate(refDate), { x: start.x, y: start.y });
            monthGrp.addElement(monthColor);
            monthGrp.addElement(monthLbl);
            return monthGrp;
        };
        /** create a particular header for a day */
        Timeline.prototype._createDayHeader = function (refDate, start) {
            // determine if the day would be too small to be useful
            if ((this._options.DAY_WIDTH * this._zoomFactor.x) < 15) {
                return null;
            }
            // TEXT LABEL FOR THE DAY
            var dayLbl = new KIP.TextElement("day|lbl|" + refDate.getDate(), refDate.getDate().toString(), { x: (this._options.DAY_WIDTH / 2), y: 0 });
            dayLbl.style.fillColor = "#333";
            dayLbl.style.fontSize = 12;
            dayLbl.fixed = true;
            dayLbl.style.textAlign = "center";
            // BACKGROUND BEHIND DAY
            var dayBG = new KIP.RectangleElement("day|rect|" + refDate.getDate(), {
                x: 0,
                y: 0,
                w: this._options.DAY_WIDTH,
                h: (this._options.DAY_HEIGHT / this._zoomFactor.y) * 0.75
            });
            dayBG.style.fillColor = this._options.DATE_BG_COLOR;
            // CREATE THE GROUP THAT STORES BOTH
            var dayGrp = new KIP.CanvasGroup("day|" + KIP.Dates.shortDate(refDate), { x: start.x, y: start.y });
            // add the elements to the group
            dayGrp.addElement(dayBG);
            dayGrp.addElement(dayLbl);
            return dayGrp;
        };
        // create a day column
        Timeline.prototype._createDayDivisions = function (refDate, start) {
            // get the formatting for the date
            var formatting = this._getDayFormatting(refDate);
            // draw the right hand border for the day
            var onePix = 1 / this._zoomFactor.x;
            var borderRight = new KIP.RectangleElement("day|b.left|" + KIP.Dates.shortDate(refDate), {
                x: this._options.DAY_WIDTH - onePix,
                y: 0,
                w: onePix,
                h: this._relativeView.h
            });
            borderRight.style.fillColor = this._options.BORDER_COLOR;
            // draw the BG border for the day
            var bg = new KIP.RectangleElement("day|bg|" + KIP.Dates.shortDate(refDate), {
                x: 0,
                y: 0,
                w: this._options.DAY_WIDTH,
                h: this._relativeView.h
            });
            if (formatting === ProjectDayFormatting.TODAY) {
                bg.style.fillColor = this._options.DAY_FORMATTING.TODAY;
            }
            else if (formatting === ProjectDayFormatting.HOLIDAY) {
                bg.style.fillColor = this._options.DAY_FORMATTING.HOLIDAY;
            }
            else if (formatting === ProjectDayFormatting.WEEKEND) {
                bg.style.fillColor = this._options.DAY_FORMATTING.WEEKEND;
            }
            else {
                bg.style.fillColor = this._options.DAY_FORMATTING.NORMAL;
            }
            var dayDivGrp = new KIP.CanvasGroup("day|division|" + KIP.Dates.shortDate(refDate), { x: start.x, y: this._relativeView.y });
            dayDivGrp.addElement(bg);
            dayDivGrp.addElement(borderRight);
            return dayDivGrp;
        };
        Timeline.prototype._getDayFormatting = function (date) {
            // create the day divisions
            var formatting;
            ProjectDayFormatting;
            // HANDLE TODAY
            if (KIP.Dates.isToday(date)) {
                formatting = ProjectDayFormatting.TODAY;
            }
            else if (KIP.Dates.isWeekend(date)) {
                formatting = ProjectDayFormatting.WEEKEND;
            }
            else {
                formatting = ProjectDayFormatting.NORMAL;
            }
            return formatting;
        };
        Timeline.prototype._getMonthColor = function (monthID) {
            return this._options.MONTH_COLORS[monthID];
        };
        return Timeline;
    }(KIP.HTML5Canvas));
    KIP.Timeline = Timeline;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    function createEmptyPoint() {
        return { x: 0, y: 0 };
    }
    var TimelineLabel = (function (_super) {
        __extends(TimelineLabel, _super);
        /**  */
        function TimelineLabel(id, lbl) {
            return _super.call(this, id, lbl, createEmptyPoint()) || this;
        }
        Object.defineProperty(TimelineLabel.prototype, "startDate", {
            get: function () { return this._startDate; },
            set: function (start) {
                this._startDate = start;
                this._updatePoint();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimelineLabel.prototype, "endDate", {
            /** we don't have an end date, so just return the start date */
            get: function () { return this._startDate; },
            set: function (dt) { },
            enumerable: true,
            configurable: true
        });
        TimelineLabel.prototype._setCanvas = function (canvas) {
            _super.prototype._setCanvas.call(this, canvas);
            this._updatePoint();
        };
        TimelineLabel.prototype._updatePoint = function () {
            if (!this._canvas) {
                return;
            }
            if (!this._startDate) {
                return;
            }
            var startPt = this._canvas.convertDateToPoint(this._startDate);
            this._dimensions.x = startPt.x;
        };
        TimelineLabel.prototype.updateDimensions = function (visibleWindow) {
            _super.prototype.updateDimensions.call(this, visibleWindow);
            // Quit if we're offscreen because of the y direction
            if (this.isOffScreen) {
                if (this._dimensions.y < visibleWindow.y) {
                    return;
                }
                if ((this._dimensions.y + this._dimensions.h) > (visibleWindow.y + visibleWindow.h)) {
                    return;
                }
            }
            if (this._dimensions.x < visibleWindow.x) {
                this._displayDimensions.x = 0;
                this._isOffScreen = false;
            }
        };
        return TimelineLabel;
    }(KIP.TextElement));
    KIP.TimelineLabel = TimelineLabel;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /** create an item on the project plan */
    var TimelineGroup = (function (_super) {
        __extends(TimelineGroup, _super);
        function TimelineGroup(id, options) {
            var _this = _super.call(this, id) || this;
            _this._reconcileOptions(options);
            return _this;
        }
        Object.defineProperty(TimelineGroup.prototype, "startDate", {
            get: function () { return this._startDate; },
            set: function (start) { this._startDate = start; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimelineGroup.prototype, "endDate", {
            get: function () { return this._endDate; },
            set: function (end) { this._endDate = end; },
            enumerable: true,
            configurable: true
        });
        TimelineGroup.prototype._createDefaultOptions = function () {
            return {
                HORIZONTAL: false,
                ELEMENT_GAP: 2,
                ELEM_HEIGHT: 20
            };
        };
        /** reconcile the options for the group */
        TimelineGroup.prototype._reconcileOptions = function (options) {
            var defaults = this._createDefaultOptions();
            this._options = KIP.reconcileOptions(options, defaults);
        };
        /** add a new project line */
        TimelineGroup.prototype.addElement = function (elem) {
            // handle extreme dates
            this._reconcileDates(elem);
            // Set the height if it hasn't been set yet & its not a group
            if ((elem.dimensions.h === 0) && (elem.type !== KIP.ElementType.Group)) {
                elem.dimensions.h = this._options.ELEM_HEIGHT;
            }
            // Horizontal groups don't get their y-position adjusted
            if (!this._options.HORIZONTAL) {
                elem.adjustDimensions({
                    x: 0,
                    y: this._dimensions.h + this._options.ELEMENT_GAP
                });
            }
            _super.prototype.addElement.call(this, elem);
        };
        TimelineGroup.prototype._reconcileDates = function (elem) {
            // If the element is missing dates, assign them
            if (!elem.startDate) {
                elem.startDate = this._startDate;
                return;
            }
            var needsUpdate;
            // Otherwise check if our extrema need updating
            if (!this._startDate || (elem.startDate < this._startDate)) {
                this._startDate = elem.startDate;
                needsUpdate = true;
            }
            if (!this._endDate || (elem.endDate > this._endDate)) {
                this._endDate = elem.endDate;
            }
            if (needsUpdate) {
                this._updateLabels();
            }
        };
        TimelineGroup.prototype._setCanvas = function (canvas) {
            _super.prototype._setCanvas.call(this, canvas);
        };
        // TODO: create sort function
        TimelineGroup.prototype.sort = function (sortFunc) {
        };
        // Update any labels to start when I start
        TimelineGroup.prototype._updateLabels = function () {
            var _this = this;
            this._elements.map(function (elem) {
                if (elem.type === KIP.ElementType.Text) {
                    elem.startDate = _this._startDate;
                }
            });
        };
        return TimelineGroup;
    }(KIP.CanvasGroup));
    KIP.TimelineGroup = TimelineGroup;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var TimelineEvent = (function (_super) {
        __extends(TimelineEvent, _super);
        // Create an event
        function TimelineEvent(id, date) {
            var _this = _super.call(this, id, []) || this;
            _this._date = date;
            return _this;
        }
        Object.defineProperty(TimelineEvent.prototype, "startDate", {
            get: function () { return this._date; },
            set: function (dt) { },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimelineEvent.prototype, "endDate", {
            get: function () { return this._date; },
            set: function (dt) { },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimelineEvent.prototype, "canvas", {
            /** override the default canvas setting, since we need it to handle the point updates */
            set: function (canvas) {
                this._canvas = canvas;
                var startPt = this._canvas.convertDateToPoint(this._date);
                this._dimensions.x = startPt.x;
                this._setPoints();
            },
            enumerable: true,
            configurable: true
        });
        /** update the points for this path, based on new dimensions */
        TimelineEvent.prototype._setPoints = function () {
            var xOffset = this._dimensions.x;
            var yOffset = this._dimensions.y;
            this._points = [
                { x: -2, y: -14 },
                { x: -2, y: 0 },
                { x: 0, y: 2 },
                { x: 2, y: 2 },
                { x: 2, y: -14 }
            ];
            this._points = [
                { x: 0, y: -2 },
                { x: 1, y: -2 },
                { x: 1, y: 8 },
                { x: 0, y: 8 }
            ];
            var pt;
            for (var _i = 0, _a = this._points; _i < _a.length; _i++) {
                pt = _a[_i];
                pt.x += xOffset;
                pt.y += yOffset;
            }
        };
        return TimelineEvent;
    }(KIP.PathElement));
    KIP.TimelineEvent = TimelineEvent;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    /** helper function to create an empty rect */
    function _createEmptyDimensions() {
        return {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };
    }
    var Timespan = (function (_super) {
        __extends(Timespan, _super);
        function Timespan(id, start, end) {
            var _this = _super.call(this, id, _createEmptyDimensions()) || this;
            _this._startDate = start;
            _this._endDate = end;
            return _this;
        }
        Object.defineProperty(Timespan.prototype, "startDate", {
            get: function () { return this._startDate; },
            set: function (dt) { },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Timespan.prototype, "endDate", {
            get: function () { return this._endDate; },
            set: function (dt) { },
            enumerable: true,
            configurable: true
        });
        //===========
        /** create the default set of options */
        Timespan.prototype._constructDefaultOptions = function () {
            return {
                COLOR: "#333",
                FONT_SIZE: 10
            };
        };
        Object.defineProperty(Timespan.prototype, "canvas", {
            /** override the canvas being set to find the appropriate position */
            set: function (canvas) {
                this._canvas = canvas;
                this._calculatePosition();
            },
            enumerable: true,
            configurable: true
        });
        /** sets the appropriate position for the element */
        Timespan.prototype._calculatePosition = function () {
            // Quit if we don't have a parent or a canvas element
            if (!this._parent) {
                return;
            }
            if (!this._canvas) {
                return;
            }
            // Calculate the date positions
            var startPt = this._canvas.convertDateToPoint(this._startDate);
            var endPt = this._canvas.convertDateToPoint(this._endDate);
            // Create the appropriately sized rect
            var dim = {
                x: startPt.x,
                y: this._dimensions.y,
                w: (endPt.x - startPt.x),
                h: this._dimensions.h
            };
            // Set the dimensions on our rectangle
            this._dimensions = dim;
        };
        return Timespan;
    }(KIP.RectangleElement));
    KIP.Timespan = Timespan;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Forms;
    (function (Forms) {
        /** type of the element */
        var FormElementTypeEnum;
        (function (FormElementTypeEnum) {
            FormElementTypeEnum[FormElementTypeEnum["TEXT"] = 1] = "TEXT";
            FormElementTypeEnum[FormElementTypeEnum["NUMBER"] = 2] = "NUMBER";
            FormElementTypeEnum[FormElementTypeEnum["DATE"] = 3] = "DATE";
            FormElementTypeEnum[FormElementTypeEnum["TIME"] = 4] = "TIME";
            FormElementTypeEnum[FormElementTypeEnum["DATE_TIME"] = 5] = "DATE_TIME";
            FormElementTypeEnum[FormElementTypeEnum["SELECT"] = 6] = "SELECT";
            FormElementTypeEnum[FormElementTypeEnum["CHECKBOX"] = 7] = "CHECKBOX";
            FormElementTypeEnum[FormElementTypeEnum["TEXTAREA"] = 8] = "TEXTAREA";
            FormElementTypeEnum[FormElementTypeEnum["ARRAY"] = 9] = "ARRAY";
            FormElementTypeEnum[FormElementTypeEnum["ARRAY_CHILD"] = 10] = "ARRAY_CHILD";
            FormElementTypeEnum[FormElementTypeEnum["TOGGLE_BUTTON"] = 11] = "TOGGLE_BUTTON";
            FormElementTypeEnum[FormElementTypeEnum["CUSTOM"] = 12] = "CUSTOM";
            FormElementTypeEnum[FormElementTypeEnum["SECTION"] = 13] = "SECTION";
            FormElementTypeEnum[FormElementTypeEnum["HIDDEN"] = 14] = "HIDDEN";
            FormElementTypeEnum[FormElementTypeEnum["FILE_UPLOAD"] = 15] = "FILE_UPLOAD";
            FormElementTypeEnum[FormElementTypeEnum["FILE_PATH"] = 16] = "FILE_PATH";
        })(FormElementTypeEnum = Forms.FormElementTypeEnum || (Forms.FormElementTypeEnum = {}));
        ;
        /** options for layout */
        var FormElementLayoutEnum;
        (function (FormElementLayoutEnum) {
            FormElementLayoutEnum[FormElementLayoutEnum["MULTILINE"] = 0] = "MULTILINE";
            FormElementLayoutEnum[FormElementLayoutEnum["TABLE"] = 1] = "TABLE";
            FormElementLayoutEnum[FormElementLayoutEnum["FLEX"] = 2] = "FLEX";
            FormElementLayoutEnum[FormElementLayoutEnum["LABEL_AFTER"] = 3] = "LABEL_AFTER";
        })(FormElementLayoutEnum = Forms.FormElementLayoutEnum || (Forms.FormElementLayoutEnum = {}));
        ;
    })(Forms = KIP.Forms || (KIP.Forms = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Forms;
    (function (Forms) {
        function cloneTemplate(template) {
            var temp = {
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
        Forms.cloneTemplate = cloneTemplate;
        /**
         * Creates a select element with associated options
         * @param id - ID to use for the select element
         * @param cls - the CSS class to use to style this select box
         * @param options - What options should be included in the select box
         * @param defaultSelection - What should be selected by default
         */
        function createSelectElement(id, cls, options, defaultSelection) {
            var optionElems = [];
            var optKey;
            // turn the option array into something the createElement function will understand
            KIP.map(options, function (lbl, value) {
                var def = {
                    type: "option",
                    attr: {
                        value: value
                    },
                    content: lbl,
                };
                if (defaultSelection === value) {
                    def.attr.selected = "true";
                }
                optionElems.push(def);
            });
            // create the general definition for the select element
            var obj = {
                id: id,
                cls: cls,
                type: "select",
                children: optionElems
            };
            // return the created select box
            return KIP.createElement(obj);
        }
        Forms.createSelectElement = createSelectElement;
        ;
        /**
         * Creates a checkbox element & a wrapper around it
         * @param id - ID to use for the checkbox
         * @param cls - the CSS class to style this checkbox
         * @param lbl - What label to use for this checkbox
         * @param checked - True if the checkbox should be checked
         */
        function createLabeledCheckbox(id, cls, lbl, checked) {
            // create the wrapper to hold the checkbox + label
            var wrapperElem = KIP.createSimpleElement(id + "|wrapper", cls + "|wrapper");
            // create the checkbox itself
            var checkboxDef = {
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
            var checkboxElem = KIP.createElement(checkboxDef);
            // create the label for the checkbox
            var lblElem = KIP.createSimpleElement("", cls + "|lbl", lbl, { for: id }, null, wrapperElem);
            // return the wrapper + the checkbox
            return {
                wrapper: wrapperElem,
                checkbox: checkboxElem
            };
        }
        Forms.createLabeledCheckbox = createLabeledCheckbox;
        /** creates a label that will be clickable to select an associated input */
        function createLabelForInput(lbl, labelFor, cls, embedIn) {
            var lblElement = KIP.createElement({
                type: "label",
                cls: cls,
                attr: {
                    for: labelFor
                },
                content: lbl,
                parent: embedIn
            });
            return lblElement;
        }
        Forms.createLabelForInput = createLabelForInput;
        function createRadioButtons() {
            //TODO: IMPLEMENT
        }
        Forms.createRadioButtons = createRadioButtons;
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
        function createInputElement(id, cls, type, value, attr, children, parent) {
            var elemType = "input";
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
                }
                else if (type === "date") {
                    attr.value = KIP.Dates.inputDateFmt(value);
                }
                else {
                    attr.value = value;
                }
            }
            // create the appropriate element
            var elem = KIP.createElement({
                type: elemType,
                id: id,
                cls: cls,
                attr: attr,
                children: children,
                parent: parent
            });
            // return the element
            return elem;
        }
        Forms.createInputElement = createInputElement;
    })(Forms = KIP.Forms || (KIP.Forms = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Forms;
    (function (Forms) {
        /**
         * determine whether a particular parameter is a form element
         * @param elem - Either a FormElement or a FormTemplate
         * @returns True if elem is a form Element
         */
        function isFormElement(elem) {
            if (!elem) {
                return false;
            }
            return (elem.id !== undefined) && (elem.type !== undefined);
        }
        Forms.isFormElement = isFormElement;
        /** create the general form element class that all others extend */
        var FormElement = (function (_super) {
            __extends(FormElement, _super);
            function FormElement(id, data) {
                var _this = _super.call(this) || this;
                /** store the standard class for all form elements */
                _this._standardCls = "kipFormElem";
                _this._id = id;
                // If this is another element, parse it
                if (isFormElement(data)) {
                    _this._cloneFromFormElement(data);
                    // otherwise, handle the standard template parsing
                }
                else {
                    _this._parseElemTemplate(data);
                }
                _this._createElements();
                return _this;
            }
            Object.defineProperty(FormElement.prototype, "id", {
                get: function () { return this._id; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FormElement.prototype, "type", {
                get: function () { return this._type; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FormElement.prototype, "data", {
                get: function () { return this._data; },
                set: function (data) { this.update(data); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FormElement.prototype, "onOtherChange", {
                get: function () { return this._onOtherChange; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FormElement.prototype, "template", {
                get: function () { return this._template; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FormElement.prototype, "_styles", {
                /** standard retrieval to get CSS styles for the form */
                get: function () {
                    return this.constructor.__styles;
                },
                enumerable: true,
                configurable: true
            });
            /** handle creation of the element through copying over an existing element */
            FormElement.prototype._cloneFromFormElement = function (elem) {
                this._parseElemTemplate(elem.template);
            };
            /** parse the template */
            FormElement.prototype._parseElemTemplate = function (template) {
                var _this = this;
                // quit if there is nothing to parse
                if (KIP.isNullOrUndefined(template)) {
                    template = {};
                }
                // set up the label for the element
                this._label = template.label || this._id;
                if (KIP.isNullOrUndefined(this._label)) {
                    this._label = this._id;
                }
                // set the appropriate type
                this._type = template.type || this._type;
                // set the appropriate default value
                this._data = template.value;
                if (KIP.isNullOrUndefined(this._data)) {
                    this._data = this._defaultValue;
                }
                // create the appropriate layout
                this._layout = template.layout || Forms.FormElementLayoutEnum.MULTILINE;
                // determine whether we need this element to submit
                this._required = template.required;
                // ensure a particular order of elements
                this._position = template.position;
                // set an appropriate CSS class
                this._cls = KIP.Styles.buildClassString(this._standardCls, this._defaultCls, template.cls, template.required ? "required" : "");
                // Track the validate function
                this._onValidate = template.onValidate;
                // If there's an "other changed" function, register a listener
                this._onOtherChange = template.onOtherChange;
                if (this._onOtherChange) {
                    KIP.Events.addEventListener(Forms.FORM_ELEM_CHANGE, function (ev) { _this._handleOtherChange(ev); }, this._id);
                }
                // save off our template
                this._template = template;
            };
            /** wrapper around the cloning method so we don't run into protection issues  */
            FormElement.prototype._parseElement = function (template, appendToID) {
                if (!appendToID) {
                    appendToID = "";
                }
                return template._createClonedElement(appendToID);
            };
            //#endregion
            //#region Creating elements for a Form Element
            /** creates all elements for this input */
            FormElement.prototype._createElements = function () {
                var _this = this;
                this._elems = {
                    core: KIP.createSimpleElement("", this._cls),
                    error: KIP.createSimpleElement("", "error")
                };
                this._elems.core.appendChild(this._elems.error);
                // Let the child handle actually creating the elements
                this._onCreateElements();
                // register the change listener if we created one
                if (this._elems.input) {
                    this._elems.input.addEventListener("change", function () {
                        _this._changeEventFired();
                    });
                }
                this._createStyles();
            };
            /** draws elements in a table format */
            FormElement.prototype._tableLayout = function () {
                // build the cells that will hold the elements
                var cells = [];
                for (var i = 0; i < 2; i += 1) {
                    var cell = KIP.createElement({
                        type: "td",
                        cls: "frmCel"
                    });
                    cells[i] = cell;
                }
                // add the label and the input to the table cells
                if (this._elems.lbl) {
                    cells[0].appendChild(this._elems.lbl);
                }
                if (this._elems.input) {
                    cells[1].appendChild(this._elems.input);
                }
                // create the actual table element & add it to the core element
                this._elems.table = KIP.createTable("", "", cells);
                this._elems.core.appendChild(this._elems.table);
            };
            /** handle a flex layout of label: elem */
            FormElement.prototype._flexLayout = function () {
                this._addStandardElemsToCore();
                KIP.addClass(this._elems.core, "flex");
            };
            /** handle a multiline layout of label on top of input */
            FormElement.prototype._multiLineLayout = function () {
                this._addStandardElemsToCore();
                KIP.addClass(this._elems.core, "multiline");
            };
            /** handle displaying the label element after the input */
            FormElement.prototype._labelAfterLayout = function () {
                this._elems.core.appendChild(this._elems.input);
                this._elems.core.appendChild(this._elems.lbl);
            };
            FormElement.prototype._addStandardElemsToCore = function () {
                this._elems.core.appendChild(this._elems.lbl);
                this._elems.core.appendChild(this._elems.input);
            };
            /** helper to handle an elements layout based on their config */
            FormElement.prototype._handleStandardLayout = function () {
                var l = Forms.FormElementLayoutEnum;
                switch (this._layout) {
                    // label displays in table cell, elemnt in other table cell
                    case l.TABLE:
                        this._tableLayout();
                        return true;
                    // label displays before element inline
                    case l.FLEX:
                        this._flexLayout();
                        return true;
                    // label displays line above element
                    case l.MULTILINE:
                        this._multiLineLayout();
                        return true;
                    // label displays after the input
                    case l.LABEL_AFTER:
                        this._labelAfterLayout();
                        return true;
                }
                return false;
            };
            //#endregion
            //#region Publicly-accessible functions 
            /**
             * handle saving the data from this form
             * @returns The data contained within this form element
             */
            FormElement.prototype.save = function (internalUpdate) {
                // return the data that was created
                return this._data;
            };
            /**
             * handle when someone gives us new data programmatically
             * @param data - The data to use for this FormElement
             */
            FormElement.prototype.update = function (data) {
                this._onClear();
                if (KIP.isNullOrUndefined(data)) {
                    data = this._defaultValue;
                }
                this._data = data;
                if (this._elems.input) {
                    this._elems.input.value = data;
                }
            };
            /**
             * render a particular form element
             * @param parent - The parent element that should be used to render this element
             */
            FormElement.prototype.render = function (parent) {
                // update the parent & quit if it's null
                this._parent = parent || this._parent;
                if (!this._parent) {
                    return;
                }
                // add this core element to the parent
                this._parent.appendChild(this._elems.core);
            };
            /**
             * Clears all data in this particular element
             */
            FormElement.prototype.clear = function () {
                return this._onClear();
            };
            //#endregion
            //#region Handle changes to the element's data 
            FormElement.prototype._changeEventFired = function () {
                this._clearErrors();
                // call the child's version of the validation
                if (this._onChange()) {
                    // let the listeners know that this succeeded
                    this._dispatchChangeEvent();
                }
            };
            /** clear all of the errors */
            FormElement.prototype._clearErrors = function () {
                if (this._elems.error) {
                    this._elems.error.innerHTML = "";
                }
            };
            /** handle the shared validation function */
            FormElement.prototype._validate = function (data) {
                // run it through the eval function
                if (this._onValidate) {
                    if (!this._onValidate(data)) {
                        return false;
                    }
                }
                return true;
            };
            /** display a default error message */
            FormElement.prototype._onValidateError = function (msg) {
                if (!msg) {
                    msg = "uh-oh: " + this._id + "'s data couldn't be saved";
                }
                console.log(msg);
                /** if we have an error element, fill it with the error */
                if (this._elems.error) {
                    this._elems.error.innerHTML = msg;
                }
                /** update the thing */
                if (this._elems.input) {
                    this._elems.input.value = this._data;
                }
            };
            /** let any listeners know that we updated our stuff */
            FormElement.prototype._dispatchChangeEvent = function (subkey) {
                KIP.Events.dispatchEvent(Forms.FORM_ELEM_CHANGE, {
                    key: this._id,
                    subkey: subkey,
                    data: this._data
                });
            };
            /** wrapper around our listener to ensure the data gets parsed appropriately */
            FormElement.prototype._handleOtherChange = function (ev) {
                if (!this._onOtherChange) {
                    return;
                }
                this._onOtherChange(ev.context.key, ev.context.data, this);
            };
            //#endregion
            //#region Standard functions for reuse
            FormElement.prototype._standardValidation = function (value) {
                if (!this._validate(value)) {
                    this._onValidateError();
                    return false;
                }
                this._data = value;
                return true;
            };
            /** create a standard input based on the form type */
            FormElement.prototype._createStandardInput = function () {
                this._elems.input = Forms.createInputElement(this._id + "|input", "input", Forms.FormElementTypeEnum[this.type], this._data);
            };
            /** create a standard label for the input */
            FormElement.prototype._createStandardLabel = function (embedIn) {
                this._elems.lbl = Forms.createLabelForInput(this._label, this._id, "lbl", embedIn);
            };
            FormElement.prototype._createStandardLabeledInput = function (shouldEmbed) {
                this._createStandardInput();
                this._createStandardLabel((shouldEmbed ? this._elems.input : null));
            };
            FormElement.prototype._onClear = function () {
                this._data = this._defaultValue;
                if (this._elems.input) {
                    this._elems.input.value = this._defaultValue;
                }
            };
            /** placeholder for individual CSS styles */
            FormElement.__styles = {};
            return FormElement;
        }(KIP.Styles.Stylable));
        Forms.FormElement = FormElement;
    })(Forms = KIP.Forms || (KIP.Forms = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Forms;
    (function (Forms) {
        /**
         * create a checkbox form element
         * @version 1.0
         */
        var CheckElement = (function (_super) {
            __extends(CheckElement, _super);
            function CheckElement() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this._styles = CheckElement.__styles;
                return _this;
            }
            Object.defineProperty(CheckElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.CHECKBOX; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CheckElement.prototype, "_defaultValue", {
                get: function () { return false; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CheckElement.prototype, "_defaultCls", {
                get: function () { return "check"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(CheckElement.prototype, "_layout", {
                get: function () { return Forms.FormElementLayoutEnum.LABEL_AFTER; },
                enumerable: true,
                configurable: true
            });
            /** create the check elements */
            CheckElement.prototype._onCreateElements = function () {
                this._createStandardInput();
                // Create the custom UI for the checkbox
                this._elems.lbl = Forms.createLabelForInput("", this._id + "|input", "", this._elems.core);
                this._elems.inputBox = KIP.createSimpleElement("", "inputBox", "", null, null, this._elems.lbl);
                this._elems.inputInnerBox = KIP.createSimpleElement("", "innerInputBox", "", null, null, this._elems.inputBox);
                this._elems.innerLbl = KIP.createSimpleElement("", "innerLbl", this._label, null, null, this._elems.lbl);
                this._handleStandardLayout();
            };
            /** handle when the checkbox is clicked */
            CheckElement.prototype._onChange = function () {
                var value = this._elems.input.checked;
                return this._standardValidation(value);
            };
            /** clone the appropriate element */
            CheckElement.prototype._createClonedElement = function (appendToID) {
                return new CheckElement(this._id + appendToID, this);
            };
            /** update the contents of the element */
            CheckElement.prototype.update = function (data) {
                this._data = data;
                this._elems.input.checked = data;
            };
            CheckElement.__styles = {
                '.kipFormElem input[type="checkbox"]': {
                    display: "none",
                    zoom: "1.5",
                    width: "18px",
                    height: "18px",
                    margin: "0",
                    marginRight: "5px",
                    border: "1px solid <0>"
                },
                ".kipFormElem input[type='checkbox'] + label": {
                    display: "flex"
                },
                '.kipFormElem input[type="checkbox"] + label .inputBox': {
                    width: "18px",
                    height: "18px",
                    margin: "0",
                    marginRight: "5px",
                    border: "1px solid <0>",
                    position: "relative",
                    boxSizing: "content-box",
                    flexShrink: "0",
                    marginTop: "4px"
                },
                ".kipFormElem input[type='checkbox'] + label .inputBox .innerInputBox": {
                    position: "absolute",
                    width: "0",
                    height: "0",
                    left: "9px",
                    top: "9px",
                    backgroundColor: "<0>",
                    transition: "all ease-in-out .1s"
                },
                ".kipFormElem input[type='checkbox']:checked + label .inputBox .innerInputBox, .kipFormElem input[type='checkbox']:checked + label:hover .inputBox .innerInputBox": {
                    left: "2px",
                    top: "2px",
                    width: "14px",
                    height: "14px"
                },
                ".kipFormElem input[type='checkbox'] + label:hover .inputBox .innerInputBox": {
                    left: "4px",
                    top: "4px",
                    width: "10px",
                    height: "10px",
                    opacity: "0.7"
                }
            };
            return CheckElement;
        }(Forms.FormElement));
        Forms.CheckElement = CheckElement;
        /**
         * create a text element for a form
         * @version 1.0
         */
        var TextElement = (function (_super) {
            __extends(TextElement, _super);
            function TextElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(TextElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.TEXT; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TextElement.prototype, "_defaultValue", {
                get: function () { return ""; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TextElement.prototype, "_defaultCls", {
                get: function () { return "text"; },
                enumerable: true,
                configurable: true
            });
            TextElement.prototype._onCreateElements = function () {
                this._createStandardLabeledInput(false);
                this._handleStandardLayout();
            };
            TextElement.prototype._onChange = function () {
                var value = this._elems.input.value;
                return this._standardValidation(value);
            };
            TextElement.prototype._createClonedElement = function (appendToID) {
                return new TextElement(this._id + appendToID, this);
            };
            return TextElement;
        }(Forms.FormElement));
        Forms.TextElement = TextElement;
        /**
         * create a text area element for a form
         * @version 1.0
         */
        var TextAreaElement = (function (_super) {
            __extends(TextAreaElement, _super);
            function TextAreaElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(TextAreaElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.TEXTAREA; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TextAreaElement.prototype, "_defaultValue", {
                get: function () { return ""; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TextAreaElement.prototype, "_defaultCls", {
                get: function () { return "textarea"; },
                enumerable: true,
                configurable: true
            });
            TextAreaElement.prototype._onCreateElements = function () {
                var input = Forms.createInputElement(this._id, "input", "textarea", this._data);
                this._elems.input = input;
                this._elems.lbl = Forms.createLabelForInput(this._label, this._id, "lbl");
                this._handleStandardLayout();
            };
            TextAreaElement.prototype._onChange = function () {
                var value = this._elems.input.value;
                value = value.replace(/\n/g, "<br>");
                value = value.replace(/    /g, "&nbsp;&nbsp;&nbsp;&nbsp;");
                return this._standardValidation(value);
            };
            TextAreaElement.prototype._createClonedElement = function (appendToID) {
                return new TextAreaElement(this._id + appendToID, this);
            };
            TextAreaElement.prototype.update = function (data) {
                this._data = data;
                if (!this._data) {
                    return;
                }
                var displayStr = data.replace(/<br>/g, "\n");
                displayStr = displayStr.replace(/\&nbsp;/g, " ");
                this._elems.input.value = displayStr;
            };
            return TextAreaElement;
        }(Forms.FormElement));
        Forms.TextAreaElement = TextAreaElement;
        /**
         * create a date element for a form
         * @version 1.0
         */
        var DateElement = (function (_super) {
            __extends(DateElement, _super);
            function DateElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(DateElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.DATE; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DateElement.prototype, "_defaultValue", {
                get: function () { return null; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DateElement.prototype, "_defaultCls", {
                get: function () { return "date"; },
                enumerable: true,
                configurable: true
            });
            /** create the display for the date element */
            DateElement.prototype._onCreateElements = function () {
                this._createStandardLabeledInput();
                this._handleStandardLayout();
            };
            DateElement.prototype._onChange = function () {
                // first convert the string value to a date
                var value = this._elems.input.value;
                var dateValue = KIP.Dates.inputToDate(value);
                // run standard validations
                return this._standardValidation(dateValue);
            };
            DateElement.prototype._createClonedElement = function (appendToID) {
                return new DateElement(this._id + appendToID, this);
            };
            DateElement.prototype.update = function (data) {
                this._data = data;
                if (!this._elems.input) {
                    return;
                }
                this._elems.input.value = KIP.Dates.inputDateFmt(data);
            };
            return DateElement;
        }(Forms.FormElement));
        Forms.DateElement = DateElement;
        /**
         * create a time element for a form
         * @version 1.0
         */
        var TimeElement = (function (_super) {
            __extends(TimeElement, _super);
            function TimeElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(TimeElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.TIME; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TimeElement.prototype, "_defaultValue", {
                get: function () { return null; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TimeElement.prototype, "_defaultCls", {
                get: function () { return "time"; },
                enumerable: true,
                configurable: true
            });
            TimeElement.prototype._onCreateElements = function () {
                this._createStandardLabeledInput();
                this._handleStandardLayout();
            };
            TimeElement.prototype._onChange = function () {
                var value = this._elems.input.value;
                var dateValue = KIP.Dates.inputToDate("", value);
                return this._standardValidation(dateValue);
            };
            TimeElement.prototype._createClonedElement = function (appendToID) {
                return new TimeElement(this._id + appendToID, this);
            };
            TimeElement.prototype.update = function (data) {
                this._data = data;
                if (!this._elems.input) {
                    return;
                }
                this._elems.input.value = KIP.Dates.shortTime(data);
            };
            return TimeElement;
        }(Forms.FormElement));
        Forms.TimeElement = TimeElement;
        /**
         * create an element to collect date and time for a form
         * @version 1.0
         */
        var DateTimeElement = (function (_super) {
            __extends(DateTimeElement, _super);
            function DateTimeElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(DateTimeElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.DATE_TIME; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DateTimeElement.prototype, "_defaultValue", {
                get: function () { return null; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DateTimeElement.prototype, "_defaultCls", {
                get: function () { return "dateTime"; },
                enumerable: true,
                configurable: true
            });
            DateTimeElement.prototype._onCreateElements = function () {
                var _this = this;
                this._createStandardLabel(this._elems.core);
                this._elems.inputWrapper = KIP.createSimpleElement("", "inputs", "", null, null, this._elems.core);
                // draw the date
                var dateLbl = KIP.createSimpleElement("", "lbl", "Date: ", null, null, this._elems.inputWrapper);
                this._elems.dateInput = Forms.createInputElement("", "dateInput", "date", this._data, null, null, this._elems.inputWrapper);
                this._elems.dateInput.addEventListener("change", function () {
                    _this._changeEventFired();
                });
                // draw the time
                var timeVal = (this._data ? KIP.Dates.shortTime(this._data) : "");
                var timeLbl = KIP.createSimpleElement("", "lbl", "Time: ", null, null, this._elems.inputWrapper);
                this._elems.timeInput = Forms.createInputElement("", "timeInput", "time", timeVal, null, null, this._elems.inputWrapper);
                this._elems.timeInput.addEventListener("change", function () {
                    _this._changeEventFired();
                });
            };
            DateTimeElement.prototype._onChange = function () {
                var timeStr = this._elems.timeInput.value;
                var dateStr = this._elems.dateInput.value;
                var date = KIP.Dates.inputToDate(dateStr, timeStr);
                return this._standardValidation(date);
            };
            DateTimeElement.prototype._createClonedElement = function (appendToID) {
                return new DateTimeElement(this._id + appendToID, this);
            };
            DateTimeElement.prototype.update = function (data) {
                this._onClear();
                this._data = data;
                if (this._elems.dateInput) {
                    this._elems.dateInput.value = KIP.Dates.inputDateFmt(data);
                }
                if (this._elems.timeInput) {
                    this._elems.timeInput.value = KIP.Dates.shortTime(data);
                }
            };
            DateTimeElement.__styles = {
                ".kipFormElem.dateTime .inputs": {
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap"
                },
                ".kipFormElem.dateTime .inputs input": {
                    marginRight: "20px",
                    flexGrow: "1",
                    minWidth: "150px"
                },
                ".kipFormElem.dateTime .inputs .lbl": {
                    flexShrink: "1",
                    maxWidth: "50px",
                    marginTop: "4px"
                }
            };
            return DateTimeElement;
        }(Forms.FormElement));
        Forms.DateTimeElement = DateTimeElement;
        /**
         * create a dropdown for a form
         * @version 1.0
         */
        var SelectElement = (function (_super) {
            __extends(SelectElement, _super);
            /** create the select element */
            function SelectElement(id, template) {
                return _super.call(this, id, template) || this;
            }
            Object.defineProperty(SelectElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.SELECT; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SelectElement.prototype, "_defaultValue", {
                get: function () { return 0; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SelectElement.prototype, "_defaultCls", {
                get: function () { return "select"; },
                enumerable: true,
                configurable: true
            });
            /** handle cloning an additional element */
            SelectElement.prototype._cloneFromFormElement = function (data) {
                _super.prototype._cloneFromFormElement.call(this, data);
                this._options = data._options;
            };
            SelectElement.prototype._parseElemTemplate = function (template) {
                _super.prototype._parseElemTemplate.call(this, template);
                this._options = template.options;
            };
            SelectElement.prototype._onCreateElements = function () {
                this._elems.input = Forms.createSelectElement(this._id, "input", this._options);
                this._createStandardLabel();
                this._handleStandardLayout();
            };
            SelectElement.prototype._onChange = function () {
                var value = +this._elems.input.value;
                return this._standardValidation(value);
            };
            SelectElement.prototype._createClonedElement = function (appendToID) {
                return new SelectElement(this._id + appendToID, this);
            };
            return SelectElement;
        }(Forms.FormElement));
        Forms.SelectElement = SelectElement;
        /**
         * create a number element for a form
         * @version 1.0
         */
        var NumberElement = (function (_super) {
            __extends(NumberElement, _super);
            function NumberElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(NumberElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.NUMBER; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NumberElement.prototype, "_defaultValue", {
                get: function () { return 0; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NumberElement.prototype, "_defaultCls", {
                get: function () { return "number"; },
                enumerable: true,
                configurable: true
            });
            NumberElement.prototype._onCreateElements = function () {
                this._createStandardLabeledInput();
                this._handleStandardLayout();
            };
            NumberElement.prototype._onChange = function () {
                var value = +this._elems.input.value;
                return this._standardValidation(value);
            };
            NumberElement.prototype._createClonedElement = function (appendToID) {
                return new NumberElement(this._id + appendToID, this);
            };
            return NumberElement;
        }(Forms.FormElement));
        Forms.NumberElement = NumberElement;
        /**
         * handle a data element that will be set, but not displayed to the user
         * @version 1.0
         */
        var HiddenElement = (function (_super) {
            __extends(HiddenElement, _super);
            function HiddenElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(HiddenElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.HIDDEN; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(HiddenElement.prototype, "_defaultCls", {
                get: function () { return "hidden"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(HiddenElement.prototype, "_defaultValue", {
                get: function () { return null; },
                enumerable: true,
                configurable: true
            });
            HiddenElement.prototype._onCreateElements = function () { };
            HiddenElement.prototype._onChange = function () {
                return true;
            };
            HiddenElement.prototype._createClonedElement = function (appendToID) {
                return new HiddenElement(this.id + appendToID, this);
            };
            HiddenElement.prototype.save = function () {
                return this._data;
            };
            HiddenElement.__styles = {
                "kipFormElem.hidden": {
                    display: "none"
                }
            };
            return HiddenElement;
        }(Forms.FormElement));
        Forms.HiddenElement = HiddenElement;
    })(Forms = KIP.Forms || (KIP.Forms = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Forms;
    (function (Forms) {
        /**
         * Create a collapsible element of the form
         * @version 1.0
         */
        var CollapsibleElement = (function (_super) {
            __extends(CollapsibleElement, _super);
            function CollapsibleElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            //#endregion
            //#region CREATE ELEMENTS
            CollapsibleElement.prototype._createCollapsibleTitle = function () {
                var _this = this;
                this._elems.titleContainer = KIP.createSimpleElement("", "sectionHeaderContainer", "", null, null, this._elems.core);
                this._elems.title = KIP.createSimpleElement("", "sectionHeader", this._label, null, null, this._elems.titleContainer);
                this._elems.collapseElem = KIP.createSimpleElement("", "caret", "\u25B5", null, null, this._elems.titleContainer);
                this._elems.titleContainer.addEventListener("click", function () { _this._onCaretClicked(); });
                // add a tracking class to the core element
                KIP.addClass(this._elems.core, "collapsible");
                // start collapsed
                this.collapse();
            };
            //#endregion
            //#region HANDLE EXPAND + COLLAPSE
            CollapsibleElement.prototype._onCaretClicked = function () {
                if (this._isCollapsed) {
                    this.expand();
                }
                else {
                    this.collapse();
                }
            };
            CollapsibleElement.prototype.collapse = function () {
                KIP.addClass(this._elems.core, "collapsed");
                this._isCollapsed = true;
            };
            CollapsibleElement.prototype.expand = function () {
                KIP.removeClass(this._elems.core, "collapsed");
                this._isCollapsed = false;
            };
            CollapsibleElement.__styles = {
                ".kipFormElem.collapsible .formChildren": {
                    maxHeight: "100%"
                },
                ".kipFormElem.collapsible.collapsed .formChildren": {
                    maxHeight: "0px",
                    overflow: "hidden"
                },
                ".kipFormElem.collapsible .sectionHeaderContainer": {
                    display: "flex",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    padding: "10px 10px",
                    borderRadius: "3px",
                    alignItems: "center"
                },
                ".kipFormElem.collapsible .caret": {
                    transformOrigin: "50% 50%",
                    width: ".8em",
                    fontSize: "1em",
                    transition: "all ease-in-out .1s",
                    cursor: "pointer"
                },
                ".kipFormElem.collapsible.collapsed .caret": {
                    transform: "rotate(180deg)"
                },
                ".kipFormElem.collapsible .sectionHeaderContainer:hover": {
                    backgroundColor: "#eee"
                }
            };
            return CollapsibleElement;
        }(Forms.FormElement));
        Forms.CollapsibleElement = CollapsibleElement;
        /**
         * create an element in the form that will contain other elements of a form
         * @version 1.0
         */
        var SectionElement = (function (_super) {
            __extends(SectionElement, _super);
            //#endregion
            //#region CONSTRUCT AND CREATE ELEMENTS
            /** create a section element */
            function SectionElement(id, template, children) {
                var _this = _super.call(this, id, template) || this;
                if (Forms.isFormElement(template)) {
                    children = template.children;
                }
                _this._parseChildren(children);
                return _this;
            }
            Object.defineProperty(SectionElement.prototype, "_styles", {
                get: function () { return this._mergeThemes(SectionElement.__styles, CollapsibleElement.__styles); },
                enumerable: true,
                configurable: true
            });
            /** update the appropriate theme color for the form */
            SectionElement.prototype.setThemeColor = function (idx, color) {
                _super.prototype.setThemeColor.call(this, idx, color);
                if (!this._children) {
                    return;
                }
                if (Forms.isFormElement(this._children)) {
                    this._children.setThemeColor(idx, color);
                }
                else {
                    KIP.map(this._children, function (child) {
                        child.setThemeColor(idx, color);
                    });
                }
            };
            Object.defineProperty(SectionElement.prototype, "children", {
                get: function () { return this._children; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SectionElement.prototype, "_defaultCls", {
                /** handle the defaults that all form elements need */
                get: function () { return "kipFormElem section"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SectionElement.prototype, "_defaultValue", {
                get: function () { return {}; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SectionElement.prototype, "_type", {
                /** use a section type */
                get: function () { return Forms.FormElementTypeEnum.SECTION; },
                enumerable: true,
                configurable: true
            });
            /** create elements for the section */
            SectionElement.prototype._onCreateElements = function () {
                // Create the title for the section
                this._createCollapsibleTitle();
                // Create the form children section
                this._elems.childrenContainer = KIP.createSimpleElement("", "formChildren", "", null, null, this._elems.core);
                this._createStyles();
            };
            /** create a clone of this element */
            SectionElement.prototype._createClonedElement = function (appendToID) {
                return new SectionElement(this._id + appendToID, this);
            };
            //#endregion
            //#region PARSE THE CHILDREN OF A SECTION
            /** parse the children array of this form element */
            SectionElement.prototype._parseChildren = function (children) {
                var _this = this;
                // quit if there isn't any data
                if (!children) {
                    return;
                }
                // Handle when there is just a single element inside of this section
                if (Forms.isFormElement(children)) {
                    var elem = this._parseChild(children);
                    this._children = elem;
                    return;
                    // handle when there is a list of children
                }
                else {
                    this._children = {};
                    // go through each of the children
                    KIP.map(children, function (template, key) {
                        var elem = _this._parseChild(template);
                        _this._children[key] = elem;
                    });
                }
            };
            SectionElement.prototype._parseChild = function (child) {
                var _this = this;
                var elem = this._parseElement(child);
                this._applyColors(elem);
                elem.render(this._elems.childrenContainer);
                KIP.Events.addEventListener(Forms.FORM_ELEM_CHANGE, function (event) {
                    var key = event.context.key;
                    if (key !== elem.id) {
                        return;
                    }
                    window.setTimeout(function () {
                        _this._updateInternalData(true);
                        _this._dispatchChangeEvent();
                    }, 0);
                }, this._id + "|" + elem.id);
                return elem;
            };
            SectionElement.prototype._updateInternalData = function (internalOnly) {
                var _this = this;
                var elem;
                if (Forms.isFormElement(this._children)) {
                    this._data = this._children.save(internalOnly);
                }
                else {
                    if (this._data === null) {
                        return;
                    }
                    KIP.map(this._children, function (elem, key) {
                        _this._data[key] = elem.save(internalOnly);
                    });
                }
            };
            //#endregion
            //#region OVERRIDE SPECIAL BEHAVIOR FOR SECTIONS
            SectionElement.prototype.save = function (internalOnly) {
                // save all of the child elements
                this._updateInternalData(internalOnly);
                return this._data;
            };
            SectionElement.prototype._onClear = function () {
                if (Forms.isFormElement(this._children)) {
                    this._children.clear();
                }
                else {
                    KIP.map(this._children, function (elem, key) {
                        elem.clear();
                    });
                }
            };
            //#endregion
            //#region HANDLE CHANGES
            /** update the inter contents of the form */
            SectionElement.prototype.update = function (data) {
                if (!data) {
                    return;
                }
                if (Forms.isFormElement(this._children)) {
                    this._children.update(data);
                }
                else {
                    KIP.map(this._children, function (elem, key) {
                        elem.update(data[key]);
                    });
                }
            };
            /** no validation for section elements */
            SectionElement.prototype._onChange = function () {
                return true;
            };
            /** styles to display this section correctly */
            SectionElement.__styles = {
                ".kipFormElem.section": {
                    marginTop: "10px",
                    marginBottom: "5px"
                },
                ".kipFormElem .sectionHeader": {
                    fontFamily: "OpenSansBold,Segoe UI,Helvetica",
                    fontSize: "1.5em",
                    color: "<0>",
                    fontWeight: "bold",
                },
                ".kipFormElem .section .sectionHeader, .kipFormElem .array .sectionHeader": {
                    fontSize: "1.2em",
                    color: "<1>"
                },
                ".kipFormElem.section .formChildren": {
                    marginLeft: "25px"
                }
            };
            return SectionElement;
        }(CollapsibleElement));
        Forms.SectionElement = SectionElement;
        /**
         * Create an element in the form that can be added to
         * @version 1.0
         */
        var ArrayElement = (function (_super) {
            __extends(ArrayElement, _super);
            //#endregion
            //#region CONSTRUCT THE FORM ELEMENT
            function ArrayElement(id, template, children) {
                var _this = _super.call(this, id, template) || this;
                if (Forms.isFormElement(template)) {
                    _this._childTemplate = template.childTemplate;
                }
                else {
                    _this._childTemplate = children;
                }
                // create the children array; this will be parsed after elements are created
                _this._children = [];
                return _this;
                //this._createNewChild();
            }
            Object.defineProperty(ArrayElement.prototype, "_type", {
                //#region PROPERTIES
                get: function () { return Forms.FormElementTypeEnum.ARRAY; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ArrayElement.prototype, "_defaultValue", {
                get: function () { return []; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ArrayElement.prototype, "_defaultCls", {
                get: function () { return "array"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ArrayElement.prototype, "_styles", {
                get: function () { return this._mergeThemes(ArrayElement.__styles, CollapsibleElement.__styles); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ArrayElement.prototype, "childTemplate", {
                get: function () { return this._childTemplate; },
                enumerable: true,
                configurable: true
            });
            /** update the appropriate theme color for the form */
            ArrayElement.prototype.setThemeColor = function (idx, color) {
                _super.prototype.setThemeColor.call(this, idx, color);
                if (!this._children) {
                    return;
                }
                KIP.map(this._children, function (child) {
                    child.setThemeColor(idx, color);
                });
            };
            ArrayElement.prototype._parseElemTemplate = function (template) {
                _super.prototype._parseElemTemplate.call(this, template);
                this._newLabel = template.newLabel || "+ Add New Element";
            };
            /** create the elements for the array */
            ArrayElement.prototype._onCreateElements = function () {
                var _this = this;
                // show the title
                this._createCollapsibleTitle();
                // handle showing the children
                this._elems.childrenContainer = KIP.createSimpleElement("", "formChildren", "", null, null, this._elems.core);
                this._elems.newButton = KIP.createSimpleElement("", "kipBtn new", this._newLabel, null, null, this._elems.core);
                this._elems.newButton.addEventListener("click", function () {
                    _this._createNewChild();
                });
                this._createStyles();
            };
            /** create a cloned version of this element */
            ArrayElement.prototype._createClonedElement = function (appendToID) {
                return new ArrayElement(this._id + appendToID, this);
            };
            //#endregion
            //#region HANDLE CHANGES
            /** array elements can always change */
            ArrayElement.prototype._onChange = function () {
                return true;
            };
            /** handle when an external force needs to update the form */
            ArrayElement.prototype.update = function (data) {
                var _this = this;
                if (!data) {
                    return;
                }
                // First clear out the existing data
                this._onClear();
                // recreate the children
                data.map(function (elem) {
                    var child = _this._createNewChild();
                    child.update(elem);
                });
            };
            //#endregion
            //#region HANDLE CHILDREN
            /** create a new child element in the array */
            ArrayElement.prototype._createNewChild = function () {
                var _this = this;
                var idx = this._children.length;
                var elem = new ArrayChildElement(this._id + "|" + idx.toString(), this._childTemplate);
                this._applyColors(elem);
                this._children.push(elem);
                elem.render(this._elems.childrenContainer);
                KIP.Events.addEventListener(Forms.FORM_ELEM_CHANGE, function (event) {
                    var key = event.context.key;
                    if (key !== elem.id) {
                        return;
                    }
                    window.setTimeout(function () {
                        _this._updateInternalData(true);
                        _this._dispatchChangeEvent();
                    }, 0);
                }, this.id + "|" + elem.id);
                return elem;
            };
            ArrayElement.prototype._updateInternalData = function (internalOnly) {
                this._data = [];
                var cnt = 0;
                // loop through all of the children we have to update the internal data structure
                for (cnt; cnt < this._children.length; cnt += 1) {
                    var elem = this._children[cnt];
                    if (KIP.isNullOrUndefined(elem)) {
                        continue;
                    }
                    var data = elem.save(internalOnly);
                    if (KIP.isNullOrUndefined(data)) {
                        continue;
                    }
                    this._data.push(data);
                }
            };
            //#endregion
            //#region OVERRIDE STANDARD FUNCTIONS THAT NEED CUSTOM LOGIC
            /** get data from children & return that */
            ArrayElement.prototype.save = function (internalOnly) {
                // save all of the child elements
                this._updateInternalData(internalOnly);
                // return the data that was created
                return this._data;
            };
            /** handle clearing out the array */
            ArrayElement.prototype._onClear = function () {
                var _this = this;
                this._elems.childrenContainer.innerHTML = "";
                this._children.map(function (elem, idx) {
                    _this._children[idx] = null;
                });
            };
            ArrayElement.__styles = {
                ".kipBtn.new": {
                    marginTop: "10px",
                    marginBottom: "10px",
                    marginLeft: "25px",
                    backgroundColor: "<0>",
                    color: "#FFF",
                    width: "calc(33% - 15px)",
                },
                ".kipFormElem.array .arrayChild .arrayChild .kipBtn.new": {
                    width: "100%",
                    display: "block"
                },
                ".kipForm .kipBtn.new:hover": {
                    transform: "scale(1.01)"
                },
                ".kipFormElem.array .formChildren": {
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "top"
                },
                ".kipFormElem.array .formChildren .arrayChild": {
                    maxWidth: "calc(33% - 10px)"
                },
                ".kipFormElem.array .formChildren .arrayChild .arrayChild": {
                    maxWidth: "100%"
                },
                ".kipFormElem.array.collapsed .kipBtn.new": {
                    display: "none"
                }
            };
            return ArrayElement;
        }(CollapsibleElement));
        Forms.ArrayElement = ArrayElement;
        /**
         * Keep track of a child of an array in the form
         * @version 1.0
         */
        var ArrayChildElement = (function (_super) {
            __extends(ArrayChildElement, _super);
            //#endregion
            //#region CONSTRUCT AN ARRAY CHILD ELEMENT
            /** create an element of an array */
            function ArrayChildElement(id, children) {
                return _super.call(this, id.toString(), {}, children) || this;
            }
            Object.defineProperty(ArrayChildElement.prototype, "_type", {
                //#region PROPERTIES
                get: function () { return Forms.FormElementTypeEnum.ARRAY_CHILD; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ArrayChildElement.prototype, "_defaultValue", {
                get: function () { return {}; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ArrayChildElement.prototype, "_defaultCls", {
                get: function () { return "kipFormElem arrayChild"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ArrayChildElement.prototype, "_styles", {
                get: function () { return ArrayChildElement.__styles; },
                enumerable: true,
                configurable: true
            });
            ;
            ArrayChildElement.prototype._onCreateElements = function () {
                var _this = this;
                this._elems.closeBtn = KIP.createSimpleElement("", "close kipBtn", "X", null, null, this._elems.core);
                this._elems.closeBtn.addEventListener("click", function () {
                    _this._delete();
                });
                this._elems.childrenContainer = KIP.createSimpleElement("", "formChildren", "", null, null, this._elems.core);
            };
            ArrayChildElement.prototype._createClonedElement = function (appendToID) {
                return new ArrayChildElement(this._id + appendToID, this._children);
            };
            ArrayChildElement.prototype._parseElement = function (child) {
                return _super.prototype._parseElement.call(this, child, "|" + this._id);
            };
            //#endregion
            //#region HANDLE DELETION
            ArrayChildElement.prototype._delete = function () {
                this._elems.core.parentNode.removeChild(this._elems.core);
                this._data = null;
                this._dispatchChangeEvent();
            };
            ArrayChildElement.__styles = {
                ".kipFormElem.arrayChild": {
                    display: "inline-block",
                    boxShadow: "1px 1px 5px 2px rgba(0,0,0,.2)",
                    borderRadius: "2px",
                    paddingRight: "10px",
                    position: "relative",
                    paddingBottom: "10px",
                    marginRight: "10px",
                    marginBottom: "10px"
                },
                ".kipFormElem.arrayChild .formChildren": {
                    marginLeft: "10px"
                }
            };
            return ArrayChildElement;
        }(SectionElement));
        Forms.ArrayChildElement = ArrayChildElement;
    })(Forms = KIP.Forms || (KIP.Forms = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Forms;
    (function (Forms) {
        /**
     * template for toggle buttons
     * @version 1.0
     */
        var ToggleButtonElement = (function (_super) {
            __extends(ToggleButtonElement, _super);
            function ToggleButtonElement(id, template) {
                return _super.call(this, id, template) || this;
            }
            Object.defineProperty(ToggleButtonElement.prototype, "_type", {
                /** shared properties across both types of toggle buttons */
                get: function () { return Forms.FormElementTypeEnum.TOGGLE_BUTTON; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ToggleButtonElement.prototype, "_defaultCls", {
                get: function () { return "toggleBtns"; },
                enumerable: true,
                configurable: true
            });
            ToggleButtonElement.prototype._parseElemTemplate = function (template) {
                _super.prototype._parseElemTemplate.call(this, template);
                this._options = template.options;
            };
            /** handle cloning an additional element */
            ToggleButtonElement.prototype._cloneFromFormElement = function (data) {
                _super.prototype._cloneFromFormElement.call(this, data);
                this._options = data._options;
            };
            /** create the elements needed for toggle buttons */
            ToggleButtonElement.prototype._onCreateElements = function () {
                this._createStandardLabel(this._elems.core);
                this._elems.childrenContainer = KIP.createSimpleElement("", "formChildren", "", null, null, this._elems.core);
                this._createOptionsElements();
            };
            ToggleButtonElement.prototype._createOptionsElements = function () {
                var _this = this;
                KIP.map(this._options, function (elem) {
                    _this._createOptionElement(elem);
                });
            };
            ToggleButtonElement.prototype._createOptionElement = function (elem) {
                var _this = this;
                var btn = KIP.createSimpleElement(this._id + "btn" + elem.value, "toggleBtn", elem.label, null, null, this._elems.childrenContainer);
                if (this._shouldBeSelected(elem)) {
                    this._selectBtn(btn, elem.value);
                }
                btn.addEventListener("click", function () {
                    _this._selectBtn(btn, elem.value);
                    _this._changeEventFired();
                });
            };
            ToggleButtonElement.prototype._onChange = function () {
                var value = this._data;
                return this._standardValidation(value);
            };
            ToggleButtonElement.prototype.update = function (data) {
                this._data = data;
                var btn = document.getElementById(this._id + "btn" + data);
                this._selectBtn(btn, data);
            };
            ToggleButtonElement.prototype._onClear = function () { };
            /** static styles for the toggle buttons */
            ToggleButtonElement.__styles = {
                ".toggleBtns": {
                    width: "800px"
                },
                ".toggleBtns .formChildren": {
                    display: "flex",
                    flexWrap: "wrap"
                },
                ".toggleBtn": {
                    borderRadius: "2px",
                    boxShadow: "1px 1px 4px 2px rgba(0,0,0,.1)",
                    padding: "4px",
                    margin: "4px",
                    cursor: "pointer",
                    textAlign: "center",
                    fontSize: "0.8em",
                    border: "1px solid transparent",
                    opacity: "0.7"
                },
                ".toggleBtn.selected, .toggleBtn:hover": {
                    border: "1px solid <0>",
                    transform: "scale(1.08)"
                },
                ".toggleBtn.selected": {
                    opacity: "1"
                }
            };
            return ToggleButtonElement;
        }(Forms.FormElement));
        Forms.ToggleButtonElement = ToggleButtonElement;
        /**
         * toggle buttons as equivalent to radio buttons
         * @version 1.0
         */
        var SingleSelectButtonElem = (function (_super) {
            __extends(SingleSelectButtonElem, _super);
            function SingleSelectButtonElem(id, template) {
                return _super.call(this, id, template) || this;
            }
            Object.defineProperty(SingleSelectButtonElem.prototype, "_defaultValue", {
                get: function () { return null; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SingleSelectButtonElem.prototype, "_multiSelect", {
                get: function () { return false; },
                enumerable: true,
                configurable: true
            });
            SingleSelectButtonElem.prototype._parseElemTemplate = function (template) {
                _super.prototype._parseElemTemplate.call(this, template);
            };
            /** handle a button being selected */
            SingleSelectButtonElem.prototype._selectBtn = function (btn, value) {
                if (!btn) {
                    return;
                }
                if (this._selectedBtn) {
                    KIP.removeClass(this._selectedBtn, "selected");
                }
                if (this._selectedBtn === btn) {
                    this._data = this._defaultValue;
                    return;
                }
                this._data = value;
                this._selectedBtn = btn;
                KIP.addClass(btn, "selected");
            };
            SingleSelectButtonElem.prototype._createClonedElement = function (appendToID) {
                return new SingleSelectButtonElem(this._id + appendToID, this);
            };
            SingleSelectButtonElem.prototype._shouldBeSelected = function (elem) {
                return this._data === elem.value;
            };
            SingleSelectButtonElem.prototype._onClear = function () {
                if (this._selectedBtn) {
                    KIP.removeClass(this._selectedBtn, "selected");
                    this._selectBtn = null;
                }
                this._data = this._defaultValue;
            };
            return SingleSelectButtonElem;
        }(ToggleButtonElement));
        Forms.SingleSelectButtonElem = SingleSelectButtonElem;
        /**
         * toggle buttons as multi-select options
         * @version 1.0
         */
        var MultiSelectButtonElem = (function (_super) {
            __extends(MultiSelectButtonElem, _super);
            function MultiSelectButtonElem(id, template) {
                return _super.call(this, id, template) || this;
            }
            Object.defineProperty(MultiSelectButtonElem.prototype, "_multiSelect", {
                get: function () { return true; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MultiSelectButtonElem.prototype, "_defaultValue", {
                get: function () { return []; },
                enumerable: true,
                configurable: true
            });
            MultiSelectButtonElem.prototype._parseElemTemplate = function (template) {
                _super.prototype._parseElemTemplate.call(this, template);
                this._selectedBtns = [];
            };
            MultiSelectButtonElem.prototype.update = function (data) {
                var _this = this;
                if (KIP.isNullOrUndefined(data)) {
                    return;
                }
                this._onClear();
                // map all of the elements
                data.map(function (elem) {
                    var btn = document.getElementById(_this._id + "btn" + elem);
                    _this._selectBtn(btn, elem);
                });
            };
            MultiSelectButtonElem.prototype._shouldBeSelected = function (elem) {
                var dIdx = this._indexOf(elem.value);
                return (dIdx !== -1);
            };
            MultiSelectButtonElem.prototype._createClonedElement = function (appendToID) {
                return new MultiSelectButtonElem(this.id + appendToID, this);
            };
            MultiSelectButtonElem.prototype._selectBtn = function (btn, value) {
                if (!btn) {
                    return;
                }
                // handle the case where the button was already selected
                var selectedIdx = this._selectedBtns.indexOf(btn);
                var dataIdx = this._indexOf(value);
                if ((dataIdx !== -1) && (selectedIdx === -1)) {
                    return;
                }
                else if (selectedIdx != -1) {
                    if (selectedIdx !== -1) {
                        KIP.removeClass(btn, "selected");
                        this._selectedBtns.splice(selectedIdx, 1);
                    }
                    if (dataIdx !== -1) {
                        this._data.splice(dataIdx, 1);
                    }
                }
                else {
                    this._data.push(value);
                    this._selectedBtns.push(btn);
                    KIP.addClass(btn, "selected");
                }
            };
            MultiSelectButtonElem.prototype._indexOf = function (value) {
                var outIdx = -1;
                for (var idx = 0; idx < this._data.length; idx += 1) {
                    var elem = this._data[idx];
                    if (this._equalTo(elem, value)) {
                        outIdx = idx;
                        break;
                    }
                }
                return outIdx;
            };
            MultiSelectButtonElem.prototype._equalTo = function (dataA, dataB) {
                switch (typeof dataA) {
                    case "string":
                    case "number":
                    case "boolean":
                        return (dataA === dataB);
                }
                if (dataA instanceof Date) {
                    return (KIP.Dates.shortDate(dataA) === KIP.Dates.shortDate(dataB));
                }
                return (dataA === dataB);
            };
            MultiSelectButtonElem.prototype._onClear = function () {
                this._data = [];
                // unselect everything
                for (var idx = (this._selectedBtns.length - 1); idx >= 0; idx -= 1) {
                    var elem = this._selectedBtns[idx];
                    KIP.removeClass(elem, "selected");
                    this._selectedBtns.splice(idx, 1);
                }
                ;
            };
            return MultiSelectButtonElem;
        }(ToggleButtonElement));
        Forms.MultiSelectButtonElem = MultiSelectButtonElem;
    })(Forms = KIP.Forms || (KIP.Forms = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Forms;
    (function (Forms) {
        /**
         * handle file uploads such that they return a file list
         * @version 1.0
         */
        var FileUploadElement = (function (_super) {
            __extends(FileUploadElement, _super);
            function FileUploadElement(id, template) {
                return _super.call(this, id, template) || this;
            }
            Object.defineProperty(FileUploadElement.prototype, "_type", {
                get: function () { return Forms.FormElementTypeEnum.FILE_UPLOAD; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FileUploadElement.prototype, "_defaultCls", {
                get: function () { return "file"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FileUploadElement.prototype, "_defaultValue", {
                get: function () { return null; },
                enumerable: true,
                configurable: true
            });
            FileUploadElement.prototype._parseElemTemplate = function (template) {
                _super.prototype._parseElemTemplate.call(this, template);
                this._attr = template.attr;
            };
            FileUploadElement.prototype._onCreateElements = function () {
                this._createStandardLabel(this._elems.core);
                this._elems.input = Forms.createInputElement("", "", "file", this._data, null, null, this._elems.core);
            };
            FileUploadElement.prototype._onChange = function () {
                var files = this._elems.input.files;
                return this._standardValidation(files);
            };
            FileUploadElement.prototype._createClonedElement = function (appendToId) {
                return new FileUploadElement(this.id + appendToId, this);
            };
            FileUploadElement.__styles = {};
            return FileUploadElement;
        }(Forms.FormElement));
        Forms.FileUploadElement = FileUploadElement;
        /**
         * handle a file-upload field that supports just a file path
         * @version 1.0
         */
        var FilePathElement = (function (_super) {
            __extends(FilePathElement, _super);
            //#endregion
            function FilePathElement(id, template) {
                return _super.call(this, id, template) || this;
            }
            Object.defineProperty(FilePathElement.prototype, "_type", {
                /** select the appropriate type for the file path type */
                get: function () { return Forms.FormElementTypeEnum.FILE_PATH; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FilePathElement.prototype, "_defaultCls", {
                /** set a default class for file-path elements */
                get: function () { return "filepath"; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FilePathElement.prototype, "_defaultValue", {
                /** set a default value for file-path elements */
                get: function () { return ""; },
                enumerable: true,
                configurable: true
            });
            FilePathElement.prototype._parseElemTemplate = function (template) {
                _super.prototype._parseElemTemplate.call(this, template);
                this._onSaveCallback = template.onSave;
                this._onChangeCallback = template.onChange;
                this._attr = template.attr;
            };
            FilePathElement.prototype._onCreateElements = function () {
                this._createStandardLabel(this._elems.core);
                this._elems.display = KIP.createSimpleElement("", "display", this._data, null, null, this._elems.core);
                this._elems.inputContainer = KIP.createSimpleElement("", "fileContainer", "", null, null, this._elems.core);
                this._elems.input = Forms.createInputElement(this._id + "|input", "", "file", "", null, null, this._elems.inputContainer);
                this._elems.inputLabel = Forms.createLabelForInput("Upload File", this._id + "|input", "filepath", this._elems.inputContainer);
            };
            /**
             * handle when the data in this element changes
             */
            FilePathElement.prototype._onChange = function () {
                // check if the link is the one that changed, and if so, update that
                if (this._tempLink) {
                    return this._onLinkChange();
                }
                // quit if we can't turn this element into a string (rare)
                if (!this._onChangeCallback) {
                    return false;
                }
                this._files = this._elems.input.files;
                console.log(this._files);
                if (!this._files) {
                    return true;
                }
                // Handle the change event
                var str = this._onChangeCallback(this._files);
                if (this._standardValidation(str)) {
                    return true;
                }
            };
            FilePathElement.prototype._onLinkChange = function () {
                var out = this._standardValidation(this._tempLink); // Check if we can set that link
                this._tempLink = ""; // Clear it in either case
                return out; // Quit with the result
            };
            FilePathElement.prototype.update = function (data) {
                this._data = data;
                this._elems.display.innerHTML = data;
                this._elems.input.value = "";
            };
            FilePathElement.prototype.save = function (internalOnly) {
                if (internalOnly) {
                    return;
                } // Don't do anything if this is an internal change
                if (this._files) {
                    if (!this._onSaveCallback) {
                        return "";
                    } // Don't do anything if we don't have a callback
                    this._onSaveCallback(this._files); // Run our callback
                }
                return this._data; // Return the appropriate data
            };
            FilePathElement.prototype._createClonedElement = function (appendToID) {
                return new FilePathElement(this.id + appendToID, this);
            };
            //#region PROPERTIES
            FilePathElement.__styles = {
                ".kipFormElem.filepath input[type=file]": {
                    display: "none"
                },
                ".kipFormElem.filepath label.filepath": {
                    backgroundColor: "<0>",
                    color: "#FFF",
                    borderRadius: "2px",
                    boxShadow: "1px 1px 5px 2px rgba(0,0,0,.1)",
                    padding: "10px",
                    fontSize: "0.7em",
                    cursor: "pointer"
                },
                ".kipFormElem.filepath .display": {
                    fontSize: "0.6em",
                    whiteSpace: "break"
                }
            };
            return FilePathElement;
        }(Forms.FormElement));
        Forms.FilePathElement = FilePathElement;
        /**
         * create an element to upload photos
         * @version 1.0
         */
        var PhotoPathElement = (function (_super) {
            __extends(PhotoPathElement, _super);
            function PhotoPathElement() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Object.defineProperty(PhotoPathElement.prototype, "_defaultCls", {
                get: function () { return "photopath"; },
                enumerable: true,
                configurable: true
            });
            PhotoPathElement.prototype._onCreateElements = function () {
                var _this = this;
                this._elems.photoWrapper = KIP.createSimpleElement("", "photoWrapper", "", null, null, this._elems.core);
                this._elems.display = KIP.createElement({
                    type: "img",
                    cls: "photo",
                    attr: {
                        "src": this._data
                    },
                    parent: this._elems.photoWrapper
                });
                // draw the photo element
                this._elems.overlay = KIP.createSimpleElement("", "photoOverlay", "", null, null, this._elems.photoWrapper);
                // handle setting a manual link
                this._elems.linkBtn = KIP.createSimpleElement("", "photoBtn link", "CHANGE LINK", null, null, this._elems.overlay);
                this._elems.linkBtn.addEventListener("click", function () {
                    var linkURL = window.prompt("What should the link be set to?", _this._data);
                    _this._tempLink = linkURL;
                    _this._changeEventFired();
                });
                // Draw the option for file upload
                this._elems.input = Forms.createInputElement(this._id + "|input", "photoInput", "file", "", null, null, this._elems.overlay);
                this._elems.uploadBtn = Forms.createLabelForInput("UPLOAD", this._id + "|input", "photoBtn upload", this._elems.overlay);
                this._elems.input.addEventListener("change", function () {
                    _this._changeEventFired();
                    _this._onFileSelected();
                });
            };
            PhotoPathElement.prototype._createClonedElement = function (appendToID) {
                return new PhotoPathElement(this.id + appendToID, this);
            };
            PhotoPathElement.prototype.update = function (data) {
                this._data = data;
                if (!this._data) {
                    return;
                }
                this._elems.display.src = data;
            };
            PhotoPathElement.prototype._onFileSelected = function () {
                var _this = this;
                var file;
                // Quit early if we don't have any files
                if (!this._files) {
                    return;
                }
                // Try to grab the first file & quit if we can't
                file = this._files[0];
                if (!file) {
                    return;
                }
                var fileReader = new FileReader();
                fileReader.addEventListener("load", function () {
                    window.setTimeout(function () {
                        var photoURL = fileReader.result;
                        _this._elems.display.src = photoURL;
                    }, 0);
                });
                // read the file
                fileReader.readAsDataURL(file);
            };
            PhotoPathElement.prototype._onLinkChange = function () {
                var link = this._tempLink;
                var out = _super.prototype._onLinkChange.call(this);
                this._elems.display.src = link;
                return out;
            };
            PhotoPathElement.__styles = {
                ".kipFormElem.photopath .photoOverlay": {
                    backgroundColor: "rgba(0,0,0,.5)",
                    opacity: "0",
                    transition: ".1s opacity ease-in-out",
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    width: "100%",
                    height: "100%",
                    left: "0",
                    top: "0",
                    justifyContent: "center",
                    alignItems: "center"
                },
                ".kipFormElem.photopath .photoWrapper:hover .photoOverlay": {
                    opacity: "1"
                },
                ".kipFormElem.photopath .photoWrapper": {
                    width: "100px",
                    height: "100px",
                    borderRadius: "50px",
                    border: "1px solid <0>",
                    overflow: "hidden",
                    position: "relative"
                },
                ".kipFormElem.photopath .photoWrapper img": {
                    width: "100%"
                },
                ".kipFormElem.photopath .photoWrapper .photoBtn": {
                    width: "100%",
                    backgroundColor: "<0>",
                    color: "#FFF",
                    textAlign: "center",
                    fontSize: "0.7em",
                    cursor: "pointer",
                    marginTop: "6px",
                    opacity: "0.8"
                },
                ".kipFormElem.photopath .photoWrapper .photoBtn:hover": {
                    opacity: "1"
                },
                ".kipFormElem.photopath .photoWrapper input[type='file']": {
                    display: "none"
                }
            };
            return PhotoPathElement;
        }(FilePathElement));
        Forms.PhotoPathElement = PhotoPathElement;
    })(Forms = KIP.Forms || (KIP.Forms = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Forms;
    (function (Forms) {
        /**
         * create a form with a data structure of F
         * @version 1.0
         */
        var Form = (function (_super) {
            __extends(Form, _super);
            //#endregion
            //#region CONSTRUCTOR
            /**--------------------------------------------------------------------------
             * Form
             * --------------------------------------------------------------------------
             * Create the Form
             *
             * @param   id          Unique ID for the form
             * @param   options     Specific way this form should be created
             * @param   elems       Form elements that should be shown for this form
             * --------------------------------------------------------------------------
             */
            function Form(id, options, elems) {
                var _this = _super.call(this) || this;
                //#region PROPERTIES
                /** handle standard styles for the form */
                _this._styles = {
                    ".kipForm": {
                        borderRadius: "2px",
                        backgroundColor: "FFF",
                        width: "60%",
                        marginLeft: "20%",
                        padding: "5px",
                        fontFamily: "OpenSansLight,Segoe UI,Helvetica",
                        fontSize: "1.2em",
                        position: "relative",
                        boxSizing: "border-box"
                    },
                    ".kipForm.hidden": {
                        display: "none"
                    },
                    ".kipForm overlay": {
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: "0",
                        left: "0",
                        backgroundColor: "rgba(0,0,0,.6)"
                    },
                    ".kipForm .formContent": {
                        marginRight: "10px"
                    },
                    ".kipForm .kipBtns": {
                        display: "flex",
                        justifyContent: "flex-end"
                    },
                    ".kipForm .kipBtn": {
                        padding: "5px 20px",
                        marginRight: "10px",
                        cursor: "pointer",
                        borderRadius: "2px",
                        boxShadow: "1px 1px 5px 2px rgba(0,0,0,.1)",
                        fontSize: "1.2em",
                        boxSizing: "border-box",
                        textAlign: "center",
                        transition: "all ease-in-out .1s"
                    },
                    ".kipForm .kipBtn:hover, .kipForm .kipBtn.selected": {
                        transform: "scale(1.05)"
                    },
                    ".kipForm .save.kipBtn": {
                        backgroundColor: "<0>",
                        color: "#FFF",
                        width: "20%"
                    },
                    ".kipForm .close.kipBtn": {
                        borderRadius: "10px",
                        border: "2px solid #999",
                        width: "15px",
                        height: "15px",
                        backgroundColor: "#999",
                        color: "#FFF",
                        padding: "0",
                        fontSize: "0.6em",
                        position: "absolute",
                        top: "-7px",
                        left: "calc(100% - 7px)",
                        boxSizing: "content-box",
                        textAlign: "center"
                    },
                    ".kipForm .cancel.kipBtn": {
                        backgroundColor: "#999",
                        color: "#FFF"
                    },
                    ".kipFormElem, .kipFormElem input, .kipFormElem select, .kipFormElem textarea": {
                        fontSize: "1em",
                        width: "100%",
                        boxSizing: "border-box"
                    },
                    ".kipFormElem": {
                        marginTop: "10px",
                        position: "relative"
                    },
                    ".kipFormElem input, .kipFormElem textarea, .kipFormElem select": {
                        fontFamily: "OpenSansLight,Segoe UI,Helvetica",
                        fontSize: "0.8em",
                        border: "1px solid #CCC"
                    },
                    ".kipFormElem textarea": {
                        minHeight: "100px",
                        maxWidth: "100%"
                    },
                    ".kipFormElem .lbl": {
                        fontSize: "0.9em",
                        color: "#666",
                        width: "100%",
                        boxSizing: "border-box"
                    },
                    ".kipFormElem.required .lbl": {},
                    ".kipFormElem.required .lbl:after": {
                        content: '"*"',
                        color: "<1>",
                        fontWeight: "bold",
                        fontSize: "1.8em",
                        position: "absolute",
                        marginLeft: "2px"
                    }
                };
                _this._id = id;
                _this._showAsPopup = options.popupForm;
                _this._noStandardStyles = options.noStandardStyles;
                _this._hidden = true;
                _this._additionalButtons = options.addlButtons || [];
                _this._colors = options.colors || ["#4A5", "#284"];
                _this._applyColors();
                // handle listeners
                _this._saveListeners = new KIP.Collection();
                _this._createElements();
                _this._createCoreElem(options, elems);
                return _this;
            }
            Object.defineProperty(Form.prototype, "data", {
                /** get the appropriate data out of this form */
                get: function () {
                    return this._coreFormElem.save();
                },
                enumerable: true,
                configurable: true
            });
            //#endregion
            //#region CREATE ELEMENTS
            /**--------------------------------------------------------------------------
             * _createElements
             * --------------------------------------------------------------------------
             * Create the elements used by the form
             * --------------------------------------------------------------------------
             */
            Form.prototype._createElements = function () {
                this._elems = {
                    base: KIP.createSimpleElement(this._id, "kipForm hidden"),
                    background: KIP.createSimpleElement("", "background"),
                    formContent: KIP.createSimpleElement("", "formContent")
                };
                this._createPopupElements();
                this._elems.background.appendChild(this._elems.formContent);
                this._createButtons();
                if (!this._noStandardStyles) {
                    this._createStyles();
                }
                // draw the form on the body of the document
                // TODO: evaluate if this should be changable
                document.body.appendChild(this._elems.base);
            };
            /**--------------------------------------------------------------------------
             * _createPopupElements
             * --------------------------------------------------------------------------
             * create the elements needed for the popup version of the form
             * --------------------------------------------------------------------------
             */
            Form.prototype._createPopupElements = function () {
                // If we aren't showing as a popup, add the BG directly to the base
                if (!this._showAsPopup) {
                    this._elems.base.appendChild(this._elems.background);
                    return;
                }
                // Create the elements that are only used for the popup version of the form
                KIP.addClass(this._elems.base, "popup");
                this._elems.overlay = KIP.createSimpleElement("", "overlay", "", null, null, this._elems.base);
                this._elems.overlay.appendChild(this._elems.background);
                this._elems.closeButton = KIP.createSimpleElement("", "close kipBtn", "", null, null, this._elems.background);
            };
            /**--------------------------------------------------------------------------
             * _createButtons
             * --------------------------------------------------------------------------
             * create the appropriate buttons for the form
             * --------------------------------------------------------------------------
             */
            Form.prototype._createButtons = function () {
                var _this = this;
                this._elems.buttons = KIP.createSimpleElement("", "kipBtns", "", null, null, this._elems.background);
                this._elems.saveButton = KIP.createSimpleElement("", "kipBtn save", "Save", null, null, this._elems.buttons);
                this._elems.saveButton.addEventListener("click", function () {
                    _this.save();
                    _this.hide();
                });
                this._elems.cancelButton = KIP.createSimpleElement("", "kipBtn cancel", "Cancel", null, null, this._elems.buttons);
                this._elems.cancelButton.addEventListener("click", function () {
                    _this.clear();
                    _this.hide();
                });
                // if we have additional buttons add them here
                var idx = 0;
                var _loop_1 = function () {
                    var btnTemplate = this_1._additionalButtons[idx];
                    var btn = KIP.createSimpleElement("", "kipBtn " + btnTemplate.cls, btnTemplate.display, null, null, this_1._elems.buttons);
                    btn.addEventListener("click", function () {
                        btnTemplate.callback();
                    });
                };
                var this_1 = this;
                for (idx; idx < this._additionalButtons.length; idx += 1) {
                    _loop_1();
                }
            };
            /**--------------------------------------------------------------------------
             * _createCoreElem
             * --------------------------------------------------------------------------
             * create the core section that will display all of our data
             *
             * @param   options     the options that are passed in for the general form
             * @param   elems       Elements associated with this form
             * --------------------------------------------------------------------------
             */
            Form.prototype._createCoreElem = function (options, elems) {
                // create the template that will render the section
                var template = {
                    type: Forms.FormElementTypeEnum.SECTION,
                    label: options.label,
                    cls: options.cls,
                    layout: options.layout
                };
                // create the core section
                this._coreFormElem = new Forms.SectionElement(this._id, template, elems);
                this._applyColors(this._coreFormElem);
                this._coreFormElem.expand();
                // add the section to the overall form UI
                this._coreFormElem.render(this._elems.formContent);
            };
            //#endregion
            //#region DATA MANIPULATIONS
            /**--------------------------------------------------------------------------
             * save
             * --------------------------------------------------------------------------
             * Saves data in the form
             *
             * @returns The data contained in the form
             * --------------------------------------------------------------------------
             */
            Form.prototype.save = function () {
                var data = this._coreFormElem.save();
                // Alert any listeners of this particular form that 
                this._notifySaveListeners(data);
                return data;
            };
            /**--------------------------------------------------------------------------
             * _notifySaveListeners
             * --------------------------------------------------------------------------
             * lets all listeners know that the form has saved
             *
             * @param  data    The form data that was just saved
             * --------------------------------------------------------------------------
             */
            Form.prototype._notifySaveListeners = function (data) {
                this._saveListeners.map(function (listener) {
                    if (!listener) {
                        return;
                    }
                    listener(data);
                });
            };
            /**--------------------------------------------------------------------------
             * clear
             * --------------------------------------------------------------------------
             * clears all data out of the form
             * --------------------------------------------------------------------------
             */
            Form.prototype.clear = function () {
                this._coreFormElem.clear();
            };
            /**--------------------------------------------------------------------------
             * update
             * --------------------------------------------------------------------------
             * update the data in the form to match a particular data set
             *
             * @param   data    The data to update the form with
             * --------------------------------------------------------------------------
             */
            Form.prototype.update = function (data) {
                this._coreFormElem.update(data);
            };
            //#endregion
            //#region TRACK CHANGES
            Form.prototype.undo = function () {
                // TODO
            };
            Form.prototype.redo = function () {
            };
            Form.prototype._trackChanges = function () {
                // TODO
            };
            //#endregion
            //#region HIDE OR SHOW THE FORM
            /**--------------------------------------------------------------------------
             * show
             * --------------------------------------------------------------------------
             * show the form on the appropriate parent
             * --------------------------------------------------------------------------
             */
            Form.prototype.show = function () {
                if (!this._hidden) {
                    return;
                }
                KIP.removeClass(this._elems.base, "hidden");
            };
            /**--------------------------------------------------------------------------
             * hide
             * --------------------------------------------------------------------------
             * hide the form
             * --------------------------------------------------------------------------
             */
            Form.prototype.hide = function () {
                if (this._hidden) {
                    return;
                }
                KIP.addClass(this._elems.base, "hidden");
            };
            //#endregion
            //#region Handle Listeners
            /**--------------------------------------------------------------------------
             * registerListener
             * --------------------------------------------------------------------------
             * register any listener that wants to hear about this form saving
             *
             * @param   listener    The function to call when the form is saved
             *
             * @returns The key with which the event is registered
             * --------------------------------------------------------------------------
             */
            Form.prototype.registerListener = function (listener) {
                var key = this._saveListeners.length.toString();
                this._saveListeners.addElement(key, listener);
                return key;
            };
            return Form;
        }(KIP.Styles.Stylable));
        Forms.Form = Form;
        //#region EVENT HANDLER FOR FORMS
        // create a particular event for all form change events
        Forms.FORM_ELEM_CHANGE = "formelemchange";
        KIP.Events.createEvent({
            name: "Form Element Changed",
            key: Forms.FORM_ELEM_CHANGE
        });
        //#endregion
    })(Forms = KIP.Forms || (KIP.Forms = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var WebElement = (function () {
        /** Create an element that will display in a web */
        function WebElement(content) {
            this._content = content;
        }
        Object.defineProperty(WebElement.prototype, "content", {
            get: function () { return this._content; },
            set: function (data) { this._content = data; },
            enumerable: true,
            configurable: true
        });
        WebElement.prototype.addChildElement = function (child) {
            this._childElements.push(child);
            child.draw();
            return;
        };
        WebElement.prototype.addLinkedElement = function (link) {
        };
        WebElement.prototype.draw = function () { };
        WebElement.prototype.erase = function () { };
        return WebElement;
    }());
    KIP.WebElement = WebElement;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Web = (function () {
        function Web(parentElem, canvasOptions) {
            this._parent = parentElem || document.body;
            this._canvas = new KIP.HTML5Canvas("web", canvasOptions);
            if (this._parent) {
                this._canvas.draw(this._parent);
            }
        }
        Web.prototype.addWebElement = function (newElem) {
            this._elements.push(newElem);
            this.draw();
        };
        Web.prototype.draw = function (parent) {
            if (!this._parent) {
                this._parent = parent;
            }
            // TODO
        };
        Web.prototype.erase = function () {
            // TODO
        };
        Web.prototype.createWebElementFromContent = function (content) {
            return null;
        };
        return Web;
    }());
    KIP.Web = Web;
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Tests;
    (function (Tests) {
        function testAllDateFuncs() {
            KIP.startGroup("DATE TESTS");
            testDateDiff();
            testBusinessDateDiff();
            testAddToDate();
            testClearTimeInfo();
            testIsToday();
            testIsWeekend();
        }
        Tests.testAllDateFuncs = testAllDateFuncs;
        /** verify that the date diff functionality is working properly */
        function testDateDiff() {
            KIP.startGroup("DATE DIFF");
            // SAME DAY
            KIP.assert("SAME DAY", KIP.Dates.dateDiff(new Date(), new Date()), 0);
            // 1 DAY
            KIP.assert("NEXT DAY", KIP.Dates.dateDiff(new Date("01/01/2017"), new Date("01/02/2017")), 1);
            // NEGATIVE 1 DAY
            KIP.assert("PREV DAY", KIP.Dates.dateDiff(new Date("01/01/2017"), new Date("01/02/2017"), true), -1);
            // DST CHANGE
            KIP.assert("DST CHANGE", KIP.Dates.dateDiff(new Date("02/01/2017"), new Date("08/01/2017")), 181);
            // TIME DIFF
            KIP.assert("TIME CHANGE", KIP.Dates.dateDiff(new Date("01/01/2017"), new Date("01/01/2017 12:34 PM"), false, true), (((12 * 60 * 60 * 1000) + (34 * 60 * 1000)) / (24 * 60 * 60 * 1000)));
            // MILLI TIME
            KIP.assert("MILLI TEST", KIP.Dates.dateDiff(new Date("01/01/2017"), new Date("01/01/2017 12:34 PM"), false, true, true), ((12 * 60 * 60 * 1000) + (34 * 60 * 1000)));
        }
        /** verify that the business date diff functionality is working properly */
        function testBusinessDateDiff() {
            KIP.startGroup("BUSINESS DATE DIFF");
            // SAME DAY
            KIP.assert("SAME DAY", KIP.Dates.businessDateDiff(new Date("01/02/2017"), new Date("01/02/2017")), 0);
            // 1 DAY AHEAD
            KIP.assert("1 DAY AHEAD", KIP.Dates.businessDateDiff(new Date("01/03/2017"), new Date("01/02/2017"), true), 1);
            // 1 DAY BEHIND
            KIP.assert("1 DAY BEFORE", KIP.Dates.businessDateDiff(new Date("01/02/2017"), new Date("01/03/2017"), true), -1);
            // 5 DAYS BEFORE - SIGNED
            KIP.assert("5 DAYS BEFORE - SIGNED", KIP.Dates.businessDateDiff(new Date("01/04/2017"), new Date("01/09/2017"), true), -3);
            // 5 DAYS BEFORE - UNSIGNED
            KIP.assert("5 DAYS BEFORE - UNSIGNED", KIP.Dates.businessDateDiff(new Date("01/04/2017"), new Date("01/09/2017"), false), 3);
            // NEXT WEEK
            KIP.assert("1 WEEK AHEAD", KIP.Dates.businessDateDiff(new Date("01/09/2017"), new Date("01/02/2017")), 5);
            // LAST WEEK
            KIP.assert("1 WEEK BEHIND", KIP.Dates.businessDateDiff(new Date("01/02/2017"), new Date("01/09/2017"), true), -5);
            // NEXT MONTH
            KIP.assert("1 MONTH AHEAD", KIP.Dates.businessDateDiff(new Date("02/06/2017"), new Date("01/02/2017")), 25);
            // ALL WEEKEND
            KIP.assert("ALL WEEKEND", KIP.Dates.businessDateDiff(new Date("01/08/2017"), new Date("01/07/2017"), true), 0);
            KIP.assert("ALL WEEKEND - REVERSE", KIP.Dates.businessDateDiff(new Date("01/07/2017"), new Date("01/08/2017"), true), 0);
            KIP.assert("ALMOST A WEEK", KIP.Dates.businessDateDiff(new Date("1/8/2017"), new Date("1/2/2017"), true), 4);
            KIP.assert("ALMOST A WEEK - REVERSE", KIP.Dates.businessDateDiff(new Date("1/2/2017"), new Date("1/8/2017"), true), -4);
            // TIME INCLUDED
        }
        function testAddToDate() { }
        ;
        function testClearTimeInfo() { }
        function testIsToday() { }
        function testIsWeekend() { }
    })(Tests = KIP.Tests || (KIP.Tests = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Tests;
    (function (Tests) {
        function runAllCollectionTests() {
            KIP.startGroup("COLLECTION TESTS");
            testAddElement();
            testRemoveElement();
            testGetElement();
            testSort();
        }
        Tests.runAllCollectionTests = runAllCollectionTests;
        function testAddElement() {
        }
        function testRemoveElement() {
        }
        function testGetElement() {
        }
        function testSort() {
        }
    })(Tests = KIP.Tests || (KIP.Tests = {}));
})(KIP || (KIP = {}));
var KIP;
(function (KIP) {
    var Tests;
    (function (Tests) {
        var DEBUG = false;
        function runAll() {
            Tests.testAllDateFuncs();
        }
        Tests.runAll = runAll;
        // make sure we run all tests if appropriate
        window.addEventListener("load", function () {
            if (!DEBUG) {
                return;
            }
            runAll();
        });
    })(Tests = KIP.Tests || (KIP.Tests = {}));
})(KIP || (KIP = {}));
//# sourceMappingURL=kip.js.map