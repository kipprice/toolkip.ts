///<reference path="drawable.ts" />
namespace KIP {

	//TODO: Cleanup this implementation

	export interface OnDragEnterFunction {
		(target: HTMLElement, e: Event): void;
	}

	export interface OnDragLeaveFunction {
		(target: HTMLElement, e: Event): void;
	}

	export interface OnDropFunction {
		(target: HTMLElement, e: Event): void;
	}

	export interface OnMoveFunction {
		(delta: IPoint): void;
	}

	export enum DraggableFunctions {
		DragEnter,
		DragLeave,
		Drop,
		Move
	}

	/**...........................................................................
	 * IDraggableHandlers
	 * ...........................................................................
	 * Keep track of handlers for draggable elements
	 * ...........................................................................
	 */
	export interface IDraggableHandlers {
		/** what to do when we start dragging over the target */
		onDragEnter?: OnDragEnterFunction;

		/** what to do when we stop dragging over the target */
		onDragLeave?: OnDragLeaveFunction;

		/** what to do when the element is dropped */
		onDrop?: OnDropFunction;

		/** wwhat to do when the element is moved */
		onMove?: OnMoveFunction;
	}

	/**...........................................................................
	 * IDraggableOptions
	 * ...........................................................................
	 * Keep track of options for the draggable element
	 * ...........................................................................
	 */
	export interface IDraggableOptions extends IDraggableHandlers {
		/** what element is considered the target of this function */
		target?: HTMLElement;

		/** keep track of whether we're using HTML5 events for dragging/dropping */
		isNonStandard?: boolean;
	}

	/** functions that can be used for a draggable element */
	export type DraggableFunction = OnDragEnterFunction | OnDragLeaveFunction | OnDropFunction | OnMoveFunction;

	/**...........................................................................
	 * @class Draggable
	 * ...........................................................................
	 * A visual element that can be dragged about the screen
	 * @version 1.0
	 * ...........................................................................
	 */
	export abstract class Draggable extends Drawable {

		//#region PROPERTIES

		/** the elements that should be treated as valid targets of the drag-drop interaction */
		private _targets: Array<HTMLElement>;

		/** true if we should ignore HTML5 drag events and rely on manual events instead */
		private _useNonStandard: boolean;

		/** internal tracking of whether we are currently dragging */
		private _isDragging: boolean;

		/** internal tracking of the last registered mouse point */
		private _mousePoint: IPoint;

		/** override what happens when the drag event goes over a particular target */
		protected _dragEnterFunc: OnDragEnterFunction;
		public set dragEnterFunc(func: OnDragEnterFunction) { this._dragEnterFunc = func; }

		/** override what happens when the drag event leaves a particular target */
		protected _dragLeaveFunc: OnDragLeaveFunction;
		public set dragLeaveFunc(func: OnDragLeaveFunction) { this._dragLeaveFunc = func; }

		/** override what happens when the element is dropped */
		protected _dropFunc: OnDropFunction;
		public set dropFunc(func: OnDropFunction) { this._dropFunc = func; }

		/** override what happens when the element is moved */
		protected _moveFunc: OnMoveFunction;
		public set moveFunc(func: OnMoveFunction) { this._moveFunc = func; }

		/** handle the particular styles for this class */
		protected static _uncoloredStyles: Styles.IStandardStyles = {
			".draggable": {
				position: "absolute !important",
				cursor: "-webkit-grab"
			},

			".draggable.grabbing": {
				cursor: "-webkit-grabbing"
			},

			".droppable": {
				cursor: "pointer"
			}
		}

		//#endregion

