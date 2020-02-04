// ///<reference path="../views/svg/svgDrawable.ts" />

// namespace KIP.Old {

// 	export interface IDictionary<T> {
// 		[key: string]: T;
// 	}
// 	/**
// 	 * Creates a view of a project in a Gantt Chart
// 	 * @class ProjectWindow
// 	 * @param {string} name - The name & ID of the project
// 	 * @param {Date} start - The date at which the default viewing window should start. Can be a date string or a Date object
// 	 * @param {Date} end   - OBSOLETE. The date at which the default viewing window should end. Can be a date string or a Date object
// 	 * @param {Object} [dim]   - What the dimensions of SVG Element should be
// 	 */
// 	export class ProjectWindow extends SVG.SVGDrawable {
// 		headerGap: number;
// 		beginningRatio: number;
// 		lastBubble: any;
// 		headerGrp: SVGElement;
// 		coverGrp: SVGElement;
// 		txtGrp: SVGElement;
// 		lineGrp: SVGElement;
// 		autoResize: boolean;
// 		expanded: any;
// 		eventGrp: any;
// 		headerDiv: any;
// 		onlyShowVisibleTitles: any;
// 		view: any;
// 		textDiv: any;
// 		options: any;
// 		fontProperty: any;
// 		itemGrp: any;
// 		overlay: any;
// 		overlayGrp: any;
// 		segmentColors: any;
// 		fillProperty: any;
// 		lineProperty: any;
// 		expandedInfoCB: any;
// 		start: any;
// 		originalView: any;
// 		dimensions: any;
// 		originalWindow: { width: number; height: number; };
// 		originalDimensions: any;
// 		impDateCatSelector: any;
// 		dateForm: any;

// 		//#region PROPERTIES
// 		public name: string;
// 		public id: string;
// 		public today: Date;
// 		public relToday: any;

// 		// INTERNAL COLLECTIONS
// 		public items: any[];
// 		public eventCnt: number;
// 		public rows: any[];
// 		public lines: any[];
// 		public headers: any[];
// 		public itemHeaders: any[];
// 		public importantDates: IDictionary<any>;
// 		public impDateCategories: any[];

// 		// OPTIONS
// 		public unitWidth: number = 5;
// 		public rowHeight: number = 10;
// 		public rowSpace: number = 2.5;
// 		public eventWidthDivisor: number = 1000;
// 		public useCoverRects: boolean = false;
// 		public showWeekends: boolean = true;
// 		public showOverallLbl: boolean = true;
// 		public disableFill: boolean = false;
// 		public showTitles: boolean = true;
// 		public alwaysShowEvents: boolean = true;
// 		public headerOffset: string = "20";
// 		public maxHeaderHeight: number = 40;
// 		public refreshNotify: Function;
// 		public barPercentages: number[] = [0.5, 0.5];
// 		public bottomBarPercentage: number = 0.5;
// 		public bottomBarGap: number = 0.05;
// 		public barGap: number = 0.05;
// 		public eventRow: number = 0;

// 		// COLORS
// 		protected monthColors: string[] = [
// 			"#37c8ab",
// 			"#00aad4",
// 			"#0066ff",
// 			"#3737c8",
// 			"#7137c8",
// 			"#ab37c8",
// 			"#ff0066",
// 			"#ff2a2a",
// 			"#ff6600",
// 			"#ffcc00",
// 			"#abc837",
// 			"#37c837"
// 		];

// 		protected textColor: string = "rgba(0, 0, 0, 1)";
// 		protected bubbleColor: string = "#333";

// 		//#endregion

// 		constructor(name: string, start: Date, dim: IBasicRect) {
// 			super(name, dim);
			
// 			var view;
// 			this.name = name;
// 			this.id = name;

// 			// Create collections for items & events
// 			this.items = [];
// 			this.eventCnt = 0;
// 			this.rows = [];
// 			this.lines = [];
// 			this.headers = [];
// 			this.itemHeaders = [];
// 			this.impDateCategories = [];

// 			this.start = start;
// 			this.today = KIP.Dates.getToday();
// 			this.relToday = this.ConvertToProjectPoint(this.today);

// 			// Set the dimensions regardless of whether they were passed in
// 			if (dim) {
// 				this.width = dim.w;
// 				this.height = dim.h;
// 			} else {
// 				this.width = window.innerWidth;
// 				this.height = window.innerHeight;
// 			}

// 			// Create a SVG canvas for the project items
// 			SVG.SVGDrawable.call(this, this.id, "", { aspect: "none", zoomY: false });


// 			// Set up the view for the object
// 			view = this.SetupView();
// 			this.autoResize = false;
// 			this.onlyShowVisibleTitles = false;

// 			// INITIALIZE BAR PERCENTAGES
// 			this._addGroups();

// 			this.CreateGuidelines();

// 			// Setup the color array for segments
// 			this.segmentColors = [];

// 			// Add listener for resizing
// 			this.AddWindowListeners(dim);

// 			// Set our standard font styles
// 			this.fontProperty.family = "Segoe UI Semilight, Segoe UI, Calibri, Arial";
// 		};

// 		protected _addGroups(): void {

// 			// Create the guidelines
// 			this.lineGrp = this.addGroup({id: "lines"}).base;
// 			this.itemGrp = this.addGroup({id: "items"}).base;
// 			this.eventGrp = this.addGroup({id: "events"}).base;
// 			this.txtGrp = this.addGroup({id: "textBubbles"}).base;
// 			this.coverGrp = this.addGroup({id: "covers"}).base;
// 			this.headerGrp = this.addGroup({id: "guideHeaders"}).base;
// 			this.overlayGrp = this.addGroup({id: "overlay"}).base;

// 			// Create the div that will hold the bubbles
// 			this.textDiv = createSimpleElement("svgText");
// 			this.headerDiv = createSimpleElement("svgHeaders");
// 		}


// 		/**
// 		 * Adds listeners to the window in general, like resizing
// 		 * @param {Object} [dim] - The original dimensions of the project window
// 		 */
// 		public AddWindowListeners(dim) {
// 			;
// 			var w_h, w_w, that;
// 			this.originalDimensions = dim;

// 			this.originalWindow = {
// 				width: window.innerWidth,
// 				height: window.innerHeight
// 			};

// 			that = this;

// 			window.addEventListener("resize", function () {

// 				// initialize the new width / height
// 				var newDim = {
// 					width: window.innerWidth,
// 					height: window.innerHeight
// 				};

// 				// Adjust to be scaled appropriately
// 				newDim.width -= (that.originalWindow.width - that.originalDimensions.width);
// 				newDim.height -= (that.originalWindow.height - that.originalDimensions.height);

// 				that.ResizeChart(newDim);
// 			});
// 		};

// 		/** actually resize the viewport to maintain scale */
// 		public ResizeChart(newDimensions) {
// 			var view, oldDimensions, oldWindow;

// 			oldDimensions = this.originalDimensions;
// 			oldWindow = this.originalWindow;

// 			// Resize the width & height accordingly
// 			this.width = newDimensions.width;
// 			this.height = newDimensions.height;

// 			this.dimensions = newDimensions;

// 			view = this._resizeView(newDimensions);

// 			this.CreateGuidelines();
// 			this.draw();
// 		};

// 		/**
// 		 * Setup the first instance of the view
// 		 */
// 		public SetupView() {
// 			var ratio = this.width / this.height;

// 			this.view.h = (this.rowHeight * 30);
// 			this.view.w = (this.unitWidth * 50 * ratio);

// 			// Initialize the view x if we haven't yet
// 			this.view.x = 0;
// 			this.view.y = (-5 * this.rowHeight);
// 			return this.generateViewboxAttribute(true);
// 		};

// 		/** change view dimensions as needed */
// 		protected _resizeView(newDimensions, updateStart?) {
// 			;
// 			var newViewW, newViewH;

// 			newViewW = this.calculateSVGWidth(newDimensions.width);
// 			newViewH = this.calculateSVGHeight(newDimensions.height);

// 			if (!this.originalView) {
// 				this.originalView = cloneObject(this.view);
// 			}
// 			this.originalView.w *= (newViewW / this.view.w);
// 			this.originalView.h *= (newViewH / this.view.h);

// 			this.view.w = newViewW;
// 			this.view.h = newViewH;


// 			if (updateStart) {
// 				var svgPoint = this.calculateSVGCoordinates(newDimensions);
// 				this.view.x = svgPoint.x;
// 				this.view.y = svgPoint.y;
// 			}

// 			return this.generateViewboxAttribute();
// 		}

