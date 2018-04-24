///<reference path="svgElement.ts" />
namespace KIP.SVG {
	export class TextElement extends SVGElem {
		
		protected _setAttributes(attr: ISVGAttributes): ISVGAttributes {
			return attr;
		}

		protected _updateExtrema(): void {}

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
		public addText (text: string, point: IPoint, originPt: IPoint, attr: IAttributes, group: SVGElement) : SVGElement {
			//TODO: actually use
			return null;
			// if (!attr) { attr = {}; }
			// attr["x"] = point.x;
			// attr["y"] = point.y;

			// let textElem: SVGElement = this._addChild("text", attr, group);
			// textElem.innerHTML = text;

			// let box: IBasicRect;
			// if (originPt) {
			// 	box = this.measureElement(textElem);
			// 	let newPt: IPoint = {
			// 		x: box.w * originPt.x,
			// 		y: (box.h * originPt.y) - box.h
			// 	};

			// 	textElem.setAttribute("x", newPt.x.toString());
			// 	textElem.setAttribute("y", newPt.y.toString());

			// 	box.x = newPt.x;
			// 	box.y = newPt.y;
			// }

			// if (this._options.auto_resize) {
			// 	if (!box) { this.measureElement(textElem); }
			// 	this._updateExtrema({ min: {x: box.x, y: box.y}, max: {x: box.x + box.w, y: box.y + box.h} });
			// }

			// // Make sure we add the unselectable class
			// addClass(textElem as any as HTMLElement, "unselectable");

			// return textElem;
		}
	}
}