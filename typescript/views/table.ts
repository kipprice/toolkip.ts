///<reference path="drawable.ts" />
namespace KIP {

	//TODO: finish and export
	class TableDrawable extends Drawable {
		public base: HTMLTableElement;

		constructor(elemDef?: IElemDefinition) {
			super();

			if (!elemDef) { elemDef = {}; }
			if (!elemDef.type) { elemDef.type = "table"; }
			this.base = createElement(elemDef) as HTMLTableElement;

		}

		public addRow(elems?: any[], idx?: number, colNum?: number): HTMLTableRowElement {
			return addRow(this.base, elems, idx, colNum);
		}

		protected _createElements(): void {}
	}
}