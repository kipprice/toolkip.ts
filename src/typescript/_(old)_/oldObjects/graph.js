KIP.Constants.GraphTypeEnum = {
	"Pie": 0,
	"Bar": 1,
	"Circle": 2,
	"Tier": 3,
	"Line": 4,
	"Trend": 5,
	"Segment": 6
};

// Graph
//-----------------------------------------
/** 
 * Creates a graph object  of various types
 *
 * @class Graph
 *
 * @param {string} id - The unique identifier for the graph
 * @param {GraphTypeEnum} type - The type of graph we are creating
 **/
KIP.Objects.Graph = function(id, type) {
	this.id = id;
	this.data = [];
	this.dataListeners = [];
	this.type = type;
	this.sortedData = [];
	this.units = {};
	this.htmlLbls = [];

	// We need to keep track of all of our elements
	this.elems = [];

	// Create a separate SVG object
	this.svg = new KIP.Objects.SVGDrawable(id + "|graph", true);

	// The root of a graph is a drawable
	KIP.Objects.Drawable.call(this, id);

	// Make sure we add our SVG to our div
	this.AppendChild(this.svg);

	
};

// The graph is based off of an SVG Drawable
KIP.Objects.Graph.prototype = Object.create(KIP.Objects.Drawable.prototype);

// Graph.SetUnits
//-----------------------------------------------------------------------------
/**
 * Set the appropriate units for this graph
 * @param {string} [x_units] - The unit used for the x axis
 * @param {string} [y_units] - The unit used for the y axis
 * @param {string} [z_units] - The unit used for the z axis
 */
KIP.Objects.Graph.prototype.SetUnits = function(x_units, y_units, z_units) {
	;
	this.units.x = x_units || "";
	this.units.y = y_units || "";
	this.units.z = z_units || "";
};

// Graph.AddData
//--------------------------------------------------------------------------------------------
/**
 * Adds a piece of data to the graph. Each graph handles this data separately
 *
 * @param {string} label - What the data should be labeled with
 * @param {number} independent - The x value of this data
 * @param {number} [dependent] - The y value of this data
 * @param {number} [depth] - The z value of this data
 * @param {variant} [addl] - Any additional data that this particular graph might need to display its data
 *
 * @returns {number} The index at which this data is placed
 */
