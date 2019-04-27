///<reference path="./circularGraph.ts" />
namespace KIP.SVG {

    export class PieGraph extends CircularGraph {

        //#region PROPERTIES
        hslRotate: any;
        sort: any;
        keyX: any;
        keyY: any;
        days: any;
        addLabels: any;
        addKey: any;
        layers: any;
        sortedArray: any;
        //#endregion

        /**
         * PieGraph
         * ----------------------------------------------------------------------------
         * Creates a pie graph that can show up to two types of data for every piece (percentage and height)
         * @param {string} id - The unique identifier for this graph
         * @param {object} [center] - The center point at which to draw this graph. Default is {x: 80, y: 80}
         * @param {number} [center.x] - The x position of the center. Default is 80
         * @param {number} [center.y] - The y position of the center. Default is 80
         * @param {number} [radius] - The radius of the graph. This is ignored if also changing the height of the graph. Default is 40
         */
        constructor(id, center, radius) {
            ;
            super(id, GraphTypeEnum.Pie);

            // Get our requirements around the graph
            this.center = center || {
                x: 80,
                y: 80
            };
            this.radius = radius || 30;
            this.total = 0;

            // set the default style for this graph
            this.svg.style.stroke = "#000";
            this.svg.style.strokeWidth = 0;
            this.svg.style.fontFamily = "Segoe UI";
            this.svg.style.fontSize = 10;
            this.svg.style.fill = "#000";


            // Other properties 
            this.hslRotate = Colors.HSLPieceEnum.SATURATION;
            this.sort = true;
            this.keyX = 0;
            this.keyY = 0;
            this.days = 0;

            this.addLabels = true;
            this.addKey = true;


        };

        // PieGraph.ChooseColorRotate
        //-------------------------------------------------------------------
        /**
         * Chooses the way the colors of this graph rotate
         */
        ChooseColorRotate(hsl) {
            this.hslRotate = hsl;
        };

        GetHoverLabel(segmentData) {
            ;
            return this.GetKeyLabel(segmentData, true);
        };

        GetKeyLabel(segmentData, hover?) {
            ;
            var unit, ret, perc;

            if (this.units.x) {
                unit = " " + this.units.x;
            } else {
                unit = "";
            }


            ret = "<div style='display: table-cell; ";
            if (segmentData.color && !hover) {
                ret += "padding-left: 5px; border-left: 15px solid; border-color: ";
                ret += segmentData.color;
            } else if (!hover) {
                ret += "padding-left: 20px;";
            }

            ret += "'>";
            ret += segmentData.lbl;
            ret += "</div>"
            ret += "<div style=' padding-bottom: 5px; display: table-cell; padding-left: 10px;'>";
            if (segmentData.x) {
                ret += segmentData.x + unit;
            } else {
                ret += "&nbsp;";
            }
            ret += "</div>"
            ret += "<div style='margin-bottom: 5px; display: table-cell; padding-left: 10px;'>";
            if (segmentData.x) {
                if (segmentData.x !== this.total) {
                    ret += "(" + roundToPlace((segmentData.x / this.total * 100), 10) + "%)";
                }
            } else {
                ret += "&nbsp;";
            }
            ret += "</div>";

            return ret;
        }

        // PieGraph.Refresh
        //-------------------------------------------------------
        /**
         * Draws all of the pieces needed for the pie graph
         */
        _refresh() {
            var datum, dIdx, elem, perc, lastDeg, text, style, tX, tY, tDeg, origin, r, layerWedge, layerText, layerBox, box, textBox, sIdx, key, color;

            lastDeg = 0;

            this.svg.clear();
            this.base.innerHTML = "";

            // ============= CREATE OUR LAYERS =================
            this.layers = {};
            this.layers.wedges = this.svg.addGroup({id: "wedges"});
            this.layers.boxes = this.svg.addGroup({id: "boxes"});
            this.layers.text = this.svg.addGroup({id: "text"});
            this.layers.hovers = createSimpleElement("hoverbubbles", "hoverbubbles");

            this.sortedArray = this.data.slice();

            // First, sort by size (unless the user requested otherwise)
            this.Sort();

            this.DrawSegments();

            if (this.addKey) {
                this.DrawKey({ x: "", lbl: "" })
                this.DrawKey({ x: this.total, lbl: "TOTAL" })
                this.base.appendChild(this.layers.key);
            }
            this.base.appendChild(this.layers.hovers);

        };