// 		/**
// 		 * Takes in an input and returns the relative poisition on the default start date
// 		 * 
// 		 * @param {Date} input - A date or date string that should be converted to a relative date
// 		 * @param {Date} [start] - If provided, will compare this as the baseline point 
// 		 *
// 		 * @returns {number} Where the relative date falls on the relative timeline
// 		 */
// 		public ConvertToProjectPoint (input, start?, addTime?) {
// 			;
// 			var diff;

// 			start = start || this.start;

// 			if (!this.showWeekends) {
// 				diff = Dates.businessDateDiff(input, start, true, addTime);
// 			} else {
// 				diff = Dates.dateDiff(input, start, true, addTime);
// 			}

// 			// Convert to a percentage start
// 			if (addTime) {
// 				diff /= (1000 * 60 * 60 * 24);
// 			}

// 			return diff;
// 		};

// 		/**
// 		 * Takes a relative project point and reverts it to its original point.
// 		 * 
// 		 * @param {number} pt - The relative date to convert
// 		 * 
// 		 * @returns {Date} The reverted date
// 		 */
// 		public RevertFromProjectPoint (pt) {
// 			;
// 			var dt;
// 			dt = new Date(this.start);

// 			// We need to add weekends back in if we are currently excluding them
// 			if (!this.showWeekends) {
// 				pt += 2 * Math.floor((pt + this.start.getDay()) / 5) + 1;
// 			}

// 			// Calculate the reverse date
// 			dt.setDate(dt.getDate() + pt);
// 			return dt;
// 		};

// 		public AddGrouper (lbl) {
// 			;

// 		};

// 		public AddSpacer (name) {
// 			;
// 			var rIdx = this.rows.length;
// 			var obj = {
// 				type: 'spacer',
// 				name: name
// 			};

// 			rIdx = this.rows.push(obj);
// 			this.items.push(obj);
// 		};

// 		public CreateExpandedInfo (addl) {
// 			;
// 			var div, key, val, excl;

// 			excl = {
// 				"TopSegments": true,
// 				"BottomSegments": true,
// 				"Events": true,
// 				"Design": true,
// 				"ganttItem": true,
// 				"svgElem": true,
// 				"sidebarElem": true,
// 				"groupName": true
// 			};
// 			div = createElement({ cls: "additionalInfo" });

// 			if (!this.expandedInfoCB) {
// 				div.innerHTML = this.WriteArray(addl, "<div class='additionalInfoLine'>", "</div>", excl);
// 			} else {
// 				div.innerHTML = this.expandedInfoCB(addl);
// 			}

// 			return div;
// 		};

// 		public WriteArray (arr, before, after, exclude?) {
// 			;
// 			var key, val, ret;

// 			ret = "";
// 			for (key in arr) {
// 				if (arr.hasOwnProperty(key)) {
// 					val = arr[key];

// 					if (exclude && exclude[key]) {
// 						continue;
// 					}

// 					if (typeof val !== "object") {
// 						ret += before + key + " : " + val + after;
// 					} else if (val) {
// 						ret += before + key + " : " + this.WriteArray(val, before, after) + after;
// 					}
// 				}
// 			}

// 			return ret;
// 		};
// 		/**
// 		 * Adds a timeline item to the view
// 		 * 
// 		 * @param {date} s - The start date for the item
// 		 * @param {date} e - The end date for the item
// 		 * @param {string} lbl - What to use to display information about the item
// 		 * @param {array} segments - An array of arrays of objects that contain the data to display for each of the rows of the item
// 		 * @param {object} addl - Any additional details about the item that are worth knowing
// 		 * @returns {SVGElement} The item that was created
// 		 */
// 		public AddItem (s, e, lbl, segments, addl, offset) {
// 			;
// 			var idx, item, sIdx, segment, row, y, x, div, start, end, sDt, segHeight, segEnd, ctx, that, sIdx, lastY;

// 			that = this;

// 			// Convert to dates if needed
// 			if (!s.getYear) {
// 				s = new Date(s);
// 			}
// 			if (!e.getYear) {
// 				e = new Date(e);
// 			}

// 			// Grab the relative dates from the real dates
// 			start = this.ConvertToProjectPoint(s, "", true);
// 			end = this.ConvertToProjectPoint(e, "", true);

// 			idx = this.items.length;
// 			row = this.GetRow(start, end);

// 			// Create the appropriate item object
// 			item = this.items[idx] = {
// 				grp: this.itemGrp.addGroup({id: "item" + idx}, this.itemGrp).base,
// 				lbl: lbl,
// 				row: row,
// 				start: s,
// 				end: e,
// 				x: start * this.unitWidth,
// 				y: (row * this.rowHeight * this.rowSpace),
// 				width: (end - start) * this.unitWidth,
// 				id: idx,
// 				eventGrp: this.eventGrp.addGroup({id: idx + "|events"}).base,
// 				addl: addl,
// 				addlInfoExpanded: this.CreateExpandedInfo(addl),
// 				coverRectGrp: this.coverGrp.addGroup({id: idx + "|cover"}).base,
// 				coverRect: null
// 			};

// 			// Loop through the segments & draw
// 			for (sIdx = 0; sIdx < segments.length; sIdx += 1) {
// 				this.CreateSegments(segments[sIdx], item, start, end, item.y, sIdx);
// 			}
// 			// Create a context menu 
// 			item.ctx = this.AddContextMenu(item);

// 			// Create some text that should apply to

// 			// Try to overlay text above the item
// 			this.fillProperty.color = this.textColor;
// 			this.fillProperty.opacity = 1;
// 			var font_family = this.fontProperty.family;
// 			var font_weight = this.fontProperty.weight;

// 			if (!addl || !addl.isGroup) {
// 				this.fontProperty.size = (4 * this.rowHeight / 9);
// 				this.fontProperty.family = "Segoe UI Light, Calibri Light, Arial";
// 			} else {
// 				this.fontProperty.size = (2 * this.rowHeight / 3);
// 				this.fontProperty.weight = "bold";
// 			}
// 			item.text = this.addText(lbl, {x: item.x + this.unitWidth / 2, y: item.y}, null, { unscalable: true }, item.grp);
// 			this.fontProperty.family = font_family;
// 			this.fontProperty.weight = font_weight;

// 			this.fillProperty.opacity = 1;

// 			if (!this.showTitles) {
// 				item.text.parentNode.removeChild(item.text);
// 			}

// 			// Add to our row tracker as appropriate
// 			if (!this.rows[row]) {
// 				this.rows[row] = [];
// 			}
// 			this.rows[row].push(item);
// 			return item;
// 		};

// 		/** Adds the covering rectangle for an item */
// 		protected __addCoverRect (item) {
// 			;
// 			var bbox, oFill, oStroke;

// 			// IF WE ALREADY HAVE A COVER, REMOVE IT
// 			if (item.coverRect && item.coverRect.parentNode) {
// 				item.coverRect.parentNode.removeChild(item.coverRect);
// 			}

// 			// MEASURE ELEMENT
// 			bbox = item.grp.measureElement();

// 			// SAVE OFF STYLE
// 			oFill = cloneObject(this.fillProperty);
// 			oStroke = cloneObject(this.lineProperty);

// 			// SET NEW STYLE
// 			this.fillProperty.opacity = 0;
// 			this.fillProperty.type = "solid";
// 			this.fillProperty.color = "rgba(0,0,0,0)";
// 			this.lineProperty.opacity = 0;
// 			this.lineProperty.type = "none";

// 			// CREATE THE RECTANGLE
// 			item.coverRect = this.addRectangle(bbox.x, bbox.y, bbox.width, bbox.height, {}, item.coverRectGrp);

// 			// RESTORE OLD STYLE
// 			this.fillProperty = oFill;
// 			this.lineProperty = oStroke;
// 		};

// 		/**
// 		 * Creates a context menu for the item
// 		 * 
// 		 * @param {Object} item - The item to add the menu to
// 		 * 
// 		 * @returns {ContextMenu} The menu to display for this element
// 		 */
// 		public AddContextMenu (item) {
// 			;
// 			var ctx, that;
// 			that = this;

// 			// Create a context menu for this element
// 			if (!this.useCoverRects) {
// 				ctx = new ContextMenu(item.grp);
// 			} else {
// 				ctx = new ContextMenu(item.coverRectGrp);
// 			}

// 			// Create the option to expand or collapse the task
// 			/*ctx.AddOption("Expand/Collapse", function () {
// 				that.ExpandItem(item);
// 			});*/

