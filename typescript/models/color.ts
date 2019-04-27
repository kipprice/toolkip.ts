namespace KIP.Colors {

	/**...........................................................................
	 * Items for grabbing color conversions and new colors
	 * @file color.ts
	 * @version 1.0
	 * @author Kip Price
	 * ...........................................................................
	 */

	//#region CONSTANTS AND INTERFACES
	/** The amount the hue should increase when cycling through new colors */
	export const HUE_INTERVAL = 22;

	/** The amount that the lightness should increase when cycling through new colors */
	export const LIGHT_INTERVAL = 20;

	/** The amount that the saturation should increase when cycling through new colors */
	export const SATURATION_INTERVAL = 20;

	/** The max and min saturation value that should be used for cycling colors */
	export const SATURATION_LIMITS = {
		max: 100,
		min: 20
	}

	/** The max and min lightness values that should be used for cycling colors */
	export const LIGHTNESS_LIMITS = {
		max: 80,
		min: 35
	}

	export enum HSLPieceEnum {
		HUE = 1,
		SATURATION = 2,
		LIGHTNESS = 3,
		ALPHA = 4
	}

	export enum RGBEnum {
		RED = 0,
		GREEN = 1,
		BLUE = 2,
		ALPHA = 3
	}

	let usedColors: {};
	export var colorGlobal: Color;

	export interface IColorMultipliers { 
		hue: number;
		saturation: number;
		lightness: number; 
		alpha: number;
	}
	//#endregion

	//#region HELPER FUNCTIONS

	/**...........................................................................
	 * _getColorGlobal
	 * ...........................................................................
	 * Grab the global for color creation or create it if it is null
	 * 
	 * @returns	The color global
	 * ...........................................................................
	 */
	function _getColorGlobal(): Color {
		if (!colorGlobal) {
			colorGlobal = new HSLColor("hsl(330, 80%, 50%)");
		}
		return colorGlobal;
	}

	/**...........................................................................
	 * generateColor
	 * ...........................................................................
	 * Generates the next color in the global color object
	 *
	 * @param 	id 				An identifier for the color
	 * @param	firstRotate		Which HSL value should change first. Defaults to Hue
	 *
	 * @returns The next hex string for the color selector
	 * ...........................................................................
	 */
	export function generateColor(id: string, firstRotate?: HSLPieceEnum): Color {
		;
		let color: Color;
		let colorStr: string;

		// Initialize the "Used Colors" array if we haven't yet
		if (!usedColors) {
			usedColors = {};
		}

		// Grab the next available color
		colorStr = _getColorGlobal().getNextColor(firstRotate || HSLPieceEnum.HUE);
		color = new HexColor(colorStr);

		// If we received an identifier, use it
		if (id) {
			usedColors[id] = colorStr;
		}

		return color;
	};

	/**...........................................................................
	 * getCurrentColor
	 * ...........................................................................
	 * Finds the current color of the color object & returns it
	 * ...........................................................................
	 */
	export function getCurrentColor() {
		return _getColorGlobal().getCurrentColor();
	};

	/**...........................................................................
	 * getApparentColor
	 * ...........................................................................
	 * Calculates the non-opacity value of the semi-transparent front color when placed over another color
	 * 
	 * @param 	frontColor	A color string including an alpha value
	 * @param 	backColor	The color that appears in the background
	 * @param 	opacity		The opacity of the first color, if not included in the color string
	 * 
	 * @returns	The created apparent color as a hex string
	 * ...........................................................................
	 */
	export function getApparentColor(frontColor: string, backColor: string, opacity: number): string {
		;
		let col: Color;

		// Create the color object
		col = new AnyColor(frontColor, opacity);

		// Calculate the new color
		col.getApparentColor(backColor);

		return col.toHexString();
	}

	/**...........................................................................
	 * getComplementaryColor
	 * ...........................................................................
	 * Find a color that works well with the color passed in
	 * 
	 * @param 	color		The color to find a complement for 
	 * @param 	cutoff 		How different the lightnesses of the colors need to be
	 * 
	 * @returns	The color string for the appropriate complementary color
	 * ...........................................................................
	 */
	export function getComplementaryColor(color: string, cutoff: number): string {
		let col: Color;
		let lightness: number;
		cutoff = cutoff || 45;

		// Grab the appropriate color
		col = new AnyColor(color);

		// Grab the current lightness value
		lightness = col.getLightness();

		if (lightness < cutoff) {
			col.lightness = 95;
		} else {
			col.lightness = 5;
		}
		col.generateRgbValues();

		return col.toRgbaString();
	}

	/**...........................................................................
	 * hexToRgb
	 * ...........................................................................
	 * Converts a hex color string to a RGB color string
	 *
	 * @param 	hex 	The hex string to convert
	 *
	 * @returns The appropriate RGB string
	 * ...........................................................................
	 */
	export function hexToRgb(hex: string): string {
		let c: HexColor = new HexColor(hex);
		return c.toRgbString();
	};

	/**...........................................................................
	 * hexToRgba
	 * ...........................................................................
	 * Converts a hex color string to rgba color string
	 *
	 * @param 	hex 	The hex string to parse
	 * @param 	alpha 	The alpha value to give the color
	 * 
	 * @returns	The rgba version of this hex string
	 * ...........................................................................
	 */
	export function hexToRgba(hex: string, alpha: number): string {
		let c: HexColor = new HexColor(hex, alpha);
		return c.toRgbaString();
	};

	/**...........................................................................
	 * hslToRgb
	 * ...........................................................................
	 * Converts a HSL string to RGB string
	 *
	 * @param {string} hsl - The HSL string to parse
	 *
	 * @returns {string} The RGB string that corresponds
	 * ...........................................................................
	 */
	export function hslToRgb(hsl: string): string {
		let c: HSLColor = new HSLColor(hsl);
		return c.toRgbString();
	};

	/**...........................................................................
	 * hslaToRgba
	 * ...........................................................................
	 * Converts a HSLA string to a RGB string
	 *
	 * @param 	hsl 	The HSL string to convert
	 * @param 	alpha 	The alpha value to use, if the hsl string doesn't include it
	 *
	 * @returns The appropriate RGBA string
	 * ...........................................................................
	 */
	export function hslaToRgba(hsl: string, alpha: number): string {
		let c: HSLColor = new HSLColor(hsl, alpha);
		return c.toRgbaString();
	};

	/**...........................................................................
	 * fullHexString
	 * ...........................................................................
	 * Grabs the hex value for a given number and ensures it is a certain length
	 *
	 * @param 	val 	The number to convert to Hex
	 * @param 	length 	How long the hex string should be
	 *
	 * @returns The hex value of the passed in number
	 * ...........................................................................
	 */
	export function fullHexString(val: number, length: number): string {
		;
		let outHexString: string;
		let i: number;

		length = length || 0;

		outHexString = val.toString(16);

		if (outHexString.length < length) {
			for (i = 0; i < (length - outHexString.length); i += 1) {
				outHexString = "0" + outHexString;
			}
		}

		return outHexString;
	};

	//#endregion

	//#region COLOR CLASS

	/**...........................................................................
	 * @class Color
	 * Handles conversion between color values
	 * @version 1.1
	 * ...........................................................................
	 */
	export abstract class Color extends NamedClass implements IEquatable {

		//#region PROPERTIES

		/** keep track of whether the color was parsed correctly */
		protected _parsedCorrectly: boolean;

		/** shared alpha property for the color */
		protected _alpha: number = 1;
		public set alpha (value: number) {
			value = Math.min(1, Math.max(0, value)); 
			this._alpha = value; 
		}

		//#region RGB PROPERTIES

		/** red value of RGB */
		protected _red: number;
		public set red (value: number) { 
			value = Math.min(255, Math.max(0, Math.round(value)));
			this._red = value; 
		}
		
		/** green value of RGB */
		protected _green: number;
		public set green (value: number) { 
			value = Math.min(255, Math.max(0, Math.round(value)));
			this._green = value; 
		}

		/** blue value of RGB */
		protected _blue: number;
		public set blue (value: number) { 
			value = Math.min(255, Math.max(0, Math.round(value)));
			this._blue = value; 
		}

		//#endregion

		//#region HSL PROPERTIES

		/** current hue of HSL color */
		protected _hue: number;
		public set hue (value: number) { 
			value = Math.min(360, Math.max(0, Math.round(value)));
			this._hue = value; 
		}

		/** current saturation value of HSL color */
		protected _saturation: number;
		public set saturation (value: number) { 
			value = Math.min(100, Math.max(0, Math.round(value)));
			this._saturation = value; 
		}

		/** current lightness value of HSL color */
		protected _lightness: number;
		public set lightness (value: number) { 
			value = Math.min(100, Math.max(0, Math.round(value)));
			this._lightness = value; 
		}

		//#endregion

		//#region INITIAL HSL VALUES
		protected _startHue: number;
		protected _startSaturation: number;
		protected _startLightness: number;
		//#endregion

		/** perceived luminance of the color */
		protected _luminance: number;
		public get luminance(): number { 
			if (isNullOrUndefined(this._luminance)) { this._calculateLuminance(); }
			return this._luminance;
		}
		//#endregion

		//#region CONSTRUCTOR

		/**...........................................................................
		* Creates an object that can handle color conversions
		* @constructor
		* @param {number} [r] - The red value for the color
		* @param {number} [g] - The green value for the color
		* @param {number} [b] - The blue value for the color
		* @param {number} [a] - The alpha value for the color
		* ...........................................................................
		*/
		constructor() {
			super("Color");
		};

		//#endregion

		//#region CREATE COLOR STRINGS

		/**...........................................................................
		 * rgbaString
		 * ...........................................................................
		 * Gets the appropriate RGBA string for this color
		 *
		 * @returns {string} RGBA string for the color
		 * ...........................................................................
		 */
		public toRgbaString(): string {
			;
			return this.toRgbString(true);
		};

		/**...........................................................................
		 * rgbString
		 * ...........................................................................
		 * Grabs the RGB string (with A element if appropriate) for this color
		 *
		 * @param {boolean} withAlpha - If true, include the alpha element in the returned string
		 *
		 * @returns {string} The appropriate color string
		 * ...........................................................................
		 */
		public toRgbString(with_alpha?: boolean): string {
			;
			let out: string;

			// Start the string regardless of alpha value
			out = "rgb" + (with_alpha ? "a" : "") + "(" + this._red + ", " + this._green + ", " + this._blue;

			// Add the alpha value if appropriate
			if (with_alpha) {
				out += ", " + this._alpha;
			}

			// Close up the string and send it out
			out += ")";
			return out;
		};

		/**...........................................................................
		 * hslString
		 * ...........................................................................
		 * From the color object, creates a hue-saturation-lightness string
		 *
		 * @param 	withAlpha 	If true, also adds an alpha element to the end of the string
		 * 
		 * @returns	The HSL string version of this color
		 * ...........................................................................
		 */
		public toHslString(with_alpha?: boolean): string {
			;
			let out: string;

			// Generate HSL if we need to
			if (!this._hue) this.generateHslValues();

			// String starts out the same regardless of whether we are including alpha
			out = "hsl" + (with_alpha ? "a" : "") + "(" + this._hue + ", " + this._saturation + "%, " + this._lightness + "%";

			// Grab the alpha piece if appropriate
			if (with_alpha) {
				out += ", " + this._alpha;
			}

			// Return the HSL string
			out += ")";
			return out;
		};

		/**...........................................................................
		 * hslaString
		 * ...........................................................................
		 * From the color object, create a HSLA string
		 *
		 * @returns A string for the color
		 * ...........................................................................
		 */
		public toHslaString(): string {
			;
			return this.toHslString(true);
		};

		/**...........................................................................
		 * hexString
		 * ...........................................................................
		 * From the color object, creates a hex color string
		 *
		 * @param 	withAlpha	True if alpha should be added to the hex string
		 *
		 * @returns The appropriate hex string
		 * ...........................................................................
		 */
		public toHexString(with_alpha?: boolean): string {
			;
			let out: string;
			out = "#";

			out += fullHexString(this._red, 2);
			out += fullHexString(this._green, 2);
			out += fullHexString(this._blue, 2);

			if (with_alpha) {
				out += fullHexString(this._alpha, 2);
			}

			return out;
		};

		//#endregion

		//#region GENERATE APPROPRIATE COLOR VALUES

		/**...........................................................................
		 * generateHslValues
		 * ...........................................................................
		 * Calculates the HSL values for this RGB color and saves it off in the color.
		 * Relies on the rgb values already having been set
		 * ...........................................................................
		 */
		public generateHslValues(): void {
			;
			let r: number;
			let g: number;
			let b: number;

			let delta: number;
			let max: number;
			let min: number;

			let hue: number;
			let saturation: number;
			let lightness: number;

			r = this._red / 255;
			g = this._green / 255;
			b = this._blue / 255;

			// Find the max, min, and the difference between them.
			// We need these values to calculate HSL equivalents
			max = Math.max(r, g, b);
			min = Math.min(r, g, b);
			delta = max - min;

			// Lightness is the average between the two extremes
			lightness = (max + min) / 2;

			// If the max and min are the same, all three are actually the same value,
			// so we can quit now with our grayscale color
			if (max === min) {
				this._hue = 0;
				this._saturation = 0;
				this._lightness = Math.round(lightness * 100);
				return;
			}

			// The saturation is a ratio of the delta of the extremes
			// over a version of the sum of the extremes.
			// It changes when lightness is less or more than 50%.
			if (lightness > .5) {
				saturation = delta / (2 - max - min);
			} else {
				saturation = delta / (max + min);
			}

			// The hue is calculated from the two non-max values
			// If two values match the max, then we just evaluate in order red -> green -> blue

			// Red was the max.
			if (max === r) {
				hue = (g - b) / delta;

				// We need an additional kick if green is less than blue
				if (g < b) {
					hue += 6;
				}

				// Green was the max
			} else if (max === g) {
				hue = (b - r) / delta + 2;

				// Blue was the max
			} else {
				hue = (r - g) / delta + 4;
			}

			// Divide by six to get the appropriate average
			hue /= 6;

			// -- Save off the member variables for this color --
			//
			// All values are currently in the range [0,1].
			// Hue needs to be multiplied by 360 to get the appropriate value.
			// Saturation and lightness both need to be multiplied by 100.
			this._hue = Math.round(hue * 3600) / 10;
			this._saturation = Math.round(saturation * 1000) / 10;
			this._lightness = Math.round(lightness * 1000) / 10;

			if (!this._startHue) {
				this._startHue = this._hue;
				this._startSaturation = this._saturation;
				this._startLightness = this._lightness;
			}
		};

		/**...........................................................................
		 * generateRgbValues
		 * ...........................................................................
		 * Saves off the appropriate RGB values for this color based on its hex values.
		 * Relies on the hex colors being set
		 * ...........................................................................
		 */
		public generateRgbValues(): void {
			;
			let hue: number;
			let saturation: number;
			let lightness: number;

			let p: number;
			let q: number;
			let t: number;
			let i: number;


			hue = this._hue / 360;
			saturation = this._saturation / 100;
			lightness = this._lightness / 100;

			// If there is not saturation, it's grayscale, so the colors are all equal to the lightness
			if (saturation === 0) {
				this._red = this._green = this._blue = lightness;
				this._red *= 255;
				this._green *= 255;
				this._blue *= 255;
			}

			//If we do have a saturated value, we need to convert it to RGB
			// Get the value of the q coefficient
			if (lightness < 0.5) {
				q = lightness * (1 + saturation);
			} else {
				q = lightness + saturation - (lightness * saturation);
			}

			// And calculate p from q
			p = (2 * lightness) - q;

			for (i = -1; i <= 1; i += 1) {
				t = hue + (-i / 3);

				// Check for the extremes and adjust them
				if (t < 0) {
					t += 1;
				} else if (t > 1) {
					t -= 1;
				}

				// Find the appropriate case to treat this value as
				if (t < (1 / 6)) {
					this.updateRgbValue(i + 1, (p + ((q - p) * 6 * t)) * 255);
				} else if (t < (1 / 2)) {
					this.updateRgbValue(i + 1, q * 255);
				} else if (t < (2 / 3)) {
					this.updateRgbValue(i + 1, (p + ((q - p) * (2 / 3 - t) * 6)) * 255);
				} else {
					this.updateRgbValue(i + 1, p * 255);
				}
			}
		};

		//#endregion

		//#region PARSE DIFFERENT COLOR STRINGS
		/**...........................................................................
		 * _parseFromHexColor
		 * ...........................................................................
		 * Takes in a hex string and saves it internally
		 *
		 * @param 	hex		The hex string to parse in
		 * @param 	alpha 	The alpha value to use
		 *
		 * @returns True if the parsing succeeds, false otherwise
		 * ...........................................................................
		 */
		protected _parseFromHexColor(hex: string, alpha?: number): boolean {
			;
			let idx: number;
			let col: number;
			let pc: string;
			let a_included: boolean;
			let h_reg: RegExp;
			let inc: number;

			h_reg = /^#?(?:[0-9A-Fa-f]{3,4}){1,2}$/;

			if (!h_reg.test(hex)) {
				return false;
			}

			// Strip out the # character if it was there
			if (charAt(hex, 0) === "#") {
				hex = rest(hex, 1);
			}

			if (hex.length < 6) {
				inc = 1;
			} else {
				inc = 2;
			}

			// Flip through each of the possible columns
			for (idx = 0; idx < hex.length; idx += inc) {
				pc = hex.substr(idx, inc);

				if (inc === 1) {
					pc += pc;
				}

				// Parse out the color and set it appropriately
				col = parseInt(pc, 16);
				this.updateRgbValue((idx / inc), col);

				// If we hit alpha values,
				if (idx > 4) {
					a_included = true;
				}
			}

			// Set the alpha value if it wasn't included in the hex string
			if (!a_included) {
				this._alpha = alpha || 1;
			}

			return true;
		};

		/**...........................................................................
		 * _parseFromRgbColor
		 * ...........................................................................
		 * Takes in a rgb color string and parses it into our internal format
		 *
		 * @param 	rgb   	The RGB string to parse
		 * @param 	alpha	The alpha value to parse in, if the rgb string doesn't have it
		 *
		 * @returns True if the parsing succeeds, false otherwise
		 * ...........................................................................
		 */
		protected _parseFromRgbColor(rgb: string, alpha?: number): boolean {
			;
			let rgb_reg: RegExp;
			let rgba_reg: RegExp;
			let match: string[];

			rgb_reg = /rgb\((?:([0-9]{1-3}), ?){3}\)/;
			rgba_reg = /rgba\((?:([0-9]{1-3}), ?){3}, ?([0-9]{0,1}(?:\.[0-9]+)?)\)/;

			if (!rgb_reg.test(rgb)) {
				if (!rgba_reg.test(rgb)) {
					return false;
				} else {
					match = rgba_reg.exec(rgb);
				}
			} else {
				match = rgb_reg.exec(rgb);
			}

			this._red = +match[1];
			this._green = +match[2];
			this._blue = +match[3];

			if ((match[4] !== undefined) || (alpha !== undefined)) {
				this._alpha = +match[4] || alpha;
			}

			return true;
		};

		/**...........................................................................
		 * _parseFromHslColor
		 * ...........................................................................
		 * Takes in a HSL string and converts it to the color object's internal format
		 *
		 * @param 	hsl 	The HSL string to convert. Can also be a HSLA string
		 * @param 	alpha 	The alpha value to set, if it is not included in the HSLA string
		 *
		 * @returns True if the color was successfully parsed, false otherwise.
		 * ...........................................................................
		 */
		protected _parseFromHslColor(hsl: string, alpha?: number): boolean {
			;
			let hsl_reg: RegExp;
			let hsla_reg: RegExp;
			let match: string[];

			let hue: number;
			let saturation: number;
			let lightness: number;

			let q: number;
			let p: number;
			let i: number;
			let t: number;

			hsl_reg = /hsl\(([0-9]{1,3}), ?([0-9]{1,3})%, ?([0-9]{1,3})%\)/;
			hsla_reg = /hsla\(([0-9]{1,3}), ?([0-9]{1,3})%, ?([0-9]{1,3})%, ?([0-9]{0,1}(?:\.[0-9]+)?)\)/;

			// Quit if the regex doesn't match
			if (!hsl_reg.test(hsl)) {
				if (!hsla_reg.test(hsl)) {
					return false;
				} else {
					match = hsla_reg.exec(hsl);
				}
			} else {
				match = hsl_reg.exec(hsl);
			}

			// Save off the values parsed out of the string
			this._hue = Math.round(parseFloat(match[1]) * 10) / 10;
			this._saturation = Math.round(parseFloat(match[2]) * 10) / 10;
			this._lightness = Math.round(parseFloat(match[3]) * 10) / 10;

			// Only set the alpha if something is available
			if ((match[4] !== undefined) || (alpha !== undefined)) {
				this._alpha = parseFloat(match[4]) || alpha;
			}

			// Make sure the RGB values are updated too
			this.generateRgbValues();

			return true;
		};

		/**...........................................................................
		 * _parseColorString
		 * ...........................................................................
		 * Tries to parse a given string into an internal color object
		 *
		 * @param 	str 	The string to parse
		 * @param 	alpha 	The alpha value to use, if not included in the string
		 *
		 * @returns True if the parsing succeeds, false otherwise
		 * ...........................................................................
		 */
		protected _parseColorString(str: string, alpha?: number): boolean {
			;
			let success: boolean;

			// Try to parse the string as a RGB value
			success = this._parseFromRgbColor(str, alpha);
			if (success) return true;

			// Try to parse the string as a Hex value
			success = this._parseFromHexColor(str, alpha);
			if (success) return true;

			// Try to parse the string as a HSL value
			success = this._parseFromHslColor(str, alpha);
			if (success) return true;

			// If nothing worked, return false
			return false;
		};

		//#endregion

		//#region UPDATE COLORS

		/**...........................................................................
		 * updateRgbValue
		 * ...........................................................................
		 * Sets a color value based on the index of the color (ie, red = 0, green = 1)
		 *
		 * @param 	idx 	The index of the color we are saving
		 * @param 	val 	The value that the color should be set to
		 * ...........................................................................
		 */
		public updateRgbValue(valueType: RGBEnum, val: number): void {

			switch (valueType) {

				case RGBEnum.RED:
					this.red = val;
					break;

				case RGBEnum.GREEN:
					this.green = val;
					break;

				case RGBEnum.BLUE:
					this.blue = val;
					break;

				case RGBEnum.ALPHA:
					this.alpha = val;
					break;
			}
		};

		/**...........................................................................
		 * updateHslValue
		 * ...........................................................................
		 * Sets a color value based on the index of the color (ie, hue = 1, saturation = 2...)
		 *
		 * @param 	idx 	The index of the color we are saving
		 * @param 	val 	The value that the color should be set to
		 * ...........................................................................
		 */
		public updateHslValue(valueType: HSLPieceEnum, val: number): void {
			
			switch (valueType) {

				case HSLPieceEnum.HUE:
					this.hue = val;
					break;

				case HSLPieceEnum.SATURATION:
					this.saturation = val;
					break;

				case HSLPieceEnum.LIGHTNESS:
					this.lightness = val;
					break;

				case HSLPieceEnum.ALPHA:
					this.alpha = val;
					break;
			}
		}

		//#endregion

		//#region HANDLE COLOR GENERATION AND GRABBING

		/**...........................................................................
		 * getNextHue
		 * ...........................................................................
		 * Grabs the next hue available for this color selector.
		 * Can be used as a random color generator
		 *
		 * @param	firstRotate		The HSL pice that should be rotating first
		 * @param 	withAlpha 		True if the alpha value should also be included in the output string
		 *
		 * @returns The hex color string for the new color
		 * ...........................................................................
		 */
		public getNextColor(firstRotate: HSLPieceEnum, withAlpha?: boolean): string {
			;
			var toCycle = [], idx;

			// First, convert our internal format to HSL (if needed)
			if (!this._startHue) this.generateHslValues();

			// Fill in our array of the order in which we will cycle the values
			toCycle[0] = firstRotate;
			toCycle[1] = (firstRotate + 1) % 3;
			toCycle[2] = (firstRotate + 2) % 3;

			// Loop through the cycles and set their values
			for (idx = 0; idx < toCycle.length; idx += 1) {

				// Rotate and quit if we don't have to rotate another piece
				if (!this.rotateAppropriateHSLValue(toCycle[idx])) {
					break;
				}
			}

			// Update the RGB values too
			this.generateRgbValues();
			return this.toHexString(withAlpha);
		};

		/**...........................................................................
		 * getCurrentHue
		 * ...........................................................................
		 * Grabs the current string for the color
		 * 
		 * @param	withAlpha	True if the string should include the alpha value
		 * 
		 * @returns The appropriate string for the color
		 * ...........................................................................
		 */
		public abstract getCurrentColor(withAlpha?: boolean): string;

		//#endregion

		//#region ROTATE THE CURRENT COLOR

		/**...........................................................................
		 * rotateAppropriateHSLValue
		 * ...........................................................................
		 * Calculates the next appropriate value for the HSL type, and
		 * 
		 * @param 	idx		The type of HSL values we should rotate
		 * 
		 * @returns	True if a full circle has been made for this particular index; 
		 * 			False otherwise
		 * ...........................................................................
		 */
		public rotateAppropriateHSLValue(idx: HSLPieceEnum) : boolean {
			;
			var val, start;

			// Grab the appropriate current value and start value
			switch (idx) {
				case HSLPieceEnum.SATURATION:
					val = this.rotateSaturation();
					start = this._startSaturation;
					break;
				case HSLPieceEnum.LIGHTNESS:
					val = this.rotateLightness();
					start = this._startLightness;
					break;
				case HSLPieceEnum.HUE:
					val = this.rotateHue();
					start = this._startHue;
					break;
			}

			// Return true if we'd made a full circle
			if (val === start) {
				return true;
			}
			return false;
		};

		/**...........................................................................
		 * rotateHue
		 * ...........................................................................
		 * Rotates our current hue value a set amount
		 * 
		 * @returns The new hue value for the color
		 * ...........................................................................
		 */
		public rotateHue(): number {
			;
			this._hue = this.rotateHslValue(this._hue, HUE_INTERVAL, 360);

			return this._hue;
		};

		/**...........................................................................
		 * rotateSaturation
		 * ...........................................................................
		 * Get the next saturation value for this color
		 * 
		 * @returns	The next saturation value
		 * ...........................................................................
		 */
		public rotateSaturation(): number {
			;
			return this._saturation = this.rotateHslValue(this._saturation, SATURATION_INTERVAL, 100, SATURATION_LIMITS.max, SATURATION_LIMITS.min);
		};

		/**...........................................................................
		 * rotateLightness
		 * ...........................................................................
		 * Get the next lightness value for this color
		 * 
		 * @returns	The next lightness value
		 * ...........................................................................
		 */
		public rotateLightness(): number {
			return this._lightness = this.rotateHslValue(this._lightness, LIGHT_INTERVAL, 100, LIGHTNESS_LIMITS.max, LIGHTNESS_LIMITS.min);
		}

		/**...........................................................................
		 * rotateHslValue
		 * ...........................................................................
		 * Rotates a given HSL value by an appropriate interval to get a new color
		 *
		 * @param 	startVal	The value the HSL value started with
		 * @param 	inc 		How much the HSL value should be incremented
		 * @param 	modBy		What the mod of the HSL value should be
		 * @param 	max			The maximum this HSL value can be
		 * @param 	min			The minimum this HSL value can be
		 *
		 * @returns The newly rotate HSL value
		 * ...........................................................................
		 */
		public rotateHslValue(startVal: number, inc: number, modBy: number, max?: number, min?: number) {
			;
			var out;

			// Increment and mod
			out = startVal += inc;
			out %= modBy;

			// If we have neither max nor min, quit now
			if (!max) { return roundToPlace(out, 10); }
			if (!min && (min !== 0)) { return roundToPlace(out, 10); }

			// Loop until we have an acceptable value
			while ((out < min) || (out > max)) {
				out = startVal += inc;
				out %= modBy;
			}

			// Return the appropriate value
			return roundToPlace(out, 10);
		};
		//#endregion

		//#region INTERACT WITH ANOTHER COLOR

		/**...........................................................................
		 * getApparentColor
		 * ...........................................................................
		 * Calculates what the display color of this color would be without setting an alpha value.
		 * Can calculate what the RGB value should be given a background color instead of RGBA
		 *
		 * @param 	backColor 	Either the color object or color string for the background color
		 *
		 * @returns True if we were successfully able to calculate the apparent color.
		 * ...........................................................................
		 */
		public getApparentColor(backColor: Color | string): boolean {
			;
			let c: Color;
			let antiAlpha: number;

			// Parse the backColor if it is a string, or just leave it if it is an object
			if ((backColor as Color)._red) {
				c = (backColor as Color);
			} else {
				c = new AnyColor(backColor as string);
			}

			// quit if this color was parsed incorrectly
			if (!c._parsedCorrectly) { return false; }

			antiAlpha = 1 - this._alpha;
			this._red = Math.round((this._red * this._alpha) + (c._red * antiAlpha));
			this._green = Math.round((this._green * this._alpha) + (c._green * antiAlpha));
			this._blue = Math.round((this._blue * this._alpha) + (c._blue * antiAlpha));

			this._alpha = 1;

			return true;
		};

		/**...........................................................................
		 * compare
		 * ...........................................................................
		 * Finds how similar two colors are based on their HSL values
		 * @param {Color} otherColor  - The color we are comparing to
		 * @param multipliers - The multipliers we should use to calculate the diff
		 * @returns An object containing the total diff calculation as well as the raw diff values
		 * ...........................................................................
		 */
		public compare(other_color: Color, multipliers: IColorMultipliers): IColorMultipliers {
			;
			var diffs;

			// If we didn't get multiplers, set some defaults
			if (!multipliers) {
				multipliers = {
					hue: 1,
					saturation: 0.04,
					lightness: 0.04,
					alpha: 0.04
				}
			}
			// Make sure we have HSL for both colors
			other_color.generateHslValues();
			this.generateHslValues();

			// Grab the differences between the values
			diffs = {
				hue: (other_color._hue - this._hue),
				saturation: (other_color._saturation - this._saturation),
				lightness: (other_color._lightness - this._lightness),
				alpha: (other_color._alpha - this._alpha)
			};

			// Calculate the total diff
			diffs.total = 0;
			diffs.total += (Math.abs(diffs.hue) * (multipliers.hue || 0));
			diffs.total += (Math.abs(diffs.saturation) * (multipliers.saturation || 0));
			diffs.total += (Math.abs(diffs.lightness) * (multipliers.lightness || 0));
			diffs.total += (Math.abs(diffs.alpha) * (multipliers.alpha || 0));

			// return our diffs array
			return diffs;
		}

		/**...........................................................................
		 * averageIn
		 * ...........................................................................
		 * Averages in another color into this one
		 * @param   {Color}   other_color The other color to average in
		 * @param   {boolean} no_merge    True if we should just return the averages instead of merging them in to this color
		 * @returns {Color}               The resulting merged color
		 * ...........................................................................
		 */
		public averageIn(other_color: Color, no_merge: boolean): Color | { hue: number, saturation: number, lightness: number, alpha: number } {
			;
			let avgs: { hue: number, saturation: number, lightness: number, alpha: number };

			// Make sure we have HSL values for both colors
			other_color.generateHslValues();
			this.generateHslValues();

			// Calculate the averages
			avgs = {
				hue: ((this._hue + other_color._hue) / 2),
				saturation: ((this._saturation + other_color._saturation) / 2),
				lightness: ((this._lightness + other_color._lightness) / 2),
				alpha: ((this._alpha + other_color._alpha) / 2)
			};


			if (no_merge) {
				return avgs;
			}

			// Set these averaged values as our colors new colors
			this._hue = Math.round(avgs.hue);
			this._saturation = (Math.floor(avgs.saturation * 10) / 10);
			this._lightness = (Math.floor(avgs.lightness * 10) / 10);
			this._alpha = (Math.floor(avgs.alpha * 10) / 10);

			return this;
		}

		/**...........................................................................
		 * equals
		 * ...........................................................................
		 * Check if two colors are functionally equal
		 * 
		 * @param 	other	The color to compare this to
		 * 
		 * @returns	True if the colors have the same values
		 * ........................................................................... 
		 */
		public equals (other: Color): boolean {
			return (this.toHexString(true) === other.toHexString(true));
		}

		//#endregion

		//#region LIGHT AND DARK DETECTION
		/**...........................................................................
		 * isDark
		 * ...........................................................................
		 * Checks if this color object is more dark than light
		 * 
		 * @returns True if the color is dark
		 * ...........................................................................
		 */
		public isDark(): boolean {
			if (!this._hue) this.generateHslValues();

			return (this.luminance <= 70);
		};

		/**...........................................................................
		 * isLight
		 * ...........................................................................
		 * Checks if this color object is more light than dark
		 * 
		 * @returns True if the color is light
		 * ...........................................................................
		 */
		public isLight(): boolean {
			if (!this._hue) this.generateHslValues();

			return (this.luminance > 70);
		};

		/**...........................................................................
		 * getLightness
		 * ...........................................................................
		 * Grabs the lightness value of this color
		 * 
		 * @returns The value of this color's lightness
		 * ...........................................................................
		 */
		public getLightness(): number {
			if (!this._hue) this.generateHslValues();

			return this._lightness;
		}

		/**...........................................................................
		 * _calculateLuminance
		 * ...........................................................................
		 * Determine the perceived luminosity of the color
		 * ...........................................................................
		 */
		protected _calculateLuminance(): void {
			if (!this._red) { this.generateRgbValues(); }
			this._luminance = ((0.2126 * this._red) + (0.7152 * this._green) + (0.0722 * this._blue)) / 2.55;
		}
		//#endregion
	}

	//#endregion

	//#region RGB COLOR
	/**...........................................................................
	 * @class RGBColor
	 * Creates a color based on RGB 
	 * @version 1.0
	 * ...........................................................................
	 */
	export class RGBColor extends Color {

		
		/**...........................................................................
		 * Creates an RGB Color
		 * 
		 * @param 	red 	Red value for the color
		 * @param 	green 	Green value for the color
		 * @param 	blue 	Blue value for the color
		 * @param 	alpha 	If provided, the alpha value for the color
		 * ...........................................................................
		 */
		constructor(red: number, green: number, blue: number, alpha?: number);

		/**...........................................................................
		 * Creates an RGB Color
		 * 
		 * @param 	rgbString 	RGB or RGBA string for the color
		 * @param 	alpha 		If alpha isn't a part of the string, the alpha value
		 * ...........................................................................
		 */
		constructor(rgbString: string, alpha?: number);

		/** Creates an RGB Color */
		constructor (redOrRgbString: string | number, greenOrAlpha?: number, blue?: number, alpha?: number) {
			super();

			// Parse the string if it was passed in
			if (typeof redOrRgbString === "string") {
				this._parsedCorrectly = this._parseFromRgbColor(redOrRgbString, greenOrAlpha);

			// Otherwise, use the numeric values
			} else {
				this.red = redOrRgbString;
				this.green = greenOrAlpha;
				this.blue = blue;
				this.alpha = alpha;
				this._parsedCorrectly = true;
			}
		}

		/**...........................................................................
		 * getCurrentHue
		 * ...........................................................................
		 * Grabs the current RGB string for the color
		 * 
		 * @param	withAlpha	True if the string should include the alpha value
		 * 
		 * @returns The RGB string for the color
		 * ...........................................................................
		 */
		public getCurrentColor (withAlpha?: boolean): string {
			return this.toRgbString(withAlpha);
		}

	}
	//#endregion

	//#region HSL COLOR
	/**...........................................................................
	 * @class HSLColor
	 * Creates a color based on HSL
	 * @version 1.0
	 * ...........................................................................
	 */
	export class HSLColor extends Color {

		/**...........................................................................
		 * Creates an HSL Color
		 * 
		 * @param 	hue 			Hue to use for this color
		 * @param 	saturation 		Saturation value to use for this color
		 * @param 	lightness 		Lightness to use for this color
		 * @param 	alpha 			If provided, alpha value for the color
		 * ...........................................................................
		 */
		constructor(hue: number, saturation: number, lightness: number, alpha?: number);

		/**...........................................................................
		 * Creates an HSL Color
		 * 
		 * @param 	hslString 	The HSL or HSLA string to parse
		 * @param 	alpha		If alpha isn't a part of the string, separate value for it 
		 * ...........................................................................
		 */
		constructor(hslString: string, alpha?: number);

		/** Creates an HSL Color */
		constructor(hueOrHslString: string | number, saturationOrAlpha?: number, lightness?: number, alpha?: number) {
			super();

			// parse the color string if passed in
			if (typeof hueOrHslString === "string") {
				this._parsedCorrectly = this._parseFromHslColor(hueOrHslString, saturationOrAlpha);

			// use the numeric values
			} else {
				this.hue = hueOrHslString;
				this.saturation = saturationOrAlpha;
				this.lightness = lightness;
				this.alpha = alpha;
				this._parsedCorrectly = true;
			}
		}

		/**...........................................................................
		 * getCurrentHue
		 * ...........................................................................
		 * Grabs the current HSL string for the color
		 * 
		 * @param	withAlpha	True if the string should include the alpha value
		 * 
		 * @returns The HSL string for the color
		 * ...........................................................................
		 */
		public getCurrentColor (withAlpha?: boolean): string {
			return this.toHslString(withAlpha);
		}
	}
	//#endregion

	//#region HEX COLOR
	export class HexColor extends Color {

		/**...........................................................................
		 * Creates a hex color
		 * 
		 * @param 	hexString	The hex or hex-alpha string to base this color on 
		 * @param 	alpha		If not a part of the string, the alpha value to use 
		 * 						for this color
		 * ........................................................................... 
		 */
		constructor(hexString: string, alpha?: number) {
			super();
			this._parsedCorrectly = this._parseFromHexColor(hexString);
		}

		/**...........................................................................
		 * getCurrentHue
		 * ...........................................................................
		 * Grabs the current hex string for the color
		 * 
		 * @param	withAlpha	True if the string should include the alpha value
		 * 
		 * @returns The hex string for the color
		 * ...........................................................................
		 */
		public getCurrentColor (withAlpha?: boolean) : string {
			return this.toHexString(withAlpha);
		}
	}
	//#endregion

	//#region ANY COLOR TYPE

	/**...........................................................................
	 * @class AnyColor
	 * Color class that can take in any color string
	 * @version 1.0
	 * ...........................................................................
	 */
	export class AnyColor extends Color {

		/**...........................................................................
		 * Creates a color
		 * 
		 * @param	colorString		The string to create from
		 * @param	alpha			If not included in the color string, the alpha 
		 * 							value to use for the color
		 */
		constructor(colorString: string, alpha?: number) {
			super();
			this._parsedCorrectly = this._parseColorString(colorString, alpha);
		}

		/**...........................................................................
		 * getCurrentColor
		 * ...........................................................................
		 * Grabs the current hex string for the color
		 * 
		 * @param 	withAlpha	True if the string should contain the alpha value
		 * 
		 * @returns	The hex string for the color
		 * ........................................................................... 
		 */
		public getCurrentColor (withAlpha?: boolean): string {
			return this.toHexString(withAlpha);
		}
	}

	//#endregion
}