        //PieGraph.DrawSegments
        //----------------------------------------------------------
        DrawSegments() {
            ;
            var sIdx, datum, elem, lastDeg, lbl, color, lastDeg;

            lastDeg = 0;

            // Loop through our newly sorted array to draw things
            for (sIdx = 0; sIdx < this.sortedArray.length; sIdx += 1) {

                //============= DRAW THE SEGMENT =================
                // Grab the particular data out of this segment
                datum = this.sortedArray[sIdx];

                // Color the segment appropriately
                color = Colors.generateColor("", this.hslRotate).toHexString();

                // Draw the segment
                elem = this.DrawSegment(datum, color, lastDeg);

                // Sort out the return value into the appropriate pieces
                lastDeg = elem.endDeg; // The last degree at which a segment occurred
                elem = elem.elem; // The SVG Element that was created

                datum.element = elem; // Store the created element in the datum array
                datum.color = color; // Also store the color

                // ============= DRAW THE LABELS =================
                lbl = this.DrawLabels(datum);

                // Add a key for the graph
                if (this.addKey) {
                    this.AddDataToKey(datum);
                }

                //Only show the text on hover
                //this.AddPieceListeners(elem, text, textBox);
                this._attachDataListeners(datum.id, elem);

            }
            this.svg.draw(this._elems.base);
        }

        // PieGraph.DrawSegment
        //--------------------------------------------------------------------------------------------
        /**
         * Draws a segment of the pie graph
         * @param {object} segmentData - Data about the segment we are drawing
         * @param {string} color       - The color string to use for the segment
         * @param {number} startDeg    - The degree at which this segment should start
         */
        DrawSegment(segmentData, color, startDeg) {
            ;
            var dID, perc, r, elem, endDeg, oldCol;

            // Get data out of the ddatum
            dID = segmentData.id; // The ID for the segment
            perc = (segmentData.x / this.total); // The percentage this segment occupies
            r = segmentData.y || this.radius; // The radial size of the segment
            endDeg = (startDeg + (perc * 360)); // The degree at which this segment will end

            // Set up the right color
            oldCol = this.svg.style.fill;
            this.svg.style.fill = color;

            // If this is 100% of the circle, just draw a circle
            if (perc === 1) {
                elem = this.svg.addCircle({x: this.center.x, y: this.center.y}, r);

            // Otherwise, draw a wedge
            } else {
                elem = this.svg.addPieSlice(
                    this.center,
                    r,
                    startDeg,
                    endDeg,
                    1,
                    { id: dID }
                );
            }

            // Reset the color appropriate
            this.svg.style.fill = oldCol;

            // Add to our elements
            this.elems[dID] = {
                piece: elem,
                label: segmentData.text,
                color: color

            }

            segmentData.elem = elem;
            segmentData.startDeg = startDeg;
            segmentData.endDeg = endDeg;
            segmentData.color = color;

            // Return the element that was created & the degree at which it occurred
            return segmentData;

        };

        // PieGraph.DrawKey
        //-----------------------------------------------------------------
        /**
         * Draws the data key for this graph
         * @param {object} segmentData - Data about this segment to use when drawing the key value
         */
        DrawKey(segmentData) {
            ;
            var lbl, color, elem;
            // Make sure we have a div to add to
            if (!this.layers.key) {
                this.layers.key = createSimpleElement(this.id + "|key", "graphKey");
                this.layers.key.style.position = "absolute";
                this.layers.key.style.display = "table";
                this.layers.key.style.borderCollapse = "separate";
                this.layers.key.style.borderSpacing = "5px";
                this.layers.key.style.left = ((this.svg.width + 50) + "px");
            }

            // Grab the relevant data from the segment
            lbl = segmentData.lbl;
            color = segmentData.color;

            elem = createSimpleElement("key" + segmentData.id, "keyVal", this.GetKeyLabel(segmentData));
            elem.style.display = "table-row";
            if (color) {
                elem.style.borderLeft = "15px solid";
                elem.style.borderColor = color;
                elem.style.paddingLeft = "5px";
            } else {
                elem.style.paddingLeft = "20px";
            }

            this.layers.key.appendChild(elem);
        };

        // PieGraph.DrawLabels
        //----------------------------------------------------------------------
        DrawLabels(datum) {
            ;
            //TODO: investigate
            // let text,
            // if (!this.addLabels) return;

            // // If we are showing the labels around the data, use our standard function
            // if (this.useSVGLabels) {
            //     text = this.AddTextAroundRing(datum.lbl, lastDeg, lastDeg + (perc * 360), r, layerText, this.rotate);

            //     // Otherwise, show it on hover
            // } else {
            //     this.DrawHoverLabel(segmentData);
            // }
        };

