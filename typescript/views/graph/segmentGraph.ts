// namespace KIP.SVG {

//     export class SegmentGraph extends Graph {

//         constructor(id, options) {
//             ;
//             super(id, GraphTypeEnum.Segment);

//             this.totals = {};
//             this.guideLines = [];
//             this.layers = {};
//             this.groupsByX = {};
//             this.colors = {};

//             this.dataListeners = {};

//             // Options for how something is drawn
//             this.options = {
//                 showYAxis: true,
//                 showXAxis: true,
//                 dataWidth: 5,
//                 dataGap: 2,
//                 startY: 20,
//                 startX: 0,
//                 shadowOffset: {
//                     x: 0.12,
//                     y: 0.07
//                 },
//                 shadowLayers: 5,
//                 shadowOpacity: 0.2,
//                 subLbl: ""
//             }

//             // Clone in user options if available
//             if (options) {
//                 KIP.Functions.CombineObjects(this.options, options);
//             }

//             // Initialize the layers that we use
//             this.layers.shadows = this.svg.CreateGroup("shadows");
//             this.layers.data = this.svg.CreateGroup("data");
//             this.layers.axes = this.svg.CreateGroup("axes");
//             this.layers.guidelines = this.svg.CreateGroup("guidelines");
//             this.layers.hoverBubbles = KIP.Functions.CreateSimpleElement("hoverBubbles", "hoverBubbles");
//             this.layers.axisLbls = KIP.Functions.CreateSimpleElement("axisLbls", "axisLbls");
//             this.AppendChild(this.layers.axisLbls);
//             this.AppendChild(this.layers.hoverBubbles);

//             // Initialize some svg properties
//             this.svg.fillProperty.type = "solid";
//             this.svg.lineProperty.type = "none";


//         }

//         // SegmentGraph.AddDataAppropriateForGraph
//         //--------------------------------------------------------------------------------
//         AddDataAppropriateForGraph(idx) {
//             ;
//             var datum;

//             datum = this.data[idx];

//             // Initialize the total count for this x if it doesn't exist
//             if (!this.totals[datum.x]) {
//                 this.totals[datum.x] = 0;
//             }

//             // Initialize the group count for this x if it doesn't exist
//             if (!this.groupsByX[datum.x]) {
//                 this.groupsByX[datum.x] = {};
//             }

//             // Add the total for this dependent variable to the total counters
//             this.totals[datum.x] += datum.y;

//             // Add this data to our groups
//             if (!this.groupsByX[datum.x][datum.lbl]) {
//                 this.groupsByX[datum.x][datum.lbl] = {
//                     value: 0,
//                     idx: []
//                 }
//             }
//             this.groupsByX[datum.x][datum.lbl].value += datum.y; // Track the value
//             this.groupsByX[datum.x][datum.lbl].idx.push(idx); // Track the indices this appeared at
//         };

//         AddListenerToData(xVal, lbl, type, func) {
//             ;
//             var cnt;

//             // Create a listener array 
//             if (!this.dataListeners[xVal]) {
//                 this.dataListeners[xVal] = {};
//             }

//             if (!this.dataListeners[xVal][lbl]) {
//                 this.dataListeners[xVal][lbl] = {};
//             }

//             // add to the listener array
//             this.dataListeners[xVal][lbl][type] = {
//                 "type": type,
//                 "listener": func
//             };
//         };

//         AttachDataListeners(element, xVal, lbl, data) {
//             ;
//             var type, listenerArr, listener, jdx, that;
//             listenerArr = this.dataListeners[xVal] && this.dataListeners[xVal][lbl];

//             if (!listenerArr) return;

//             that = this;

//             // Loop through all of the events we have for this index
//             for (jdx in listenerArr) {
//                 if (listenerArr.hasOwnProperty(jdx)) {
//                     // Skip this if we don't have any data
//                     if (!listenerArr[jdx]) continue;

//                     // Grab the type and callback
//                     type = listenerArr[jdx].type;
//                     listener = listenerArr[jdx].listener;

//                     // Don't do anything if we're missing something
//                     if ((!type) || (!listener)) continue;

//                     // Otherwise, add the event listener
//                     element.addEventListener(type, function () {
//                         listener(data);
//                     });
//                 }
//             }
//         }


//         // SegmentGraph.AddGuideLine
//         //--------------------------------------------------------------------
//         AddGuideline(level) {
//             ;

//             // Add the level to our list of guidelines
//             this.guideLines.push(level);
//         };

//         // SegmentData.Refresh
//         //----------------------------------------------------------
//         Refresh() {
//             ;

