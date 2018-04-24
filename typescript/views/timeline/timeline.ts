///<reference path="../canvas/canvas.ts" />
namespace KIP {

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

    export class Timeline extends HTML5Canvas {

        //#region PROPERTIES

        /** options for displaying this timeline */
        protected _options: TimelineOptions;
        public get options(): TimelineOptions { return this._options; }

        /** central x-position, for calculating offsets */
        private _centralDateLocation: number;

        /** the layer of elements */
        private _elemLayer: CanvasGroup;

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

            // make sure we draw the right UI as we move around
            this.onPreRender = () => {
                this._createVisibleBackground();
            };

            // ensure that we have a layer for all of our elements
            this._layers[1] = this._getOrCreateLayer(1);
            this._elemLayer = this._layers[1];
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
        public addTimelineElement(item: TimelineElement): boolean {

            // calculate the appropriate height for the element
            item.adjustDimensions({
                x: 0,
                y: this._elemLayer.dimensions.h + this._options.BETWEEN_GROUP_GAP
            });

            this._elemLayer.addElement(item);

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

            // calculate the min date visible & max date visible
            let extrema: IGenericExtrema<Date> = this._getDateExtrema();

            // create the group to add to
            let bgGroup: CanvasGroup = new CanvasGroup("bg", { x: 0, y: 0 });
            bgGroup.layer = 0;

            let headerGroup: CanvasGroup = new CanvasGroup("header", { x: 0, y: 0 });
            headerGroup.layer = 99;

            // handle month tracking
            let curMonthStart: number = this._relativeView.x;
            let curMonthRefDate: Date = extrema.min;

            // figure out what the non-scaled version of our day-height would be
            let unscaledDay: number = roundToPlace(this._options.DAY_HEIGHT / this._zoomFactor.y, 10);

            // loop through all dates in this time range
            let diff: number = Dates.dateDiff(extrema.max, extrema.min, false, false, false) + 1;
            for (let i = 0; i < diff; i += 1) {

                // create the date to draw currently
                let refDate: Date = Dates.addToDate(new Date(extrema.min as any), { days: i });
                refDate = Dates.clearTimeInfo(refDate);

                // Create the reference point position for the day display
                let refPt: IPoint = this.convertDateToPoint(refDate);
                refPt.y = this._relativeView.y + unscaledDay;

                // for the first element, the reference point is going to be a little different
                if (i === 0) {
                    refPt.x = this._relativeView.x;
                }

                let lastElem: boolean = (i === (diff - 1));

                // Create the day column
                let dayDivGrp: CanvasGroup = this._createDayDivisions(refDate, refPt);
                bgGroup.addElement(dayDivGrp);

                // create the month header
                let dateMismatch: boolean = refDate.getMonth() !== curMonthRefDate.getMonth();
                if (dateMismatch) {
                    let monthGrp: CanvasGroup = this._createMonthHeader(
                        curMonthRefDate,
                        {
                            x: curMonthStart,
                            y: this._relativeView.y
                        },
                        {
                            x: refPt.x,
                            y: this._relativeView.y + unscaledDay
                        });
                    curMonthRefDate = refDate;
                    curMonthStart = refPt.x;
                    headerGroup.addElement(monthGrp);
                }

                // if this is the last element, make sure we still finish the month header
                if (lastElem) {
                    let monthGrp: CanvasGroup = this._createMonthHeader(
                        curMonthRefDate,
                        {
                            x: curMonthStart,
                            y: this._relativeView.y
                        },
                        {
                            x: this._relativeView.x + this._relativeView.w,
                            y: this._relativeView.y + unscaledDay
                        }
                    );
                    curMonthRefDate = refDate;
                    curMonthStart = refPt.x;
                    headerGroup.addElement(monthGrp);
                }

                // create the day header
                let dayGroup: CanvasGroup = this._createDayHeader(refDate, refPt);
                if (dayGroup !== null) {
                    headerGroup.addElement(dayGroup);
                }

            }

            // remove the old
            this.removeElement("bg");
            this.removeElement("header");

            // and insert the new
            this.addElement(bgGroup);
            this.addElement(headerGroup);
        }

