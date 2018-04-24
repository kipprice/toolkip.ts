namespace KIP {

    /**...........................................................................
     * createEmptyPoint
     * ...........................................................................
     * Helper function to create an empty point object
     * 
     * @returns The created empty point
     * ...........................................................................
     */
    function createEmptyPoint(): IPoint {
        return { x: 0, y: 0 };
    }

    /**...........................................................................
     * @class TimelineLabel
     * Creates a label for a timeline element
     * @version 1.0
     * ...........................................................................
     */
    export class TimelineLabel extends TextElement implements ITimelineElement{

        /** where to draw this particular label */
        private _startDate: Date;
        public get startDate(): Date { return this._startDate; }
        public set startDate(start: Date) { 
            this._startDate = start; 
            this._updatePoint();
        }

        /** we don't have an end date, so just return the start date */
        public get endDate(): Date { return this._startDate; }
        public set endDate(dt: Date) { }

        /** the canvas we are drawing upon */
        protected _canvas: Timeline;

        /**...........................................................................
         * Create a TimelineLabel
         * @param   id      Unique identifier for the label
         * @param   lbl     What text should be displayed
         * ...........................................................................
         */
        constructor (id: string, lbl: string) {
            super(id, lbl, createEmptyPoint());
        }

        /**...........................................................................
         * _setCanvas
         * ...........................................................................
         * Override how we set the canvas for this element
         * @param canvas 
         * ...........................................................................
         */
        protected _setCanvas(canvas: Timeline): void {
            super._setCanvas(canvas);
            this._updatePoint();
        }

        /**...........................................................................
         * _updatePoint
         * ...........................................................................
         * Handle the point being updated for this element
         * ...........................................................................
         */
        protected _updatePoint (): void {
            if (!this._canvas) { return; }
            if (!this._startDate) { return; }
            let startPt: IPoint = this._canvas.convertDateToPoint(this._startDate);
            this._dimensions.x = startPt.x;
        }

        /**...........................................................................
         * updateDimensions
         * ...........................................................................
         * Allow a caller to update the dimensions of display for this element
         * 
         * @param   visibleWindow   The new window that's visible
         * ........................................................................... 
         */
        public updateDimensions (visibleWindow: IBasicRect): void {
            super.updateDimensions(visibleWindow);

            // Quit if we're offscreen because of the y direction
            if (this.isOffScreen) { 
                if (this._dimensions.y < visibleWindow.y) { return; }
                if ((this._dimensions.y + this._dimensions.h) > (visibleWindow.y + visibleWindow.h)) { return; }
            }

            if (this._dimensions.x < visibleWindow.x) {
                this._displayDimensions.x = 0;
                this._isOffScreen = false;
            }
        }

    }   
}