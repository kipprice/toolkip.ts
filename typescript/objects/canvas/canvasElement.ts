///<reference path="canvas.ts" />
namespace KIP {

	/**...........................................................................
	 * ElementType
	 * ...........................................................................
	 * The type of element we're drawing  
	 * ...........................................................................
	 */
	export enum ElementType {
		Rectangle,
		Text,
		Circle,
		Path,
		Group
	}

	/**...........................................................................
	 * EventTypeEnum
	 * ...........................................................................
	 * Handle all of the events we might need 
	 * ...........................................................................
	 */
	export enum EventTypeEnum {
		CLICK = 0,
		HOVER = 1,
		LEAVE = 2,
		R_CLICK = 3,
		DBL_CLICK = 4,
		KEY_PRESS = 5,
		FOCUS = 6,
		BLUR = 7
	};

	/** declare the style options supported by cavas elements */
	

	/**...........................................................................
	 * CanvasEventHandler
	 * ...........................................................................
	 * interface for callbacks handling events 
	 * 
	 * @param	pt
	 * @param	e
	 * ...........................................................................
	 */
	export interface CanvasEventHandler {
		(pt: IPoint, e?: Event) : void;
	}

	/**...........................................................................
	 * CanvasMouseEventHandler
	 * ...........................................................................
	 * interface for callbacks handling mouse events 
	 * @param	pt
	 * @param	e
	 * ........................................................................... 
	 */
	export interface CanvasMouseEventHandler extends CanvasEventHandler {
		(pt: IPoint, e?: MouseEvent): void;
	}

	/**...........................................................................
	 * CanvasKeyboardEventHandler
	 * ...........................................................................
	 * interface for callbacks handling keyboard events 
	 * @param	pt
	 * @param	e
	 * ...........................................................................
	 */
	export interface CanvasKeyboardEventHandler extends CanvasEventHandler {
		(pt: IPoint, e?: KeyboardEvent): void;
	}

	/**...........................................................................
	 * ICanvasElementTransform
	 * ...........................................................................
	 *  interface for handling transforms on click / hover 
	 * ........................................................................... 
	 */
	export interface ICanvasElementTransform {

		/** how we should scale the element */
		scale?: number;

		/** if set, scale x and y differently */
		unevenScale?: IPoint;

		/** the color this element should shift to */
		color?: string;
	}
	
	/**...........................................................................
	 * @class CanvasElement
	 * ...........................................................................
	 * create a canvas element
	 * @version 1.1
	 * @author	Kip Price
	 * ........................................................................... 
	 */
	export abstract class CanvasElement {

		//#region PROPERTIES

		/** unique ID for this particular element */
		protected _id: string;
		public get id (): string { return this._id; }

		/** determines whether this is an effect element */
		protected _isEffect: boolean;

		/** keep track of elements for thsi Drawable */
		protected _elems: IDrawableElements;
		
		/** keep track of the type of element */
		public abstract get type (): ElementType;
		protected _type: ElementType;

		/** Track the canvas for ease of grabbing global stats */
		protected _canvas: HTML5Canvas;
		public set canvas (canvas: HTML5Canvas) { this._setCanvas(canvas); }

		/** Every element will have a direct CanvasGroup as a parent (except for the top level CanvasGroup) */
		protected _parent: CanvasGroup;
		public set parent (grp: CanvasGroup) { this._parent = grp; }

		/** style for the element */
		protected _style: CanvasElementStyle;
		public get style () : CanvasElementStyle { return this._style; }
		public set style (s: CanvasElementStyle) { this._style = s; }

		/** how this element will transform */
		protected _transformDetails: ICanvasElementTransform;

		/** layer at which the element should appear. Defaults to 1 */
		protected _layer: number = 1;
		public get layer(): number { return this._layer; }
		public set layer (layer: number) { this._layer = layer; }

		/** determines whether this element is off-screen */
		protected _isOffScreen: boolean;
		public get isOffScreen (): boolean { return this._isOffScreen; }

