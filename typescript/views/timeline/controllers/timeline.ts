///<reference path="../../canvas/canvas.ts" />
///<reference path="../views/shared/timelineElement.ts" />

namespace KIP.Timeline {

    /**...........................................................................
     * TimelineOptions
     * ...........................................................................
     * display options for a given timeline 
     * ...........................................................................
     */
    export interface TimelineOptions extends IHTML5CanvasOptions {

        /** how far the Y dimension should extend for a day */
        DAY_HEIGHT?: number;

        /** how far the X dimension should extend for a day */
        DAY_WIDTH?: number;

        /** what should be considered the central date for the timeline */
        CENTRAL_DATE?: Date;

        /** the colors that should be used for the months */
        MONTH_COLORS?: string[];

        /** how days should be formatted per their values */
        DAY_FORMATTING?: {
            NORMAL?: string;
            WEEKEND?: string;
            HOLIDAY?: string;
            TODAY?: string;
        };

        /** what color should be used for borders on elements */
        BORDER_COLOR?: string;

        /** what should be used for the date background */
        DATE_BG_COLOR?: string;

        /** what font-size should be used for all text elements */
        FONT_SIZE?: number;

        /** false if we should hide the headers */
        SHOW_HEADERS?: boolean;

        /** false if we should hide the background */
        SHOW_BACKGROUND?: boolean;

        /** what the gap should be between elements in the canvas */
        BETWEEN_GROUP_GAP?: number;
    }

    /**...........................................................................
     * ProjectDayFormatting
     * ...........................................................................
     * Keep track of how a day should be formatted
     * ...........................................................................
     */
    export enum ProjectDayFormatting {

        /** regular day */
        NORMAL = 0,

        /** weekend day */
        WEEKEND = 1,

        /** holiday */
        HOLIDAY = 2,

        /** current day */
        TODAY = 3
    };

    export interface TimelineLayers {
        background: CanvasGroup;
        elements: CanvasGroup;
    }

    /**...........................................................................
     * @class   Timeline
     * ...........................................................................
     * Draw a timeline for events
     * @author  Kip Price
     * @version 1.0.1
     * ...........................................................................
     */
    export class Timeline extends HTML5Canvas {

        //#region PROPERTIES

        /** options for displaying this timeline */
        protected _options: TimelineOptions;
        public get options(): TimelineOptions { return this._options; }

        /** central x-position, for calculating offsets */
        private _centralDateLocation: number;

        /** track the layers upon which we will be drawing */
        private _timelineLayers: TimelineLayers;

        /** allow child elements to indicate that the Y dispersement should be adjusted */
        protected _needsVerticalAdjustment: boolean;
        public set needsVerticalAdjustment (val: boolean) { this._needsVerticalAdjustment = true; }
        //#endregion

        //#region CONSTRUCTOR

        /**...........................................................................
         * Create a representation of timelines 
         * @param   Options to used create the timeline
         * ...........................................................................
         */
        constructor(options?: TimelineOptions) {
            super("timeline", options);

            this._handleCanvasForTimeline();
        }

        /**...........................................................................
         * _createDefaultOptions
         * ...........................................................................
         * create the default options for a project plan 
         * 
         * @returns The default options
         * ...........................................................................
         */
        protected _createDefaultOptions(): TimelineOptions {
            let options: TimelineOptions = super._createDefaultOptions();
            options.DAY_HEIGHT = 20;
            options.DAY_WIDTH = 20;
            options.CENTRAL_DATE = Dates.getToday();
            options.SIZE = {
                width: window.innerWidth - 15,
                height: window.innerHeight - 15
            }
            options.MONTH_COLORS = [
                "#D30",
                "#D70",
                "#EA0",
                "#AD0",
                "#0C3",
                "#0D9",
                "#0DC",
                "#05D",
                "#40D",
                "#80D",
                "#A0D",
                "#C07"
            ];
            options.DAY_FORMATTING = {
                NORMAL: "#fafafa",
                WEEKEND: "#ccc",
                HOLIDAY: "#ccc",
                TODAY: "#333"
            };
            options.ZOOM_DELTA = () => {

                let out: IPoint = {
                    x: 0.03 * this.zoomFactor.x,
                    y: 0.01 * this.zoomFactor.y
                };

                return out;
            };
            options.DATE_BG_COLOR = "#FFF";
            options.BORDER_COLOR = "#bbb";
            options.FONT_SIZE = 12;
            options.BETWEEN_GROUP_GAP = 10;
            options.MAX_ZOOM.y = Math.pow(1.01, Math.log(options.MAX_ZOOM.x / 1.03));
            options.MIN_ZOOM.y = Math.pow(1.01, Math.log(options.MIN_ZOOM.x)/Math.log(1.03));

            return options;
        }

