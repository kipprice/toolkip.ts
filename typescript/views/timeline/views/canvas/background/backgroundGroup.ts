// namespace KIP {

//     /**...........................................................................
//      * @class   TimelineBackground
//      * ...........................................................................
//      * Create the background needed for a timeline
//      * @author  Kip Price
//      * @version 1.0.0
//      * ...........................................................................
//      */
//     export class TimelineBackground extends CanvasGroup {

//         //#region PROPERTIES

//         /** keep track of the relevant options for this background */
//         private _options: TimelineOptions;

//         /** create the actual background group */
//         private _background: CanvasGroup;

//         /** keep track of the headers */
//         private _headers: CanvasGroup;

//         /** keep track of the parent timeline */
//         protected _canvas: Timeline;

//         /** determine the width of an unscaled day */
//         private _unscaledDay: number;
//         protected get unscaledDay(): number {
//             if (isNullOrUndefined(this._unscaledDay)) {
//                 this._unscaledDay = roundToPlace(this._options.DAY_HEIGHT / this._canvas.zoomFactor.y, 10);
//             }
//             return this._unscaledDay;
//         }

//         /** determine the current extrema */
//         private _extrema: IGenericExtrema<Date>;
//         protected get extrema(): IGenericExtrema<Date> { 
//             if (!this._extrema) { this._getDateExtrema(); }
//             return this._extrema;
//         }
//         //#endregion

//         /**...........................................................................
//          * Create the timeline background
//          * ...........................................................................
//          */
//         constructor(id: string, options: TimelineOptions) {
//             super(id);
//             this._options = options;
//         }

//         public updateDimensions(visibleWindow: IBasicRect): void {
//             super.updateDimensions(visibleWindow);
//             this._unscaledDay = null;
//             this._extrema = null;
//         }
//         /**...........................................................................
//          * _getDateExtrema
//          * ...........................................................................
//          * calculate the max & min dates that are visible 
//          * 
//          * @returns The extremes of the dates
//          * ...........................................................................
//          */
//         private _getDateExtrema(): IGenericExtrema<Date> {
//             let viewport: IBasicRect = this.canvas.relativeView;

//             let min: IPoint = {
//                 x: viewport.x,
//                 y: viewport.y
//             };

//             let max: IPoint = {
//                 x: viewport.x + viewport.w,
//                 y: viewport.y + viewport.h
//             };

//             let out: IGenericExtrema<Date> = {
//                 max: this._canvas.convertPointToDate(max),
//                 min: this._canvas.convertPointToDate(min)
//             };

//             return out;
//         }

//         /**...........................................................................
//          * _createElements
//          * ...........................................................................
//          * Create elements 
//          * ...........................................................................
//          */
//         protected _createElements(): void {

//             // create the elements we'll be adding to
//             this._createBackgroundLayer();
//             this._createHeaderLayer();

//             // loop through months
//             this._createMonthHeaders();

//             // loop through days
//             this._createDayHeaders();

//             // make sure the contents are up to date
//             this._swapOutElements();
//         }

//         /**...........................................................................
//          * _createBackgroundLayer
//          * ...........................................................................
//          * 
//          * ...........................................................................
//          */
//         private _createBackgroundLayer(): void {
//             this._background = new CanvasGroup("bg", { x: 0, y: 0 });
//             this._background.layer = 0;
//         }

//         /**...........................................................................
//          * _createHeaderLayer
//          * ...........................................................................
//          * 
//          * ...........................................................................
//          */
//         private _createHeaderLayer(): void {
//             this._headers = new CanvasGroup("header", { x: 0, y: 0 });
//             this._headers.layer = 99;
//         }

//         /**...........................................................................
//          * _createMonthHeaders
//          * ...........................................................................
//          * 
//          * ...........................................................................
//          */
//         private _createMonthHeaders(): void {
//             let extrema: IGenericExtrema<Date> = this.extrema;

//             // handle month tracking
//             let curMonthStart: number = this._canvas.relativeView.x;

//             let diff = Dates.monthDiff(extrema.min, extrema.max, true, Dates.InclusivityEnum.INCLUSIVE);
//             let curRefDate: Date = new Date(+extrema.min);
            
//             // for the number of month headers we need to create...
//             for (let idx = 0; idx < diff; idx += 1) {
    
//                 // determine the start + end point
//                 let startPt: IPoint = this._getMonthStartPt(curRefDate);
//                 let endPt: IPoint = this._getMonthEndPt(curRefDate);

//                 // actually create the header
//                 let monthGrp: CanvasGroup = this._createMonthHeader(
//                     curRefDate,
//                     startPt,
//                     endPt
//                 );
//                 this._headers.addElement(monthGrp);

//                 // update the current date to the next month
//                 curRefDate = this._incrementMonth(curRefDate);
//             }

//         }

//         private _getMonthStartPt(startDate: Date): IPoint {
//             return {
//                 x: this._canvas.convertDateToPoint(startDate).x,
//                 y: this._canvas.relativeView.y
//             };
//         }

//         private _getMonthEndPt(startDate: Date): IPoint {
//             let endDate: Date = this._getMonthEndDate(startDate);
//             let endPt: IPoint = {
//                 x: this._canvas.convertDateToPoint(endDate).x,
//                 y: this._canvas.relativeView.y + this.unscaledDay
//             };
//             return endPt;
//         }

//         private _getMonthEndDate(refDate: Date): Date {
//             let lengthOfMonth: number = Dates.getLengthOfMonthInDays(refDate);
//             let endDate: Date = new Date(+refDate);
//             endDate = Dates.addToDate(endDate, { days: (lengthOfMonth - refDate.getDate()) + 1 });
//             return endDate;
//         }

