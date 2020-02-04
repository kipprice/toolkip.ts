// namespace KIP {

//     export interface ITimelineMonthOptions {
//         REFERENCE_DATE: Date;
//         MONTH_COLORS: string[];
//     }
//     export class TimelineMonthHeader extends CanvasGroup {

//         //#region PROPERTIES
//         protected _referenceDate: Date;
//         public get referenceDate(): Date { return this._referenceDate; }

//         protected _canvas: Timeline;

//         protected _options: ITimelineMonthOptions;
//         //#endregion
        
//         public constructor(id: string, options: ITimelineMonthOptions) {
//             super(id);
//             this._referenceDate = options.REFERENCE_DATE;
//             this._options = options;
//             this._createElements();
//         }

//         protected _createElements(): void {

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

//          //#region FORMAT THE MONTH HEADER
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