		/** real dimensions for the element */
		protected _dimensions: IBasicRect;
		public get dimensions () : IBasicRect { return this._dimensions; }
		public set dimensions (dim: IBasicRect) { this._setDimensions(dim); }

		/** where the element should current display */
		protected _displayDimensions: IBasicRect;
		public get displayDimensions () : IBasicRect { return this._displayDimensions; }

		/** where the element was previously positioned */
		protected _oldDimensions: IBasicRect;

		/** detect whether the element has been drawn*/
		protected _isDrawn: boolean;

		/** determines if this element is the target of a hover */
		protected _isHoverTarget: boolean;
		public get isHoverTarget () : boolean { return this._isHoverTarget; }
		public set isHoverTarget (value: boolean) { this._isHoverTarget = value; }

		/** listeners for events */
		protected _eventFunctions: CanvasEventHandler[][];

		/** handle hiding elements */
		protected _isHidden: boolean;
		public get isHidden(): boolean { return this._isHidden; }

		//#endregion

		/**...........................................................................
		 * create a canvas element 
		 * 
		 * @param	id			The unique ID for this
		 * @param 	isEffect 	If true, treats this element as an effect
		 * ...........................................................................
		 */
		constructor (id: string, isEffect?: boolean) {
			this._id = id;
			this._isEffect = isEffect;
			this._eventFunctions = [];
			this._style = new CanvasElementStyle();
		}


		/**...........................................................................
		 * _initializeRects
		 * ...........................................................................
		 * create the initial display rectangle
		 * ...........................................................................
		 */
		protected _initializeRects () : void {
			this._displayDimensions = {
				x: this._dimensions.x,
				y: this._dimensions.y,
				w: this._dimensions.w,
				h: this._dimensions.h
			};
		}

		/**...........................................................................
		 * _applyStyle
		 * ...........................................................................
		 * update the context to use this element's style 
		 *
		 * @param	context		The Canvas context to draw on
		 * ........................................................................... 
		 */
		protected _applyStyle (context: CanvasRenderingContext2D) : void {
			this._style.setStyle(context);
		}


		/**...........................................................................
		 * _restoreStyle
		 * ...........................................................................
		 * set the context style back to what it originally was 
		 * 
		 * @param	context
		 * ...........................................................................
		 */
		protected _restoreStyle (context: CanvasRenderingContext2D): void {
			this._style.restoreStyle(context);
		}

		/**...........................................................................
		 * transform
		 * ...........................................................................
		 * handle a temporary transform for the element 
		 * 
		 * @param 	transformDetails
		 * ...........................................................................
		 */
		public transform (transformDetails: ICanvasElementTransform): void {
			// we need a canvas object to have been assigned
			if (!this._parent) { return; }

			// create a clone of this element
			let clone: CanvasElement = this._cloneForEffect(this.id + "|e");
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

		}

		/**...........................................................................
		 * _cloneForEffect
		 * ...........................................................................
		 * abstract method to get a new cloned element 
		 *
		 * @param	id
		 * 
		 * @returns
		 * ........................................................................... 
		 */
		protected abstract _cloneForEffect (id: string): CanvasElement;

		/**...........................................................................
		 * _cloneStyle
		 * ...........................................................................
		 * copy style from one elem for use in another 
		 *
		 * @returns 
		 * ...........................................................................
		 */
		private _cloneStyle () : CanvasElementStyle {
			return new CanvasElementStyle(this._style);
		}

		/**...........................................................................
		 * _scale
		 * ...........................................................................
		 * standard scale algorithm 
		 * @param	scaleAmt
		 * ...........................................................................
		 * */
		protected _scale (scaleAmt: number): void {

			// This is only allowed for effect elements
			if (!this._isEffect) { return; }

			// calculate the width offset and value
			let newWidth: number = scaleAmt * this._dimensions.w;
			let xOffset: number = (newWidth - this._dimensions.w) / 2;

			// calculate the height offset and value
			let newHeight: number = scaleAmt * this._dimensions.h;
			let yOffset: number = (newHeight - this._dimensions.h) / 2;

			// update the dimensions to be appropriate for this scaling element
			this._dimensions = {
				x: this._dimensions.x - xOffset,
				y: this._dimensions.y - yOffset,
				w: newWidth,
				h: newHeight
			};
		}
	
