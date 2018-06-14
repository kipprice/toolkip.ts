///<reference path="svgElement.ts" />
namespace KIP.SVG {

    export interface SVGUpdateListener {
        (): void;
    }

	/**...........................................................................
     * @class   GroupElement
     * ...........................................................................
     * @version 1.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class GroupElement extends SVGElem {

        //#region ID TRACKING
		protected static _lastId: number = 0;
		protected static get _nextId(): string {
			GroupElement._lastId += 1;
			return GroupElement._lastId.toString();
        }
        //#endregion
        
		//#region PROPERTIES
		
		/** all SVG elements in this group */
		protected _svgElems: Collection<SVGElem>;
		
		/** all elements that should not be scaled in this group */
		protected _nonScaled: SVGElem[];
		public get nonScaled(): SVGElem[] { return this._nonScaled; }

        /** override the default style getter; we don't need to apply anything */
        public get style(): SVGStyle { return this._style; }
        //#endregion

        constructor(attr: ISVGAttributes) {
            super(attr);

            // Initiate collections
			this._svgElems = new Collection<SVGElem>();
			this._nonScaled = [];
        }

        protected _setAttributes(attributes: ISVGAttributes): ISVGAttributes {
            attributes.type = "g";

            return attributes;
        }

        protected _updateExtrema(attributes: ISVGAttributes): void {}

        protected _updateExtremaFromChild(childExtrema: IExtrema): void {
            if (!this._extrema) {
                this._extrema = cloneObject(childExtrema);
                return;
            }

            if (childExtrema.min.x < this._extrema.min.x) { this._extrema.min.x = childExtrema.min.x; }
            if (childExtrema.min.y < this._extrema.min.y) { this._extrema.min.y = childExtrema.min.y; }

            if (childExtrema.max.x < this._extrema.max.x) { this._extrema.max.x = childExtrema.max.x; }
            if (childExtrema.max.y < this._extrema.max.y) { this._extrema.max.y = childExtrema.max.y; }
        }

        private _addChildElement(elem: SVGElem, skipUpdateExtrema?: boolean): void {

            // style the element appropriately
			elem.style.merge(this._style);

			// add the element to our internal array
			this._svgElems.addElement(elem.id, elem);

			// prevent scaling of the element if appropriate
			if (elem.preventScaling) {
				this._nonScaled.push(elem);
			}

			// update the extrema of the SVG if appropriate
			if (!skipUpdateExtrema) {
				this._updateExtrema(elem.extrema);
            }
            
            elem.addUpdateListener(() => { 
                this._updateExtremaFromChild(elem.extrema);
                this._notifyUpdateListeners();
            });
        }

		//#region ADD PATH

		/**...........................................................................
		 * addPath
		 * ...........................................................................
		 * Adds a path to the SVG canvas
		 * 
		 * @param 	points   The points to add to the path
		 * @param	noFinish True if we should finish the path without closing
		 * @param	attr     Any attributes that should be applied
		 * @param	group    The group this path should be added to
		 * 
		 * @returns The path that was created
		 * ...........................................................................
		 */
		public addPath (points: IPathPoint[], noFinish?: boolean, attr?: IPathSVGAttributes) : PathElement {
			attr = this._initializeAttributes(attr) as IPathSVGAttributes;
			attr.noFinish = noFinish;

			let path: PathElement = new PathElement(points, attr);
			this._addChildElement(path);
			return path;
		}

		//#endregion

		//#region ADD RECTANGLE

		/**...........................................................................
		 * addRectangle
		 * ...........................................................................
		 * @param x 
		 * @param y 
		 * @param width 
		 * @param height 
		 * @param attr 
		 * @param group 
		 * ...........................................................................
		 */
		public addRectangle (x: number, y: number, width: number, height: number, attr?: ISVGAttributes) : RectangleElement {
			attr = this._initializeAttributes(attr);

			let rect: RectangleElement = new RectangleElement(x, y, width, height, attr);
			this._addChildElement(rect);
			return rect;
		}

		//#endregion

		//#region ADD CIRCLE

		/**...........................................................................
		 * addCircle
		 * ...........................................................................
		 * adds a circle to the SVG canvas 
		 * @param	centerPt
		 * @param	radius
		 * @param	attr
		 * @param	group
		 * @returns	The created circle
		 * ...........................................................................
		 */
		public addCircle (centerPt: IPoint, radius: number, attr?: IAttributes) : CircleElement {
			attr = this._initializeAttributes(attr);

			let circle: CircleElement = new CircleElement(centerPt, radius, attr);
			this._addChildElement(circle);
			return circle;
		}

		//#endregion

		

		//#endregion

		//#region ADD POLYGON
		/**...........................................................................
		 * addRegularPolygon
		 * ...........................................................................
		 * creates a regular polygon to the SVG canvas
		 * @param   centerPt The central point of the polygon
		 * @param   sides    The number of sides of the polygon
		 * @param   radius   The radius of the polygon
		 * @param   attr     Any additional attributes
		 * @param   group    The group the polygon should be added to
		 * @returns The created polygon on the SVG Canvas
		 * ...........................................................................
		 */
		public addRegularPolygon (centerPt: IPoint, sides: number, radius: number, attr?: IPathSVGAttributes) : PolygonElement {
			attr = this._initializeAttributes(attr) as IPathSVGAttributes;

			let polygon: PolygonElement = new PolygonElement(centerPt, sides, radius, attr);
			this._addChildElement(polygon);
			return polygon;
		}
		//#endregion