// 			ctx.AddOption("Remove", function () {
// 				that.RemoveItem(item);
// 			});

// 			return ctx;
// 		};

// 		/**
// 		 * Grabs the row at which an item appears
// 		 * @param {Object} item - The item to grab the row of
// 		 * @returns {number} The row at which the item appears
// 		 */
// 		public GetRowOfItem (item) {
// 			;
// 			var rIdx, rIt;

// 			// First try just to grab the item's row
// 			if (item && item.row) {
// 				return item.row;
// 			}

// 			// Loop backwards as it will usually be the last item added
// 			for (rIdx = (this.rows.length - 1); rIdx >= 0; rIdx += 1) {
// 				for (rIt = 0; rIt < this.rows[rIdx].length; rIt += 1) {
// 					if (this.rows[rIdx][rIt] === item) {
// 						return rIdx;
// 					}
// 				}
// 			}
// 		};

// 		/**
// 		 * Creates the top/bottom segments of an item
// 		 * @param {Array} arr - The segments to create
// 		 * @param {Object} item - The item to add this to
// 		 */
// 		public CreateSegments (arr, item, start, end, startY, segRow) {
// 			;
// 			var idx, x, lastX, segEnd, sDt, first;

// 			lastX = start;
// 			first = true;

// 			// Loop through each of the segments
// 			for (idx = 0; idx < arr.length; idx += 1) {
// 				if (!arr[idx]) continue;

// 				sDt = arr[idx].end;

// 				if (!sDt.getYear) {
// 					sDt = new Date(sDt);
// 				}

// 				segEnd = this.ConvertToProjectPoint(sDt, "", true);

// 				if (arr[idx].start) {
// 					sDt = arr[idx].start;
// 					if (!sDt.getYear) {
// 						sDt = new Date(sDt);
// 					}
// 					x = this.ConvertToProjectPoint(sDt, "", true);

// 				} else {
// 					x = lastX;
// 				}

// 				if (!first) {
// 					//x += 0.5;
// 				} else {
// 					first = false;
// 				}

// 				// Try to draw the segment
// 				if (segEnd >= x) {
// 					this.CreateSegment(item, { x: x, y: startY }, segEnd, arr[idx], idx, segRow, item);

// 					// Handle the error case of something not actually being a forward rectangle
// 				} else {
// 					console.log("\nError in segment creation\nStart: " + x + " End: " + segEnd);
// 				}

// 				lastX = segEnd;
// 			}

// 			if (this.disableFill) return;

// 			// If we haven't hit the end, create a last segment
// 			if (lastX !== end) {
// 				if (first) {
// 					x = start;
// 				} else {
// 					x = lastX + 0.5;
// 				}

// 				this.CreateSegment(item, { x: x, y: startY }, end, {}, -1, segRow, item);
// 			}
// 		};

// 		/**
// 		 * Creates a segment for a piece of the project plan.
// 		 *
// 		 * @param {Object} item - The item this is being created for
// 		 * @param {Object} start - The start x & y value
// 		 * @param {number} end - At what point the segment ends
// 		 * @param {Object} data - Any additional available data about the segment
// 		 * @param {number} idx - What index of segment we are creating
// 		 * @param {bool} isBottom - True if we are drawing the bottom set of segments
// 		 *
// 		 * @returns {SVGDrawable} The created segment
// 		 */
// 		public CreateSegment (item, start, end, data, idx, rowNum, addl) {
// 			;
// 			var segment, div, y, height, x, width, i, txt;

// 			// Adjust the top value as appropriate
// 			y = start.y;
// 			height = this.rowHeight * (this.barPercentages[rowNum]);

// 			if (rowNum > 0) {
// 				for (i = (rowNum - 1); i >= 0; i -= 1) {
// 					y += (this.rowHeight * this.barPercentages[i]) + (this.barGap * this.rowHeight);
// 				}
// 				y += (this.barGap * this.rowHeight);
// 			}

// 			// Set the x & width values for readability
// 			x = start.x * this.unitWidth;
// 			width = ((end - start.x) * this.unitWidth);
// 			if ((width < 0) || (isNaN(width))) {
// 				console.log("Err: improper width for segment");
// 				return;
// 			}

// 			// Set the appropriate color & fill properties
// 			this.SetSegmentStyle(data, idx);

// 			// Create the segment and label
// 			segment = this.addRectangle(x, y, width, height, null, item.grp);
// 			if (data.lbl) {
// 				txt = data.lbl;

// 				if (data.type) {
// 					txt += "<br>[" + data.type + " on " + data.end + "]";
// 				}

// 				if (!this.showTitles) {
// 					txt += "<br><br>" + addl.lbl + " (" + Dates.shortDate(addl.start) + " - " + Dates.shortDate(addl.end) + ")";
// 				}

// 				div = this.AddTextBubble(txt, segment, item, "", (y + (6 * height)) - item.y);
// 			}

// 			return segment;
// 		};

// 		/**
// 		 * Sets the style for the provided segment. Can be overriden by individual implementations
// 		 * @param {SVGElement} segment - Data about the segment to set the appropriate color 
// 		 * @param {number} idx - The index of the segment
// 		 */
// 		public SetSegmentStyle (segment, idx) {
// 			;
// 			if (!this.segmentColors[idx]) {
// 				this.segmentColors[idx] = Colors.generateColor(idx, Colors.HSLPieceEnum.HUE);
// 			}
// 			this.fillProperty.type = "solid";
// 			this.fillProperty.color = this.segmentColors[idx];
// 		};

// 		/**
// 		 * Adds data about an event without actually drawing it
// 		 * 
// 		 * @param {Object} item     - The item object to add event data to
// 		 * @param {Date} pos      - The date at which this event should appear. Accepts a date string or Date object
// 		 * @param {String} lbl      - What label should appear for the event on hover
// 		 * @param {Object} addlInfo - Any additional information needed about the event
// 		 * 
// 		 * @returns {Object} The data about the created event
// 		 */
// 		public AddEventData (item, pos, lbl, addlInfo) {
// 			;
// 			var ev, dt, pt, row, x, y, i;

// 			if (!item) return;

// 			if (!pos.getYear) {
// 				dt = new Date(pos);
// 			} else {
// 				dt = pos;
// 			}

// 			pt = this.ConvertToProjectPoint(dt, "", true);

// 			x = pt * this.unitWidth;

// 			row = this.GetRowOfItem(item);

// 			// Get the appropriate height
// 			y = (row * this.rowHeight) + ((row - 1) * this.rowSpace);
// 			for (i = (this.eventRow - 1); i >= 0; i -= 1) {
// 				y += ((2 * this.barGap * this.rowHeight) + (this.rowHeight * this.barPercentages[i]));
// 			}

// 			ev = {
// 				lbl: lbl,
// 				date: pos,
// 				prjPt: pt,
// 				row: row,
// 				x: x,
// 				y: y,
// 				addl: addlInfo
// 			};

// 			// Add to our array
// 			if (!item.events) {
// 				item.events = [];
// 			}
// 			item.events.push(ev);

// 			// return the created object
// 			return ev;
// 		};

// 		/**
// 		 * Adds an event & draws it
// 		 * 
// 		 * @param {Object} item - The item object to add event data to
// 		 * @param {Object} [ev] - If available, the data that was already created for this event. Created if not passed in
// 		 * @param {Date} [pos] - The date at which this event should appear. If ev is passed in, this is ignored
// 		 * @param {String} [lbl] - The label that should appear for this event. If ev is passed in, this is ignored
// 		 * @param {Object} [addlInfo] - Any additional info available for the event
// 		 * 
// 		 * @returns {SVGElement} The event that was created
// 		 */
// 		public AddEvent (item, ev, pos, lbl, addlInfo, large) {
// 			;
// 			var date, row, dx, dy, txt, event, height;

// 			// Quit if we don't have an item
// 			if (!item) return;

// 			// Grab the appropriate data
// 			if (!ev) {
// 				ev = this.AddEventData(item, pos, lbl, addlInfo);
// 			}

// 			// Grab the offset valies we should use
// 			dx = this.unitWidth / 8;
// 			dy = this.rowHeight / (2 + this.barPercentages.length);

// 			// Set attributes for the event
// 			this.fillProperty.type = "solid";
// 			if (ev.addl) {
// 				if (ev.addl.idx || ev.addl.idx === 0) {
// 					this.fillProperty.color = this.segmentColors[ev.addl.idx];
// 				} else if (ev.addl.color) {
// 					this.fillProperty.color = ev.addl.color;
// 				}
// 			} else {
// 				this.fillProperty.color = "#FFF";
// 			}