//             // First, draw the actual data
//             this.DrawData();

//             // Then draw the axes around the graph
//             this.DrawAxes();

//             // Finally draw the guidelines
//             this.DrawGuidelines();

//         };

//         // SegmentGraph.DrawData
//         //----------------------------------------------------------
//         DrawData() {
//             ;
//             var xValue, group, x;

//             // Initialize our X position
//             x = this.options.startX;

//             // Loop through each of our x values to start drawing each bar
//             for (xValue in this.groupsByX) {
//                 if (this.groupsByX.hasOwnProperty(xValue)) {

//                     // Pull out the data for this group
//                     group = this.groupsByX[xValue];

//                     // Draw the group
//                     this.DrawBar({
//                         data: group,
//                         position: x,
//                         x: xValue
//                     });

//                     // Increment the x position
//                     x += (this.options.dataGap + this.options.dataWidth);

//                 }
//             }

//             this.lastX = x;

//         };

//         // SegmentGraph.DrawBar
//         //------------------------------------------------------------
//         /**
//          * Draws a bar on the segmented graph
//          * @param {object} data - The data that should be displayed in this bar
//          * @returns {object} An augmented version of the data object that was passed in
//          */

//         DrawBar(data) {
//             ;
//             var lbl, zValue, lastY, bar, position, segmentData, x, shadow, c, o, sortable, idx;

//             // Grab the object data from our 
//             bar = data.data;
//             position = data.position;
//             x = data.x;
//             sortable = [];

//             lastY = this.options.startY;

//             // Loop through each of the y-values in this graph
//             for (lbl in bar) {
//                 if (bar.hasOwnProperty(lbl)) {
//                     // Grab the actual data from the segment
//                     segmentData = bar[lbl];

//                     segmentData.lbl = lbl;

//                     sortable.push(segmentData);
//                 }
//             }

//             sortable.sort(function (a, b) {
//                 if (a.value > b.value) {
//                     return -1;
//                 } else if (a.value < b.value) {
//                     return 1
//                 }
//                 return 0;
//             })

//             for (idx = 0; idx < sortable.length; idx += 1) {
//                 segmentData = sortable[idx];
//                 lbl = segmentData.lbl;

//                 // Set the position into the segment
//                 segmentData.startPosition = {
//                     x: position,
//                     y: lastY
//                 }

//                 // Set the actual data into the element
//                 segmentData.x = x;

//                 // Actually draw the segment
//                 segmentData = this.DrawSegment(segmentData);

//                 // Make sure we increment the y value based on how much space it took up
//                 lastY = segmentData.endPosition.y;
//             }

//             // Draw a drop shadow behind the elements
//             this.DrawShadow(position, lastY, this.options.dataWidth, this.options.startY - lastY);

//             // Create the X-axis labels that can later be used
//             if (!this.xAxisLbls) {
//                 this.xAxisLbls = [];
//             }

//             this.xAxisLbls.push({
//                 x: position,
//                 lbl: x
//             });


//             return data;
//         };

//         // SegmentGraph.DrawSegment
//         //-------------------------------------------------------------------------
//         /**
//          * Draws a segment of a particular bar on the graph
//          * @param {object} segmentData - The data needed to draw this segment of the graph
//          * @returns {object} An augmented version of the segmentData object that was passed in
//          */
//         DrawSegment(segmentData) {
//             ;
//             var oldCol, height, startY, elem, lbl, that, lineType, lineColor, lineWidth;



//             // Make sure we have an appropriate color for the segment
//             lbl = segmentData.lbl;
//             if (!this.colors[lbl]) {
//                 this.colors[lbl] = this.GenerateColor();
//             }

//             // Save off the SVG color and use this one instead
//             oldCol = this.svg.fillProperty.color;
//             lineType = this.svg.lineProperty.type;
//             lineColor = this.svg.lineProperty.color;
//             lineWidth = this.svg.lineProperty.width;

//             segmentData.color = this.svg.fillProperty.color = this.colors[lbl];
//             this.svg.lineProperty.color = "rgba(0,0,0,.03)";
//             this.svg.lineProperty.type = "solid";
//             this.svg.lineProperty.width = ".02";

//             // Get data out of the segment
//             height = segmentData.value;
//             startY = (segmentData.startPosition.y - height);

//             // Tell the SVG to draw a shape
//             elem = this.svg.AddRectangle(segmentData.startPosition.x, startY, this.options.dataWidth, height, {}, this.layers.data);

//             // Add some data back to the segment
//             segmentData.endPosition = {
//                 x: segmentData.startPosition.x + this.options.dataWidth,
//                 y: startY,
//             };
//             segmentData.elem = elem;

