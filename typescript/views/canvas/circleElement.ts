///<reference path="canvasElement.ts" />
namespace KIP {
	export class CircleElement extends CanvasElement {
		private _center: IPoint;
		private _radius: IPoint;
		private _displayRadius: IPoint;

		public get type(): ElementType { return ElementType.Circle; }

		constructor(id: string, center: IPoint, radius: IPoint);
		constructor(id: string, center: IPoint, radius: number);
		constructor(id: string, center: IPoint, temp: IPoint | number) {
			super(id);

			let radius: IPoint;
			if (isNumber(temp)) {
				radius = {
					x: temp,
					y: temp
				};
			} else {
				radius = temp;
			}

			this._dimensions = {
				x: center.x - radius.x,
				y: center.y - radius.y,
				w: radius.x * 2,
				h: radius.y * 2
			};

			this._center = center;
			this._radius = radius;

			this._initializeRects();
		}
		
		protected _onDraw(context: CanvasRenderingContext2D): void {

			// TODO: HANDLE SCALING IF NEED BE

			// draw the actual text of the element
			context.beginPath();
			context.arc(
				this._displayDimensions.x + this._displayRadius.x, 
				this._displayDimensions.y + this._displayRadius.y,	
				this._displayRadius.x,
				0, 
				2 * Math.PI
			);
			context.fill();

			// return style to norm
			this._restoreStyle(context);
		}

		/** change the dimensions based on a pan / zoom change on the canvas */
		public updateDimensions(canvasDimensions: IBasicRect) : void {
			super.updateDimensions(canvasDimensions);

			this._displayRadius = {
				x: this._radius.x * this._canvas.zoomFactor.x,
				y: this._radius.y * this._canvas.zoomFactor.y
			};
		}

		/** override default dimensions for circle specific dimensions */
		protected _debugDimensions () {
			console.log("CIRCLE:");
			console.log("center pt: " + Math.round(this._displayDimensions.x + this._displayRadius.x) + ", " + Math.round(this._displayDimensions.y + this._displayRadius.y));
			console.log("radius: " + Math.round(this._displayRadius.x));
			this._canvas.debugRelativeDimensions();
		}

		/** create a clone to be used in effect calculations */
		protected _cloneForEffect (id: string) : CircleElement {

			// clone relevant data 
			let center: IPoint = {
				x: this._dimensions.x + this._radius.x,
				y: this._dimensions.y + this._radius.y
			};
			let radius: IPoint = clonePoint(this._radius);

			let elem: CircleElement = new CircleElement(id, center, radius);
			return elem;
		}

		/** allow effect elements to be resized */
		protected _scale (scaleAmt: number) {
			if (!this._isEffect) { return; }

			super._scale(scaleAmt);

			// Update this radius
			this._radius = {
				x: this._radius.x * scaleAmt,
				y: this._radius.y * scaleAmt
			};

			
		}
		
	}
}