///<reference path="../drawable.ts" />

namespace KIP.SVG {

	export enum GraphTypeEnum {
		Pie = 0,
		Bar = 1,
		Circle = 2,
		Tier = 3,
		Line = 4,
		Trend = 5,
		Segment = 6
	}

	export interface IUnitScale {
		x: string;
		y: string;
		z: string;
	}

	export abstract class Graph extends Drawable {

		//#region PROPERTIES
		protected id: string;

		protected type: GraphTypeEnum;

		protected data: any;

		protected dataListeners;

		protected sortedData: any;

		protected units: any;

		protected htmlLbls: any;

		protected svg: SVGDrawable;

		protected elems: any;

		protected useSVGLabels: boolean;

		protected total: number;
		//#endregion

		//#region UPDATED PROPERTIES
		protected _xAxisUnit: string;
		public get xAxisUnit(): string { return this._xAxisUnit; }
		public set xAxisUnit(data: string) { this._xAxisUnit = data; }
		
		protected _yAxisUnit: string;
		public get yAxisUnit(): string { return this._yAxisUnit; }
		public set yAxisUnit(data: string) { this._yAxisUnit = data; }
		
		protected _zAxisUnit: string;
		public get zAxisUnit(): string { return this._zAxisUnit; }
		public set zAxisUnit(data: string) { this._zAxisUnit = data; }
		//#endregion
		
		constructor(id: string, type: GraphTypeEnum) {
			super({id: id});

			//#region OLD CODE
			this.id = id;
			this.data = [];
			this.dataListeners = [];
			this.type = type;
			this.sortedData = [];
			this.units = {};
			this.htmlLbls = [];

			// We need to keep track of all of our elements
			this.elems = [];


			//#endregion
		}

		protected _createElements(): void {
			this.svg = new SVGDrawable({w: window.innerWidth, h: window.innerHeight, x: 0, y: 0}, {prevent_events: true});
			this.svg.draw(this._elems.base);
		}

		/**
		 * setUnits
		 * ----------------------------------------------------------------------------
		 * Set the appropriate units for this graph
		 * @param 	x_units 	The unit used for the x axis
		 * @param 	y_units		The unit used for the y axis
		 * @param 	z_units		The unit used for the z axis
		 */
		protected _setUnits (x_units: string, y_units: string, z_units: string): void {
			"use strict";
			this.units.x = x_units || "";
			this.units.y = y_units || "";
			this.units.z = z_units || "";
		};

		/**
		 * addData
		 * ----------------------------------------------------------------------------
		 * Adds a piece of data to the graph. Each graph handles this data separately
		 *
		 * @param label 		What the data should be labeled with
		 * @param ndependent 	The x value of this data
		 * @param dependent 	The y value of this data
		 * @param depth 		The z value of this data
		 * @param addl 			Any additional details that this particular graph 
		 * 						might need to display its data
		 *
		 * @returns The index at which this data is placed
		 */
		public addData (label: string, independent: number, dependent: number, depth: number, addl: any): number {
			"use strict";
			var idx;
		
			// Find the index at which data should appear
			idx = this.data.length;
		
			// Save data into that index
			this.data[idx] = {
				lbl: label,
				x: independent,
				y: dependent,
				z: depth,
				extra: addl
			};
		
			// Handle the data per-graph
			this.AddDataAppropriateForGraph(idx);
		
			return idx;
		};


		/**
		 * _addDataAppropriateForGraph
		 * ----------------------------------------------------------------------------
		 * Placeholder function that is overriden by each type of graph
		 *
		 * @param {number} idx - The index of the data we are adding toLocaleString
		 */
		protected abstract AddDataAppropriateForGraph (idx): void;

		protected abstract _refresh(): any;

		/**
		 * Queues up an event listener to a particular piece of data, to be added when it is drawn
		 * @param {number} idx - The index of the data to add the listener to
		 * @param {string} type - The type of listener we want to add
		 * @param {function} func - The call back function for the listener
		 */
		public addListenerToData (idx, type, func) {
			"use strict";
			var cnt;

			// Create a listener array 
			if (!this.dataListeners[idx]) {
				this.dataListeners[idx] = [];
			}

			// 
			cnt = this.dataListeners[idx].length;
			this.dataListeners[idx][cnt] = {
				"type": type,
				"listener": func
			};
		};
	
		/**
		 * _attachDataListeners
		 * ----------------------------------------------------------------------------
		 * Add the appropriate event listeners to the current piece of data
		 * @param {number} idx - The index of the piece of data being drawn
		 * @param {SVGElement} pc - The SVG element to add the event listener to
		 */
		protected _attachDataListeners (idx, pc) {
			"use strict";
			var type, listenerArr, listener, jdx, that;
			listenerArr = this.dataListeners[idx];

			if (!listenerArr) return;

			that = this;

			// Loop through all of the events we have for this index
			for (jdx = 0; jdx < listenerArr.length; jdx += 1) {

				// Skip this if we don't have any data
				if (!listenerArr[jdx]) continue;

				// Grab the type and callback
				type = listenerArr[jdx].type;
				listener = listenerArr[jdx].listener;

				// Don't do anything if we're missing something
				if ((!type) || (!listener)) continue;

				// Otherwise, add the event listener
				pc.addEventListener(type, function () {
					listener(this, jdx);
				});
			}
		};

		/**
		 * _adjustSize
		 * ----------------------------------------------------------------------------
		 * Passes through to the SVG portions of the graph to set the SVG size
		 * @param 	w		The width to use for the SVG
		 * @param 	h		The height to use for the SVG
		 * @param	view	A string to use for the SVG view
		 * 
		 * @returns True if we successfully resized
		 */
		public adjustSize (w: number, h: number): boolean {
				"use strict";
			var x, y, elem, idx, pt;

			// update the size of the SVG
			this.svg.width = w;
			this.svg.height = h;
			this.svg.generateViewboxAttribute(true);
			
			// Make sure all of our textual elements also get updated to their new relative positions
			for (idx = 0; idx < this.htmlLbls.length; idx += 1) {
				x = this.htmlLbls[idx].x;	
				y = this.htmlLbls[idx].y;	
				elem = this.htmlLbls[idx].elem;	
				
				pt = this.svg.calculateScreenCoordinates({x: x, y: y});
				elem.style.left = pt.x + "px";
				elem.style.top = pt.y + "px";
			}
			
			return true;
		};

		/**
		 * addHtmlLbl
		 * ----------------------------------------------------------------------------
		 * @param elem 
		 * @param x 
		 * @param y 
		 * @param extra 
		 */
		public addHTMLLbl (elem, x, y, extra) {
			"use strict";
			this.htmlLbls.push({
				elem: elem,
				x: x, 
				y: y,
				extra: extra
			});
		}
	}
}



