namespace KIP.Timeline {
    export type TimelineBackingView = HTML5Canvas | SVG.SVGDrawable;
    export type TimelineBackingElement = CanvasElement | SVG.SVGElem;
    export type TimelineBackingGroup = CanvasGroup | SVG.GroupElement;

    /**...........................................................................
     * @class   TimelineView
     * ...........................................................................
     * Shared view for a timeline
     * @author  Kip Price
     * @version 1.0.0
     * ...........................................................................
     */
    export abstract class TimelineView<T extends TimelineBackingView, G extends TimelineBackingGroup> extends Drawable {

        //#region PROPERTIES

        /** canvas that will actually draw the elements */
        protected _canvas: T;

        /** background that will actually be rendered */
        protected _background: G;

        /** foreground for all of the elements */
        protected _foreground: G;

        /** track the controller that  */
        protected _controller: Timeline;

        //#endregion


        /**...........................................................................
         * addTimespan
         * ...........................................................................
         * Adds a timespan to the timeline view
         * ...........................................................................
         */
        public abstract addTimespan(): void;

        /**...........................................................................
         * addMilestone
         * ...........................................................................
         * Adds a milestone to the timeline view
         * ...........................................................................
         */
        public abstract addMilestone(): void;

        //#region HANDLE DISPLAYING DATA DIFFERENTLY
        public clear(): void {
            this._canvas.clear();
        }
        //#endregion
    }
}