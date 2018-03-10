///<reference path="drawable.ts" />
namespace KIP {

	//TODO: finish & export
	class DrawableCanvas extends Drawable {
		public _base : HTMLCanvasElement;

		constructor (id?: string, cls?: string) {
			super({
				type: "canvas",
				id: id,
				cls: cls
			});

		}

		public drawRect (x: number, y: number, w: number, h: number) : void {}

		protected _createElements(): void {}

	}

	export class ICanvasElement {
		type: CanvasElementType;
	}

	export enum CanvasElementType {
		Rectangle,
		Circle,
		Polygon,
		Star
	}
}