// 			// Set the appropriate line properties

// 			//this.fillProperty.opacity = 0.3;

// 			height = this.rowHeight * this.barPercentages[this.eventRow];


// 			// Create a marker for the event
// 			if (large) {
// 				this.lineProperty.type = "None";
// 				this.lineProperty.width = 0;
// 				this.lineProperty.color = "rgba(0,0,0,0)";

// 				event = this.addPath([
// 					{  x: ev.x - dx, y: ev.y - dy },
// 					{ x: ev.x - dx, y: ev.y },
// 					{ x: ev.x, y: ev.y + (0.5 * dy) },
// 					{ x: ev.x + dx, y: ev.y },
// 					{ x: ev.x + dx, y: ev.y - dy }
// 				], { id: "ev." + this.eventCnt }, item.eventGrp);

// 				// Draw the small event line
// 			} else {
// 				this.lineProperty.type = "solid";
// 				this.lineProperty.color = "rgba(0,0,0,0)";
// 				this.lineProperty.width = "0";
// 				event = this.addRectangle(ev.x, ev.y, (this.view.w / this.eventWidthDivisor), height, { id: "ev." + this.eventCnt }, item.eventGrp);
// 			}


// 			txt = this.AddTextBubble(ev.lbl, event, item, "", "", 0.3);

// 			this.lineProperty.type = "None";
// 			this.lineProperty.width = 0;
// 			this.lineProperty.color = "rgba(0,0,0,0)";
// 			//this.fillProperty.opacity = 1;
// 			this.eventCnt += 1;
// 			return event;
// 		};

// 		/**
// 		 * Removes all events linked to an event from the canvas (but not the internal collection)
// 		 * Used to only draw events on zoom in
// 		 * @param {Object} item - The item to remove events from
// 		 */
// 		public RemoveEvents (item) {
// 			;
// 			item.eventGrp.innerHTML = "";
// 		};

// 		/**
// 		 * Adds all events in an item's internal array to the canvas.
// 		 * Used to only draw events on zoom in
// 		 * @param {Object} item - The item to add events to.
// 		 */
// 		public AddEvents (item, large?) {
// 			;
// 			var ev, event;

// 			if (!item.events) return;

// 			for (ev = 0; ev < item.events.length; ev += 1) {
// 				this.AddEvent(item, item.events[ev], "", "", "", large);
// 			}
// 		};

// 		/**
// 		 * Expands an item to fill the screen. 
// 		 * Allows the view of more details about the event
// 		 * @param {Object} item - The item to expand
// 		 */
// 		public ExpandItem (item) {
// 			;
// 			var scaleCoord, posCoord, w, h, subSVG, that;
// 			that = this;
// 			// Create a second SVG canvas to host the expanded display
// 			// TODO

// 			// Handle collapsing
// 			if (item.expanded) {
// 				// Remove from the overlay
// 				this.overlayGrp.removeChild(item.grp);
// 				this.overlayGrp.removeChild(this.overlay);
// 				this.overlayGrp.removeChild(item.eventGrp);
// 				this._parent.removeChild(item.addlInfoExpanded);

// 				this.itemGrp.appendChild(item.grp);
// 				this.eventGrp.appendChild(item.eventGrp);
// 				item.expanded = false;
// 				this.expanded = null;
// 				//this._elems.base.style.cursor = "-webkit-grab";

// 				item.grp.removeAttribute("transform");
// 				item.eventGrp.removeAttribute("transform");

// 				if (!this.alwaysShowEvents) {
// 					this.RemoveEvents(item);
// 					this.AddEvents(item);
// 				}

// 				item.text.style.fill = "#000";
// 				item.text.removeAttribute("transform");

// 				// Handle expanding
// 			} else {
// 				// Create the overlay
// 				this.fillProperty.opacity = 0.8;
// 				this.fillProperty.color = "#000";
// 				this.fillProperty.type = "solid";
// 				this.overlay = this.addRectangle(this.view.x, this.view.y, this.view.w, this.view.h, null, this.overlayGrp);
// 				this.overlay.addEventListener("click", function () {
// 					that.ExpandItem(item);
// 				});

// 				this.itemGrp.removeChild(item.grp);
// 				this.eventGrp.removeChild(item.eventGrp);
// 				this.overlayGrp.appendChild(item.grp);
// 				this.overlayGrp.appendChild(item.eventGrp);
// 				this._parent.appendChild(item.addlInfoExpanded);
// 				item.expanded = true;
// 				this.expanded = item;
// 				//this._elems.base.style.cursor = "default";

// 				// Calculate the appropriate coordinates
// 				w = document.documentElement.clientWidth || window.innerWidth;
// 				h = document.documentElement.clientHeight || window.innerHeight;
// 				scaleCoord = this.calculateSVGCoordinates({x: w - 20, y: (2 * h / 3) });
// 				posCoord = this.calculateSVGCoordinates({x: 20, y: (window.innerHeight) / 3 });
// 				scaleCoord.x -= posCoord.x;
// 				scaleCoord.y -= posCoord.y;

// 				// Actually do the resizing
// 				this.ResizeAndRepositionItem(item, {
// 					w: scaleCoord.x,
// 					h: scaleCoord.y,
// 					x: posCoord.x,
// 					y: posCoord.y
// 				});

// 				item.text.style.fill = "rgba(0,0,0,0)";
// 				item.text.setAttribute("transform", "translate(0," + (-0.25 * item.text.measureElement().h) + ")");
// 				if (!this.alwaysShowEvents) {
// 					this.RemoveEvents(item);
// 					this.AddEvents(item, true);
// 				}
// 			}
// 		};

// 		/**
// 		 * Gets the row at which an item should appear, before the item is created
// 		 * 
// 		 * @param {Date} start - The start date of the event we are getting the row for
// 		 * @param {Date} end - The end date of the event we are getting the row for
// 		 * 
// 		 * @returns {number} The row number for this item
// 		 */
// 		public GetRow (start, end) {
// 			;

// 			// TODO eventually: allow multiple elements per row
// 			return this.rows.length;
// 		};

// 		/**
// 		 * OBSOLETE Creates a text bubble as an SVG
// 		 * @param {number} x      The x coordinate the bubble should appear at
// 		 * @param {number} y      The y coordinate the bubble should appear at
// 		 * @param {String} lbl    The label that should appear in the bubble
// 		 * @param {SVGGroup} layer - The layer at which this bubble should be added
// 		 * @param {Object} origin - The origin of the text that will be displayed
// 		 * @returns {SCGElement} The bubble that is created
// 		 */
// 		public AddSVGTextBubble (x, y, lbl, layer, origin) {
// 			;
// 			var rect, text, attr, dim, grp;

// 			grp = this.addGroup({id: lbl + "bubble"}, layer);

// 			if (lbl === "") {
// 				lbl = "??";
// 			}

// 			// Reset other properties
// 			this.lineProperty.type = "none";
// 			this.lineProperty.width = 0;
// 			this.lineProperty.color = "rgba(0,0,0,0)";

// 			// Set the color attributes
// 			this.fillProperty.type = "solid";
// 			this.fillProperty.color = this.bubbleColor;

// 			// Set the rectangle attributes
// 			attr = {
// 				rx: (this.rowHeight / 3),
// 				ry: (this.rowHeight / 3)
// 			};
// 			rect = this.addRectangle(x, y, 0, 0, attr, grp);

// 			if (!origin) {
// 				origin = {};
// 				origin.x = 0;
// 				origin.y = 0;
// 			}

// 			// Add the text
// 			this.fillProperty.color = this.textColor;
// 			this.fontProperty.family = "Segoe UI Semilight, Segoe UI, Calibri, Arial";
// 			this.fontProperty.size = (this.rowHeight / 3) + "pt";
// 			text = this.addText(lbl, {x: x, y: y}, origin, {}, grp);

// 			// Resize the rectangle to the size of the text
// 			dim = text.measureElement();
// 			rect.setAttribute("width", dim.width * 1.75);
// 			rect.setAttribute("height", dim.height * 1.65);
// 			rect.setAttribute("x", x);
// 			text.setAttribute("x", x + (dim.width * 0.37));
// 			rect.setAttribute("y", dim.y - (dim.height * 82.5));

// 			return grp;
// 		};

