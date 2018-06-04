// namespace KIP {
//     export class TimelineDayHeader extends CanvasGroup {
//         //#region FORMAT THE DAY HEADER

//         /**...........................................................................
//          * _createDayHeader
//          * ...........................................................................
//          * create a particular header for a day 
//          * 
//          * @param   refDate     The reference date for the day
//          * @param   start       Where the day should start
//          * 
//          * @returns The created group
//          * ...........................................................................
//          */
//         private _createDayHeader(refDate: Date, start: IPoint): CanvasGroup {

//             // determine if the day would be too small to be useful
//             if ((this._options.DAY_WIDTH * this._zoomFactor.x) < 15) { return null; }

//             // create the day elements
//             let dayLbl: TextElement = this._createDayLabel(refDate);            // The label for the day
//             let dayBG: RectangleElement = this._createDayBackground(refDate);   // Background behind the day

//             // create the group for the day elements
//             let dayGrp: CanvasGroup = new CanvasGroup("day|" + Dates.shortDate(refDate), { x: start.x, y: start.y });

//             // add the elements to the group
//             dayGrp.addElement(dayBG);
//             dayGrp.addElement(dayLbl);

//             return dayGrp;
//         }

//         /**...........................................................................
//          * _createDayLabel
//          * ...........................................................................
//          * Create the text display for the day
//          * 
//          * @param   refDate     The reference date for this date
//          * 
//          * @returns The created text element
//          * ...........................................................................
//          */
//         protected _createDayLabel(refDate: Date): TextElement {

//             // create the element
//             let dayLbl: TextElement = new TextElement(
//                 "day|lbl|" + refDate.getDate(),
//                 refDate.getDate().toString(),
//                 { x: (this._options.DAY_WIDTH / 2), y: 0 }
//             );

//             // format the label 
//             dayLbl.style.fillColor = "#333";
//             dayLbl.style.fontSize = 12;
//             dayLbl.fixed = true;
//             dayLbl.style.textAlign = "center";

//             return dayLbl;
//         }

//         /**...........................................................................
//          * _createDayBackground
//          * ...........................................................................
//          * Create the day background for the date header
//          * 
//          * @param   refDate     The reference date 
//          * 
//          * @returns The created rectabgle element
//          * ...........................................................................
//          */
//         protected _createDayBackground(refDate: Date): RectangleElement {

//             let dayBG: RectangleElement = new RectangleElement("day|rect|" + refDate.getDate(), {
//                 x: 0,
//                 y: 0,
//                 w: this._options.DAY_WIDTH,
//                 h: (this._options.DAY_HEIGHT / this._zoomFactor.y) * 0.75
//             });
//             dayBG.style.fillColor = this._options.DATE_BG_COLOR;

//             return dayBG;
//         }   

//         //#endregion
//     }
// }