		/**...........................................................................
		 * Creates a Draggable element
		 * 
		 * @param	obj				Optional definition of what the base element of 
		 * 							this object looks like
		 * @param	dragTarget		Optional target for dropping the element
		 * @param	useNonStandard	If true, uses non HTML5 drag events (e.g. mouseup)
		 * ...........................................................................
		 */
		constructor(obj?: IElemDefinition, dragTarget?: HTMLElement, useNonStandard?: boolean) {

			// Call our super function
			super(obj);
			this._addClassName("Draggable");

			// Set our internal properties
			this._useNonStandard = useNonStandard;
			this._targets = [];

			// Add the target if it was passed in, or the document body if it wasn't
			if (dragTarget) {
				this._targets.push(dragTarget);
			} else {
				this._targets.push(document.body);
			}

			// Make sure the element is positionable
			addClass(this._elems.base, "draggable");

			// Add the default event handlers
			this._addDefaultEventFunctions();

			// Add the appropriate listeners after the current stack is empty
			this._isDragging = false;
			window.setTimeout(() => {
				if (!useNonStandard) {
					this._addStandardDragEventListeners();
				} else {
					this._addNonStandardDragEventListeners();
				}
			}, 0);
		}

		/**...........................................................................
		 * _addDefaultEventFunctions
		 * ...........................................................................
		 * Add handlers for each of these elements
		 * ...........................................................................
		 */
		private _addDefaultEventFunctions() {
			let base: StandardElement = this._elems.base;

			// MOVE FUNCTION
			this._moveFunc = (delta: IPoint) => {
				// Default implementation : adjust position
				let new_pt: IPoint = {
					x: ((parseInt(base.style.left) || 0) + delta.x),
					y: ((parseInt(base.style.top) || 0) + delta.y)
				}

				base.style.left = new_pt.x + "px";
				base.style.top = new_pt.y + "px";
			}

			// DRAG ENTER FUNCTION
			this._dragEnterFunc = (target: HTMLElement, e: Event) => {
				e.preventDefault();
			}

			// DRAG LEAVE FUNCTION
			this._dragLeaveFunc = (target: HTMLElement, e: Event) => {
				e.preventDefault();
			}

			// DROP FUNCTION
			this._dropFunc = (target: HTMLElement, e: Event) => {

				// Prevent the default
				e.preventDefault();

				//Default implementation - add to the target
				if (base.parentNode === target) { return; }
				if (base.parentNode) {
					base.parentNode.removeChild(base);
				}

				target.appendChild(base);

			}

		}

		/**...........................................................................
		 * _addStandardDragEventListeners
		 * ...........................................................................
		 * Add 
		 * ...........................................................................
		 */
		private _addStandardDragEventListeners(): void {
			let base: StandardElement = this._elems.base;

			// Make sure we have the attribute on the draggable
			base.setAttribute("draggable", "true");

			base.addEventListener("dragstart", (e: DragEvent) => {
				this._isDragging = true;
				this._updateMousePoint(e);
				e.dataTransfer.dropEffect = "move";
				//e.preventDefault();
			});

			base.addEventListener('drag', (e: DragEvent) => {

			});

			base.addEventListener("dragend", (e: DragEvent) => {
				this._isDragging = false;
			});

			let target: HTMLElement;
			for (target of this._targets) {
				this._addStandardTargetEventListeners(target);
			}

		}

		/**...........................................................................
		 * _addNonStandardDragEventListeners
		 * ...........................................................................
		 * 
		 * ...........................................................................
		 */
		private _addNonStandardDragEventListeners(): void {
			let base: StandardElement = this._elems.base;

			base.addEventListener("mousedown", (e: MouseEvent) => {
				this._isDragging = true;

				// Set our initial point
				this._updateMousePoint(e);

				// Add the additional listeners we care about
				window.addEventListener("mousemove", mousemove);
				window.addEventListener("mouseup", mouseup);
				window.addEventListener("mouseout", mouseout);


			});

			let mousemove = (e: MouseEvent) => {
				if (!this._isDragging) { return; }

				let delta: IPoint = this._getDelta(e);

				// update our point
				this._updateMousePoint(e);

				// Call our overridable move function
				this._onMove(delta);

			};

			let mouseup = (e: MouseEvent) => {
				__stopDragging();
			};

			let mouseout = (e: MouseEvent) => {
				if (e.relatedTarget) return;
				__stopDragging();
			}

			// Remove all listeners & reset our var
			let __stopDragging = () => {

				// Quit if we've already removed these events
				if (!this._isDragging) { return; }

				// Set our internal variable to false
				this._isDragging = false;

				// Remove listeners
				window.removeEventListener("mousemove", mousemove);
				window.removeEventListener("mouseup", mouseup);
				window.removeEventListener("mouseout", mouseout);
			}

			let target: HTMLElement;
			for (target of this._targets) {
				this._addNonStandardTargetEventListeners(target);
			}
		}