        /**...........................................................................
         * _getDateExtrema
         * ...........................................................................
         * calculate the max & min dates that are visible 
         * 
         * @returns The extremes of the dates
         * ...........................................................................
         */
        private _getDateExtrema(): IGenericExtrema<Date> {
            let viewport: IBasicRect = this._relativeView;

            let min: IPoint = {
                x: viewport.x,
                y: viewport.y
            };

            let max: IPoint = {
                x: viewport.x + viewport.w,
                y: viewport.y + viewport.h
            };

            let out: IGenericExtrema<Date> = {
                max: this.convertPointToDate(max),
                min: this.convertPointToDate(min)
            };

            return out;
        }

        //#region FORMAT THE MONTH HEADER
        /**...........................................................................
         * _createMonthHeader
         * ...........................................................................
         * create a particular header for a month 
         * 
         * @param   refDate     The reference date for the month
         * @param   start       The start position
         * @param   end         The end position
         * 
         * @returns The canvas group representing the month
         * ...........................................................................
         */
        private _createMonthHeader(refDate: Date, start: IPoint, end: IPoint): CanvasGroup {
            
            let monthLbl: TextElement = this._createMonthLabel(refDate);                        // create the label for the month
            let monthColor: RectangleElement = this._createMonthColor(refDate, start, end);     // create the background color for the month

            // group around both
            let monthGrp: CanvasGroup = new CanvasGroup("month|" + Dates.shortDate(refDate), { x: start.x, y: start.y });
            monthGrp.addElement(monthColor);
            monthGrp.addElement(monthLbl);

            return monthGrp;
        }

        /**...........................................................................
         * _createMonthLabel
         * ...........................................................................
         * Create the label for the month
         * 
         * @param   refDate     The reference date for the month
         * 
         * @returns The created text element
         * ...........................................................................
         */
        private _createMonthLabel(refDate: Date): TextElement {

            // grab the text that we need for the header
            let monthName: string = Dates.getMonthName(refDate, true);
            let year: number = Dates.getShortYear(refDate);

            // create the label
            let monthLbl: TextElement = new TextElement(
                "month|lbl|" + Dates.shortDate(refDate),
                (monthName + " " + year),
                {
                    x: 5,
                    y: 0
                }
            );

            // format the label
            monthLbl.style.fillColor = "#FFF";
            monthLbl.style.fontSize = 14;
            monthLbl.fixed = true;

            return monthLbl;
        }

        /**...........................................................................
         * _createMonthColor
         * ...........................................................................
         * Create the month background color
         * 
         * @param   refDate     The reference date for the element
         * @param   start       The start point for the month header
         * @param   end         The end point for the month header
         * 
         * @returns The created month color
         * ...........................................................................
         */
        private _createMonthColor(refDate: Date, start: IPoint, end: IPoint): RectangleElement {

            // create the rectangle element & format
            let monthColor: RectangleElement = new RectangleElement(
                "month|rect|" + Dates.shortDate(refDate),
                {
                    x: 0,
                    y: 0,
                    w: (end.x - start.x),
                    h: (end.y - start.y)
                }
            );
            monthColor.style.fillColor = this._getMonthColor(refDate.getMonth());

            return monthColor;
        }
        //#endregion

        //#region FORMAT THE DAY HEADER

        /**...........................................................................
         * _createDayHeader
         * ...........................................................................
         * create a particular header for a day 
         * 
         * @param   refDate     The reference date for the day
         * @param   start       Where the day should start
         * 
         * @returns The created group
         * ...........................................................................
         */
        private _createDayHeader(refDate: Date, start: IPoint): CanvasGroup {

            // determine if the day would be too small to be useful
            if ((this._options.DAY_WIDTH * this._zoomFactor.x) < 15) { return null; }

            // create the day elements
            let dayLbl: TextElement = this._createDayLabel(refDate);            // The label for the day
            let dayBG: RectangleElement = this._createDayBackground(refDate);   // Background behind the day

            // create the group for the day elements
            let dayGrp: CanvasGroup = new CanvasGroup("day|" + Dates.shortDate(refDate), { x: start.x, y: start.y });

            // add the elements to the group
            dayGrp.addElement(dayBG);
            dayGrp.addElement(dayLbl);

            return dayGrp;
        }