		/**...........................................................................
		 * updateDimensions
		 * ...........................................................................
		 * update the internal dimensions of the element 
		 * @param	canvasDimensions
		 * ...........................................................................
		 */
		public updateDimensions(canvasDimensions: IBasicRect): void {
			this._displayDimensions = this._canvas.convertAbsoluteRectToRelativeRect(this._dimensions);

			// Update our tracking variable to determine whether 
			// we should be showing this element
			this._setIsOffScreen(canvasDimensions);

		}

		/**...........................................................................
		 * adjustDimensions
		 * ...........................................................................
		 * shift the dimensions of the element based on the reference point 
		 * @param	adjustPt
		 * ...........................................................................
		 * */
		public adjustDimensions(adjustPt: IPoint): void {
			if (this._isEffect) { return; }

			this._dimensions.x += adjustPt.x;
			this._dimensions.y += adjustPt.y;
		}

		/**...........................................................................
		 * draw
		 * ...........................................................................
		 * abstract method that each child element will implement 
		 * ...........................................................................
		 */
		public draw() : void {

			// Don't do anything if we're offscreen or don't have a canvas
    		if (this._isOffScreen) { return; }
			if (!this._canvas) { return; }
			if (this._isHidden) { return; }

			// Get the context from the canvas, as appropriate for this particular element
			let context: CanvasRenderingContext2D;

			if (!this._isEffect) {
				context = this._canvas.context;
			} else {
				context = this._canvas.effectContext;
			}

			this._applyStyle(context);		// Set the appropriate style
			this._onDraw(context);			// Call on the child class to draw their specific stuff
			this._restoreStyle(context);	// Restore original style

			this._isDrawn = true;
		}

		/**...........................................................................
		 * _onDraw
		 * ...........................................................................
		 * Abstract function that will be implemented by each of the children of this class
		 * @param	context
		 * ...........................................................................
		 */
		protected abstract _onDraw(context: CanvasRenderingContext2D) : void;

		/**...........................................................................
		 * _setIsOffScreen
		 * ...........................................................................
		 * determine whether this element is off screen 
		 * @param	canvasDimensions	
		 * ...........................................................................
		 * */
		protected _setIsOffScreen (canvasDimensions: IBasicRect) : void {
			this._isOffScreen = !Trig.doBasicRectsOverlap(canvasDimensions, this._dimensions);
		}

		/**...........................................................................
		 * _setDimensions
		 * ...........................................................................
		 * allow outsiders to update the internal set of dimensions for this element 
		 * @param	dim
		 * ...........................................................................
		 */
		protected _setDimensions (dim: IBasicRect): void {
			this._dimensions = dim;
			if (this._canvas) { this._canvas.needsRedraw = true; }
		}

		/**...........................................................................
		 * _setCanvas
		 * ...........................................................................
		 * Set our internal canvas
		 * @param canvas 
		 * ...........................................................................
		 */
		protected _setCanvas (canvas: HTML5Canvas): void {
			this._canvas = canvas;
		}

		//#endregion

		//#region EVENT HANDLING FOR CANVAS ELEMENTS

		/** collect event listeners */
		public addEventListener( eventType: EventTypeEnum, eventFunc: CanvasEventHandler): void {
			let list: CanvasEventHandler[] = this._eventFunctions[eventType];
			if (!list) { 
				list = [];
				this._eventFunctions[eventType] = list;
			}

			list.push(eventFunc);
		}

		/** handle click events */
		public click (pt: IPoint, e: MouseEvent) : void {
			this.handleEvent(EventTypeEnum.CLICK, pt, e);
		}
		/** handle double clicks */
		public doubleClick (pt: IPoint, e: MouseEvent): void {
			this.handleEvent(EventTypeEnum.DBL_CLICK, pt, e);
		}

		/** handle the right click */
		public rightClick (pt: IPoint, e: MouseEvent): void {
			this.handleEvent(EventTypeEnum.R_CLICK, pt, e);
		}

