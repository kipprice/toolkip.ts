namespace KIP.Timeline {

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

    export class Timespan extends RectangleElement {
        //#region PROPERTIES

        /** track the start date of this segment */
       protected _model: TimedElement;
       public get model(): TimedElement { return this._model; }
       public set model(data: TimedElement) { this._model = data; }

        /** canvas for the timespan */
        protected _canvas: Timeline;

        //#endregion

        constructor(id: string, start: Date, end: Date) {
            super(id, _createEmptyDimensions());
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
            let startPt: IPoint = this._canvas.convertDateToPoint(this._model.start);
            let endPt: IPoint = this._canvas.convertDateToPoint(this._model.end);

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