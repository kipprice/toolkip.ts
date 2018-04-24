namespace KIP {

    export interface ProjectLineSegmentOptions {
        COLOR?: string;
        FONT_SIZE?: number;
    }

    /** helper function to create an empty rect */
    function _createEmptyDimensions(): IBasicRect {
        return {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };
    }

    export class Timespan extends RectangleElement implements ITimelineElement {
        //#region PROPERTIES

        /** track the start date of this segment */
        private _startDate: Date;
        public get startDate(): Date { return this._startDate; }
        public set startDate (dt: Date) { }

        /** track the end date of this segment */
        private _endDate: Date;
        public get endDate(): Date { return this._endDate; }
        public set endDate(dt: Date) { }

        /** canvas for the timespan */
        protected _canvas: Timeline;

        //#endregion

        constructor(id: string, start: Date, end: Date) {
            super(id, _createEmptyDimensions());
            this._startDate = start;
            this._endDate = end;
        }

        /** create the default set of options */
        private _constructDefaultOptions(): ProjectLineSegmentOptions {
            return {
                COLOR: "#333",
                FONT_SIZE: 10
            };
        }

        /** override the canvas being set to find the appropriate position */
        public set canvas (canvas: Timeline) {
            this._canvas = canvas;
            this._calculatePosition();
        }

        /** sets the appropriate position for the element */
        private _calculatePosition(): void {

            // Quit if we don't have a parent or a canvas element
            if (!this._parent) { return; }  
            if (!this._canvas) { return; }

            // Calculate the date positions
            let startPt: IPoint = this._canvas.convertDateToPoint(this._startDate);
            let endPt: IPoint = this._canvas.convertDateToPoint(this._endDate);

            // Create the appropriately sized rect
            let dim: IBasicRect = {
                x: startPt.x,
                y: this._dimensions.y, 
                w: (endPt.x - startPt.x),
                h: this._dimensions.h
            };

            // Set the dimensions on our rectangle
            this._dimensions = dim;
        }

    }
}