		/** handle when the mouse enters the element */
		public hover (pt: IPoint, e: MouseEvent): void {
			this.handleEvent(EventTypeEnum.HOVER, pt, e);
		}

		/** handle when the mouse leaves the element */
		public leave (pt: IPoint, e: MouseEvent): void {
			this.handleEvent(EventTypeEnum.LEAVE, pt, e);
		}

		/** handle the keypress event */
		public keyPress (pt: IPoint, e: KeyboardEvent) : void {
			this.handleEvent(EventTypeEnum.KEY_PRESS, pt, e);
		}

		/** handle the focus event */
		public focus (pt: IPoint, e: Event): void {
			this.handleEvent(EventTypeEnum.FOCUS, pt, e);
		}

		/** handle the blur event */
		public blur (pt: IPoint, e: Event): void {
			this.handleEvent(EventTypeEnum.BLUR, pt, e);
		}

		/**...........................................................................
		 * handleEvent
		 * ...........................................................................
		 * generic handler for all events 
		 * ...........................................................................
		 */
		public handleEvent (eventType: EventTypeEnum, pt: IPoint, e: Event) : void {

			// Make sure we apply properties regardless of whether there are additional handlers
			if ((eventType === EventTypeEnum.BLUR) || (eventType === EventTypeEnum.LEAVE)) {
				if (this._parent) { this._parent.removeElement(this.id + "|e"); }
				this._isHoverTarget = false;
			} else if (eventType === EventTypeEnum.HOVER) {
				this._isHoverTarget = true;
			}

			// Add the event to the list
			let list: CanvasEventHandler[] = this._eventFunctions[eventType];
			if (!list) { return; }

			// handle all of the callbacks
			let func: CanvasEventHandler;
			for (func of list) {
				func(pt, e);
			}

			// If we have a canvas, tell it to redraw
			if (!this._canvas) { this._canvas.needsRedraw = true; }
		}
	
		//#endregion

		//#region HIDE AND SHOW THE ELEMENT

		/**...........................................................................
		 * swapVisibilty
		 * ...........................................................................
		 * Change whether this element is hidden or shown
		 * ...........................................................................
		 */
		public swapVisibility(): void {
			if (this._isHidden) {
				this.show();
			} else {
				this.hide();
			}
		}

		/**...........................................................................
		 * hide
		 * ...........................................................................
		 * Hide this element
		 * ...........................................................................
		 */
		public hide(): void {
			if (this._isHidden) { return; }
			this._isHidden = true;
			this._canvas.needsRedraw = true;
		}

		/**...........................................................................
		 * show
		 * ...........................................................................
		 * Show this element if it was hidden
		 * ...........................................................................
		 */
		public show(): void {
			if (!this._isHidden) { return; }
			this._isHidden = false;
			this._canvas.needsRedraw = true;
		}

		//#endregion
		//#region DEBUGGING FUNCTIONS

		/**...........................................................................
		 * _debugDimensions
		 * ...........................................................................
		 * display dimensions for debugging purposes 
		 * ...........................................................................
		 */
		protected _debugDimensions() {
					console.log("CANVAS ELEM: " + this._id);
					console.log("x: " + Math.round(this._displayDimensions.x) + " (from " + this._dimensions.x + ")");
					console.log("y: " + Math.round(this._displayDimensions.y) + " (from " + this._dimensions.y + ")");
					console.log("w: " + Math.round(this._displayDimensions.w) + " (from " + this._dimensions.w + ")");
					console.log("h: " + Math.round(this._displayDimensions.h) + " (from " + this._dimensions.h + ")");
					console.log("\nparent: " + (this._parent ? this._parent.id : "none"));
					console.log("===\n");
					if (this._canvas) {this._canvas.debugRelativeDimensions();}
					console.log("offscreen? " + this._isOffScreen);
					console.log("--------------------\n\n");
		}

		/**...........................................................................
		 * debugDimensions
		 * ...........................................................................
		 * public function for debugging purposes
		 * ...........................................................................
		 */
		public debugDimensions() : void {
			this._debugDimensions();
		}

		//#endregion


	}
}