		/**...........................................................................
		 * _addNonStandardTargetEventListeners
		 * ...........................................................................
		 * @param target 
		 * ...........................................................................
		 */
		private _addNonStandardTargetEventListeners(target: HTMLElement): void {
			target.addEventListener("mouseup", (e: MouseEvent) => {
				if (!this._isDragging) { return; }
				this._onDropOnTarget(target, e);
			});

			target.addEventListener("mouseover", (e: MouseEvent) => {
				if (!this._isDragging) { return; }
				this._onDragEnterTarget(target, e);
			});

			target.addEventListener("mouseout", (e: MouseEvent) => {
				if (!this._isDragging) { return; }
				this._onDragLeaveTarget(target, e);
			});
		}

		/**...........................................................................
		 * _addStandardTargetEventListeners
		 * ...........................................................................
		 * @param target 
		 * ...........................................................................
		 */
		private _addStandardTargetEventListeners(target: HTMLElement): void {
			target.addEventListener("dragover", (e: DragEvent) => {
				this._onDragEnterTarget(target, e);
			});

			target.addEventListener("dragexit", (e: DragEvent) => {
				this._onDragLeaveTarget(target, e);
			});

			target.addEventListener("drop", (e: DragEvent) => {
				this._onDropOnTarget(target, e);
			})
		}

		/**...........................................................................
		 * addDragTarget
		 * ...........................................................................
		 * Adds a new element that can receive the draggable element
		 * @param 	target 	The new target to allow drop events on
		 * ...........................................................................
		 */
		public addDragTarget(target: HTMLElement): void {
			this._targets.push(target);

			if (!this._useNonStandard) {
				this._addStandardTargetEventListeners(target);
			} else {
				this._addNonStandardTargetEventListeners(target);
			}
		}

		/**...........................................................................
		 * _onDragEnterTarget
		 * ...........................................................................
		 * @param target 
		 * @param e 
		 * ...........................................................................
		 */
		protected _onDragEnterTarget(target: HTMLElement, e: Event): void {
			this._dragEnterFunc(target, e);
		}

		/**...........................................................................
		 * _onDragLeaveTarget
		 * ...........................................................................
		 * @param target 
		 * @param e 
		 * ...........................................................................
		 */
		protected _onDragLeaveTarget(target: HTMLElement, e: Event): void {
			this._dragLeaveFunc(target, e)
		}

		/**...........................................................................
		 * _onMove
		 * ...........................................................................
		 * @param delta 
		 * ...........................................................................
		 */
		protected _onMove(delta: IPoint): void {
			this._moveFunc(delta);
		}

		/**...........................................................................
		 * _onDropOnTarget
		 * ...........................................................................
		 * @param target 
		 * @param e 
		 * ...........................................................................
		 */
		protected _onDropOnTarget(target: HTMLElement, e: Event): void {
			this._dropFunc(target, e);
		}

		/**...........................................................................
		 * _overrideFunctions
		 * ...........................................................................
		 * @param dragEnter 
		 * @param dragLeave 
		 * @param drop 
		 * @param move 
		 * @param noReplace 
		 * ...........................................................................
		 */
		public overrideFunctions(handlers: IDraggableHandlers, noReplace?: boolean): void {
			if (handlers.onDragEnter) {
				this._overrideFunction(DraggableFunctions.DragEnter, this._dragEnterFunc, handlers.onDragEnter, noReplace);
			}

			if (handlers.onDragLeave) {
				this._overrideFunction(DraggableFunctions.DragLeave, this._dragLeaveFunc, handlers.onDragLeave, noReplace);
			}

			if (handlers.onDrop) {
				this._overrideFunction(DraggableFunctions.Drop, this._dropFunc, handlers.onDrop, noReplace);
			}

			if (handlers.onMove) {
				this._overrideFunction(DraggableFunctions.Move, this._moveFunc, handlers.onMove, noReplace);
			}
		}