//             // Draw the label for the element
//             this.DrawLabel(segmentData);

//             // Reset the SVG fill color
//             this.svg.fillProperty.color = oldCol;

//             this.svg.lineProperty.type = lineType;
//             this.svg.lineProperty.color = lineColor;
//             this.svg.lineProperty.width = lineWidth;

//             // Add event listeners
//             this.AttachDataListeners(elem, segmentData.x, lbl, segmentData);


//             return segmentData;


//         };

//         // SegmentGraph.DrawLabel
//         //----------------------------------------------------------------------
//         DrawLabel(segmentData) {
//             ;
//             var elem, pt, unit, fullLbl;

//             if (this.units.y) {
//                 unit = " " + this.units.y;
//             } else {
//                 unit = "";
//             }

//             fullLbl = segmentData.lbl + " (" + segmentData.value + unit + ")";
//             if (this.options.subLbl) fullLbl += "<br>" + this.options.subLbl;
//             // Create the label
//             elem = KIP.Functions.CreateSimpleElement("segmentLbl|" + segmentData.x + "|" + segmentData.lbl, "segmentLbl", fullLbl);

//             // Add some styling
//             elem.style.position = "absolute";
//             elem.style.display = "none";
//             elem.style.border = "1px solid";
//             elem.style.borderLeft = "8px solid";
//             elem.style.borderColor = segmentData.color;
//             elem.style.padding = "5px";
//             elem.style.fontFamily = '"Segoe UI Light", "Calibri"';
//             elem.style.boxShadow = "1px 1px 5px 2px rgba(0, 0, 0, .2)";
//             elem.style.transition = "opacity ease-in-out .2s";
//             elem.style.opacity = "0";
//             elem.style.borderRadius = "5px";
//             elem.style.backgroundColor = "#FFF";

//             // Set the appropriate position
//             pt = this.svg.CalculateScreenCoordinates(segmentData.endPosition.x, segmentData.endPosition.y);
//             elem.style.left = pt.x + "px";
//             elem.style.top = pt.y + "px";

//             // Add some listeners
//             segmentData.elem.addEventListener("mouseover", function (e) {
//                 elem.style.display = "block";

//                 window.setTimeout(function () {
//                     elem.style.opacity = 1;
//                 }, 50);
//             });

//             segmentData.elem.addEventListener("mouseout", function () {
//                 elem.style.opacity = 0;

//                 window.setTimeout(function () {
//                     elem.style.display = "none";
//                 }, 250);
//             });

//             // Add to our appropriate layer
//             this.layers.hoverBubbles.appendChild(elem);

//             // Add to the array that gets recalculated when the size is adjusted
//             this.AddHTMLLbl(elem, segmentData.endPosition.x, segmentData.endPosition.y);

//             // Store the element for later
//             segmentData.lblElem = elem;
//         };

//         // SegmentGraph.DrawShadow
//         //----------------------------------------------------------------
//         DrawShadow(x, y, width, height) {
//             ;
//             var c, o, sIdx, dx, dy, shadow;

//             // Also draw a drop shadow for this bar
//             c = this.svg.fillProperty.color;
//             o = this.svg.fillProperty.opacity;

//             this.svg.fillProperty.color = "#000";
//             this.svg.fillProperty.opacity = (this.options.shadowOpacity / this.options.shadowLayers);

//             // Find how much the shadow should be offset per layer
//             dx = (this.options.shadowOffset.x / this.options.shadowLayers);
//             dy = (this.options.shadowOffset.y / this.options.shadowLayers);

//             for (sIdx = 1; sIdx <= this.options.shadowLayers; sIdx += 1) {

//                 shadow = this.svg.AddRectangle(
//                     x + (dx * sIdx),
//                     y + (dy * sIdx),
//                     width,
//                     height, {},
//                     this.layers.shadows
//                 );
//             }

//             this.svg.fillProperty.color = c;
//             this.svg.fillProperty.opacity = 0;
//         };

//         // SegmentGraph.DrawAxes
//         //----------------------------------------------------------------
//         DrawAxes() {
//             ;

//             // Draw the x-axis if appropriate
//             if (this.options.showXAxis) {
//                 this.DrawAxis({
//                     type: "horizontal",
//                     data: this.xAxisLbls,
//                     layer: this.layers.axes
//                 });
//             }

//             // Draw the y-axis if appropriate
//             if (this.options.showYAxis) {
//                 this.DrawAxis({
//                     type: "vertical"
//                 });
//             }
//         };

