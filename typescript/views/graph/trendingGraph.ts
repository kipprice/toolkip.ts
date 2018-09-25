namespace KIP.SVG {

    //TODO: finish
    /**----------------------------------------------------------------------------
     * @class   TrendingGraph
     * ----------------------------------------------------------------------------
     * Track and display trends 
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class TrendingGraph extends Graph {

        //#region PROPERTIES
        min_x: any;
        min_y: any;
        max_x: any;
        max_y: any;
        hslRotate: any;
        //#endregion

        /**
         * TrendingGraph
         * ----------------------------------------------------------------------------
         * Create a graph to display trends
         * @param   id      unique identifierfor the graph
         * @param   minX    minimum value
         * @param   minY    
         */
        constructor(id: string, min: IPoint) {
            super(id, GraphTypeEnum.Trend);


            this.min_x = min.x || 10000000;
            this.min_y = min.y || 10000000;
            this.hslRotate = Colors.HSLPieceEnum.HUE;

            // set styles
            this.svg.style.strokeWidth = 0.2;
            this.svg.style.fontFamily= "Calibri";

        };


        AddDataAppropriateForGraph(idx) {
            "use strict";
            var datum;

            datum = this.data[idx];

            this.UpdateView(datum.x, datum.y, 1, 1);
        };

        AddLineListeners(line, lbl, box) {
            "use strict";
            if (!line || !lbl) return;

            line.addEventListener("mouseover", () => {
                lbl.style.opacity = 1;
                line.style.strokeWidth = (this.svg.style.strokeWidth * 3);
                if (box) { box.style.opacity = 0.8; }
            });

            line.addEventListener("mouseout", () => {
                lbl.style.opacity = 0;
                line.style.strokeWidth = this.svg.style.strokeWidth;
                if (box) box.style.opacity = 0;
            });

            lbl.style.opacity = 0;
        };

        // TODO: Implement
        UpdateView(...addlArgs: any[]): void {}


        _refresh() {
            "use strict";
            var datum, sorted, lastLine, dIdx, ptLayer, txtLayer, lastElem, xDiff, yDiff, txt;

            // Sort the array by the z value
            sorted = this.data.slice();
            sorted = sorted.sort(function (a, b) {
                if (!a || !b) return 0;
                if ((a.z === undefined) || (b.z === undefined)) return 0;

                if (a.z > b.z) {
                    return 1;
                } else if (a.z < b.z) {
                    return -1;
                }

                if (a.x > b.x) {
                    return 1;
                } else if (a.x < b.x) {
                    return -1;
                }

                return 0;
            });

            xDiff = this.max_x - this.min_x;
            yDiff = this.max_y - this.min_y;

            this.svg.style.strokeWidth = (Math.min(xDiff, yDiff) / 70);

            this.svg.style.fontSize = (this.svg.style.strokeWidth * 8);

            // Create the groups
            ptLayer = this.svg.addGroup({id: "pts"});
            txtLayer = this.svg.addGroup({id: "txt"});

            // Loop through our sorted data and draw our points and lines
            for (dIdx = 0; dIdx < sorted.length; dIdx += 1) {
                datum = sorted[dIdx];

                // If the last line doesn't match the current value, create a new line
                if (((datum.z === undefined) && !lastElem) || (lastLine !== datum.z)) {

                    // Generate a color
                    this.svg.style.fill = this.svg.style.stroke = Colors.generateColor("", this.hslRotate).toHexString();

                    if (datum.z !== undefined) lastLine = datum.z;
                    // lastElem = this.addChild("path", {
                    //     d: ""
                    // }, this.style, "", "", ptLayer);

                    // txt = this.AddText(lastElem, datum.lbl, datum.x, datum.y, this.fontStyle, "", "", "", txtLayer);

                    // this.AddLineListeners(lastElem, txt);
                    // this.svg.moveTo(datum.x, datum.y, lastElem);

                    // Otherwise, add to the last line
                } else {
                    // this.LineTo(datum.x, datum.y, lastElem);
                }
            }

            //TODO: figure out what this was meant to do
            //this.FinishPath(lastElem);
        };

    }
}