// 		/**
// 		 * Adds a label hover bubble for an svg element. Stays in the same place for the DLG
// 		 * 
// 		 * @param {String} lbl - The label that should appear in the bubble
// 		 * @param {SVGElement} elem - The element to add the bubble to
// 		 * @param {Object} item - The item object that this bubble is generally being applied to
// 		 * @param {number} [anchor_x] - The x-position at which a bubble should always appear
// 		 * @param {number} [anchor_y] - The y-position at which a bubble should always appear
// 		 * 
// 		 * @returns {HTMLElement} The text bubble that was created
// 		 */
// 		public AddTextBubble (lbl, elem, item, anchor_x?, anchor_y?, origOpacity?) {
// 			;
// 			var div, that;

// 			if (!elem) return;

// 			// check if we've attched our element
// 			if (!this.textDiv.parentNode) {
// 				this._parent.appendChild(this.textDiv);
// 			}

// 			if (this.options.noHoverBubbles) return;

// 			div = createSimpleElement("txt." + lbl, "textBubble", lbl);
// 			div.style.position = "absolute";
// 			div.style.backgroundColor = this.bubbleColor;
// 			div.style.color = this.textColor;
// 			div.style.fontFamily = "Segoe UI Light";
// 			div.style.padding = "5px";
// 			div.style.borderRadius = "5px";
// 			div.style.fontSize = "12px";
// 			div.style.boxShadow = "1px 1px 8px 2px rgba(0,0,0,.1)";

// 			this.textDiv.appendChild(div);
// 			that = this;


// 			// Mouse in listener
// 			elem.addEventListener("mouseover", function (ev) {
// 				var x, y, box;

// 				// Quit if we've already revealed the bubble
// 				if (!hasClass(div, "hidden")) return;

// 				// Hide whatever bubble was showing last if it's not hidden
// 				if (that.lastBubble) {
// 					addClass(that.lastBubble, "hidden");
// 				}

// 				box = elem.getBoundingClientRect();

// 				x = ev.x; //Math.round(box.left < 0 ? 0 : box.left);
// 				y = Math.round(box.top + box.height);

// 				// Set the appropriate coordinates
// 				removeClass(div, "hidden");

// 				// Make sure whatever coordinates we found are still on the screen
// 				box = div.getBoundingClientRect();
// 				if (x < 0) {
// 					x = 0;
// 				} else if ((x + box.width) > window.innerWidth) {
// 					x = (window.innerWidth - box.width);
// 				}

// 				if (y < 0) {
// 					y = 0;
// 				} else if ((y + box.height) > window.innerHeight) {
// 					y = (window.innerHeight - box.height);
// 				}

// 				div.style.left = x + "px";
// 				div.style.top = y + "px";

// 				that.lastBubble = div;

// 				elem.style.opacity = 1;
// 			});

// 			// Mouse out listener
// 			elem.addEventListener("mouseout", function (ev) {
// 				var rel = ev.toElement || ev.relatedTarget;
// 				//if (rel === div) return;

// 				addClass(div, "hidden");
// 				elem.style.opacity = origOpacity;
// 			});

// 			elem.addEventListener("mousemove", function (ev) {
// 				if (hasClass(div, "hidden")) return;
// 				div.style.left = ev.x + "px";
// 			});

// 			addClass(div, "hidden");

// 			return div;
// 		};

// 		/**
// 		 * Creates the lines indicating dates on the Gantt chart
// 		 */
// 		public CreateGuidelines () {
// 			;
// 			var num, lIdx, ln, func, relToday, x, dow, today, revDt, w, mult, coordA, coordB, noShow, shortDt, txt, txtColor, box, dIdx;



// 			// Don't draw lines if they wouldn't show
// 			coordA = this.calculateScreenCoordinates(this.view);
// 			coordB = this.calculateScreenCoordinates({x: this.view.x + (this.unitWidth / 15), y: this.view.y });
// 			if ((coordB.x - coordA.x) === 0) {
// 				noShow = true;
// 			}

// 			// Even if they might be shown, don't show more than 200 lines
// 			if (this.view.w > (200 * this.unitWidth)) {
// 				noShow = true;
// 			}

// 			// Create headers first
// 			this.CreateGuideHeaders(noShow);

// 			// Remove all old guildelines
// 			for (lIdx = this.lines.length - 1; lIdx >= 0; lIdx -= 1) {
// 				if (this.lines[lIdx] && this.lines[lIdx].parentNode) {
// 					this.lineGrp.removeChild(this.lines[lIdx]);
// 				}
// 			}

// 			this.lines = [];
// 			num = this.view.w / this.unitWidth;

// 			today = new Date();
// 			dow = today.getDay();
// 			relToday = this.ConvertToProjectPoint(today);

// 			// Set the fill properies for these lines
// 			this.fillProperty.type = "solid";
// 			this.lineProperty.type = "none";
// 			this.lineProperty.color = "rgba(0,0,0,0)";
// 			this.lineProperty.width = 0;

// 			// Loop throuh all visible lines at this point
// 			for (lIdx = 0; lIdx < num; lIdx += 1) {
// 				x = this.view.x + (this.unitWidth - (this.view.x % this.unitWidth)) + (lIdx * this.unitWidth);
// 				revDt = this.RevertFromProjectPoint(x / this.unitWidth);
// 				shortDt = Dates.shortDate(revDt);
// 				dow = revDt.getDay();
// 				txt = "";

// 				if (this.importantDates[shortDt]) {

// 					// Set a variable width for these
// 					w = (this.unitWidth / this.importantDates[shortDt].length);

// 					for (dIdx = 0; dIdx < this.importantDates[shortDt].length; dIdx += 1) {
// 						this.fillProperty.color = this.importantDates[shortDt][dIdx].color;

// 						// Show a border if the date is also today
// 						if (Dates.dateDiff(revDt, today) === 0) {
// 							this.lineProperty.width = (w / 8);
// 							this.lineProperty.color = "#8AE";
// 							this.lineProperty.type = "solid";
// 						}

// 						txt = this.importantDates[shortDt][dIdx].lbl;
// 						txtColor = this.importantDates[shortDt][dIdx].textColor;
// 						ln = this.addRectangle(x + (dIdx * w), this.view.y, w, this.view.h, null, this.lineGrp);
// 						this.lines.push(ln);

// 					}

// 					this.lineProperty.type = "none";
// 					this.lineProperty.width = 0;
// 					this.lineProperty.color = "rgba(0,0,0,0)";
// 					continue;

// 					// HILITE THE TODAY COLUMN
// 				} else if (Dates.dateDiff(revDt, today) === 0) {
// 					this.fillProperty.color = "rgba(0,0,0,.2)";
// 					w = this.unitWidth;

// 					// MAKE WEEKENDS GREY
// 				} else if (this.showWeekends && (dow === 0 || dow === 6)) {
// 					this.fillProperty.color = "rgba(0,0,0,.05)";
// 					w = this.unitWidth;

// 					// HILITE THE FIRST DAY OF THE WEEK IF WE AREN'T SHOWING WEEKENDS
// 				} else if (!this.showWeekends && dow === 1) {
// 					//if (noShow) continue;
// 					this.fillProperty.color = "rgba(255,255,255,.1)"; //KJPTEST
// 					this.lineProperty.color = "rgba(100,100,100,.3)";
// 					this.lineProperty.type = "solid";
// 					this.lineProperty.width = this.unitWidth / 20;

// 					// REGULAR COLUMN FILL
// 				} else {
// 					//if (noShow) continue;
// 					this.fillProperty.color = "rgba(255,255,255,.1)"; //KJPTEST
// 					this.lineProperty.color = "rgba(220,220,220,.4)";
// 					this.lineProperty.type = "solid";
// 					this.lineProperty.width = this.unitWidth / 20;
// 				}

// 				ln = this.addRectangle(x, this.view.y, this.unitWidth, this.view.h, { "class": "projectCol", "id": "col" + shortDt }, this.lineGrp);
// 				this.lines.push(ln);

// 				this.lineProperty.type = "none";
// 				this.lineProperty.color = "rgba(0,0,0,0)";
// 				this.lineProperty.width = 0;

// 				// Draw the text for important dates
// 				if (txt) {
// 					this.fillProperty.color = txtColor;
// 					this.fontProperty.size = (2 * this.unitWidth / 3);
// 					txt = this.addText(txt, {x: (0.5 * this.unitWidth), y: (3 * this.rowHeight)}, { x: 0.5, y: 0.5 }, {},  this.lineGrp);
// 					box = txt.measureElement();
// 					txt.setAttribute("y", +txt.getAttribute("y") + (box.width / 2) + this.rowHeight);

// 					this.rotateElement(txt, -90);
// 					this.lines.push(txt);
// 				}

