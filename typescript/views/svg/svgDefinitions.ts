namespace KIP.SVG {
    export class SVGDefinitionsElement extends Drawable{

        protected _elems: {
            base: SVGElement;
        }

        public get base(): SVGElement { return this._elems.base; }

        //#region PROPERTIES
        protected _gradients: SVGGradientElement[];
        public get gradients(): SVGGradientElement[] { return this._gradients; }
        public set gradients(data: SVGGradientElement[]) { this._gradients = data; }
        //#endregion

        protected _shouldSkipCreateElements(): boolean { return true; }

        constructor() {
            super();
            this._elems = {
                base: createSVGElem({type: "defs"})
            }
            this._createElements();
        }

        protected _createElements(): void {
            this._addDropShadow();
        }

        protected _addDropShadow(): void {
            // Taken from this SO post: https://stackoverflow.com/questions/6088409/svg-drop-shadow-using-css3
            let def = {
                type: "filter",
                id: "dropshadow",
                attr: {
                    width: "200%",
                    height: "200%",
                    x: "-50%",
                    y: "-50%"
                },
                children: [
                    {
                        type: "feGaussianBlur",
                        attr: {
                            in: "SourceAlpha",
                            stdDeviation: "0.5"
                        }
                    },

                    {
                        type: "feOffset",
                        attr: {
                            dx: "0.1",
                            dy: "0.1",
                            result: "offsetblur"
                        }
                    },

                    {
                        type: "feComponentTransfer",
                        children: [
                            {
                                type: "feFuncA",
                                attr: {
                                    type: "gamma",
                                    exponent: "1.2",
                                    amplitude: "0.3"
                                }
                            }
                        ]
                    },

                    {
                        type: "feMerge",
                        children: [
                            {
                                type: "feMergeNode"
                            },

                            {
                                type: "feMergeNode",
                                attr: {in: "SourceGraphic"}
                            }
                        ]
                    }
                ]
            };

            let filter = createSVGElem(def);
            this._elems.base.appendChild(filter);
        }

        //#region ADD GRADIENTS
		/**...........................................................................
		 * addGradient
		 * ...........................................................................
		 * Adds a gradient to the SVG canvas
		 * @param   type       The type of gradient to add
		 * @param   points     What points describe the gradient
		 * @param   transforms 	 ???
		 * @returns he created gradient
		 * ...........................................................................
		 */
		public addGradient (type: SVGGradientTypeEnum, points: IGradientPoint[], transforms: {start: IPoint, end: IPoint}) : string {
			return "";
			//TODO: the real thing
		}
		//#endregion

		//#region ADD PATTERNS

		// TODO: add pattern
		// public addPattern () {
		// }

		// TODO: add stipple pattern
		//public addStipplePattern () {
		//}

		//#endregion
    }
}