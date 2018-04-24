///<reference path="canvasElement.ts" />
namespace KIP {
	export class TextElement extends CanvasElement {

		protected _type: ElementType = ElementType.Text;
		private _text: string;
		public set text (txt: string) { this._text = txt; }

		private _fixed: boolean;
		public set fixed (fixed: boolean) { this._fixed = fixed;}

		public get type(): ElementType { return ElementType.Text; }

		/** handle the canvas being assigned to the  */
		protected _setCanvas (canvas: HTML5Canvas) : void { 
			super._setCanvas(canvas);
			this._calculateTextMetrics(); 
		}

		/** create the text element */
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

		private _addStyleChangeListener (): void {
			this._style.addStyleChangeListener(StyleChangeEnum.FONT_SIZE, () => {
				this._dimensions.h = this._style.fontSize;
			});
		}

		/** determine how big the text should be */
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

		/** draw the text element on the canvas */
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

		/** clone a text effect */
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