// 			}


// 		};

// 		/**
// 		 * Creates the headers for the dates on the Gantt chart
// 		 */
// 		public CreateGuideHeaders (noNumbers?) {
// 			;
// 			var num, header, txt, idx, revDt, x, months, mIdx, rect, month, w, maxH, h, txt, pt;

// 			if (!this.textDiv.parentNode && this._parent) {
// 				this._parent.appendChild(this.textDiv);
// 			}

// 			// remove all of the old guide headers
// 			for (idx = this.headers.length - 1; idx >= 0; idx -= 1) {
// 				if (this.headers[idx] && this.headers[idx].parentNode) {
// 					this.headers[idx].parentNode.removeChild(this.headers[idx]);
// 				}
// 			}

// 			this.headers = [];
// 			months = {};

// 			// Calculate the max height in SVG units
// 			maxH = this.calculateSVGHeight(this.maxHeaderHeight);
// 			h = maxH;

// 			this.fillProperty.type = "solid";
// 			this.fontProperty.size = (h / 3);
// 			this.fillProperty.opacity = 1;

// 			num = this.view.w / this.unitWidth;
// 			for (idx = 0; idx < num; idx += 1) {

// 				x = this.view.x + (this.unitWidth - (this.view.x % this.unitWidth)) + ((idx - 1) * this.unitWidth);

// 				revDt = this.RevertFromProjectPoint(x / this.unitWidth);
// 				mIdx = revDt.getMonth() + "." + revDt.getYear();

// 				// Initialize the months index if appropriate
// 				if (!months[mIdx]) {
// 					months[mIdx] = {
// 						name: Dates.getMonthName(revDt, true),
// 						start: x,
// 						month: revDt.getMonth(),
// 						year: revDt.getFullYear().toString()
// 					};
// 				} else {
// 					months[mIdx].end = x;
// 				}

// 				// Don't show numbers if we shouldn't be
// 				if (noNumbers) continue;

// 				// Create the day headers
// 				this.fillProperty.color = "#FFF";
// 				this.headers.push(this.addRectangle(x, this.view.y + h, this.unitWidth, (h / 2), {}, this.headerGrp));
// 				//this.fillProperty.color="#68C";
// 				//this.fontProperty.size = (4 * this.unitWidth / 5);
// 				//this.headers.push(this.AddText("", revDt.getDate(), x + (this.unitWidth / 4), this.viewY + h, "", {x: 0, y: 0}, this.headerGrp));

// 				txt = createSimpleElement("", "dayHeader", revDt.getDate(), {}, [], this.textDiv);
// 				pt = this.calculateScreenCoordinates({x: x + (this.unitWidth / 4), y: this.view.y + h });
// 				txt.style.left = "calc(" + this.headerOffset + "% + " + pt.x + "px)";
// 				txt.style.top = pt.y = "px";
// 				txt.style.width = w + "px";
// 				txt.style.color = "#FFF";
// 				txt.style.position = "absolute";

// 				this.headers.push(txt);
// 			}


// 			// Create the monthly headers
// 			for (mIdx in months) {
// 				if (months.hasOwnProperty(mIdx)) {

// 					month = months[mIdx];
// 					w = month.end - month.start + this.unitWidth;
// 					if ((w < 0) || (isNaN(w))) continue;

// 					// create a rectangle
// 					this.fillProperty.color = this.monthColors[month.month];
// 					this.headers.push(this.addRectangle(month.start, this.view.y, w, h, null, this.headerGrp));

// 					// create the text
// 					txt = createSimpleElement("", "monthHeader", month.name.toUpperCase() + " " + month.year[2] + month.year[3], null, null, this.textDiv);
// 					pt = this.calculateScreenCoordinates({ x: month.start, y: this.view.y });
// 					txt.style.left = pt.x + "px";
// 					txt.style.top = pt.y = "px";
// 					txt.style.width = w + "px";
// 					txt.style.color = "#FFF";
// 					txt.style.position = "absolute";



// 					this.headers.push(txt);
// 				}
// 			}
// 		};

// 		/**
// 		 * Handle updating our guidelines on zoom
// 		 * @param {number} amt - The amount that has been zoomed
// 		 */
// 		public Zoom (amt) {
// 			var end_ratio;
// 			if (this.expanded) return;
// 			this.RemoveText();
// 			if (this.lastBubble) {
// 				addClass(this.lastBubble, "hidden");
// 			}

// 			if (!this.beginningRatio) {
// 				this.beginningRatio = (this.view.w / this.view.h);
// 			}

// 			super._onZoom.call(this, amt);
// 			end_ratio = (this.view.w / this.view.h);
// 			this.CreateGuidelines();
// 			this.RefreshUI();
// 		};

// 		public RemoveText () {
// 			var idx;

// 		};

// 		// ReaddText
// 		//---------------------------------------------------------------
// 		public ReaddText (end) {
// 			return;
// 		};

// 		/**
// 		 * Handle updating our guidelines on pan
// 		 * @param {number} amtX - The x amount to move the viewbox
// 		 * @param {number} amtY - The y amount to move the viewbox
// 		 */
// 		public Pan (amtX, amtY) {
// 			if (this.expanded) return;
// 			if (this.lastBubble) {
// 				addClass(this.lastBubble, "hidden");
// 			}
// 			super._onPan.call(this, amtX, amtY);
// 			this.CreateGuidelines();
// 			this.RefreshUI(true);
// 		};

// 		/** 
// 		 * Allows the user to sort the items in the Gantt chart according to a particular sort function
// 		 * @param {function} sortFunc - The function to sort the list by
// 		 */
// 		public Sort (sortFunc, titleFunc) {
// 			var i, y, h, lastH, headCb, that = this;

// 			// Clear any previous headers
// 			this.itemHeaders.map(function (elem) {
// 				if (!elem) return;
// 				if (!elem.div) return;
// 				if (elem.div.parentNode) {
// 					elem.div.parentNode.removeChild(elem.div);
// 				}
// 			});
// 			this.itemHeaders = [];

// 			// We need to rearrange the rows to the appropriate positions
// 			this.items.sort(sortFunc);

// 			// Also create headers for each of the sections
// 			this.items.map(function (elem, key, arr) {
// 				h = titleFunc(elem);
// 				if (lastH === h) return;
// 				that.AddItemHeader(key, h);
// 				lastH = h;
// 			});

// 			// Update the UI
// 			this.RefreshUI();
// 		};

// 		/** 
// 		 * Clears all data about this project.
// 		 */
// 		public Clear () {
// 			var rIdx, idx, item;

// 			// Clear out the visible elements
// 			this.ClearUI();

// 			// Clear out our internal collections
// 			this.rows = [];
// 			this.items = [];
// 			this.eventCnt = 0;
// 		};

// 		/** 
// 		 * Clears the UI of the project, but not its internal data
// 		 */
// 		public ClearUI () {
// 			this.itemGrp.innerHTML = "";
// 			this.eventGrp.innerHTML = "";
// 			this.textDiv.innerHTML = "";
// 			this.coverGrp.innerHTML = "";
// 			this.CreateGuideHeaders();
// 		};

// 		// RemoveItem
// 		//--------------------------------------------------------------------------------------
// 		public RemoveItem (item, refreshesLater) {
// 			var idx, tItem;
// 			idx = item.id;
// 			tItem = this.items[idx];

// 			// Grab the appropriate item index
// 			if (tItem !== item) {
// 				for (idx = 0; idx < this.items.length; idx += 1) {
// 					tItem = this.items[idx];
// 					if (tItem === item) break;
// 				}
// 			}

// 			// Remove the value of the row
// 			this.rows.splice(item.row, 1);

// 			// Remove the item
// 			this.items.splice(idx, 1);

// 			// Clear the HTML
// 			item.grp.innerHTML = "";
// 			if (item.grp.parentNode) {
// 				item.grp.parentNode.removeChild(item.grp);
// 			}

// 			// Clean up event HTML
// 			item.eventGrp.innerHTML = "";
// 			if (item.eventGrp.parentNode) {
// 				item.eventGrp.parentNode.removeChild(item.eventGrp);
// 			}
// 			if (item.events) this.eventCnt -= item.events.length;

// 			// Clean up cover groups
// 			item.coverRectGrp.innerHTML = "";

// 			// Allow a callback on remove
// 			if (item.addl.onremove) {
// 				item.addl.onremove();
// 			}

// 			// Refresh so everything slides into place
// 			if (!refreshesLater) this.RefreshUI();
// 		};