        /**...........................................................................
         * _createDayLabel
         * ...........................................................................
         * Create the text display for the day
         * 
         * @param   refDate     The reference date for this date
         * 
         * @returns The created text element
         * ...........................................................................
         */
        protected _createDayLabel(refDate: Date): TextElement {

            // create the element
            let dayLbl: TextElement = new TextElement(
                "day|lbl|" + refDate.getDate(),
                refDate.getDate().toString(),
                { x: (this._options.DAY_WIDTH / 2), y: 0 }
            );

            // format the label 
            dayLbl.style.fillColor = "#333";
            dayLbl.style.fontSize = 12;
            dayLbl.fixed = true;
            dayLbl.style.textAlign = "center";

            return dayLbl;
        }

        /**...........................................................................
         * _createDayBackground
         * ...........................................................................
         * Create the day background for the date header
         * 
         * @param   refDate     The reference date 
         * 
         * @returns The created rectabgle element
         * ...........................................................................
         */
        protected _createDayBackground(refDate: Date): RectangleElement {

            let dayBG: RectangleElement = new RectangleElement("day|rect|" + refDate.getDate(), {
                x: 0,
                y: 0,
                w: this._options.DAY_WIDTH,
                h: (this._options.DAY_HEIGHT / this._zoomFactor.y) * 0.75
            });
            dayBG.style.fillColor = this._options.DATE_BG_COLOR;

            return dayBG;
        }   

        //#endregion

        //#region CREATE DAY DIVISIONS

        /**...........................................................................
         * _createDayDivisions
         * ...........................................................................
         * create a day column
         * 
         * @param   refDate     The reference date for the column
         * @param   start       The start date
         * 
         * @returns The created group
         * ...........................................................................
         */
        private _createDayDivisions(refDate: Date, start: IPoint): CanvasGroup {

            // get the formatting for the date
            let formatting: ProjectDayFormatting = this._getDayFormatting(refDate);

            // draw the right hand border for the day
            let onePix: number = 1 / this._zoomFactor.x;
            let borderRight: RectangleElement = new RectangleElement("day|b.left|" + Dates.shortDate(refDate), {
                x: this._options.DAY_WIDTH - onePix,
                y: 0,
                w: onePix,
                h: this._relativeView.h
            });
            borderRight.style.fillColor = this._options.BORDER_COLOR;

            // draw the BG border for the day
            let bg: RectangleElement = new RectangleElement("day|bg|" + Dates.shortDate(refDate), {
                x: 0,
                y: 0,
                w: this._options.DAY_WIDTH,
                h: this._relativeView.h
            });

            // determine what the formatting should actually do to this column
            if (formatting === ProjectDayFormatting.TODAY) {
                bg.style.fillColor = this._options.DAY_FORMATTING.TODAY;
            } else if (formatting === ProjectDayFormatting.HOLIDAY) {
                bg.style.fillColor = this._options.DAY_FORMATTING.HOLIDAY;
            } else if (formatting === ProjectDayFormatting.WEEKEND) {
                bg.style.fillColor = this._options.DAY_FORMATTING.WEEKEND;
            } else {
                bg.style.fillColor = this._options.DAY_FORMATTING.NORMAL;
            }

            // create the group that will allow us to show the column
            let dayDivGrp: CanvasGroup = new CanvasGroup("day|division|" + Dates.shortDate(refDate), { x: start.x, y: this._relativeView.y });
            dayDivGrp.addElement(bg);
            dayDivGrp.addElement(borderRight);

            return dayDivGrp;
        }

        /**...........................................................................
         * _getDayFormatting
         * ...........................................................................
         * Format the actual day display
         * 
         * @param   date    The date to format 
         * 
         * @returns The formatting to use for the day
         * ...........................................................................
         */
        private _getDayFormatting(date: Date): ProjectDayFormatting {
            // create the day divisions
            let formatting; ProjectDayFormatting;

            // HANDLE TODAY
            if (Dates.isToday(date)) {
                formatting = ProjectDayFormatting.TODAY;
            }

            // HANDLE WEEKEND
            else if (Dates.isWeekend(date)) {
                formatting = ProjectDayFormatting.WEEKEND;
            }

            // HANDLE REGULAR DAY
            else {
                formatting = ProjectDayFormatting.NORMAL;
            }

            return formatting
        }

        //#endregion

        /**...........................................................................
         * _getMonthColor
         * ...........................................................................
         * Grab the appropriate color for the month
         * 
         * @param   monthID     The month to get a color for
         * 
         * @returns The color string for the month
         * ........................................................................... 
         */
        private _getMonthColor(monthID: number): string {
            return this._options.MONTH_COLORS[monthID];
        }
        //#endregion

    }
}