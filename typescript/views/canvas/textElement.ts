///<reference path="canvasElement.ts" />
namespace KIP {

	/**...........................................................................
	 * @class	TextElement
	 * ...........................................................................
	 * Draw text on a canvas
	 * @author	Kip Price
	 * @version 1.0.0
	 * ...........................................................................
	 */
	export class TextElement extends CanvasElement {

		//#region PROPERTIES

		/** what type of element this is */
		protected _type: ElementType = ElementType.Text;
		public get type(): ElementType { return ElementType.Text; }

		/** the text to display in this element */
		private _text: string;
		public set text (txt: string) { this._text = txt; }

		/** tracks whether this text should be considered fixed as opposed to scalable */
		private _fixed: boolean;
		public set fixed (fixed: boolean) { this._fixed = fixed;}

		//#endregion

		/**...........................................................................
		 * _setCanvas
		 * ...........................................................................
		 * handle the canvas being assigned to this element
		 * @param	canvas	The 
		 * ...........................................................................
		 */
		protected _setCanvas (canvas: HTML5Canvas) : void { 
			super._setCanvas(canvas);
			this._calculateTextMetrics(); 
		}


		/**...........................................................................
		 * create the text element 
		 * @param	id		Unique identifier for the element
		 * @param	text	The text to display for the element
		 * @param	point	The top-left point for the text
		 * ...........................................................................
		 */
		constructor (id: string, text: string, point: IPoint){
			super(id);
			this._text = text;
			this._dimensions = {
				x: point.x,
				y: point.y,
				w: 10,			// Estimate until we can calculate the real width
				h: 10			// Same for height
			};
			this._initializeRects();
			this._addStyleChangeListener();
		}

		/**...........................................................................
		 * _addStyleChangeListener
		 * ...........................................................................
		 * Handle when the style changes for this element
		 * ...........................................................................
		 */
		private _addStyleChangeListener (): void {
			this._style.addStyleChangeListener(StyleChangeEnum.FONT_SIZE, () => {
				this._dimensions.h = this._style.fontSize;
			});
		}

		/**...........................................................................
		 * _calculateTextMetrics
		 * ...........................................................................
		 * determine how big the text should be 
		 * ...........................................................................
		 */
		private _calculateTextMetrics () : void {
			if (!this._canvas) { return; }
			let context: CanvasRenderingContext2D = this._canvas.context;

			this._applyStyle(context);

			let metrics: TextMetrics = context.measureText(this._text);

			this._restoreStyle(context);

			// Set the real measurements
			this._dimensions.w = metrics.width;
			this._dimensions.h = this.style.fontSize;

			// set the display dimensions to be this statically
			this._displayDimensions.w = metrics.width;
			this._displayDimensions.h = this.style.fontSize;

		}

		/**...........................................................................
		 * _onDraw
		 * ...........................................................................
		 * draw the text element on the canvas 
		 * @param	context		The canvas upon which to render
		 * ...........................................................................
		 */
		protected _onDraw (context: CanvasRenderingContext2D) : void {

			// draw the actual text of the element
			context.fillText(
				this._text,
				this._displayDimensions.x,
				this._displayDimensions.y + (this._fixed? this._dimensions.h : this._displayDimensions.h)
			);

			// consider the display dimensions the same as the original calculation
			this._displayDimensions.w = this._dimensions.w;
			this._displayDimensions.h = this._dimensions.h;
		}

		/**...........................................................................
		 * _cloneForEffect
		 * ...........................................................................
		 * clone a text effect 
		 * @param	id	The identifier to use for the cloned element
		 * @returns	The cloned text element
		 * ...........................................................................
		 */
		protected _cloneForEffect (id: string) : TextElement {
			let pt: IPoint = {
				x: this._dimensions.x,
				y: this._dimensions.y
			};
			let out: TextElement = new TextElement(id, this._text, pt);
			return out;
		}
	}
}