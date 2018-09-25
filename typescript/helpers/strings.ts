namespace KIP {
	/**
	 * piece
	 * ---------------------------------------------------------------------------
	 * Gets a piece of a delimited string
	 *
	 * @param 	str 		The string to grab a piece from
	 * @param 	delim 	The character (or characters) that are delimiting the string
	 * @param 	piece 	The piece number to get. Defaults to 1 if not passed in.
	 *
	 * @return The specified piece of the string, "" if it doesn't exist
	 */
	export function piece(str: string, delim: string, pc: number = 1): string {
		let split_arr: string[];

		split_arr = str.split(delim);
		return split_arr[pc] || "";
	};

	/**
	 * addPiece
	 * ---------------------------------------------------------------------------
	 * Add a new piece to a delimited string, adding the appropriate delimiter if
	 * appropriate to do so
	 * 
	 * @param	str			The string to add a piece to
	 * @param	nextPiece	The next piece to add to the string
	 * @param	delim		Delimiter to use to separate pieces
	 * 
	 * @returns	The pieced-together string
	 */
	export function addPiece(str: string, nextPiece: string, delim: string): string {
		if (str.length > 0) { str += delim; }
		return str + nextPiece;
	}

	/**
	 * titleCase
	 * ---------------------------------------------------------------------------
	 * Capitalizes the first letter of each word of a given string, and converts all else to lowercase
	 *
	 * @param 	str   	The string to convert to title case
	 * @param 	delim 	What separates the different words in this string
	 *
	 * @returns The string, now in title case
	 */
	export function titleCase(str: string, delim: string = " "): string {
		let words: string[];
		let w: number;
		let out: string;

		out = "";

		words = str.split(delim);

		for (w = 0; w < words.length; w += 1) {
			if (w !== 0) {
				out += delim;
			}
			out += charAt(words[w], 0).toUpperCase();
			out += rest(words[w], 1).toLowerCase();
		}

		return out;
	};

	/**
	 * sentenceCase
	 * ---------------------------------------------------------------------------
	 * Capitalizes the first letter of a given string, and converts the rest to 
	 * lowercase
	 *
	 * @param 	str   The string to capitalize
	 *
	 * @returns The string, now in sentence case
	 */
	export function sentenceCase(str): string {
		let out: string;
		out = charAt(str, 0).toUpperCase();
		out += rest(str, 1).toLowerCase();

		return out;
	};

	/**
	 * charAt
	 * ---------------------------------------------------------------------------
	 * Slightly more memorable way to get a character at a given position in a 
	 * string
	 *
	 * @param 	str 	The string to take the character out of
	 * @param 	idx 	What index of the string to get the character of
	 *
	 * @return The character at the specified position
	 */
	export function charAt(str: string, idx: number): string {
		return str.substr(idx, 1);
	};

	/**
	 * rest
	 * ---------------------------------------------------------------------------
	 * Gets the substring of a string starting from a given index
	 *
	 * @param 	str 	The string to get the substring of
	 * @param 	idx 	What index to start the substring at
	 *
	 * @return The rest of the string after the provided index
	 */
	export function rest(str: string, idx: number): string {
		return str.substring(idx, str.length);
	};

	/**
	 * trim
	 * ---------------------------------------------------------------------------
	 * Trims all white space off of the beginning and end of a string
	 *
	 * @param 	str 	The string to trim
	 *
	 * @return The trimmed string
	 */
	export function trim(str: string): string {
		let ret: string;
		ret = str.replace(/^\s*/g, "");		// Replace white space at the beginning
		ret = ret.replace(/\s*?$/g, "");	// Replace white space at the end
		return ret;
	};

	/**
	 * stripSpaces
	 * ---------------------------------------------------------------------------
	 * Remove all spaces from the provided string
	 * 
	 * @param 	str	The string to strip
	 * 
	 * @returns	The stripped strings 
	 */
	export function stripSpaces(str: string): string {
		let ret: string;
		ret = str.replace(/\s/g, "");
		ret = ret.replace(/\&nbsp\;/g, "");
		return ret;
	}

	/**
	 * format
	 * ---------------------------------------------------------------------------
	 * Take a string with placeholders and replaces them with the provided 
	 * parameters
	 * 
	 * @param 	str 					The string to make replacements within
	 * @param		replacements	The strings that should replace the placeholders
	 * 
	 * @returns	The string with replacements made
	 */
	export function format(str: string, ...replacements: any[]): string {
		let stringArr: string[] = str.split("");

		// make sure we have an array to avoid null references
		if (!replacements) { replacements = []; }

		let number: string = "";
		let lookingForNumber: boolean = false;

		// Loop through each letter in the array
		for (let idx = 0; idx < stringArr.length; idx += 1) {
			let char: string = stringArr[idx];

			// Option 1: a backslash means we should skip the next character
			if (char === "\\") {
				stringArr[idx] = "";
				idx += 1;
				continue;
			}

			// Option 2: a left brace means we should start looking for a number
			else if (char === "{") {
				lookingForNumber = true;	// start looking for a number
				stringArr[idx] = "";		// replace the brace with a blank string
			}

			// Option 3: a right brace should be replaced with whatever is in the replacements array
			else if (char === "}" && lookingForNumber) {
				stringArr[idx] = (!isNullOrUndefined(replacements[+number]) ? replacements[+number].toString() : "{" + number + "}");
				lookingForNumber = false;
				number = "";
			}

			// Option 4: a numeric character when we're looking for a number
			else if (isNumeric(char) && lookingForNumber) {
				number += char;
				stringArr[idx] = "";
			}

			// Option 5: we were looking for a number but didn't find one
			else if (lookingForNumber) {
				lookingForNumber = false;
				number = "";
			}

		}

		return stringArr.join("");
	}

	/**
	 * isNumeric
	 * ---------------------------------------------------------------------------
	 * Checks if a string can be parsed into an integer number
	 * @param 	str 	The string to test
	 * 
	 * @returns	True if this is an integer string
	 */
	export function isNumeric(str: string): boolean {
		return /[0-9]/.test(str);
	}

	/**
	 * addLeadingZeros
	 * ---------------------------------------------------------------------------
	 * Adds a number of leading zeroes before a number
	 * 
	 * @param   count   The number of zeroes to add
	 * @param   nums    The numbers to add zeroes to
	 * 
	 * @returns All zero-padded numbers that were passed in
	 */
	export function addLeadingZeroes(count: number, unpadded: number | string): string {
		"use strict";
		let out: string;

		if (typeof unpadded === "string") {
			out = unpadded;
		} else {
			out = unpadded.toString();
		}

		// Loop through the number of zeros we need to add and add them
		let z: number;
		for (z = out.length; z < count; z += 1) {
			out = "0" + out;
		}

		return out;
	};

	/**
	 * stripHTML
	 * ---------------------------------------------------------------------------
	 * Remove HTML tags from a particular string
	 * @param 	str		String to remove tags from
	 * 
	 * @returns	The string stripped of HTML 
	 */
	export function stripHTML(str: string): string {
		let out: string;
		out = str.replace(/\<.*?\>/g, "");
		return out;
	}


}