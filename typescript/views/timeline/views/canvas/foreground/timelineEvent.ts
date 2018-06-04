namespace KIP.Timeline {
    export class TimelineEvent extends PathElement {

        private _date: Date;

        protected _model: TimedElement;
        public get model(): TimedElement { return this._model; }
        public set model(data: TimedElement) { this._model = data; }
        
        

        protected _canvas: Timeline;

        // Create an event
        constructor (id: string, date: Date) {
            super(id,[]);
            this._date = date;
        }

        /** override the default canvas setting, since we need it to handle the point updates */
        public set canvas (canvas: Timeline) {
            this._canvas = canvas;
            let startPt: IPoint = this._canvas.convertDateToPoint(this._date);
            this._dimensions.x = startPt.x;

            this._setPoints();
        }

        /** update the points for this path, based on new dimensions */
        private _setPoints (): void {
            let xOffset: number = this._dimensions.x;
            let yOffset: number = this._dimensions.y;

            this._points = [
                { x: -2, y: -14 },
                { x: -2, y: 0 },
                { x: 0, y: 2 },
                { x: 2, y: 2 },
                { x: 2, y: -14 }
            ];

            this._points = [
                {x: 0, y: -2},
                {x: 1, y: -2},
                {x: 1, y: 8},
                {x: 0, y: 8}
            ];

            let pt: IPoint;
            for (pt of this._points) {
                pt.x += xOffset;
                pt.y += yOffset;
            }
        }
    }
}