// 		/**
// 		 * Temporarily resizes an item via a transform matrix
// 		 * 
// 		 * @param {Object} item - The item to resize & reposition
// 		 * @param {Object} newDim - The new dimensions to use for the item
// 		 * @param {number} newDim.x - The new x position
// 		 * @param {number} newDim.y - The new y position
// 		 * @param {number} newDim.w - The new width of the item
// 		 * @param {number} newDim.h - The new height of the item
// 		 * @param {number} [newDim.scaleW] - The percentage to scale by. Used in place of w if provided
// 		 * @param {number} [newDim.scaleH] - The percentage to scale by. Used in place of h if provided
// 		 */
// 		public ResizeAndRepositionItem (item, newDim) {
// 			;
// 			var box, dx, dy, dw, dh, matrix;

// 			// Remove any previous transforms we had applied
// 			item.grp.removeAttribute("transform");

// 			// Measure the elem as it originally existed
// 			box = item.grp.measureElement();

// 			// Quit if width or height are zero
// 			if (box.width === 0) return;
// 			if (box.height === 0) return;

// 			// Calculate the deltas of the width & height
// 			dw = newDim.scaleW || (newDim.w / box.width);
// 			dh = newDim.scaleH || (newDim.h / box.height);

// 			// Calculate the deltas of the new x & y
// 			dx = newDim.x - box.x;
// 			dy = newDim.y - box.y;

// 			// Calculate what offset we'll need for the scaling
// 			dx += (-1 * (dw - 1) * box.x);
// 			dy += (-1 * (dh - 1) * box.y);

// 			// Create the matrix element to use
// 			matrix = "matrix(";
// 			matrix += dw + ", ";
// 			matrix += "0, 0, ";
// 			matrix += dh + ", ";
// 			matrix += dx + ", ";
// 			matrix += dy;
// 			matrix += ")";

// 			item.grp.setAttribute("transform", matrix);
// 			item.eventGrp.setAttribute("transform", matrix);
// 		};

// 		/**
// 		 * Disables showing the titles inline
// 		 * @param {boolean} [undo] - If true, enables the titles
// 		 */
// 		public DisableTitles (undo) {
// 			;

// 			if (undo) {
// 				this.rowSpace = 2.0;
// 				this.showTitles = true;
// 			} else {
// 				this.rowSpace = 1.5;
// 				this.showTitles = false;
// 			}

// 			this.RefreshUI();
// 		};

// 		/** 
// 		 * Changes the y position of an item
// 		 * @param {Object} item - The item that is being adjusted
// 		 * @param {number} newY - The new Y value that this item should appear at
// 		 * @param {number} row  - The new row value of the item
// 		 */
// 		public AdjustY (item, newY, row) {
// 			;
// 			var grp, c, child, origY, dy, tmp, that;

// 			that = this;

// 			this.rows[row] = [this.items[row]];
// 			this.items[row].row = row;
// 			this.items[row].y = newY;

// 			grp = item.grp;

// 			// Loop through all of the segments and adjust their position
// 			for (c = 0; c < grp.children.length; c += 1) {
// 				child = grp.children[c];
// 				tmp = child.getAttribute("y");

// 				// Make sure we account for both the top & bottom row
// 				if (!origY && (origY !== 0)) {
// 					origY = tmp;
// 				}

// 				if ((tmp !== origY) && (child !== item.text)) {
// 					dy = (+tmp) - (+origY);
// 				} else if (child === item.text) {
// 					dy = -1;
// 				} else {
// 					dy = 0;
// 				}

// 				child.setAttribute("y", newY + dy);
// 			}

// 			// Remove & redraws the associated events
// 			if (item.events) {
// 				item.events.map(function (elem) {
// 					var i;
// 					elem.row = row;
// 					elem.y = newY;
// 					for (i = (that.eventRow - 1); i >= 0; i -= 1) {
// 						elem.y += ((2 * that.barGap * that.rowHeight) + (that.rowHeight * that.barPercentages[i]));
// 					}
// 				});
// 				this.RemoveEvents(item);
// 				this.AddEvents(item);
// 			}

// 			if (this.useCoverRects) {
// 				this.__addCoverRect(item);
// 			}
// 		};

// 		/**
// 		 * Refreshes the display so that new Y values are accommodated
// 		 */
// 		public RefreshUI (fromPanZoom?: boolean, unscale?: boolean) {
// 			;
// 			var i, y, h_y, box, top, itemLeft, itemRight, headerX, running_y;

// 			// Now loop through the events and assign new rows
// 			this.rows = [];
// 			h_y = 0;
// 			running_y = 0;
// 			headerX = this.calculateSVGCoordinates({x: 20, y: 0}).x;
// 			var zeroX = this.calculateSVGCoordinates({x: 10, y: 0}).x;

// 			for (i = 0; i < this.items.length; i += 1) {
// 				this.rows.push(this.items[i]);

// 				// HANDLE SPACERS + HEADERS
// 				if (this.items[i].type === "spacer") {
// 					if (this.items[i].name) {
// 						if (!this.items[i].text) {
// 							var fsize = this.fontProperty.size;
// 							var fColor = this.fillProperty.color;
// 							var font = this.fontProperty.family;

// 							this.fontProperty.size = (2 * this.rowHeight / 3);
// 							this.fontProperty.family = "Segoe UI Black";
// 							this.fillProperty.color = "rgba(0,0,0,.6)";

// 							this.items[i].text = this.addText(this.items[i].name, {x: headerX, y: running_y }, { x: 0, y: 0 }, { unscalable: true }, this.itemGrp);

// 							this.items[i].x = headerX;
// 							this.fontProperty.size = fsize;
// 							this.fontProperty.family = font;
// 							this.fillProperty.color = fColor;

// 						} else {
// 							this.items[i].text.setAttribute("x", headerX);
// 						}

// 					}
// 					running_y += (this.rowHeight * this.rowSpace);
// 					continue;
// 				}

// 				box = undefined;
// 				this.items[i].row = i;


// 				// Show or hide the title as appropriate
// 				if (!this.showTitles) {
// 					if (this.items[i].text && this.items[i].text.parentNode) {
// 						this.items[i].text.parentNode.removeChild(this.items[i].text);
// 					}
// 				} else {
// 					if (this.items[i].text && !this.items[i].text.parentNode) {
// 						this.items[i].grp.appendChild(this.items[i].text);
// 					}

// 					// Adjust the title to be on screen
// 					this.__adjustTitleToBeOnScreen(zeroX, this.items[i]);

// 				}

// 				// HANDLE NON-SVG HEADERS
// 				if (this.itemHeaders[i]) {
// 					this.headerDiv.appendChild(this.itemHeaders[i].div);

// 					top = this.calculateScreenCoordinates({x: 0, y: h_y + this.rowSpace + (i * this.rowHeight * this.rowSpace) - (box ? box.height : 0)}).y;
// 					top += this.base.getBoundingClientRect().top;
// 					this.itemHeaders[i].div.style.top = top + "px";
// 					box = this.itemHeaders[i].div.getBoundingClientRect();
// 					if (box.height > 0) {
// 						h_y += this.calculateSVGHeight(box.height) + (1.5 * this.rowSpace) + (this.headerGap || 0);
// 					}
// 				}

// 				y = h_y + (i * this.rowHeight * this.rowSpace);
// 				if (!fromPanZoom) { this.AdjustY(this.items[i], y, i); }
// 				running_y += (h_y + (this.rowHeight * this.rowSpace));

// 			}

// 			// Refresh all of the appropriate elements
// 			this.draw();

// 			// If we are told to unscale our elements, do it
// 			if (unscale) { this._unscaleAppropriateElements(); }

// 			// If we have a listener, tell it that we refreshed
// 			if (this.refreshNotify) this.refreshNotify(fromPanZoom);
// 		};

// 		// __adjustTitleToBeOnScreen
// 		//---------------------------------------------------------------------------------------
// 		/** adjust a project line title to be visible */
// 		protected __adjustTitleToBeOnScreen (zeroX, item) {
// 			;
// 			var itemLeft, itemRight, newX, curX;
// 			itemLeft = item.x;

// 			// LINE START IS OFF SCREEN
// 			if (itemLeft < zeroX) {

// 				// IF WE ARE ONLY SHOWING LINES THAT ARE ON SCREEN, QUIT IF THIS ONE IS COMPLETELY OFF
// 				if (this.onlyShowVisibleTitles) {
// 					itemRight = this.calculateScreenWidth(item.grp.measureElement().w) + itemLeft;
// 					if (itemRight < 0) { return; }
// 				}

