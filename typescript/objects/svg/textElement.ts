///<reference path="svgElement.ts" />
namespace KIP.SVG {
	export class TextElement extends SVGElem {
		
		protected _setAttributes(attr: ISVGAttributes): ISVGAttributes {
			return attr;
		}

		protected _updateExtrema(): void {}
	}
}