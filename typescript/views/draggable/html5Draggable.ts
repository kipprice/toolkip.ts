namespace KIP {

    /**----------------------------------------------------------------------------
     * @class   HTML5Draggable
     * ----------------------------------------------------------------------------
     * Use HTML5 drag events to allow for dragging
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class HTML5Draggable extends GenericDraggable {

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * Applies the draggable attribute to the associated elements
         */
        protected _createElements(): void {
            this._elems.base.setAttribute("draggable", "true");
            addClass(this._elems.base, "draggable");
            this._addEventListeners();

            this._elems.blank = createElement({
                type: "canvas",
                attr: {
                    width: "1px",
                    height: '1px"'
                },
                cls: "blank",
                parent: document.body
            });
        }

        /**
         * _createDraggableTarget
         * ----------------------------------------------------------------------------
         * Creates a new target for this draggable
         * @param   elem    The element to associate with the target
         * 
         * @returns The created draggable target
         */
        protected _createDraggableTarget(elem: StandardElement): HTML5DragTarget {
            return new HTML5DragTarget(elem);
        }

        protected _addEventListeners(): void {
            this.base.addEventListener("dragstart", (e: DragEvent) => { this._onDragStart(e); });
            this.base.addEventListener('drag', (e: DragEvent) => { this._onMove(e); });
            this.base.addEventListener("dragend", (e: DragEvent) => { this._onDrop(e); });
        }

        protected _onDragStart(event: DragEvent): void {
            super._onDragStart(event);
            event.dataTransfer.setDragImage(this._elems.blank as HTMLElement, 0, 0);

            // update the element to be low opacity
            window.setTimeout(() => {
                addClass(this._elems.base, "dragging")
            }, 50);
        }

        protected _onMove(event: DragEvent): void {
            if (event.buttons === 0) { return; }
            super._onMove(event);
        }

        protected _onDrop(event: DragEvent): void {
            super._onDrop(event);
            // update the style of the element
            removeClass(this._elems.base, "dragging");
        }
    }

    /**----------------------------------------------------------------------------
     * @class   HTML5DragTarget
     * ----------------------------------------------------------------------------
     * Use HTML5 drag events to allow for 
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class HTML5DragTarget extends DraggableTarget {

        protected _addEventListeners(): void {
            this.base.addEventListener("dragover", (e: DragEvent) => { this._onDragEnter(e); });
            this.base.addEventListener("dragexit", (e: DragEvent) => { this._onDragLeave(e); });
            this.base.addEventListener("drop", (e: DragEvent) => { this._onDrop(e); });
        }

        protected _onDragEnter(event: DragEvent): void {
            event.preventDefault();
            super._onDragEnter(event);
        }

        protected _onDrop(event: DragEvent): void {
            event.preventDefault();
            super._onDrop(event);
        }

        protected _onDragLeave(event: DragEvent): void {
            event.preventDefault();
            super._onDragLeave(event);
        }
    }
}