//         private _incrementMonth(curDate: Date) : Date {
//             Dates.addToDate(curDate, { months: 1 });
//             curDate.setDate(1);
//             return curDate;
//         }

//         private _createDayHeaders(): void {
//             let diff: number = Dates.dateDiff(extrema.max, extrema.min, false, false, false) + 1;
//             for (let i = 0; i < diff; i += 1) {

//                 // create the date to draw currently
//                 let refDate: Date = Dates.addToDate(new Date(extrema.min as any), { days: i });
//                 refDate = Dates.clearTimeInfo(refDate);

//                 // Create the reference point position for the day display
//                 let refPt: IPoint = this._canvas.convertDateToPoint(refDate);
//                 refPt.y = this._canvas.relativeView.y + unscaledDay;

//                 // for the first element, the reference point is going to be a little different
//                 if (i === 0) {
//                     refPt.x = this._canvas.relativeView.x;
//                 }

//                 this._createDay(refDate, refPt, curMonthRefDate);
//             }
//         }

//         /**...........................................................................
//          * _createDay
//          * ...........................................................................
//          * @param refDate 
//          * @param refPt 
//          * @param curMonthRefDate 
//          * ...........................................................................
//          */
//         private _createDay(refDate: Date, refPt: IPoint, curMonthRefDate: Date): void {

//              // Create the day column
//              let dayDivGrp: CanvasGroup = this._createDayDivisions(refDate, refPt);
//              bgGroup.addElement(dayDivGrp);

//              // create the day header
//              let dayGroup: CanvasGroup = this._createDayHeader(refDate, refPt);
//              if (dayGroup !== null) {
//                  headerGroup.addElement(dayGroup);
//              }

//         }

//         private _createLastElement(): void {
//             // if this is the last element, make sure we still finish the month header
//             let monthGrp: CanvasGroup = this._createMonthHeader(
//                 curMonthRefDate,
//                 {
//                     x: curMonthStart,
//                     y: this._relativeView.y
//                 },
//                 {
//                     x: this._relativeView.x + this._relativeView.w,
//                     y: this._relativeView.y + unscaledDay
//                 }
//             );
//             curMonthRefDate = refDate;
//             curMonthStart = refPt.x;
//             headerGroup.addElement(monthGrp);

//         }

//         private _isDateMismatched(refDate: Date, curMonthRefDate: Date): boolean {
//             return (refDate.getMonth() !== curMonthRefDate.getMonth());
//         }

//         private _swapOutElements(): void {
//             // remove the old
//             this.removeElement("bg");
//             this.removeElement("header");

//             // and insert the new
//             this.addElement(this._background);
//             this.addElement(this._headers);
//         }

//         //#region FORMAT THE MONTH HEADER
//         /**...........................................................................
//          * _createMonthHeader
//          * ...........................................................................
//          * create a particular header for a month 
//          * 
//          * @param   refDate     The reference date for the month
//          * @param   start       The start position
//          * @param   end         The end position
//          * 
//          * @returns The canvas group representing the month
//          * ...........................................................................
//          */
//         private _createMonthHeader(refDate: Date, start: IPoint, end: IPoint): CanvasGroup {
            
//             let monthLbl: TextElement = this._createMonthLabel(refDate);                        // create the label for the month
//             let monthColor: RectangleElement = this._createMonthColor(refDate, start, end);     // create the background color for the month

//             // group around both
//             let monthGrp: CanvasGroup = new CanvasGroup("month|" + Dates.shortDate(refDate), { x: start.x, y: start.y });
//             monthGrp.addElement(monthColor);
//             monthGrp.addElement(monthLbl);

//             return monthGrp;
//         }

//         /**...........................................................................
//          * _createMonthLabel
//          * ...........................................................................
//          * Create the label for the month
//          * 
//          * @param   refDate     The reference date for the month
//          * 
//          * @returns The created text element
//          * ...........................................................................
//          */
//         private _createMonthLabel(refDate: Date): TextElement {

//             // grab the text that we need for the header
//             let monthName: string = Dates.getMonthName(refDate, true);
//             let year: number = Dates.getShortYear(refDate);

//             // create the label
//             let monthLbl: TextElement = new TextElement(
//                 "month|lbl|" + Dates.shortDate(refDate),
//                 (monthName + " " + year),
//                 {
//                     x: 5,
//                     y: 0
//                 }
//             );

//             // format the label
//             monthLbl.style.fillColor = "#FFF";
//             monthLbl.style.fontSize = 14;
//             monthLbl.fixed = true;

//             return monthLbl;
//         }

//         /**...........................................................................
//          * _createMonthColor
//          * ...........................................................................
//          * Create the month background color
//          * 
//          * @param   refDate     The reference date for the element
//          * @param   start       The start point for the month header
//          * @param   end         The end point for the month header
//          * 
//          * @returns The created month color
//          * ...........................................................................
//          */
//         private _createMonthColor(refDate: Date, start: IPoint, end: IPoint): RectangleElement {

//             // create the rectangle element & format
//             let monthColor: RectangleElement = new RectangleElement(
//                 "month|rect|" + Dates.shortDate(refDate),
//                 {
//                     x: 0,
//                     y: 0,
//                     w: (end.x - start.x),
//                     h: (end.y - start.y)
//                 }
//             );
//             monthColor.style.fillColor = this._getMonthColor(refDate.getMonth());

//             return monthColor;
//         }
//         //#endregion

//         /**...........................................................................
//          * _getMonthColor
//          * ...........................................................................
//          * Grab the appropriate color for the month
//          * 
//          * @param   monthID     The month to get a color for
//          * 
//          * @returns The color string for the month
//          * ........................................................................... 
//          */
//         private _getMonthColor(monthID: number): string {
//             return this._options.MONTH_COLORS[monthID];
//         }
//         //#endregion
//     }
// }