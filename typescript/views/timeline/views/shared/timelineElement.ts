namespace KIP.Timeline {
    export class TimelineElementView extends CanvasGroup {

        protected _model: TimedElement;
        public get model(): TimedElement { return this._model; }
        public set model(data: TimedElement) { this._model = data; }
        
    }
}