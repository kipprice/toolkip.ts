namespace KIP {
     //....................................
    //#region CALCULATE OFFSET FUNCTIONS

    /**
     * GlobalOffsetLeft
     * ----------------------------------------------------------------------------
     * Gets the offset left of this element in reference to the entire page
     *
     * @param   elem    The element to get the offset of
     * @param   parent  The parent element to use as the reference. If not 
     *                  included, it uses the document.body as the reference
     *
     * @returns The global offset of the elememt from the left of the page (or 
     *          parent, if included)
     * 
     */
    export function globalOffsetLeft(elem: HTMLElement, parent?: HTMLElement, useStandardParent?: boolean): number {
        return _auxGlobalOffset(elem, "offsetLeft", parent, useStandardParent);
    };

    /**
     * GlobalOffsetTop
     * ----------------------------------------------------------------------------
     * Gets the offset top of this element in reference to the entire page
     *
     * @param   elem   The element to get the offset of
     * @param   parent The parent element to use as the reference. If not 
     *                 included, it uses the document.body as the reference 
     *
     * @returns The global offset of the elememt from the top of the page (or 
     *          parent, if included)
     * 
     */
    export function globalOffsetTop(elem: HTMLElement, parent?: HTMLElement, useStandardParent?: boolean): number {
        return _auxGlobalOffset(elem, "offsetTop", parent, useStandardParent);
    };

    /**
     * GlobalOffsets
     * ----------------------------------------------------------------------------
     * Gets both the left and top offset
     *
     * @param   elem    The element to get the offsets for
     * @param   parent  The element to use as the reference frame
     *
     * @returns Object with the keys "left" and "top"
     * 
     */
    export function globalOffsets(elem: HTMLElement, parent?: HTMLElement, useStandardParent?: boolean): { left: number, top: number } {
        ;
        return {
            left: globalOffsetLeft(elem, parent, useStandardParent),
            top: globalOffsetTop(elem, parent, useStandardParent)
        };
    };

    /**
     *  _auxGlobalOffset
     * ----------------------------------------------------------------------------
     * Helper function to get a global offset
     *
     * @param   elem    The element to get the global offset for
     * @param   type    The type of offset we should look at (either "offsetTop"
     *                  or "offsetWidth")
     * @param   parent  The parent to use as the reference frame. Uses document.
     *                  body by default {optional}
     *
     * @return The specified offset for the element
     * 
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

    /**
     * getScrollPosition
     * ----------------------------------------------------------------------------
     * Determines how far we have scrolled down the page
     * 
     * @returns The point of the current scroll position
     * 
     */
    export function getScrollPosition(): IPoint {
        let out: IPoint = {
            x: (window.pageXOffset) ? window.pageXOffset : document.body.scrollLeft,
            y: (window.pageYOffset) ? window.pageYOffset : document.body.scrollTop
        }

        return out;
    }

    /**
     * measureElement
     * ----------------------------------------------------------------------------
     * Measures how large an element is when rendered on the document
     * @param     elem    The element to measure 
     * @param     parent  The parent element to render this within
     * @returns   The client rect for the element 
     * 
     */
    export function measureElement(elem: HTMLElement, parent?: HTMLElement): ClientRect {
        let added: boolean = false;

        // add to the document if not already present
        if (!elem.parentNode) {
            added = true; 

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

        if (added) { parent.removeChild(elem); }

        return rect;
    }

    //#endregion
    //....................................

    //..........................................
    //#region RELATIVE TO OTHER ELEM FUNCTIONS

    /**
     * findCommonParent
     * ----------------------------------------------------------------------------
     * Finds the closest shared parent between two arbitrary elements
     *
     * @param   elem_a    The first element to find the shared parent for
     * @param   elem_b    The second element to find the shared parent for
     *
     * @returns The closest shared parent, or undefined if it doesn't exist or 
     *          an error occurred.
     * 
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

    /**
     * moveRelToElement
     * ----------------------------------------------------------------------------
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
     * 
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

    
}