// 				// UPDATE THE APPROPRIATE TRANSLATION VALUES
// 				newX = zeroX;

// 				// OTHERWISE, WE MAY NEED TO RESET THE TITLE POSITION TO BE THE LINE START
// 			} else {
// 				curX = item.text.getAttribute("x");
// 				if (curX === item.x) { return; }

// 				newX = itemLeft;
// 			}

// 			// ACTUALLY UPDATE THE VALUES
// 			item.text.setAttribute("x", newX);
// 			this._updateTranslation(item.text);
// 		};

// 		// AddItemHeader 
// 		//-------------------------------------------------------------------------
// 		// (used for non-SVG headers)
// 		public AddItemHeader (idx, label) {
// 			;
// 			var h;

// 			// Add our header div if appropriate
// 			if (!this.headerDiv.parentNode) {
// 				this._parent.appendChild(this.headerDiv);
// 			}

// 			// Create a header to be added
// 			h = createSimpleElement("header" + idx, "header", label);

// 			// Save to our headers array
// 			this.itemHeaders[idx] = {
// 				div: h,
// 				lbl: label,
// 				key: idx
// 			};

// 		};

// 		// ProjectPlan.AddImportantDate
// 		//----------------------------------------------------------------------------------------------------------------------
// 		/**
// 		 * Adds an important date to our internal collection.
// 		 */
// 		public AddImportantDate(startDate, lbl, color, textColor, endDate, category) {
// 			;
// 			var diff, dir, dt, dIdx, tmp, cb, i, that = this;

// 			// Callback that sets the appropriate data on the created dates
// 			cb = function (date, label, col, textCol, cat) {
// 				var shortDt, tmp;
				
// 				shortDt = Dates.shortDate(date);


// 				if (!that.importantDates[shortDt]) {
// 					that.importantDates[shortDt] = [];
// 				} else {
// 					// Make sure we don't have the same date already set
// 					for (i = 0; i < that.importantDates[shortDt].length; i += 1) {
// 						tmp = that.importantDates[shortDt][i];
// 						if (tmp.lbl === label) {
// 							break;
// 						}
// 						tmp = null;
// 					}
// 				}

// 				// Push the date onto the array for this date
// 				if (!tmp) {
// 					that.importantDates[shortDt].push({
// 						date: new Date(date),
// 						lbl: label,
// 						color: col || "#C30",
// 						textColor: textCol || "#FFF",
// 						category: category,
// 						shortDate: shortDt
// 					});

// 					// Update if this column already exists
// 				} else {
// 					tmp.date = new Date(date);
// 					tmp.color = col || tmp.color;
// 					tmp.textColor = textCol || tmp.textColor;
// 					tmp.category = category || tmp.category;
// 				}

// 			};

// 			// Convert to a date if need be
// 			if (!startDate.getFullYear) {
// 				startDate = new Date(startDate);
// 			}
// 			if (endDate && !endDate.getFullYear) {
// 				endDate = new Date(endDate);
// 			}

// 			// Get the difference between the end date & the start date
// 			diff = 0;
// 			dir = 1;
// 			if (endDate) {
// 				diff = Dates.dateDiff(endDate, startDate);
// 				dir = (diff < 0) ? -1 : 1;
// 				diff = Math.abs(diff);
// 			}

// 			// Quit if the date isn't real
// 			if (!startDate || !startDate.getFullYear) return;
// 			tmp = new Date(startDate);
// 			for (dIdx = 0; dIdx <= diff; dIdx += dir) {
// 				dt = tmp;

// 				// Add to our important date array
// 				cb(dt, lbl, color, textColor, category);

// 				// Increment the date
// 				dt = Dates.addToDate(tmp, { days: 1 });
// 			}

// 			// Redraw so the date is now incorporated
// 			this.CreateGuidelines();
// 			this.draw();
// 		};


// 		// AddImportantDateCategory
// 		//----------------------------------------------------------------------------------
// 		public AddImportantDateCategory(catName) {
// 			;
// 			var catOpt, idx;

// 			// Check that we din't have a category with that name
// 			for (idx = 0; idx < this.impDateCategories.length; idx += 1) {
// 				if (this.impDateCategories[idx] === catName) {
// 					return false;
// 				}
// 			}

// 			// Otherwise, add it to the list
// 			idx = this.impDateCategories.length;
// 			this.impDateCategories.push(catName);

// 			// If we have already drawn the form, we need to add new catgories
// 			if (!this.dateForm) {
// 				return idx;
// 			}
// 			catOpt = createElement({
// 				type: "option",
// 				attr: {value: idx},
// 				before_content: catName
// 			});
// 			this.impDateCatSelector.appendChild(catOpt);

// 			// return the index this was added to
// 			return idx;
// 		};

// 		// Remove Important Date
// 		//----------------------------------------------------------------------------
// 		public RemoveImportantDate(dt, idx) {
// 			;
// 			if (idx) {
// 				this.importantDates[dt].splice(idx, 1);
// 			} else {
// 				delete this.importantDates[dt];
// 			}
// 			this.CreateGuidelines();
// 			this.draw();
// 		};

// 		// Jump
// 		//----------------------------------------------------------
// 		public Jump(x, y) {
// 			;
// 			this.view.x = x || this.view.x;
// 			this.view.y = y || this.view.y;
// 			this.view = this._calculateView();
// 			this.CreateGuidelines();
// 			this._calculateView();
// 			this.RefreshUI();
// 		};


// 		// AfterDrawChildren
// 		//-------------------------------------------------------------------
// 		public AfterDrawChildren() {
// 			;
// 			if (!this.textDiv.parentNode && this._parent) {
// 				this._parent.appendChild(this.textDiv);
// 			}
// 		};

// 		/**
// 		 * _updateTranslation
// 		 * @param element 
// 		 */
// 		protected _updateTranslation (element) {
// 			var transformString = element.getAttribute("transform");
// 			if (transformString === "") { return; }
			
// 			var pos = this._getPosition(element);
			
// 			// PULL OUT THE SCALE PART
// 			var scaleReg= /scale\(.*?\)/g;
// 			var scale: RegExpExecArray = scaleReg.exec(transformString);
// 			if (!scale) { return; } 
			
// 			// UPDATE THE TRANSFORM
// 			transformString = "translate(" + pos.x + "," + pos.y + "), " + scale[0] + ", translate(" + (pos.x * -1) + ", " + (pos.y * -1) + ")";
// 			element.setAttribute("transform", transformString);
			
// 		};

// 		/**
// 		 * _getPosition
// 		 */
// 		protected _getPosition (elem) {
// 			var pos;
// 			if (elem.getAttribute("x") && elem.getAttribute("y")) {
// 				pos = {
// 					x: +elem.getAttribute("x"),
// 					y: +elem.getAttribute("y")
// 				};
// 			} else {
// 				var bbox = elem.measureElement();
// 				pos = {
// 					x: bbox.x,
// 					y: bbox.y
// 				};
// 			}
// 			return pos;
// 		};

// 		/**
// 		 * 
// 		 */
// 		protected _unscaleAppropriateElements () {
// 			var idx;
			
// 			// SAVE OFF THE ORIGINAL DIMENSIONS FOR THE UNSCALING
// 			if (!this.originalView) { this._saveOriginalView(); }
			
// 			// QUIT IF THERE IS NOTHING TO "UN-SCALE"
// 			if (this._nonScaled.length === 0) { return; }
		
// 			// GET THE SCALE FACTORS KJPTEST
// 			var scale = {
// 				x: (this.view.w / this.originalView.w),
// 				y: (this.view.h / this.originalView.h)
// 			};
		
// 			// LOOP THROUGH EACH OF OUR UNSCALABLE ELEMENTS
// 			for (idx = 0; idx < this._nonScaled.length; idx += 1) {
// 				this._unscaleElement(this._nonScaled[idx], scale);
// 			}
		
// 		};

// 		/**
// 		 * _unscaleElement
// 		 * 
// 		 * @param elem 
// 		 * @param scale 
// 		 */
// 		protected _unscaleElement (elem, scale) {

// 			// GET THE CURRENT POSITION OF THE ELEMENT
// 			var pos = this._getPosition(elem);
		
// 			// BUILD & ASSIGN THE STRING
// 			var transformString = "translate(" + pos.x + "," + pos.y + "), scale(" + scale.x + ", " + scale.y + "), translate(" + (pos.x * -1) + ", " + (pos.y * -1) + ")";
			
// 			elem.setAttribute("transform", transformString);
// 		};
// 	}
// }