//         // SegmentGraph.DrawAxis
//         //----------------------------------------------------------------
//         DrawAxis(data) {
//             ;
//             var minX, maxX, startY, lineWidth, lineType, lineColor, elem, lbl, idx, x;

//             maxX = this.svg.maxX || this.lastX;
//             minX = this.svg.minX || this.options.startX;
//             startY = this.options.startY + 0.05;

//             // Set up the line to display properly
//             lineType = this.svg.lineProperty.type;
//             lineColor = this.svg.lineProperty.color;
//             lineWidth = this.svg.lineProperty.width;

//             this.svg.lineProperty.type = "solid";
//             this.svg.lineProperty.color = "#777";
//             this.svg.lineProperty.width = 0.02;

//             // Add a horizontal line
//             if (data.type === "horizontal") {
//                 this.svg.AddPath(
//                     [
//                         {
//                             x: minX,
//                             y: startY
//                         },
//                         {
//                             x: maxX,
//                             y: startY
//                         }
//                     ],
//                     {
//                         noFinish: true
//                     },
//                     data.layer
//                 );
//             }

//             this.svg.lineProperty.type = lineType;
//             this.svg.lineProperty.color = lineColor;
//             this.svg.lineProperty.width = lineWidth;

//             if (!data.data) return;
//             // Then draw the appropriate labels
//             startY += 0.8;
//             for (idx = 0; idx < data.data.length; idx += 1) {
//                 lbl = data.data[idx].lbl;
//                 x = data.data[idx].x + (0.35 * this.options.dataWidth);

//                 elem = KIP.Functions.CreateSimpleElement("", "axisLbl", lbl);

//                 elem.style.position = "absolute";
//                 elem.style.transform = "rotate(45deg)";
//                 elem.style.fontSize = "13px";
//                 elem.style.color = "#777";
//                 this.layers.axisLbls.appendChild(elem);

//                 // Also save in our label array for later
//                 this.AddHTMLLbl(elem, x, startY);
//             }

//         };

//         // SegmentGraph.DrawGuidelines
//         //----------------------------------------------------------------
//         /**
//             Draws all guidelines on the graph to indicate a threshold
//         */
//         DrawGuidelines() {
//             ;
//             var lnY, height, lineType, lineColor, lineWidth, lineDashes, startY, layer, minX, maxX, that;

//             // Set up the line to display properly
//             lineType = this.svg.lineProperty.type;
//             lineColor = this.svg.lineProperty.color;
//             lineWidth = this.svg.lineProperty.width;
//             lineDashes = this.svg.lineProperty.dashArray;

//             this.svg.lineProperty.type = "dashed";
//             this.svg.lineProperty.color = "#333";
//             this.svg.lineProperty.width = 0.05;
//             this.svg.lineProperty.dashArray = "0.05, 0.25"

//             startY = this.options.startY;
//             layer = this.layers.guidelines;
//             maxX = this.svg.maxX || this.lastX;
//             minX = this.svg.minX || this.options.startX;
//             that = this;

//             // Make sure we draw a good line for each
//             this.guideLines.map(function (value) {
//                 var htmlPt, elem, lbl;
//                 // Calculate where the line should go on our canvas
//                 height = (startY - value);

//                 // Draw an appropriate line at the y-value relative to our start
//                 that.svg.AddPath([{
//                     x: minX,
//                     y: height
//                 }, {
//                     x: maxX,
//                     y: height
//                 }], {
//                         noFinish: true
//                     },
//                     layer
//                 );

//                 // Also create a label for the line
//                 htmlPt = that.svg.CalculateScreenCoordinates(minX, height);
//                 lbl = value;
//                 if (that.units.y) {
//                     lbl += " " + that.units.y;
//                 }

//                 elem = KIP.Functions.CreateSimpleElement("", "guideLbl", lbl);
//                 elem.style.position = "absolute";
//                 elem.style.fontSize = "13px";
//                 elem.style.color = "#777";
//                 elem.style.left = (htmlPt.x + 15) + "px";
//                 elem.style.top = (htmlPt.y - 22) + "px";
//                 that.layers.axisLbls.appendChild(elem);

//                 that.AddHTMLLbl(elem, minX, height);

//             });

//             // Reset the SVG variables
//             this.svg.lineProperty.type = lineType;
//             this.svg.lineProperty.color = lineColor;
//             this.svg.lineProperty.width = lineWidth;
//             this.svg.lineProperty.dashArray = lineDashes;


//         };

//         GenerateColor(lbl) {
//             ;
//             var c;
//             c = Colors.generateColor(lbl, Colors.HSLPieceEnum.HUE);
//             return c;
//         };
//     }
// }