        /**...........................................................................
         * _reconcileOptions
         * ...........................................................................
         * reconcile default options with user options 
         * 
         * @param   options     The options to reconcile
         * ...........................................................................
         */
        protected _reconcileOptions(options: TimelineOptions): void {
            this._options = reconcileOptions<TimelineOptions>(options, this._createDefaultOptions());
        }

        /**...........................................................................
         * _handleCanvasForTimeline
         * ...........................................................................
         * create the canvas upon which we will be drawing our project plan 
         * ...........................................................................
         */
        private _handleCanvasForTimeline(): void {

            // save off the central point and coordinate for date - point conversions
            this._centralDateLocation = (this._options.SIZE.width / 2);

            // create the layers
            this._timelineLayers = {} as TimelineLayers;

            // make sure we draw the right UI as we move around
            this.onPreRender = () => {
                this._createVisibleBackground();
            };

            // ensure that we have a layer for all of our elements
            this._layers[1] = this._getOrCreateLayer(1);
            this._timelineLayers.elements = this._layers[1];
        }

        //#endregion

        //#region HANDLE CONVERSIONS

        /**...........................................................................
         * convertDateToPoint
         * ...........................................................................
         * given a date, turn it into a point on the canvas 
         * ...........................................................................
         */
        public convertDateToPoint(date: Date, absolute?: boolean): IPoint {
            let diff: number = Dates.dateDiff(date, this._options.CENTRAL_DATE, true, true);

            let scaledDayWidth: number = this._options.DAY_WIDTH;
            if (absolute) { scaledDayWidth *= this.zoomFactor.x; }

            let outPt: IPoint = {
                x: this._centralDateLocation + (diff * scaledDayWidth),
                y: 0
            };

            return outPt;
        }

        /**...........................................................................
         * convertPointToDate
         * ...........................................................................
         * given a point, turn it into a date on the timeline 
         * 
         * @param   point       The point to convert
         * @param   absolute    If true, treat the point as absolute
         * ...........................................................................
         */
        public convertPointToDate(point: IPoint, absolute?: boolean): Date {

            // figure out how far this date is from the central location
            let diff: number = point.x - this._centralDateLocation;

            // figure out how wide a day is currently
            let scaledDayWidth: number = this._options.DAY_WIDTH;
            if (absolute) { scaledDayWidth *= this.zoomFactor.x; }

            // Create the out date and shift by the appropriate amount
            let outDate: Date = new Date(this._options.CENTRAL_DATE as any);
            Dates.addToDate(outDate, { days: (diff / scaledDayWidth) });

            return outDate;
        }
        //#endregion

        //#region ADD OR REMOVE DATA

        /**...........................................................................
         * addTimelineElement
         * ...........................................................................
         * add a new project item to the canvas 
         * 
         * @param   item    The item to add to the canvas
         * 
         * @returns True if the element can be added
         * ...........................................................................
         */
        public addTimelineElement(item: TimelineElementView): boolean {

            // calculate the appropriate height for the element
            item.adjustDimensions({
                x: 0,
                y: this._timelineLayers.elements.dimensions.h + this._options.BETWEEN_GROUP_GAP
            });

            this._timelineLayers.elements.addElement(item);

            return true;
        }
        //#endregion

        //*region REARRANGE DATA
        public adjustVerticalPosition(): void {
            
        }
        //#endregion


        //#region HANDLE THE BACKGROUND CREATION
        
        /**...........................................................................
         * _createVisibleBackground
         * ...........................................................................
         * Create the background that's currently visible
         * ...........................................................................
         */
        private _createVisibleBackground(): void {
            this._timelineLayers.background = new TimelineBackground("background");
        }

    }
}