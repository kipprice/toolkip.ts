///<reference path="./graph.ts" />

namespace KIP.SVG {

    /**----------------------------------------------------------------------------
     * @class   CircularGraph
     * ----------------------------------------------------------------------------
     * Creates a graph geared around a circle. Taken from JS library
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class CircularGraph extends Graph {

        //#region PROPERTIES
        radius: number;
        center: IPoint;
        //#endregion

        /**
         * CircularGraph
         * ----------------------------------------------------------------------------
         * Prototypical graph object to use for pie graphs and circle graphs
         * @param   id      The unique identifier for this graph
         * @param   type    What type of graph this will become
         */
        constructor(id, type) {
            ;
            super(id, type);
            this.useSVGLabels = false;
        };


        /** 
         * AddTextAroundRing
         * ----------------------------------------------------------------------------
         * Adds a label in the appropriate position around the circular graph
         * @param   txt         The text to display as the label
         * @param   startAngle  The beginning angle (in degrees) of the data we are labeling
         * @param   endAngle    The ending angle (in degrees) of the data we are labeling
         * @param   r           The radius for this particular piece of data
         * @param   group       The SVG group to add this to
         * @param   rotate      True if the text should be rotated around the graph.
         * 
         * @returns The created label
         */
        protected AddTextAroundRing(txt, startAngle, endAngle, r, group, rotate) {
            ;
            var tDeg, tRad, tX, tY, origin, rAng, box;

            // Quit if this isn't a circular graph
            if (!this.radius) return;

            origin = this._getPointAroundCircle(r || this.radius, startAngle, endAngle);

            // Set the appropriate properties
            this.svg.style.strokeWidth = 0;

            // add the text
            let text: TextElement = this.svg.addText(
                txt,
                { 
                    x: this.center.x + (tX * (r + 1)),
                    y: this.center.y + ((r + 1) * tY)
                },
                origin,
                { parent: group }
            );

            // Rotate if appropriate
            if (rotate) { this._rotateText(text, startAngle, endAngle); }

            // Return the created text
            return text;

        };

        protected _getPointAroundCircle(r: number, startAngle: number, endAngle: number): IPoint {
            // Allow a passed in radius
            r = r || this.radius;

            // Calculate the position at which the text should appear
            let tDeg = startAngle + (endAngle - startAngle) / 2;
           let tRad = Trig.degreesToRadians(tDeg);

            let tY = roundToPlace(-1 * Math.cos(tRad), 1000);
            let tX = roundToPlace(Math.sin(tRad), 1000);

            // calculate actual origin offset
            let origin: IPoint = {} as IPoint;
            origin.y = (tY / -4) + 0.75;
            origin.x = (tX / -2) + 0.5;

            return origin;
        }

        protected _rotateText(text: TextElement, startAngle: number, endAngle: number): void {
            let box: IBasicRect = text.measureElement();
            let rAng = (((endAngle - startAngle) / 2) + startAngle) % 45 + 315;
            text.base.setAttribute("transform", "rotate(" + (rAng) + " " + (box.x + (box.w / 2)) + " " + (box.y + (box.h / 2)) + ")");
        }

        /**
         * CalcluateMiddlePointOfSegment
         * ----------------------------------------------------------------------------
         * Calculates the point on the circumference of a circular graph that is in between a starting & ending angle
         * @param {number} startAngle - The angle that starts this segment
         * @param {number} endAngle - The final angle in this segment
         * @returns {object} The SVG coordinates & real-screen coordinates for the appropriate spot on the graph
         */
        CalculateMiddlePointOfSegment(startAngle, endAngle) {
            ;
            var tDeg, tRad, sX, sY, pt, r, dx, dy;
            r = this.radius;
            tDeg = startAngle + (endAngle - startAngle) / 2;
            tRad = Trig.degreesToRadians(tDeg);

            sY = roundToPlace(-1 * Math.cos(tRad), 1000);
            sX = roundToPlace(Math.sin(tRad), 1000);

            sX = this.center.x + (sX * (r + 1));
            sY = this.center.y + ((r + 1) * sY);

            pt = this.svg.calculateScreenCoordinates({x: sX, y: sY});

            return {
                svg_x: sX,
                svg_y: sY,
                x: pt.x,
                y: pt.y
            }
        }

        /**
         * AddPieceListener
         * ----------------------------------------------------------------------------
         * Adds the mouse in/out listeners for the data pieces to show labels
         * @param   piece   The element to add the listeners to
         * @param   text    The label to show on mouse over
         * @param   box     The SVG rectangle that appears behind the text
         */
        AddPieceListeners(piece, text, box?) {
            ;
            if (!piece || !text) return;

            piece.addEventListener("mouseover", function () {
                text.style.opacity = 1;
                if (box) box.style.opacity = 0.8;
            });

            piece.addEventListener("mouseout", function () {
                text.style.opacity = 0;
                if (box) box.style.opacity = 0;
            });

            text.style.transition = "opacity ease-in-out .2s";
            text.style.opacity = 0;
            if (box) {
                box.style.opacity = 0;
                box.style.transition = "opacity ease-in-out .2s";
            }

        };
    }
}