		//#region ADD STAR
		/**...........................................................................
		 * addRegularStar
		 * ...........................................................................
		 * Creates a regular star on the SVG canvas
		 * @param   centerPt      	The point at the center of the star
		 * @param   numberOfPoints 	The number of points of this star
		 * @param   radius        	[description]
		 * @param   innerRadius   	[description]
		 * @param   attr          	[description]
		 * @param   group         	[description]
		 * @returns The created star
		 * ...........................................................................
		 */
		public addRegularStar (centerPt: IPoint, numberOfPoints: number, radius: number, innerRadius: number, attr?: IPathSVGAttributes) : StarElement {
			attr = this._initializeAttributes(attr) as IPathSVGAttributes;

			let star: StarElement = new StarElement(centerPt, numberOfPoints, radius, innerRadius, attr);
			this._addChildElement(star);
			return star;
		}
		//#endregion

		//#region ADD TEXT
		/**...........................................................................
		 * addtext
		 * ...........................................................................
		 * Adds a text element to the SVG canvas
		 * @param   text     The text to add
		 * @param   point    The point at which to add the point
		 * @param   originPt If provided, the origin point within the text element that defines where the text is drawn
		 * @param   attr     Any attributes that should be applied to the element
		 * @param   group    The group to add this element to
		 * @returns The text element added to the SVG
		 * ...........................................................................
		 */
		public addText (text: string, point: IPoint, originPt: IPoint, attr?: ISVGAttributes) : TextElement {
			attr = this._initializeAttributes(attr);

			let txt: TextElement = new TextElement(text, point, originPt, attr);
			this._addChildElement(txt, true);

			window.setTimeout(() => {
				this._updateExtrema(txt.extrema);
			}, 10);
			return txt;
		}

		public addFlowableText (text: string, bounds: IBasicRect, attr: IAttributes) : TextElement {
			//TODO: Add flowable text
			return null;
		}

		//#endregion

		//#region ADD GROUP

		/**...........................................................................
		 * addGroup
		 * ...........................................................................
		 * @param	attr 
		 * @param 	group 
		 * @returns	The created element
		 * ...........................................................................
		 */
		public addGroup (attr?: IAttributes): GroupElement {
			attr = this._initializeAttributes(attr);

			let grp: GroupElement = new GroupElement(attr);
			this._addChildElement(grp);
			return grp;
		}
		//#endregion

		

		//#region ADD SHAPES
		/**...........................................................................
         * addShape
         * ...........................................................................
		 * Adds a particular shape to the SVG canvas
		 * @param   shapeType The type of shape to add
		 * @param   scale     What scale the shape should be drawn at
		 * @param   attr      Any attributes that should be applied to the element
		 * @param   group     What group the element should be added to
		 * @returns The created shape
         * ...........................................................................
		 */
		public addShape (shapeType: SVGShapeEnum, scale?: number, centerPt?: IPoint, attr?: IAttributes) : PathExtensionElement {

			// Use our default scale if one wasn't passed in
            if (!scale) { scale = 1; }
            if (!centerPt) { centerPt = {x: 0, y: 0}; }

			// Draw the appropriate shape
			switch (shapeType) {
				case SVGShapeEnum.CHECKMARK:
					return this._addCheckShape(scale, centerPt, attr);
				case SVGShapeEnum.X:
					return this._addExShape(scale, centerPt, attr);
				case SVGShapeEnum.PLUS:
					return this._addPlusShape(scale, centerPt, attr);
			}
		}

		/**...........................................................................
		 * Adds a checkmark to the canvas with the provided scale
		 * ...........................................................................
		 */
		private _addCheckShape (scale: number, centerPt: IPoint, attr?: IPathSVGAttributes): CheckElement {
			attr = this._initializeAttributes(attr) as IPathSVGAttributes;

			let checkmark: CheckElement = new CheckElement(null, attr, centerPt);
			this._addChildElement(checkmark);
			return checkmark;
		}

		/**...........................................................................
		 * Adds an 'ex' to the canvas with the provided scale
		 * ...........................................................................
		 */
		private _addExShape (scale: number, centerPt: IPoint, attr?: IPathSVGAttributes): ExElement {
			attr = this._initializeAttributes(attr) as IPathSVGAttributes;

			let exElem: ExElement = new ExElement(null, attr, centerPt);
			this._addChildElement(exElem);
			return exElem;
		}

		/**...........................................................................
		 * Adds a plus to the canvas with the provided scale
		 * ...........................................................................
		 */
		private _addPlusShape (scale: number, centerPt: IPoint, attr?: IPathSVGAttributes): PlusElement {
			attr = this._initializeAttributes(attr) as IPathSVGAttributes;

			let plusSymbol: PlusElement = new PlusElement(null, attr, centerPt);
			this._addChildElement(plusSymbol);
			return plusSymbol;
		}

        //#endregion
        
        /**...........................................................................
		 * _initializeAttributes
		 * ...........................................................................
		 * Create attributes needed to create a shape
		 * @param	attr	The attributes to initialize
		 * @param	group	The group to add this element to
		 * @returns	The updated attributes
		 * ...........................................................................
		 */
		private _initializeAttributes(attr: ISVGAttributes): ISVGAttributes {
			if (!attr) { attr = {}; }

            // set the parent
            attr.parent = this._elems.base;
            
			// initialize the ID of the child
			if (!attr.id) { attr.id = GroupElement._nextId; }

			return attr;
		}

		/**...........................................................................
		 * clear
		 * ...........................................................................
		 * Clear the contents of this group
		 * ...........................................................................
		 */
		public clear(): void {
			this._elems.base.innerHTML = "";
			this._svgElems.clear();
		}
    }
}