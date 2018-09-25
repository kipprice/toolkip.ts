///<reference path="./circularGraph.ts" />

namespace KIP.SVG {

    /**----------------------------------------------------------------------------
     * @class   CircleGraph
     * ----------------------------------------------------------------------------
     * Graph of circular elements. Copied from JS library
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class CircleGraph extends CircularGraph {

        //#region PROPERTIES
        ringTotals: any;
        layers: {rings: GroupElement, text: GroupElement};
        //#endregion

        // CircleGraph
        //---------------------------------------------------------------
        /**
         * Creates a graph with multiple rings to show multiple data sets on a circle
         * @param id        The unique identifier for this graph
         * @param center    The center point for this graph
         * @param radius    The size of the graph
         */
        constructor(id: string, center?: IPoint, radius?: number) {
            "use strict";

            super(id, GraphTypeEnum.Circle);
            this.center = center || {
                x: 80,
                y: 80
            };
            this.radius = radius || 30;
            this.ringTotals = [];

            // set styles for the SVG
            this.svg.style.fill = "None";
            this.svg.style.stroke = "#000";
            this.svg.style.strokeWidth = 5;
            this.svg.style.fontFamily = "Segoe UI";
            this.svg.style.fontSize = 10;

        };

        /**
         * refresh
         * ----------------------------------------------------------------------------
         * Draws all of the pieces of the graph and adds listeners and labels
         */
        _refresh() {
            "use strict";
            var text, dIdx, datum, perc, elem, ring, width, r, nextDeg, c, opacity, layerRings, layerText;

            this._createLayers();

            // Initialize some variables we need
            let max = Math.max.apply(this, this.ringTotals);
            let colors = {};
            let lastDeg = [];

            // Loop through all of the data we have available
            for (dIdx = 0; dIdx < this.data.length; dIdx += 1) {
                datum = this.data[dIdx];

                // If we don't yet have a color for this label, create a new one
                if (!colors[datum.lbl]) {
                    colors[datum.lbl] = Colors.generateColor(datum.lbl, Colors.HSLPieceEnum.HUE).toHexString();
                }
                c = colors[datum.lbl];

                // Pull out the pieces of data we need
                ring = datum.y;
                width = (datum.z || 1) * this.svg.style.strokeWidth;

                // Calculate what degree this piece of data should appear at
                if (!lastDeg[ring]) {
                    lastDeg[ring] = 0;
                }
                nextDeg = ((datum.x * 360) / max) + lastDeg[ring];

                // If the ring is negative, it should be displayed as a ghost ring
                if (ring < 0) {
                    ring = -1 * ring;
                    opacity = 0.4;
                } else {
                    opacity = 1;
                }

                // Set up the style and radius
                r = this.radius + ((this.radius / 2) * ring);
                this.svg.style.strokeWidth = width;
                this.svg.style.stroke = c;

                // add the element and its hover text
                elem = this.svg.addPerfectArc(this.center, r, lastDeg[ring], nextDeg, 1, {noFinish: true});
                elem.style.opacity = opacity;
                //text = this.AddTextAroundRing(datum.lbl, lastDeg[ring], nextDeg, elem, r + (width - this.svg.style.strokeWidth),  layerText);
                //this._elems.base.appendChild(elem);

                // Add event listeners
                this.AddPieceListeners(elem, text);
                this._attachDataListeners(dIdx, elem);

                // Increment the degree count
                lastDeg[ring] = nextDeg;
            }
        };

        
        protected _createLayers(): void {
            this.layers = {
                rings: this.svg.addGroup({id: "rings" }),
                text: this.svg.addGroup({id: "text"})
            };
        }

        // CircleGraph.AddDataAppropriateForGraph
        //------------------------------------------------------------------------------
        /**
         * Adds data to the circlegraph specific data collections
         * @param {number} idx - THe index at which the raw data lives
         */
        AddDataAppropriateForGraph(idx) {
            "use strict";
            var ring, datum;

            datum = this.data[idx];
            ring = datum.y;

            if (ring < 0) {
                ring = -1 * ring;
            }

            // Add to the total for this ring
            if (!this.ringTotals[ring]) {
                this.ringTotals[ring] = 0;
            }

            this.ringTotals[ring] += datum.x;

            // Redraw if we have drawn before
            if (this._parent) {
                this.draw();
            }
        };
    }
}