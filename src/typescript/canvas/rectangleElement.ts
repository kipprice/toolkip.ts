///<reference path="canvasElement.ts" />
namespace KIP {

    /**...........................................................................
     * @class   RectangleElement
     * ...........................................................................
     * Create a rectangle on the canvas
     * @author  Kip Price
     * @version 1.0.0
     * ...........................................................................
     */
    export class RectangleElement extends CanvasElement {
        //#region PROPERTIES

        /** type of this element */
        protected _type: ElementType = ElementType.Rectangle;
        public get type(): ElementType { return ElementType.Rectangle; }

        /** details about how this rectangle used to be displayed */
        protected _oldDimensions: IBasicRect;

        /** what border radius should be used (if any) for this rectangle */
        protected _borderRadius: number = 0;
        public set borderRadius (bRad: number) { this._borderRadius = bRad; }

        /** handle variations in scale between x & y when rounding rectangles */
        protected _displayBorderRadius: IPoint;

        //#endregion

        /**...........................................................................
         *  create a rectangle element 
         * @param   id          unique ID for the rectangle
         * @param   dimensions  the size of the rectangle (in canvas coordinates)
         * ...........................................................................
         */
        constructor (id: string, dimensions: IBasicRect) {
            super(id);
            this._dimensions = dimensions;
            this._initializeRects();
        }
        
        /**...........................................................................
         * _onDraw
         * ...........................................................................
         * actually draw the rectangle 
         * @param   context     Context in which to draw this element
         * ...........................................................................
         */
        protected _onDraw(context: CanvasRenderingContext2D) : void {

            if (this._borderRadius === 0) {
                this._unroundedRect(context);
            } else {
                this._roundedRect(context);
            }
            
        }

        /**...........................................................................
         * _unroundedRect
         * ...........................................................................
         * Draw a plain unrounded rectangle
         * @param   context     The context in which to render this element
         * ........................................................................... 
         */
        private _unroundedRect (context: CanvasRenderingContext2D) : void {
            context.fillRect(               // Create the actual rectangle
                this._displayDimensions.x,  // ...
                this._displayDimensions.y,  // ...
                this._displayDimensions.w,  // ...
                this._displayDimensions.h   // ...
            );                              // ...
        }

        /**...........................................................................
         * _roundedRect
         * ...........................................................................
         * Draw a rectangle with rounded corners
         * @param   context     The context in which to draw this rectangle
         * ...........................................................................
         */
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

        /**...........................................................................
         * updateDimensions
         * ...........................................................................
         * Update our rectangle's dimensions
         * @param   canvasDimensions    The dimensions of the canvas as a whole
         * ........................................................................... 
         */
        public updateDimensions (canvasDimensions: IBasicRect): void {
            super.updateDimensions(canvasDimensions);

            this._displayBorderRadius = {
                x: this._borderRadius * this._canvas.zoomFactor.x,
                y: this._borderRadius * this._canvas.zoomFactor.y
            };
        }

        /**...........................................................................
         * _cloneForEffect
         * ...........................................................................
         * clone an element for an effect to be applied 
         * @param   id  Unique identifier for the cloned element
         * @returns The cloned rectangle
         * ...........................................................................
         */
        protected _cloneForEffect(id: string): RectangleElement {
            let dim = cloneRect(this._dimensions);
            let clone: RectangleElement = new RectangleElement(id, dim);
            return clone;
        }
        
    }
}