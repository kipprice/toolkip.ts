///<reference path="svgElement.ts" />
namespace KIP.SVG {
	export class TextElement extends SVGElem {

		protected _text: string;
		protected _originPt: IPoint;

		public get style(): SVGStyle {
			window.setTimeout(() => {
				this._style.assignStyle(this._elems.base);
				if (!this._originPt) {
					this._notifyUpdateListeners();
				}
			});

			return this._style;
		}

		protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
			".unselectable": {
				userSelect: "none",
      			MozUserSelect: "none",
      			WebkitUserSelect: "none",
      			khtmlUserSelect: "none",
      			oUserSelect: "none"
			}
		};
		
		constructor(text: string, point: IPoint, originPt: IPoint, attr: ISVGAttributes) {
			super(attr, text, point, originPt);
		}

		protected _setAttributes(attr: ISVGAttributes, text: string, point: IPoint, originPt: IPoint): ISVGAttributes {
			attr.type = "text";
			attr.x = point.x;
			attr.y = point.y;

			// store the pieces that have to be added post-creation
			this._text = text;
			this._originPt = originPt;

			return attr;
		}

		protected _createElements(attr: ISVGAttributes): void {
			super._createElements(attr);

			addClass(this._elems.base, "unselectable");

			// update the text
			this._elems.base.innerHTML = this._text;

			// update the origin point if provided
			if (this._originPt) {
				this._elems.base.style.display = "none";
				window.setTimeout(() => {
					this._handleOriginPoint(attr);
					this._elems.base.style.display = "default";
				}, 10);
			}
		}

		protected _handleOriginPoint(attr: ISVGAttributes): void {
			let box: IBasicRect = this.measureElement();

			let newPt: IPoint = {
				x: attr.x - (box.w * this._originPt.x),
				y: attr.y - ((box.h - ((attr.y - box.y) * 2)) * this._originPt.y)
			};

			console.log("box: (" + box.x + ", " + box.y + ") -> (" + box.w + ", " + box.h + ")");

			this._elems.base.setAttribute("x", newPt.x.toString());
			this._elems.base.setAttribute("y", newPt.y.toString());

			box.x = newPt.x;
			box.y = newPt.y;

			console.log("box: (" + box.x + ", " + box.y + ") -> (" + box.w + ", " + box.h + ")");

			this._updateExtrema(box);
			this._notifyUpdateListeners();
		}

		protected _updateExtremaAndNotifyListeners(attr: ISVGAttributes) {
			this._updateExtrema(attr);
		}

		protected _updateExtrema(attr: ISVGAttributes): void {
			let rect: IBasicRect = this.measureElement();

			this._extrema = {
				min: {x: rect.x, y: rect.y},
				max: {x: rect.x + rect.w, y: rect.y + rect.h}
			};
		}

	}
}