        //
        DrawHoverLabel(segmentData) {
            ;
            var elem, segment, ID, lbl, color, x, y, box, pt, d1, d2, that, c;

            that = this;
            // Initialize the variables from the segment
            segment = segmentData.element;
            lbl = segmentData.lbl;
            ID = segmentData.ID;
            color = segmentData.color;

            c = this.svg.calculateScreenCoordinates({x: this.center.x, y: this.center.y});

            // Create the div that actually will be displayed
            elem = createSimpleElement(ID + "|lbl", "segmentLbl", this.GetHoverLabel(segmentData));
            elem.style.border = "1px solid";
            elem.style.borderLeft = "8px solid";
            elem.style.padding = "3px";
            elem.style.borderColor = color;
            elem.style.borderRadius = "3px";
            elem.style.boxShadow = "1px 1px 5px 2px rgba(0,0,0,.2)";
            elem.style.backgroundColor = "#FFF";

            // Move the label to this position
            elem.style.position = "absolute";
            elem.style.opacity = 0;
            elem.style.display = "none";
            elem.style.transition = "opacity ease-in-out .2s .05s";

            // Handle the mouseover event
            segment.addEventListener("mouseover", function (e) {
                elem.style.display = "block";

                window.setTimeout(function () {
                    var rect;

                    rect = elem.getBoundingClientRect();

                    if (x < c.x) {
                        x -= (rect.right - rect.left);
                    }

                    if (y < c.y) {
                        y -= (rect.bottom - rect.top);
                    }

                    // Handle x coordinates
                    if (x < 0) {
                        //x = 0;
                    }
                    if ((x + (rect.right - rect.left)) > window.innerWidth) {
                        //x = (window.innerWidth - (rect.right - rect.left));
                    }

                    // Handle y coordinates
                    if (y < 0) {
                        //y = 0;
                    }
                    if ((y + (rect.bottom - rect.top)) > window.innerHeight) {
                        y = (window.innerHeight - (rect.bottom - rect.top));
                    }

                    // If the hover bubble encompasses the mouse position, change that
                    if (Trig.isPointContained({ x: e.x, y: e.y }, rect)) {
                        //x = e.x + 5;
                    }

                    // Set the elements in place
                    elem.style.left = (x + "px");
                    elem.style.top = (y + "px");

                    elem.style.opacity = 1;


                }, 50);

                pt = that.CalculateMiddlePointOfSegment(segmentData.startDeg, segmentData.endDeg);
                if (pt) {
                    x = pt.x;
                    y = pt.y;
                } else {
                    x = e.x + "px";
                    y = e.y + "px";
                }
            });

            // Handle the mouse-out event
            segment.addEventListener("mouseout", function (e) {
                elem.style.opacity = 0;
                window.setTimeout(function () {
                    elem.style.display = "none";
                }, 250);
            });

            // Add the label element
            this.layers.hovers.appendChild(elem);

        };

        // PieGraph.Sort
        //--------------------------------------------------
        Sort() {
            ;

            // Quit if we shouldn't sort
            if (!this.sort) return;

            // Sort the array otherwise
            this.sortedArray = this.sortedArray.sort(function (a, b) {
                if (a.x > b.x) {
                    return -1;
                } else if (a.x < b.x) {
                    return 1;
                }

                return 0;
            });

        }

        // PieGraph.AddDataToKey
        //----------------------------------------------------------------------
        /**
         * Adds a label to the key for the graph
         * @param {object} datum - The data we are adding to the key
         * @param {SVGGroup} layer - The SVG group to add this key display to
         */
        AddDataToKey(datum, layer?) {
            ;
            this.DrawKey(datum);
        };

        // PieGraph.AddAppropriateDataForGraph
        //----------------------------------------------------------------------------
        /**
         * Adds to our total of our pie graph
         * @param {number} idx - The index at which the data appears
         */
        AddDataAppropriateForGraph(idx) {
            ;
            var datum;

            // Add to the total so we can get the percentages right
            datum = this.data[idx];
            this.total += datum.x;
            datum.id = idx;

            // Redraw if we have drawn before
            if (this._parent) {
                this._refresh();
            }
        };
    }
}
