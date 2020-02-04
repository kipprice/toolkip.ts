// namespace KIP.Timeline {
// 	export class TimelineDayDivision extends CanvasGroup {
// 		//#region CREATE DAY DIVISIONS

//         /**...........................................................................
//          * _createDayDivisions
//          * ...........................................................................
//          * create a day column
//          * 
//          * @param   refDate     The reference date for the column
//          * @param   start       The start date
//          * 
//          * @returns The created group
//          * ...........................................................................
//          */
//         private _createDayDivisions(refDate: Date, start: IPoint): CanvasGroup {

//             // get the formatting for the date
//             let formatting: ProjectDayFormatting = this._getDayFormatting(refDate);

//             // draw the right hand border for the day
//             let onePix: number = 1 / this._zoomFactor.x;
//             let borderRight: RectangleElement = new RectangleElement("day|b.left|" + Dates.shortDate(refDate), {
//                 x: this._options.DAY_WIDTH - onePix,
//                 y: 0,
//                 w: onePix,
//                 h: this._relativeView.h
//             });
//             borderRight.style.fillColor = this._options.BORDER_COLOR;

//             // draw the BG border for the day
//             let bg: RectangleElement = new RectangleElement("day|bg|" + Dates.shortDate(refDate), {
//                 x: 0,
//                 y: 0,
//                 w: this._options.DAY_WIDTH,
//                 h: this._relativeView.h
//             });

//             // determine what the formatting should actually do to this column
//             if (formatting === ProjectDayFormatting.TODAY) {
//                 bg.style.fillColor = this._options.DAY_FORMATTING.TODAY;
//             } else if (formatting === ProjectDayFormatting.HOLIDAY) {
//                 bg.style.fillColor = this._options.DAY_FORMATTING.HOLIDAY;
//             } else if (formatting === ProjectDayFormatting.WEEKEND) {
//                 bg.style.fillColor = this._options.DAY_FORMATTING.WEEKEND;
//             } else {
//                 bg.style.fillColor = this._options.DAY_FORMATTING.NORMAL;
//             }

//             // create the group that will allow us to show the column
//             let dayDivGrp: CanvasGroup = new CanvasGroup("day|division|" + Dates.shortDate(refDate), { x: start.x, y: this._relativeView.y });
//             dayDivGrp.addElement(bg);
//             dayDivGrp.addElement(borderRight);

//             return dayDivGrp;
//         }

//         /**...........................................................................
//          * _getDayFormatting
//          * ...........................................................................
//          * Format the actual day display
//          * 
//          * @param   date    The date to format 
//          * 
//          * @returns The formatting to use for the day
//          * ...........................................................................
//          */
//         private _getDayFormatting(date: Date): ProjectDayFormatting {
//             // create the day divisions
//             let formatting; ProjectDayFormatting;

//             // HANDLE TODAY
//             if (Dates.isToday(date)) {
//                 formatting = ProjectDayFormatting.TODAY;
//             }

//             // HANDLE WEEKEND
//             else if (Dates.isWeekend(date)) {
//                 formatting = ProjectDayFormatting.WEEKEND;
//             }

//             // HANDLE REGULAR DAY
//             else {
//                 formatting = ProjectDayFormatting.NORMAL;
//             }

//             return formatting
//         }

//         //#endregion
// 	}
// }