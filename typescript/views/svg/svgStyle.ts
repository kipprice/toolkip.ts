namespace KIP.SVG {
	/**...........................................................................
	 * @class ISVGStyle
	 * ...........................................................................
	 * Keep track of SVG styles
	 * ...........................................................................
	 */
	export interface ISVGStyle {
		fill: string;
		fillOpacity?: number;

		fontSize?: number;
		fontWeight?: string;
		fontFamily?: string;

		stroke: string;
		strokeWidth?: number;
		strokeOpacity?: number;
		strokeLinecap?: string;
		strokeLinejoin?: string;

		filter?: string;
		transform?: string;
		transition?: string;
	}
	
    /**...........................................................................
	 * @class	SVGStyle
	 * ...........................................................................
	 * Keep track of style changes for SVG elements
	 * @version 1.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export class SVGStyle implements ISVGStyle {

		/** keep track of the last generated string */
		protected _generatedStyleString: string;

		/** inner tracking for our particular style selements */
		protected _innerStyle: ISVGStyle;

		/** keep track of whether we need to regenerate the string to use for the SVG style */
		protected _needsNewString: boolean

		/**...........................................................................
		 * _setStyle
		 * ...........................................................................
		 * Update a particular style
		 * @param 	key 	The key 
		 * @param 	value 	The value
		 * ...........................................................................
		 */
		protected _setStyle(key: keyof ISVGStyle, value: string | number) {
			this._innerStyle[key] = value;
			this._needsNewString = true;
		}

		/** fill color or "None" */
		public set fill(fill: string) { this._setStyle("fill", fill); }

		/** fill opacity */
		public set fillOpacity(opacity: number) { this._setStyle("fillOpacity", opacity); }

		/** font size */
		public set fontSize(size: number) { this._setStyle("fontSize", size); }

		/** font weight */
		public set fontWeight(weight: string) { this._setStyle("fontWeight", weight); }

		/** font family */
		public set fontFamily(family: string) { this._setStyle("fontFamily", family); }

		/** stroke color */
		public set stroke(stroke: string) { this._setStyle("stroke", stroke); }

		/** stroke width */
		public set strokeWidth(width: number) { this._setStyle("strokeWidth", width); }

		/** stroke opacity */
		public set strokeOpacity(opacity: number) { this._setStyle("strokeOpacity", opacity); }

		/** stroke linecap */
		public set strokeLinecap(linecap: string) { this._setStyle("strokeLinecap", linecap); }

		/** stroke linejoin */
		public set strokeLinejoin(linejoin: string) { this._setStyle("strokeLinejoin", linejoin); }

		/** filter */
		public set filter(filter: string) { 
			if (filter.substr(0,4) !== "url(") {
				filter = "url(" + filter + ")";
			}
			this._setStyle("filter", filter); 
		}

		protected _transform: string;
		public set transform(transform: string) { this._transform = transform; }

		public set transition(transition: string) { this._setStyle("transition", transition); }

		/** keep track of how the line should be dashed */
		protected _strokeDashArray: string;
		public set strokeDashArray(dashArray: string) { this._strokeDashArray = dashArray; }

		/**...........................................................................
		 * Create a SVGStyle object
		 * ...........................................................................
		 */
		constructor() {
			this.clear();
			this._needsNewString = true;
		}

		/**...........................................................................
		 * merge
		 * ...........................................................................
		 * Merge another style object into this 
		 * @param 	style 	The style to merge in
		 * ...........................................................................
		 */
		public merge<K extends keyof ISVGStyle>(style: SVGStyle): void {
			map(style._innerStyle, (value: ISVGStyle[K], key: K) => {
				if (!this._innerStyle[key] || (this._innerStyle[key] === "None")) { 
					this._innerStyle[key] = value; 
				}
			});

			if (!this._strokeDashArray) {
				this._strokeDashArray = style._strokeDashArray;
			}

			if (!this._transform) {
				this._transform = style._transform;
			}
		}

		/**...........................................................................
		 * clear
		 * ...........................................................................
		 * Clear out our inner styles to defaults
		 * ...........................................................................
		 */
		public clear(): void {
			this._innerStyle = {
				fill: "None",
				stroke: "None"
			};
		}

		/**...........................................................................
		 * assignStyle
		 * ...........................................................................
		 * @param 	element 	The element to set styles on
		 * ...........................................................................
		 */
		public assignStyle(element: SVGElement): void {
			if (this._needsNewString) { this._generateStyleString(); }

			element.setAttribute("style", this._generatedStyleString); 

			if (this._strokeDashArray) { 
				element.setAttribute("stroke-dasharray", this._strokeDashArray);
			}

			if (this._transform) {
				element.setAttribute("transform", this._transform);
			}
		}

		/**...........................................................................
		 * _generateStyleString
		 * ...........................................................................
		 * Generate the appropriate string for the current style
		 * ...........................................................................
		 */
		protected _generateStyleString(): void {
			this._generatedStyleString = "";

			map(this._innerStyle, (propValue: any, propName: string) => {
				let formattedPropName: string = Styles.getPropertyName(propName);
				this._generatedStyleString += format("{0}: {1};", formattedPropName, propValue.toString());
			});
		}

	}
}