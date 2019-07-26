/// <reference path="./../styles.ts" />
/// <reference path="./../css.ts" />
/// <reference path="./../objects.ts" />

namespace KIP {


    /**
     * removeSubclassFromAllElenents
     * ----------------------------------------------------------------------------
     * Allows you to easily remove a subclass from all elements that have a certain 
     * main class. Useful for things like button selection
     *
     * @param   cls       The main class to find all elements of
     * @param   subcls    The sub class to remove from all of those elements
     * @param   exception If needed, a single element that should 
     *                    not have its subclass removed.
     * 
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

    /**
     * addResizingElement (UNIMPLEMENTED)
     * ----------------------------------------------------------------------------
     * Adds an element to the document that should resize with the document
     * 
     * @param   elem        The element that should resize
     * @param   fixedRatio  If provided, keeps the image at this fixed ratio of w:h at all document sizes
     * @param   forceInitW  Optionally force the initial width to a certain value
     * @param   forceInitH  Optionally force the initial height to a certain value
     * 
     */
    function addResizingElement(elem, fixedRatio, forceInitW, forceInitH) {
        // TODO: implement
    };

    /**
     * resizeElement (UNIMPLEMENTED)
     * ----------------------------------------------------------------------------
     * Resizes an element to be the same ratio as it previously was
     * @param   obj   The element to resize
     * 
     */
    function resizeElement(obj) {
        // TODO: implement
    };

    /**
   * isChildEventTarget
   * ----------------------------------------------------------------------------
   * Checks if a child of the current task is being targeted by the event
   * 
   * @param   ev    The event that is being triggered
   * @param   root  The parent to check for
   * 
   * @returns True if the event is being triggered on a child element of the 
   *          root element, false otherwise
   * 
   */
    export function isChildEventTarget(ev: Event, root: HTMLElement): boolean {
        ;
        return isChild(root, <HTMLElement>ev.target);
    };

    /**
     * isChild
     * ----------------------------------------------------------------------------
     * Checks if an element is a child of the provided parent element
     * 
     * @param   root    The parent to check for
     * @param   child   The element to check for being a child of the root node
     * @param   levels  The maximum number of layers that the child can be 
     *                  separated from its parent. Ignored if not set.
     * 
     * @returns True if the child has the root as a parent
     * 
     */
    export function isChild(root: HTMLElement, child: HTMLElement): boolean {
        ;
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
        ;
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

    /**
     * moveElemRelativePosition
     * ----------------------------------------------------------------------------
     * Moves an element a relative anount
     * 
     * @param   elem      The element to move
     * @param   distance  The relative distance to move
     * 
     */
    export function moveElemRelativePosition(elem: HTMLElement, distance: IPoint): void {
        let top: number = parseInt(elem.style.top) || 0;
        let left: number = parseInt(elem.style.left) || 0;

        elem.style.top = (top + distance.y) + "px";
        elem.style.left = (left + distance.x) + "px";
    }


    /**
     * resetPageFocus
     * ----------------------------------------------------------------------------
     * Reset where current focus is to the top of the page
     * 
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

    /**
     * removeElement
     * ----------------------------------------------------------------------------
     * Remove an element from the DOM
     * @param   elem    The element to remove
     * 
     */
    export function removeElement(elem: HTMLElement): void {
        if (!elem.parentNode) { return; }
        elem.parentNode.removeChild(elem);
    }

    /**
     * select
     * ----------------------------------------------------------------------------
     * Selects the contents of an HTML element, whether an input or a 
     * content-editable element.
     * 
     * @param   htmlElem    The element to select the contents of
     * 
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

    /**
     * encodeForHTML
     * ----------------------------------------------------------------------------
     * Encode a string so that it can render appropriately in HTML contexts
     * @param   data    The data to encode
     * @returns The encoded data
     *  
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

    /**
     * replaceElemWithElem
     * ----------------------------------------------------------------------------
     * replace a particular element with another in the DOM
     * 
     * @param   elemToReplace   The element to remove
     * @param   replacement     The element to replace with
     */
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