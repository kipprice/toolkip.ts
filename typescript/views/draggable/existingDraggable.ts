/// <reference path="./html5Draggable.ts" />
/// <reference path="./classicDraggable.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class   ExistingClassicDraggable
     * ----------------------------------------------------------------------------
     * Create a draggable out of an already-existing element
     * @author  Kip Price
     * @version 1.5.0
     * ----------------------------------------------------------------------------
     */
    export class ExistingClassicDraggable extends ClassicDraggable {

        /**
         * ExistingClassicDraggable
         * ----------------------------------------------------------------------------
         * Turn an existing element into a draggable that supports classic mouse events
         * @param   elem        The element to use for this element
         * @param   target      The target for the element
         */
        constructor(elem: StandardElement, target?: StandardElement) {
            super(null, target);
            this._elems.base = elem;

            this._addEventListeners();
        }
    }

    /**----------------------------------------------------------------------------
     * @class   ExistingHTML5Draggable
     * ----------------------------------------------------------------------------
     * Create a draggable that uses HTML5 elements out of an already existing 
     * element
     * @author  Kip Price
     * @version 1.5.0
     * ----------------------------------------------------------------------------
     */
    export class ExistingHTML5Draggable extends HTML5Draggable {

        /**
         * ExistingHTML5Draggable
         * ----------------------------------------------------------------------------
         * Turn an existing element into a draggable that supports HTML5 events
         * @param   elem        The element to use for this element
         * @param   target      The target for the element
         */
        constructor(elem: StandardElement, target?: StandardElement) {
            super(null, target);
            this._elems.base = elem;

            this._addEventListeners();
        }
    }

}