KIP.Objects.Graph.prototype.AddData = function(label, independent, dependent, depth, addl) {
	;
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

// Graph.AddDataAppropriateForGraph
//------------------------------------------------------------------------
/**
 * Placeholder function that is overriden by each type of graph
 *
 * @param {number} idx - The index of the data we are adding toLocaleString
 */
KIP.Objects.Graph.prototype.AddDataAppropriateForGraph = function(idx) {
	;
	// Placeholder for the implementable function for adding data
};

// Graph.AddListenerToData
//--------------------------------------------------------------------------
/**
 * Queues up an event listener to a particular piece of data, to be added when it is drawn
 * @param {number} idx - The index of the data to add the listener to
 * @param {string} type - The type of listener we want to add
 * @param {function} func - The call back function for the listener
 */
KIP.Objects.Graph.prototype.AddListenerToData = function(idx, type, func) {
	;
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

// Graph.AttachDataLsteners
//---------------------------------------------------------------------
/**
 * Add the appropriate event listeners to the current piece of data
 * @param {number} idx - The index of the piece of data being drawn
 * @param {SVGElement} pc - The SVG element to add the event listener to
 */
KIP.Objects.Graph.prototype.AttachDataListeners = function(idx, pc) {
	;
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

// Graph.AdjustSize
//---------------------------------------------------------------
/**
 * Passes through to the SVG portions of the graph to set the SVG size
 * @param {number} w - The width to use for the SVG
 * @param {number} h - The height to use for the SVG
 * @param {string} view - A string to use for the SVG view
 */
KIP.Objects.Graph.prototype.AdjustSize = function(w, h, view) {
		;
	var x, y, elem, idx, pt, ret;
	// Call the regular Adjust Size function
	ret = this.svg.AdjustSize(w, h, view);
	
	// Make sure all of our textual elements also get updated to their new relative positions
	for (idx = 0; idx < this.htmlLbls.length; idx += 1) {
		x = this.htmlLbls[idx].x;	
		y = this.htmlLbls[idx].y;	
		elem = this.htmlLbls[idx].elem;	
		
		pt = this.svg.CalculateScreenCoordinates(x, y);
		elem.style.left = pt.x + "px";
		elem.style.top = pt.y + "px";
	}
	
	return ret;
};

// Graph.AddHTMLLbl
//---------------------------------------------------------------
KIP.Objects.Graph.prototype.AddHTMLLbl = function (elem, x, y, extra) {
	;
	this.htmlLbls.push({
		elem: elem,
		x: x, 
		y: y,
		extra: extra
	});
}


// =================== CIRCULAR GRAPH SUBTYPE ===============================
// CircularGraph
//------------------------------------------------
/**
 * Prototypical graph object to use for pie graphs and circle graphs
 * @param {string} id - The unique identifier for this graph
 * @param {GraphTypeEnum} type - What type of graph this will become
 */
KIP.Objects.CircularGraph = function(id, type) {
	;
	this.useSVGLabels = false;
	KIP.Objects.Graph.call(this, id, type);
};

// Inherits the basic properties of a graph
KIP.Objects.CircularGraph.prototype = Object.create(KIP.Objects.Graph.prototype);

// CircularGraph.AddTextAroundRing
//---------------------------------------------------------------------------------------------------------------------------------
/** 
 * Adds a label in the appropriate position around the circular graph
 * @param {string} txt - The text to display as the label
 * @param {number} startAngle - The beginning angle (in degrees) of the data we are labeling
 * @param {number} endAngle - The ending angle (in degrees) of the data we are labeling
 * @param {SVGElement} reFElem - The element to add the label to
 * @param {number} [r] - The radius for this particular piece of data
 * @param {string} [id] - A unique identifier for this label
 * @param {string} [cls] - A CSS class to use for this label
 * @param {SVGElement} [group] - The SVG group to add this to
 * @param {boolean} [rotate] - True if the text should be rotated around the graph.
 * @returns {SVGElement} The created label
 */
KIP.Objects.CircularGraph.prototype.AddTextAroundRing = function(txt, startAngle, endAngle, refElem, r, id, cls, group, rotate) {
	;
	var tDeg, tRad, tX, tY, origin, text, rAng, box;

	// Quit if this isn't a circular graph
	if (!this.radius) return;

	// Allow a passed in radius
	r = r || this.radius;

	// Calculate the position at which the text should appear
	tDeg = startAngle + (endAngle - startAngle) / 2;
	tRad = KIP.Functions.DegreesToRadians(tDeg);

	tY = KIP.Functions.RoundToPlace(-1 * Math.cos(tRad), 1000);
	tX = KIP.Functions.RoundToPlace(Math.sin(tRad), 1000);

	origin = {};

	// Calculate where to stick the y component of the origin
	origin.y = (tY / -4) + 0.75;

	// Calculate where to stick the x component of the origin
	origin.x = (tX / -2) + 0.5;

	// Set the appropriate properties
	this.svg.lineProperty.type = "none";

	// Actually add the text
	text = this.svg.AddText(
		refElem,
		txt,
		this.center.x + (tX * (r + 1)),
		this.center.y + ((r + 1) * tY), {
			"id": id,
			"class": cls
		},
		origin,
		group
	);

	// Rotate if appropriate
	if (rotate) {
		box = this.svg.MeasureElem(text);
		rAng = (((endAngle - startAngle) / 2) + startAngle) % 45 + 315;
		text.setAttribute("transform", "rotate(" + (rAng) + " " + (box.x + (box.width / 2)) + " " + (box.y + (box.height / 2)) + ")");
	}

	// Return the created text
	return text;

};

// CircularGraph.CalculateMiddlePointOfSegment
//-----------------------------------------------------------------------------------------------------
/**
 * Calculates the point on the circumference of a circular graph that is in between a starting & ending angle
 * @param {number} startAngle - The angle that starts this segment
 * @param {number} endAngle - The final angle in this segment
 * @returns {object} The SVG coordinates & real-screen coordinates for the appropriate spot on the graph
 */
KIP.Objects.CircularGraph.prototype.CalculateMiddlePointOfSegment = function(startAngle, endAngle) {
	;
	var tDeg, tRad, sX, sY, pt, r, dx, dy;
	r = this.radius;
	tDeg = startAngle + (endAngle - startAngle) / 2;
	tRad = KIP.Functions.DegreesToRadians(tDeg);

	sY = KIP.Functions.RoundToPlace(-1 * Math.cos(tRad), 1000);
	sX = KIP.Functions.RoundToPlace(Math.sin(tRad), 1000);

	sX = this.center.x + (sX * (r + 1));
	sY = this.center.y + ((r + 1) * sY);

	pt = this.svg.CalculateScreenCoordinates(sX, sY);

	return {
		svg_x: sX,
		svg_y: sY,
		x: pt.x,
		y: pt.y
	}
}

// CircularGraph.AddPieceListeners
//------------------------------------------------------------------------------------
/**
 * Adds the mouse in/out listeners for the data pieces to show labels
 * @param {SVGElement} piece - The element to add the listeners to
 * @param {string} text - The label to show on mouse over
 * @param {SVGElement} [box] - The SVG rectangle that appears behind the text
 */
KIP.Objects.CircularGraph.prototype.AddPieceListeners = function(piece, text, box) {
	;
	if (!piece || !text) return;

	piece.addEventListener("mouseover", function() {
		text.style.opacity = 1;
		if (box) box.style.opacity = 0.8;
	});

	piece.addEventListener("mouseout", function() {
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

//==============================
// PIE GRAPH 
//==============================

// PieGraph
//--------------------------------------------------------------------------
/**
 * Creates a pie graph that can show up to two types of data for every piece (percentage and height)
 * @param {string} id - The unique identifier for this graph
 * @param {object} [center] - The center point at which to draw this graph. Default is {x: 80, y: 80}
 * @param {number} [center.x] - The x position of the center. Default is 80
 * @param {number} [center.y] - The y position of the center. Default is 80
 * @param {number} [radius] - The radius of the graph. This is ignored if also changing the height of the graph. Default is 40
 */
KIP.Objects.PieGraph = function(id, center, radius) {
	;

	// Create from the circular graph template
	KIP.Objects.CircularGraph.call(this, id, KIP.Constants.GraphTypeEnum.Pie);

	// Get our requirements around the graph
	this.center = center || {
		x: 80,
		y: 80
	};
	this.radius = radius || 30;
	this.total = 0;

	// Style properties on the svg
	this.svg.lineProperty = {
		type: "solid",
		color: "#000",
		width: "0px"
	};
	this.svg.fontProperty = {
		family: "Segoe UI",
		size: "10px"
	};
	this.svg.fillProperty = {
		type: "solid"
	};

	// Other properties 
	this.hslRotate = KIP.Constants.HSLPieceEnum.Saturation;
	this.sort = true;
	this.keyX = 0;
	this.keyY = 0;
	this.days = 0;

	this.addLabels = true;
	this.addKey = true;


};

// Make sure we are inheriting from the circular graph
KIP.Objects.PieGraph.prototype = Object.create(KIP.Objects.CircularGraph.prototype);

// PieGraph.ChooseColorRotate
//-------------------------------------------------------------------
/**
 * Chooses the way the colors of this graph rotate
 */
KIP.Objects.PieGraph.prototype.ChooseColorRotate = function(hsl) {
	this.hslRotate = hsl;
};

KIP.Objects.PieGraph.prototype.GetHoverLabel = function (segmentData) {
	;
	return this.GetKeyLabel(segmentData, true);
};

KIP.Objects.PieGraph.prototype.GetKeyLabel = function (segmentData, hover) {
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
			ret += "(" + KIP.Functions.RoundToPlace((segmentData.x / this.total * 100), 10) + "%)";
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
KIP.Objects.PieGraph.prototype.Refresh = function() {
	var datum, dIdx, elem, perc, lastDeg, text, style, tX, tY, tDeg, origin, r, layerWedge, layerText, layerBox, box, textBox, sIdx, key, color;

	lastDeg = 0;

	this.svg.Clear();
	this.div.innerHTML = "";

	// ============= CREATE OUR LAYERS =================
	this.layers = {};
	this.layers.wedges = this.svg.CreateGroup("wedges");
	this.layers.boxes = this.svg.CreateGroup("boxes");
	this.layers.text = this.svg.CreateGroup("text");
	this.layers.hovers = KIP.Functions.CreateSimpleElement("hoverbubbles", "hoverbubbles");

	this.sortedArray = this.data.slice();

	// First, sort by size (unless the user requested otherwise)
	this.Sort();

	this.DrawSegments();

	if (this.addKey) {
		this.DrawKey({x: "", lbl: ""})
		this.DrawKey({x: this.total, lbl: "TOTAL"})
		this.div.appendChild(this.layers.key);
	}
	this.AppendChild(this.layers.hovers);

};

//PieGraph.DrawSegments
//----------------------------------------------------------
KIP.Objects.PieGraph.prototype.DrawSegments = function() {
	;
	var sIdx, datum, elem, lastDeg, lbl, color, lastDeg;

	lastDeg = 0;

	// Loop through our newly sorted array to draw things
	for (sIdx = 0; sIdx < this.sortedArray.length; sIdx += 1) {

		//============= DRAW THE SEGMENT =================
		// Grab the particular data out of this segment
		datum = this.sortedArray[sIdx];

		// Color the segment appropriately
		color = KIP.Functions.GenerateColor("", this.hslRotate);

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
		this.AttachDataListeners(datum.id, elem);

	}
}

// PieGraph.DrawSegment
//--------------------------------------------------------------------------------------------
/**
 * Draws a segment of the pie graph
 * @param {object} segmentData - Data about the segment we are drawing
 * @param {string} color       - The color string to use for the segment
 * @param {number} startDeg    - The degree at which this segment should start
 */
KIP.Objects.PieGraph.prototype.DrawSegment = function(segmentData, color, startDeg) {
	;
	var dID, perc, r, elem, endDeg, oldCol;

	// Get data out of the ddatum
	dID = segmentData.id; // The ID for the segment
	perc = (segmentData.x / this.total); // The percentage this segment occupies
	r = segmentData.y || this.radius; // The radial size of the segment
	endDeg = (startDeg + (perc * 360)); // The degree at which this segment will end

	// Set up the right color
	oldCol = this.svg.fillProperty.color;
	this.svg.fillProperty.color = color;

	// If this is 100% of the circle, just draw a circle
	if (perc === 1) {
		elem = this.svg.AddCircle(this.center.x, this.center.y, r, {}, this.layers.wedges);

		// Otherwise, draw a wedge
	} else {
		elem = this.svg.AddPerfectArc(
			this.center,
			r,
			startDeg,
			endDeg,
			1,
			false, {
				id: dID
			},
			this.layers.wedges
		);
	}

	// Reset the color appropriate
	this.svg.fillProperty.color = oldCol;

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
KIP.Objects.PieGraph.prototype.DrawKey = function(segmentData) {
	;
	var lbl, color, elem;
	// Make sure we have a div to add to
	if (!this.layers.key) {
		this.layers.key = KIP.Functions.CreateSimpleElement(this.id + "|key", "graphKey");
		this.layers.key.style.position = "absolute";
		this.layers.key.style.display = "table";
		this.layers.key.style.borderCollapse = "separate";
		this.layers.key.style.borderSpacing = "5px";
		this.layers.key.style.left = ((this.svg.w + 50) + "px");
	}

	// Grab the relevant data from the segment
	lbl = segmentData.lbl;
	color = segmentData.color;

	elem = KIP.Functions.CreateSimpleElement("key" + segmentData.id, "keyVal", this.GetKeyLabel(segmentData));
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
KIP.Objects.PieGraph.prototype.DrawLabels = function(segmentData) {
	;

	if (!this.addLabels) return;

	// If we are showing the labels around the data, use our standard function
	if (this.useSVGLabels) {
		text = this.AddTextAroundRing(datum.lbl, lastDeg, lastDeg + (perc * 360), elem, r, "", "", layerText, this.rotate);

		// Otherwise, show it on hover
	} else {
		this.DrawHoverLabel(segmentData);
	}
};

//
KIP.Objects.PieGraph.prototype.DrawHoverLabel = function(segmentData) {
	;
	var elem, segment, ID, lbl, color, x, y, box, pt, d1, d2, that, c;

	that = this;
	// Initialize the variables from the segment
	segment = segmentData.element;
	lbl = segmentData.lbl;
	ID = segmentData.ID;
	color = segmentData.color;

	c = this.svg.CalculateScreenCoordinates(this.center.x, this.center.y);

	// Create the div that actually will be displayed
	elem = KIP.Functions.CreateSimpleElement(ID + "|lbl", "segmentLbl", this.GetHoverLabel(segmentData));
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
	segment.addEventListener("mouseover", function(e) {
		elem.style.display = "block";
		
		window.setTimeout(function() {
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
			if (KIP.Functions.Contained ({x: e.x, y: e.y}, rect)) {
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
	segment.addEventListener("mouseout", function(e) {
		elem.style.opacity = 0;
		window.setTimeout(function() {
			elem.style.display = "none";
		}, 250);
	});

	// Add the label element
	this.layers.hovers.appendChild(elem);

};

// PieGraph.Sort
//--------------------------------------------------
KIP.Objects.PieGraph.prototype.Sort = function() {
	;

	// Quit if we shouldn't sort
	if (!this.sort) return;

	// Sort the array otherwise
	this.sortedArray = this.sortedArray.sort(function(a, b) {
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
KIP.Objects.PieGraph.prototype.AddDataToKey = function(datum, layer) {
	;
	this.DrawKey(datum);
};

// PieGraph.AddAppropriateDataForGraph
//----------------------------------------------------------------------------
/**
 * Adds to our total of our pie graph
 * @param {number} idx - The index at which the data appears
 */
KIP.Objects.PieGraph.prototype.AddDataAppropriateForGraph = function(idx) {
	;
	var datum;

	// Add to the total so we can get the percentages right
	datum = this.data[idx];
	this.total += datum.x;
	datum.id = idx;

	// Redraw if we have drawn before
	if (this.parent) {
		this.Refresh();
	}
};

//====================== CIRCLE GRAPH =============================//
// CircleGraph
//---------------------------------------------------------------
/**
 * Creates a graph with multiple rings to show multiple data sets on a circle
 * @param {string} id - The unique identifier for this graph
 * @param {object} [center] - The center point for this graph
 * @param {number} [center.x] - The x position of the center point of the graph
 * @param {number} [center.y] - The y position of the center point of the graph
 * @param {number} [radius] - The size of the graph
 * @param {object} [style] - The style to use for the graph
 */
KIP.Objects.CircleGraph = function(id, center, radius, style) {
	;
	this.center = center || {
		x: 80,
		y: 80
	};
	this.radius = radius || 30;
	this.ringTotals = [];
	this.fillProperty = {
		type: "solid"
	};
	this.style = style || {
		stroke: {
			type: "solid",
			color: "#000",
			width: "5px"
		},
		fill: {}
	};
	this.fontStyle = {
		font: {
			family: "Segoe UI",
			size: "10px"
		},
		fill: {
			type: "solid"
		}
	};
	this.strokeWidth = 5;

	// Implements a circular graph
	KIP.Objects.CircularGraph.call(this, id, KIP.Constants.GraphTypeEnum.Circle);
};

// Implements the CircularGraph object as its prototype
KIP.Objects.CircleGraph.prototype = Object.create(KIP.Objects.CircularGraph.prototype);

// CircleGraph.Refresh
//---------------------------------------------------------
/**
 * Draws all of the pieces of the graph and adds listeners and labels
 */
KIP.Objects.CircleGraph.prototype.Refresh = function() {
	;
	var colors, text, dIdx, datum, max, perc, elem, ring, width, r, lastDeg, nextDeg, c, opacity, layerRings, layerText;

	// Creates the layers for the circle graph
	layerRings = this.CreateGroup("rings");
	layerText = this.CreateGroup("text");

	// Initialize some variables we need
	max = Math.max.apply(this, this.ringTotals);
	colors = {};
	lastDeg = [];

	// Loop through all of the data we have available
	for (dIdx = 0; dIdx < this.data.length; dIdx += 1) {
		datum = this.data[dIdx];

		// If we don't yet have a color for this label, create a new one
		if (!colors[datum.lbl]) {
			colors[datum.lbl] = KIP.Functions.GenerateColor(datum.lbl, KIP.Constants.HSLPieceEnum.Hue);
		}
		c = colors[datum.lbl];

		// Pull out the pieces of data we need
		ring = datum.y;
		width = datum.z * this.strokeWidth;

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
		this.style.stroke.width = width + "px";
		this.style.stroke.color = c;

		// Add the element and its hover text
		elem = this.AddPerfectArc(this.center, r, lastDeg[ring], nextDeg, 1, true, this.style, "", "", layerRings);
		elem.style.opacity = opacity;
		text = this.AddTextAroundRing(datum.lbl, lastDeg[ring], nextDeg, elem, r + (width - this.strokeWidth), "", "", layerText);
		this.div.appendChild(elem);

		// Add event listeners
		this.AddPieceListeners(elem, text);
		this.AttachDataListeners(dIdx, elem);

		// Increment the degree count
		lastDeg[ring] = nextDeg;
	}
};

// CircleGraph.AddDataAppropriateForGraph
//------------------------------------------------------------------------------
/**
 * Adds data to the circlegraph specific data collections
 * @param {number} idx - THe index at which the raw data lives
 */
KIP.Objects.CircleGraph.prototype.AddDataAppropriateForGraph = function(idx) {
	;
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
	if (this.parent) {
		this.Draw();
	}
};

//====================== TRENDING GRAPH ==============================//
KIP.Objects.TrendingGraph = function(id, minX, minY) {
	this.min_x = minX || 10000000;
	this.min_y = minY || 10000000;
	this.hslRotate = KIP.Constants.HSLPieceEnum.Hue;

	this.style = {
		fill: {},
		stroke: {
			type: "solid",
			width: "0.2"
		},
		font: {
			family: "Calibri"
		}
	};
	this.fontStyle = {
		fill: {
			type: "solid"
		},
		font: {
			family: "Calibri"
		}
	};
	// Call the constructor for the graph
	KIP.Objects.Graph.call(this, id, KIP.Constants.GraphTypeEnum.Trend);
};

KIP.Objects.TrendingGraph.prototype = Object.create(KIP.Objects.Graph.prototype);

KIP.Objects.TrendingGraph.prototype.AddDataAppropriateForGraph = function(idx) {
	;
	var datum;

	datum = this.data[idx];

	this.UpdateView(datum.x, datum.y, 1, 1);
};

KIP.Objects.TrendingGraph.prototype.AddLineListeners = function(line, lbl, box) {
	;
	var that = this;
	if (!line || !lbl) return;

	line.addEventListener("mouseover", function() {
		lbl.style.opacity = 1;
		line.style.strokeWidth = (that.style.stroke.width * 3) + "px";
		if (box) box.style.opacity = 0.8;
	});

	line.addEventListener("mouseout", function() {
		lbl.style.opacity = 0;
		line.style.strokeWidth = that.style.stroke.width + "px";
		if (box) box.style.opacity = 0;
	});

	lbl.style.opacity = 0;
};

KIP.Objects.TrendingGraph.prototype.Refresh = function() {
	;
	var datum, sorted, lastLine, dIdx, ptLayer, txtLayer, lastElem, xDiff, yDiff, txt;

	// Sort the array by the z value
	sorted = this.data.slice();
	sorted = sorted.sort(function(a, b) {
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

	this.style.stroke.width = (Math.min(xDiff, yDiff) / 70);

	this.fontStyle.font.size = (this.style.stroke.width * 8);

	// Create the groups
	ptLayer = this.CreateGroup("pts");
	txtLayer = this.CreateGroup("txt");

	// Loop through our sorted data and draw our points and lines
	for (dIdx = 0; dIdx < sorted.length; dIdx += 1) {
		datum = sorted[dIdx];

		// If the last line doesn't match the current value, create a new line
		if (((datum.z === undefined) && !lastElem) || (lastLine !== datum.z)) {

			// Generate a color
			this.fontStyle.fill.color = this.style.stroke.color = KIP.Functions.GenerateColor("", this.hslRotate);

			if (datum.z !== undefined) lastLine = datum.z;
			lastElem = this.AddChild("path", {
				d: ""
			}, this.style, "", "", ptLayer);
			txt = this.AddText(lastElem, datum.lbl, datum.x, datum.y, this.fontStyle, "", "", "", txtLayer);

			this.AddLineListeners(lastElem, txt);
			this.MoveTo(datum.x, datum.y, lastElem);

			// Otherwise, add to the last line
		} else {
			this.LineTo(datum.x, datum.y, lastElem);
		}
	}

	//this.FinishPath(lastElem);
};

//======================== SEGMENT GRAPH =======================================//
// SegmentGraph
//--------------------------------------------------
KIP.Objects.SegmentGraph = function(id, options) {
	;

	this.totals = {};
	this.guideLines = [];
	this.layers = {};
	this.groupsByX = {};
	this.colors = {};

	// Implement the standard graph constructor
	KIP.Objects.Graph.call(this, id, KIP.Constants.GraphTypeEnum.Segment);
	
	this.dataListeners = {};

	// Options for how something is drawn
	this.options = {
		showYAxis: true,
		showXAxis: true,
		dataWidth: 5,
		dataGap: 2,
		startY: 20,
		startX: 0,
		shadowOffset: {
			x: 0.12,
			y: 0.07
		},
		shadowLayers: 5,
		shadowOpacity: 0.2,
		subLbl: ""
	}

	// Clone in user options if available
	if (options) {
		KIP.Functions.CombineObjects(this.options, options);
	}

	// Initialize the layers that we use
	this.layers.shadows = this.svg.CreateGroup("shadows");
	this.layers.data = this.svg.CreateGroup("data");
	this.layers.axes = this.svg.CreateGroup("axes");
	this.layers.guidelines = this.svg.CreateGroup("guidelines");
	this.layers.hoverBubbles = KIP.Functions.CreateSimpleElement("hoverBubbles", "hoverBubbles");
	this.layers.axisLbls = KIP.Functions.CreateSimpleElement("axisLbls", "axisLbls");
	this.AppendChild(this.layers.axisLbls);
	this.AppendChild(this.layers.hoverBubbles);

	// Initialize some svg properties
	this.svg.fillProperty.type = "solid";
	this.svg.lineProperty.type = "none";


}

KIP.Objects.SegmentGraph.prototype = Object.create(KIP.Objects.Graph.prototype);



// SegmentGraph.AddDataAppropriateForGraph
//--------------------------------------------------------------------------------
KIP.Objects.SegmentGraph.prototype.AddDataAppropriateForGraph = function(idx) {
	;
	var datum;

	datum = this.data[idx];

	// Initialize the total count for this x if it doesn't exist
	if (!this.totals[datum.x]) {
		this.totals[datum.x] = 0;
	}

	// Initialize the group count for this x if it doesn't exist
	if (!this.groupsByX[datum.x]) {
		this.groupsByX[datum.x] = {};
	}

	// Add the total for this dependent variable to the total counters
	this.totals[datum.x] += datum.y;

	// Add this data to our groups
	if (!this.groupsByX[datum.x][datum.lbl]) {
		this.groupsByX[datum.x][datum.lbl] = {
			value: 0,
			idx: []
		}
	}
	this.groupsByX[datum.x][datum.lbl].value += datum.y; // Track the value
	this.groupsByX[datum.x][datum.lbl].idx.push(idx); // Track the indices this appeared at
};


KIP.Objects.SegmentGraph.prototype.AddListenerToData = function(xVal, lbl, type, func) {
	;
	var cnt;

	// Create a listener array 
	if (!this.dataListeners[xVal]) {
		this.dataListeners[xVal] = {};
	}
	
	if (!this.dataListeners[xVal][lbl]) {
		this.dataListeners[xVal][lbl] = {};
	}
	
	// add to the listener array
	this.dataListeners[xVal][lbl][type] = {
		"type": type,
		"listener": func
	};
};

KIP.Objects.SegmentGraph.prototype.AttachDataListeners = function (element, xVal, lbl, data) {
	;
	var type, listenerArr, listener, jdx, that;
	listenerArr = this.dataListeners[xVal] && this.dataListeners[xVal][lbl];

	if (!listenerArr) return;

	that = this;

	// Loop through all of the events we have for this index
	for (jdx in listenerArr) {
		if (listenerArr.hasOwnProperty(jdx)) {
			// Skip this if we don't have any data
			if (!listenerArr[jdx]) continue;

			// Grab the type and callback
			type = listenerArr[jdx].type;
			listener = listenerArr[jdx].listener;

			// Don't do anything if we're missing something
			if ((!type) || (!listener)) continue;

			// Otherwise, add the event listener
			element.addEventListener(type, function () {
				listener(data);
			});
		}
	}
}


// SegmentGraph.AddGuideLine
//--------------------------------------------------------------------
KIP.Objects.SegmentGraph.prototype.AddGuideline = function(level) {
	;

	// Add the level to our list of guidelines
	this.guideLines.push(level);
};

// SegmentData.Refresh
//----------------------------------------------------------
KIP.Objects.SegmentGraph.prototype.Refresh = function() {
	;

	// First, draw the actual data
	this.DrawData();

	// Then draw the axes around the graph
	this.DrawAxes();

	// Finally draw the guidelines
	this.DrawGuidelines();

};

// SegmentGraph.DrawData
//----------------------------------------------------------
KIP.Objects.SegmentGraph.prototype.DrawData = function() {
	;
	var xValue, group, x;

	// Initialize our X position
	x = this.options.startX;

	// Loop through each of our x values to start drawing each bar
	for (xValue in this.groupsByX) {
		if (this.groupsByX.hasOwnProperty(xValue)) {

			// Pull out the data for this group
			group = this.groupsByX[xValue];

			// Draw the group
			this.DrawBar({
				data: group,
				position: x,
				x: xValue
			});

			// Increment the x position
			x += (this.options.dataGap + this.options.dataWidth);

		}
	}

	this.lastX = x;

};

// SegmentGraph.DrawBar
//------------------------------------------------------------
/**
 * Draws a bar on the segmented graph
 * @param {object} data - The data that should be displayed in this bar
 * @returns {object} An augmented version of the data object that was passed in
 */

KIP.Objects.SegmentGraph.prototype.DrawBar = function(data) {
	;
	var lbl, zValue, lastY, bar, position, segmentData, x, shadow, c, o, sortable, idx;

	// Grab the object data from our 
	bar = data.data;
	position = data.position;
	x = data.x;
	sortable = [];

	lastY = this.options.startY;

	// Loop through each of the y-values in this graph
	for (lbl in bar) {
		if (bar.hasOwnProperty(lbl)) {
			// Grab the actual data from the segment
			segmentData = bar[lbl];
			
			segmentData.lbl = lbl;
			
			sortable.push(segmentData);
		}
	}
	
	sortable.sort(function (a, b) {
		if (a.value > b.value) {
			return -1;
		} else if (a.value < b.value) {
			return 1
		}
		return 0;
	})
	
	for (idx = 0; idx < sortable.length; idx += 1) {	
		segmentData = sortable[idx];
		lbl = segmentData.lbl;

		// Set the position into the segment
		segmentData.startPosition = {
			x: position,
			y: lastY
		}

		// Set the actual data into the element
		segmentData.x = x;

		// Actually draw the segment
		segmentData = this.DrawSegment(segmentData);

		// Make sure we increment the y value based on how much space it took up
		lastY = segmentData.endPosition.y;
	}

	// Draw a drop shadow behind the elements
	this.DrawShadow(position, lastY, this.options.dataWidth, this.options.startY - lastY);

	// Create the X-axis labels that can later be used
	if (!this.xAxisLbls) {
		this.xAxisLbls = [];
	}

	this.xAxisLbls.push({
		x: position,
		lbl: x
	});
	
	
	return data;
};

// SegmentGraph.DrawSegment
//-------------------------------------------------------------------------
/**
 * Draws a segment of a particular bar on the graph
 * @param {object} segmentData - The data needed to draw this segment of the graph
 * @returns {object} An augmented version of the segmentData object that was passed in
 */
KIP.Objects.SegmentGraph.prototype.DrawSegment = function(segmentData) {
	;
	var oldCol, height, startY, elem, lbl, that, lineType, lineColor, lineWidth;

	
	
	// Make sure we have an appropriate color for the segment
	lbl = segmentData.lbl;
	if (!this.colors[lbl]) {
		this.colors[lbl] = this.GenerateColor();
	}

	// Save off the SVG color and use this one instead
	oldCol = this.svg.fillProperty.color;
	lineType = this.svg.lineProperty.type;
	lineColor = this.svg.lineProperty.color;
	lineWidth = this.svg.lineProperty.width;
	
	segmentData.color = this.svg.fillProperty.color = this.colors[lbl];
	this.svg.lineProperty.color = "rgba(0,0,0,.03)";
	this.svg.lineProperty.type = "solid";
	this.svg.lineProperty.width = ".02";

	// Get data out of the segment
	height = segmentData.value;
	startY = (segmentData.startPosition.y - height);

	// Tell the SVG to draw a shape
	elem = this.svg.AddRectangle(segmentData.startPosition.x, startY, this.options.dataWidth, height, {}, this.layers.data);

	// Add some data back to the segment
	segmentData.endPosition = {
		x: segmentData.startPosition.x + this.options.dataWidth,
		y: startY,
	};
	segmentData.elem = elem;

	// Draw the label for the element
	this.DrawLabel(segmentData);
	
	// Reset the SVG fill color
	this.svg.fillProperty.color = oldCol;
	
	this.svg.lineProperty.type = lineType;
	this.svg.lineProperty.color = lineColor;
	this.svg.lineProperty.width = lineWidth;
	
	// Add event listeners
	this.AttachDataListeners(elem, segmentData.x, lbl, segmentData);

	
	return segmentData;
	
	
};

// SegmentGraph.DrawLabel
//----------------------------------------------------------------------
KIP.Objects.SegmentGraph.prototype.DrawLabel = function(segmentData) {
	;
	var elem, pt, unit, fullLbl;

	if (this.units.y) {
		unit = " " + this.units.y;
	} else {
		unit = "";
	}

	fullLbl = segmentData.lbl + " (" + segmentData.value + unit + ")";
	if (this.options.subLbl) fullLbl += "<br>" + this.options.subLbl;
	// Create the label
	elem = KIP.Functions.CreateSimpleElement("segmentLbl|" + segmentData.x + "|" + segmentData.lbl, "segmentLbl", fullLbl);

	// Add some styling
	elem.style.position = "absolute";
	elem.style.display = "none";
	elem.style.border = "1px solid";
	elem.style.borderLeft = "8px solid";
	elem.style.borderColor = segmentData.color;
	elem.style.padding = "5px";
	elem.style.fontFamily = '"Segoe UI Light", "Calibri"';
	elem.style.boxShadow = "1px 1px 5px 2px rgba(0, 0, 0, .2)";
	elem.style.transition = "opacity ease-in-out .2s";
	elem.style.opacity = "0";
	elem.style.borderRadius = "5px";
	elem.style.backgroundColor = "#FFF";

	// Set the appropriate position
	pt = this.svg.CalculateScreenCoordinates(segmentData.endPosition.x, segmentData.endPosition.y);
	elem.style.left = pt.x + "px";
	elem.style.top = pt.y + "px";

	// Add some listeners
	segmentData.elem.addEventListener("mouseover", function(e) {
		elem.style.display = "block";

		window.setTimeout(function() {
			elem.style.opacity = 1;
		}, 50);
	});

	segmentData.elem.addEventListener("mouseout", function() {
		elem.style.opacity = 0;

		window.setTimeout(function() {
			elem.style.display = "none";
		}, 250);
	});

	// Add to our appropriate layer
	this.layers.hoverBubbles.appendChild(elem);
	
	// Add to the array that gets recalculated when the size is adjusted
	this.AddHTMLLbl(elem, segmentData.endPosition.x, segmentData.endPosition.y);
	
	// Store the element for later
	segmentData.lblElem = elem;
};

// SegmentGraph.DrawShadow
//----------------------------------------------------------------
KIP.Objects.SegmentGraph.prototype.DrawShadow = function(x, y, width, height) {
	;
	var c, o, sIdx, dx, dy, shadow;

	// Also draw a drop shadow for this bar
	c = this.svg.fillProperty.color;
	o = this.svg.fillProperty.opacity;

	this.svg.fillProperty.color = "#000";
	this.svg.fillProperty.opacity = (this.options.shadowOpacity / this.options.shadowLayers);

	// Find how much the shadow should be offset per layer
	dx = (this.options.shadowOffset.x / this.options.shadowLayers);
	dy = (this.options.shadowOffset.y / this.options.shadowLayers);

	for (sIdx = 1; sIdx <= this.options.shadowLayers; sIdx += 1) {

		shadow = this.svg.AddRectangle(
			x + (dx * sIdx),
			y + (dy * sIdx),
			width,
			height, {},
			this.layers.shadows
		);
	}

	this.svg.fillProperty.color = c;
	this.svg.fillProperty.opacity = 0;
};

// SegmentGraph.DrawAxes
//----------------------------------------------------------------
KIP.Objects.SegmentGraph.prototype.DrawAxes = function() {
	;

	// Draw the x-axis if appropriate
	if (this.options.showXAxis) {
		this.DrawAxis({
			type: "horizontal",
			data: this.xAxisLbls,
			layer: this.layers.axes
		});
	}

	// Draw the y-axis if appropriate
	if (this.options.showYAxis) {
		this.DrawAxis({
			type: "vertical"
		});
	}
};

// SegmentGraph.DrawAxis
//----------------------------------------------------------------
KIP.Objects.SegmentGraph.prototype.DrawAxis = function(data) {
	;
	var minX, maxX, startY, lineWidth, lineType, lineColor, elem, lbl, idx, x;
	
	maxX = this.svg.maxX || this.lastX;
	minX = this.svg.minX || this.options.startX;
	startY = this.options.startY + 0.05;
	
	// Set up the line to display properly
	lineType = this.svg.lineProperty.type;
	lineColor = this.svg.lineProperty.color;
	lineWidth = this.svg.lineProperty.width;
	
	this.svg.lineProperty.type = "solid";
	this.svg.lineProperty.color = "#777";
	this.svg.lineProperty.width = 0.02;
	
	// Add a horizontal line
	if (data.type === "horizontal") {
		this.svg.AddPath(
			[
				{
					x: minX,
					y: startY 
				},
				{
					x: maxX,
					y: startY
				}
			],
			{
				noFinish: true
			},
			data.layer
		);
	}
	
	this.svg.lineProperty.type = lineType;
	this.svg.lineProperty.color = lineColor;
	this.svg.lineProperty.width = lineWidth;
		
	if (!data.data) return;
	// Then draw the appropriate labels
	startY += 0.8;
	for (idx = 0; idx < data.data.length; idx += 1) {
		lbl = data.data[idx].lbl;
		x = data.data[idx].x + (0.35 * this.options.dataWidth);
		
		elem = KIP.Functions.CreateSimpleElement("", "axisLbl", lbl);
		
		elem.style.position = "absolute";
		elem.style.transform = "rotate(45deg)";
		elem.style.fontSize = "13px";
		elem.style.color = "#777";
		this.layers.axisLbls.appendChild(elem);
		
		// Also save in our label array for later
		this.AddHTMLLbl(elem, x, startY);
	}
	
};

// SegmentGraph.DrawGuidelines
//----------------------------------------------------------------
/**
	Draws all guidelines on the graph to indicate a threshold
*/
KIP.Objects.SegmentGraph.prototype.DrawGuidelines = function() {
	;
	var lnY, height, lineType, lineColor, lineWidth, lineDashes, startY, layer, minX, maxX, that;

	// Set up the line to display properly
	lineType = this.svg.lineProperty.type;
	lineColor = this.svg.lineProperty.color;
	lineWidth = this.svg.lineProperty.width;
	lineDashes = this.svg.lineProperty.dashArray;
	
	this.svg.lineProperty.type = "dashed";
	this.svg.lineProperty.color = "#333";
	this.svg.lineProperty.width = 0.05;
	this.svg.lineProperty.dashArray = "0.05, 0.25"

	startY = this.options.startY;
	layer = this.layers.guidelines;
	maxX = this.svg.maxX || this.lastX;
	minX = this.svg.minX || this.options.startX;
	that = this;

	// Make sure we draw a good line for each
	this.guideLines.map(function(value) {
		var htmlPt, elem, lbl;
		// Calculate where the line should go on our canvas
		height = (startY - value);

		// Draw an appropriate line at the y-value relative to our start
		that.svg.AddPath([{
				x: minX,
				y: height
			}, {
				x: maxX,
				y: height
			}], {
				noFinish: true
			},
			layer
		);
		
		// Also create a label for the line
		htmlPt = that.svg.CalculateScreenCoordinates(minX, height);
		lbl = value;
		if (that.units.y) {
			lbl += " " + that.units.y;
		}
		
		elem = KIP.Functions.CreateSimpleElement("", "guideLbl", lbl);
		elem.style.position = "absolute";
		elem.style.fontSize = "13px";
		elem.style.color = "#777";
		elem.style.left = (htmlPt.x + 15) + "px";
		elem.style.top = (htmlPt.y - 22) + "px";
		that.layers.axisLbls.appendChild(elem);
		
		that.AddHTMLLbl(elem, minX, height);
	
	});

	// Reset the SVG variables
	this.svg.lineProperty.type = lineType;
	this.svg.lineProperty.color = lineColor;
	this.svg.lineProperty.width = lineWidth;
	this.svg.lineProperty.dashArray = lineDashes;


};

KIP.Objects.SegmentGraph.prototype.GenerateColor = function(lbl) {
	;
	var c;
	c = KIP.Functions.GenerateColor(lbl, KIP.Constants.HSLPieceEnum.Hue);
	return c;
};