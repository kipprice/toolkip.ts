///<reference path="svgElement.ts" />
namespace KIP.SVG {

	/**...........................................................................
	 * @class SVGGradientTypeEnum
	 * ...........................................................................
	 * Handle different types of gradients
	 * ...........................................................................
	 */
	export enum SVGGradientTypeEnum {
		Linear = 1,
		Radial = 2
	}

	/**...........................................................................
	 * @class IGradientPoint
	 * ...........................................................................
	 * Keep track of a point used for gradients
	 * ...........................................................................
	 */
	export interface IGradientPoint {
		point: IPoint,
		color: string,
		offset: string,
		opacity: number
	}

	/**...........................................................................
	 * ITransforms
	 * ...........................................................................
	 * ...........................................................................
	 */
	export interface ITransforms {
		start: IPoint;
		end: IPoint;
	}

	/**...........................................................................
	 * @class	GradientElement
	 * ...........................................................................
	 * @version 1.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export abstract class GradientElement extends SVGElem {
		
		/**...........................................................................
		 * @param type 
		 * @param points 
		 * @param transforms 
		 * ...........................................................................
		 */
		constructor(type: SVGGradientTypeEnum, points: IGradientPoint[], transforms: ITransforms) {
			super({}, type, points, transforms);
		}

		/**...........................................................................
		 * _setAttributes
		 * ...........................................................................
		 * @param attr 
		 * @param type 
		 * @param points 
		 * @param transforms 
		 * ...........................................................................
		 */
		protected _setAttributes(attr: ISVGAttributes, type: SVGGradientTypeEnum, points: IGradientPoint[], transforms: ITransforms): ISVGAttributes {

			let id: string = attr.id;

			// create the global gradient element
			let gradient: SVGGradientElement;
			gradient = createSVGElem(SVGGradientTypeEnum[type] + "Gradient", attr) as SVGGradientElement;
			this._elems.base = gradient;

			// Apply the points
			this._createPoints(gradient, points);

			// Add to our element & our collection
			attr.parent.appendChild(gradient);

			// Add transform points (BROKEN?)
			this._createTransforms(transforms, id);

			return attr;
		}

		/**...........................................................................
		 * _createPoints
		 * ...........................................................................
		 * @param parent 
		 * @param points 
		 * ...........................................................................
		 */
		private _createPoints(parent: SVGGradientElement, points: IGradientPoint[]): void {
			for (let point of points) {
				let ptElem: SVGStopElement = createSVGElem("stop") as SVGStopElement;
				ptElem.style.stopColor = point.color;
				ptElem.style.stopOpacity = point.opacity.toString();
				ptElem.setAttribute("offset", point.offset);
				parent.appendChild(ptElem);
			}
		}

		/**...........................................................................
		 * _createTransforms
		 * ...........................................................................
		 * @param transforms 
		 * @param id 
		 * ...........................................................................
		 */
		private _createTransforms(transforms: ITransforms, id: string): void {
			if (!transforms) { return; }

			//let tID: string = "gradient" + this.__gradients.length;
			let tID: string = ""; 			//TODO: create real ID
			let type: string = "linear";	//TODO: create real
			let tGrad: SVGGradientElement = createSVGElem(type + "Gradient", {id: tID}) as SVGGradientElement;

			tGrad.setAttribute("x1", transforms.start.x.toString());
			tGrad.setAttribute("x2", transforms.end.x.toString());
			tGrad.setAttribute("y1", transforms.start.y.toString());
			tGrad.setAttribute("y2", transforms.end.y.toString());

			tGrad.setAttribute("xlink:href", "#" + id);

			//this._definitionsElement.appendChild(tGrad);
			//this.__gradients.push(tGrad);
			id = tID;
		}

		/**...........................................................................
		 * _updateExtrema
		 * ...........................................................................
		 */
		protected _updateExtrema(): void {}

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 */
		protected _createElements(): void {}

	}

	export class LinearGradient extends GradientElement {
		constructor(points: IGradientPoint[], transforms: ITransforms) {
			super(SVGGradientTypeEnum.Linear, points, transforms);
		}
	}

	export class RadialGradient extends GradientElement {
		constructor(points: IGradientPoint[], transforms: ITransforms) {
			super(SVGGradientTypeEnum.Radial, points, transforms);
		}
	}
}