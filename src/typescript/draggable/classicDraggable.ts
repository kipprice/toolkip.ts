/// <reference path="draggable.ts" />
namespace KIP {

    /**----------------------------------------------------------------------------
     * @class   ClassicDraggable
     * ----------------------------------------------------------------------------
     * Create a draggable that listens to standard mouse events to be able to 
     * accommodate drag and drop
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class ClassicDraggable extends GenericDraggable {

        /**
         * _createElements
         * ----------------------------------------------------------------------------
         * (Does nothing; can be overidden by child classes)
         */
        protected _createElements(): void {
            addClass(this._elems.base, "draggable");
            this._addEventListeners();

            this._addDraggingSignifier();
        }

        /**
         * _onDrop
         * ----------------------------------------------------------------------------
         * Defalut behavior for a draggable is to attach to the associated target
         * @param   event   The mouse event triggering the drop 
         */
        protected _onDrop(event: MouseEvent): void {
            if (!this._isDragging) { return; }
            super._onDrop(event);
            // update the style of the element
            removeClass(this._elems.base, "dragging");
        }

        /**
         * _addEventListeners
         * ----------------------------------------------------------------------------
         * Add any event listeners needed for this classic draggable
         */
        protected _addEventListeners(): void {

            this.addEventListener("mousedown", (e: MouseEvent) => {
                if (
                    (e.target !== this._elems.base) &&
                    (e.target !== this._signifier)
                )
                { return; }
                
                this._onDragStart(e);
                e.preventDefault();
            });

            window.addEventListener("mousemove", (e: MouseEvent) => {
                this._onMove(e);
            });


			window.addEventListener("mouseup", (e: MouseEvent) => {
                this._onDrop(e);
            });

			window.addEventListener("mouseout", (e: MouseEvent) => {
                //this._onDrop(e);
            });
        }

        /**
         * _createDraggableTarget
         * ----------------------------------------------------------------------------
         * Create a target element for this draggable
         * @param   target  The element to link to the created target
         * 
         * @returns The created target 
         */
        protected _createDraggableTarget(target: StandardElement): ClassicDraggableTarget {
            return new ClassicDraggableTarget(target); 
        }
    }

    /**----------------------------------------------------------------------------
     * @class   ClassicDraggableTarget
     * ----------------------------------------------------------------------------
     * Creates a target that can receive classic draggable events
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class ClassicDraggableTarget extends DraggableTarget {

        /**
         * _addEventListeners
         * ----------------------------------------------------------------------------
         * Add event listeners to the target
         */
        protected _addEventListeners(): void {
            this.addEventListener("mouseup", (e: MouseEvent) => {
				if (!GenericDraggable.currentDraggable) { return; }
				this._onDrop(e);
			});

			this.addEventListener("mouseover", (e: MouseEvent) => {
				this._onDragEnter(e);
			});

			this.addEventListener("mouseout", (e: MouseEvent) => {
				this._onDragLeave(e);
			});
        }
    }
}