///<reference path="canvasElement.ts" />
namespace KIP {
	export class PathElement extends CanvasElement {
		protected _points: IPoint[];
		protected _displayPoints: IPoint[];

		public get type(): ElementType { return ElementType.Path; }

		private _needsInitialDimensions: boolean;

		constructor (id: string, points?: IPoint[]) {
			super(id);
			this._initializeRects();

			if (points) {
				this._points = points;
				this._updateExtremaFromPoints();
			} else {
				this._points = [];
			}
		}

		/** create an empty dimensions rect */
		protected _initializeRects () : void {
			this._dimensions = {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			};

			super._initializeRects();

			this._needsInitialDimensions = true;
		}

		/** add a new point to this path */
		public addPoint (point: IPoint) {
			this._points.push(point);
			
			// Update extrema
			this._updateExtremaFromPoint(point);
		}

		/** loop through and update extremas based on all points */
		private _updateExtremaFromPoints(): void {
			let point: IPoint;
			for (point of this._points) {
				this._updateExtremaFromPoint(point);
			}
		}

		/** check if extrema need to be updated for a single point */
		private _updateExtremaFromPoint (point: IPoint) : void {

			// Check for x extremes
			if (this._needsInitialDimensions || point.x < this._dimensions.x) { this._dimensions.x = point.x; }
			else if (point.x > (this._dimensions.x + this._dimensions.w)) { this._dimensions.w = (point.x - this._dimensions.x); }

			// Check for y extremes
			if (this._needsInitialDimensions || point.y < this._dimensions.y) { this._dimensions.y = point.y; }
			else if (point.y > (this._dimensions.y + this._dimensions.h)) { this._dimensions.h = (point.y - this._dimensions.y); }

			this._needsInitialDimensions = false;
		}

		/** actually create the path on the canvas */
		protected _onDraw (context: CanvasRenderingContext2D) : void {
			context.beginPath();

			// Add each point
			let point: IPoint;
			for (point of this._displayPoints) {
				context.lineTo(point.x, point.y);		//TODO: [future] add curves and arcs as well
			}
			context.closePath();
			context.fill();

		}

		/**  */
		public updateDimensions (canvasDimensions: IBasicRect): void {
			super.updateDimensions(canvasDimensions);

			// We need to update each of our points
			this._displayPoints = [];
			let point: IPoint;
			for (point of this._points) {
				//let displayPoint: IPoint = this._canvas.convertAbsolutePointToRelativePoint(point);
				let displayPoint: IPoint = {
					x: (point.x - canvasDimensions.x) * this._canvas.zoomFactor.x,
					y: (point.y - canvasDimensions.y) * this._canvas.zoomFactor.y
				}
				this._displayPoints.push(displayPoint);
			}
		}

		public adjustDimensions(adjustPt: IPoint): void {
			if (this._isEffect) { return; }
			super.adjustDimensions(adjustPt);

			let point: IPoint;
			for (point of this._points) {
				point.x += adjustPt.x;
				point.y += adjustPt.y;
			}
		}

		/** clone in order to be able to apply various effects */
		protected _cloneForEffect (id: string) : PathElement {
			let out: PathElement = new PathElement(id, clonePointArray(this._points));
			return out;
		}

		protected _scale (scaleAmt: number): void {
			if (!this._isEffect) { return; }

			// calculate the central point (defined as the center of each extrema)
			let center: IPoint = {
				x: this._dimensions.x + (this._dimensions.w / 2),
				y: this._dimensions.y + (this._dimensions.h / 2)
			};

			// Scale each point to be some amount further from the center
			let pt: IPoint;
			let tmpPoints: IPoint[] = [];
			for (pt of this._points) {
				let tmpPt: IPoint = this._scalePoint(pt, center, scaleAmt);
				tmpPoints.push(tmpPt);
			}

			// set our points array to the new points array
			this._points = tmpPoints;
			this._updateExtremaFromPoints();
		}

		private _scalePoint (pt: IPoint, center: IPoint, scaleAmt: number) : IPoint {
			let angle: number = Trig.getAngle(center, pt);
			let distance: number = Trig.getDistance(center, pt);
			let newDistance: number = distance * scaleAmt;
			let newPt: IPoint = Trig.getEndPoint(center, angle, newDistance);
			return newPt;
		}
	}
}