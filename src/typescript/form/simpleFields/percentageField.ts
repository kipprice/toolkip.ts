/// <reference path="./numberField.ts" />
namespace KIP.Forms {

	/**---------------------------------------------------------------------------
	 * @class 	PercentageField
	 * ---------------------------------------------------------------------------
	 * Show a numeric form specific to percentages. Only differs from a numeric
	 * element in the display
	 * 
	 * @author  Kip Price
	 * @version 1.0.0
	 * ---------------------------------------------------------------------------
	 */
	export class PercentageField extends NumberField {

        //.....................
		//#region PROPERTIES
		
		protected get _type(): FieldTypeEnum { return FieldTypeEnum.PERCENTAGE; }
		protected get _defaultValue(): number { return 0; }
		protected get _defaultCls(): string { return "percentage"; }
		
		//#endregion
		//.....................

		//...................................................
		//#region STYLES
		
		protected static _uncoloredStyles: Styles.IStandardStyles = {
			".percentage" :{
				nested: {
					"input": {
						maxWidth: "3em"
					},
		
					".percentageLbl": {
						color: "#555",
						fontSize: "1em",
						marginLeft: "5px",
						display: "inline-block"
					}
				}
			} 
		}

		protected _getUncoloredStyles(): Styles.IStandardStyles {
			return this._mergeThemes(
				PercentageField._uncoloredStyles,
				Field._uncoloredStyles
			);
		}
		
		//#endregion
		//...................................................

		protected _createElements(): void {
			super._createElements();
			
			// create the element that indicates this expects a percentage
			createElement({ 
				cls: "percentageLbl",
				content: "%",
				parent: this._elems.base
			});
		}
		/**
		 * _createClonedElement
		 * ---------------------------------------------------------------------------
		 * create a new percentage element as required
		 */
        protected _createClonedElement(appendToID: string): NumberField {
            return new PercentageField(this._id + appendToID, this);
        }
	}
}