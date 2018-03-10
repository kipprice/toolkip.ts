///<reference path="canvasElement.ts" />
namespace KIP {
    export class RectangleElement extends CanvasElement {
        protected _type: ElementType = ElementType.Rectangle;
        protected _oldDimensions: IBasicRect;

        protected _borderRadius: number = 0;
        public set borderRadius (bRad: number) { this._borderRadius = bRad; }

        protected _displayBorderRadius: IPoint;

        public get type(): ElementType { return ElementType.Rectangle; }

        /** create a rectangle element 
         * @param id - unique ID for the rectangle
         * @param dimensions - the size of the rectangle (in canvas coordinates)
         */
        constructor (id: string, dimensions: IBasicRect) {
            super(id);
            this._dimensions = dimensions;
            this._initializeRects();
        }
        
        /** actually draw the rectangle */
        protected _onDraw(context: CanvasRenderingContext2D) : void {

            if (this._borderRadius === 0) {
                this._unroundedRect(context);
            } else {
                this._roundedRect(context);
            }
            
        }

        private _unroundedRect (context: CanvasRenderingContext2D) : void {
            context.fillRect(               // Create the actual rectangle
                this._displayDimensions.x,  // ...
                this._displayDimensions.y,  // ...
                this._displayDimensions.w,  // ...
                this._displayDimensions.h   // ...
            );                              // ...
        }

        private _roundedRect (context: CanvasRenderingContext2D): void {
            context.beginPath();

            let dim: IBasicRect = this._displayDimensions;
            let radius: IPoint = this._displayBorderRadius;

            // top straight line
            context.moveTo(
                dim.x + radius.x, 
                dim.y
            );
            context.lineTo(
                dim.x + dim.w - radius.x,
                dim.y
            );

            // top right rounded corner
            context.quadraticCurveTo(
                dim.x + dim.w,
                dim.y,
                dim.x + dim.w,
                dim.y + radius.y
            );

            // right vertical side
            context.lineTo(
                dim.x + dim.w,
                dim.y + dim.h - radius.y
            );

            // bottom right rounded corner
            context.quadraticCurveTo(
                dim.x + dim.w,
                dim.y + dim.h,
                dim.x + dim.w - radius.x,
                dim.y + dim.h
            );

            // bottom straight line
            context.lineTo(
                dim.x + radius.x,
                dim.y + dim.h
            );

            // bottom left rounded corner
            context.quadraticCurveTo(
                dim.x,
                dim.y + dim.h,
                dim.x,
                dim.y + dim.h - radius.y
            );

            // left straight line
            context.lineTo(
                dim.x,
                dim.y + radius.y
            );

            // top left rounded corner
            context.quadraticCurveTo(
                dim.x, 
                dim.y,
                dim.x + radius.x,
                dim.y
            );
            context.closePath();
            context.fill();


        }

        public updateDimensions (canvasDimensions: IBasicRect): void {
            super.updateDimensions(canvasDimensions);

            this._displayBorderRadius = {
                x: this._borderRadius * this._canvas.zoomFactor.x,
                y: this._borderRadius * this._canvas.zoomFactor.y
            };
        }

        /** clone an element for an effect to be applied */
        protected _cloneForEffect(id: string): RectangleElement {
            let dim = cloneRect(this._dimensions);
            let clone: RectangleElement = new RectangleElement(id, dim);
            return clone;
        }
        
    }
}