		/**...........................................................................
		 * _overrideFunction
		 * ...........................................................................
		 * @param func 
		 * @param def 
		 * @param override 
		 * @param no_replace 
		 * ...........................................................................
		 */
		private _overrideFunction(func: DraggableFunctions, def: DraggableFunction, override: DraggableFunction, no_replace?: boolean) {
			let wrapper: DraggableFunction;

			switch (func) {

				//override or augment the drag enter function
				case DraggableFunctions.DragEnter:
					wrapper = (target: HTMLElement, e: Event) => {
						if (no_replace) { def.call(this, target, e); }
						override.call(this, target, e);
					};
					this._dragEnterFunc = wrapper as OnDragEnterFunction;
					break;

				// override or augment the drag leave function
				case DraggableFunctions.DragLeave:
					wrapper = (target: HTMLElement, e: Event) => {
						if (no_replace) { def.call(this, target, e); }
						override.call(this, target, e);
					}
					this._dragLeaveFunc = wrapper as OnDragLeaveFunction;
					break;

				// Override or augment the drop function
				case DraggableFunctions.Drop:
					wrapper = (target: HTMLElement, e: Event) => {
						if (no_replace) { def.call(this, target, e); }
						override.call(this, target, e);
					}
					this._dropFunc = wrapper as OnDropFunction;
					break;

				// Override or augment the move function
				case DraggableFunctions.Move:
					wrapper = (delta: IPoint) => {
						if (no_replace) { def.call(this, delta); }
						override.call(this, delta);
					}
					this._moveFunc = wrapper as OnMoveFunction;
					break;

			}
		}

		/**...........................................................................
		 * _getDelta
		 * ...........................................................................
		 * Gets the delta from the last measurement and this point
		 * @param	e 	The event we are measuring from
		 * @returns The delta represented as a point
		 * ...........................................................................
		 */
		private _getDelta(e: MouseEvent): IPoint {
			let delta: IPoint;

			// Create the delta element
			delta = {
				x: (e.clientX - this._mousePoint.x),
				y: (e.clientY - this._mousePoint.y)
			};

			return delta;
		}

		/**...........................................................................
		 * _updateMousePoint
		 * ...........................................................................
		 * Updates our internal tracking for the last mouse point
		 * @param {MouseEvent} e The event we are using to set the point
		 * ...........................................................................
		 */
		private _updateMousePoint(e: MouseEvent): void {
			this._mousePoint = {
				x: e.clientX,
				y: e.clientY
			};
		}

	}

	/**...........................................................................
	 * ExistingDraggable
	 * ...........................................................................
	 * Turn an existing element into one that can be dragged about the screen
	 * @version 1.0
	 * ...........................................................................
	 */
	export class ExistingDraggable extends Draggable {

		/**...........................................................................
		 * create an Existing Draggable element from an existing HTML or SVG element
		 * @param	existingElem	The element to use as the base
		 * @param	target			If included, the target of drop actions
		 * @param	nonStandard		If true, uses mouseup / down instead of drag / drop
		 * ...........................................................................
		 */
		constructor (existingElem: StandardElement, target?: HTMLElement, nonStandard?: boolean) {
			super(null, target, nonStandard);
			this._elems = {
				base: existingElem
			};
		}

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 * Does nothing as the only element here is the base, which already exists
		 * ...........................................................................
		 */
		protected _createElements(): void {}
	}



	/**...........................................................................
	 * makeDraggable
	 * ...........................................................................
	 * Makes a particular element draggable
	 * 
	 * @param 	elem         	The element to make draggable
	 * @param 	target       	The drop-target of the draggable
	 * @param 	non_standard 	True if we should use non-standard events
	 * 
	 * @returns	HTML element that respects drag events
	 * ...........................................................................
	 */
	export function makeDraggable(elem: HTMLElement, options: IDraggableOptions): StandardElement {

		// Behind the scenes, we create a draggable to get this
		let drg: ExistingDraggable = new ExistingDraggable(elem, options.target, options.isNonStandard);
		drg.overrideFunctions(options);

		// Return the element of the Draggable
		return drg.base;
	}
}