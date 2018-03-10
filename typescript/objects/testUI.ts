namespace KIP {

	/**...........................................................................
	 * IUnitTestElems
	 * ...........................................................................
	 * Elements for unit tests
	 * ...........................................................................
	 */
	export interface IUnitTestElems extends IDrawableElements {
		testContainer: HTMLElement;
		groups: HTMLElement[];
	}

	export interface IVisualTestButton {
		label: string;
		callback: Function;
	}

	export interface IUnitTestDetails {
		params: any[];
		result: any;
		details: string;
	}

	export class UnitTestUI extends Drawable {

		//#region PROPERTIES

		/** styles to use for this unit test */
		protected static _uncoloredStyles: Styles.IStandardStyles = {
			".hidden": {
				display: "none"
			},

			".group": {
				marginBottom: "10px",
				display: "#666",
				borderCollapse: "collapse",
				width: "20%"
			},

			".groupName": {
				fontSize: "1.6em",
				color: "#666"
			},

			".functionTitle": {
				fontSize: "1.3em",
				color: "#888",
				marginLeft: "5px"
			},

			".tests": {
				marginLeft: "50px",
				fontFamily: "Segoe UI, Calibri, Helvetica"
			},

			".tests .testContainer": {
				display: "flex",
				flexWrap: "wrap"
			},

			".test": {
				display: "table-row"
			},

			".test > div": {
				border: "solid transparent",
				borderWidth: "10px",
				borderRightWidth: "20px",
				marginRight: "10px",
				display: "table-cell"
			},

			".test .fail": {
				color: "rgb(190,50,30)",
				fontWeight: "bold"
			},

			".test .pass": {
				color: "rgb(50,190,30)",
				fontWeight: "bold",
				marginRight: "10px",
				display: "table-cell"
			},

			".test .name": {
				color: "#333",
				marginRight: "10px",
				display: "table-cell"
			},

			".test .err": {
				fontStyle: "italic",
				color: "#666",
				fontSize: "0.8em"
			},

			".test .message": {
				color: "#888",
				marginRight: "10px",
				display: "table-cell"
			},

			".visualTestBtn": {
				color: "#FFF",
				padding: "2px 10px",
				borderRadius: "3px",
				cursor: "pointer",
				width: "auto",
				marginBottom: "8px"
			},

			".innerBtn": {
				backgroundColor: "#06C",
				display: "inline-block",
				padding: "2px 10px"
			}
		}

		/** elements associated with the unit test UI */
		protected _elems: IUnitTestElems;

		//#endregion

		/**...........................................................................
		 * Construct a new instance of the UnitTestUI
		 * ...........................................................................
		 */
		constructor() {
			super();
			this._addClassName("UnitTestUI");
		}

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 * Create the elements needed for the drawable
		 * ...........................................................................
		 */
		protected _createElements(): void {
			this._elems.base = createElement({ cls: "tests" });
			this._elems.testContainer = createElement({ cls: "testContainer", parent: this._elems.base });
			this._elems.groups = [];
		}

		/**...........................................................................
		 * tset
		 * ...........................................................................
		 * State the result of whether a certain test passed or failed
		 * 
		 * @param 	name 			The name of the assertion			
		 * @param 	actualResult 	What the result of the test was
		 * @param 	expectedResult 	What should have been the result
		 * @param 	message 		If provided, the additional message to display
		 * ...........................................................................
		 */
		public test(name: string, actualResult: any, expectedResult: any, message?: string): void {

			let pass: boolean = this.testEquality(actualResult, expectedResult);
			let value: string = actualResult.toString() + " " + (pass ? "===" : "!==") + " " + expectedResult.toString()
			let valueStr: string = this._buildValueString(pass, actualResult, expectedResult);
			message = message || "";

			this._constructTestUI(name, pass, valueStr, message);
			this._logTest(name, pass, valueStr, message);

		}

		/**...........................................................................
		 * assert
		 * ...........................................................................
		 * Asserts whether the passed in evaluation is true or false
		 * 
		 * @param 	name 			Name of the test we are running
		 * @param 	pass 			Evaluation of pass
		 * @param 	trueMessage 	What to show if the evaluation passes
		 * @param 	falseMessage 	What to show if the evaluation fails
		 * ...........................................................................
		 */
		public assert(name: string, pass: boolean, trueMessage?: string, falseMessage?: string): void {
			let msg: string = pass? trueMessage : falseMessage;
			this._constructTestUI(name, pass, msg);
			this._logTest(name, pass, msg);
		}

		/**...........................................................................
		 * startGroup
		 * ...........................................................................
		 * Creates a group of tests
		 * 
		 * @param 	groupName 	The name of the group to display
		 * ...........................................................................
		 */
		public startGroup(groupName: string): void {
			console.log("\n=== " + groupName + " ===");

			// Create the group
			let group: HTMLElement = createElement({ cls: "group", parent: this._elems.testContainer });
			this._elems.groups.push(group);

			// add the name of the group
			createElement({ cls: "groupName", parent: group, content: groupName });
		}

		/**...........................................................................
		 * testFunction
		 * ...........................................................................
		 * 
		 * @param funcToTest 
		 * @param title 
		 * @param tests 
		 * ...........................................................................
		 */
		public testFunction(funcToTest: Function, title: string, tests: IUnitTestDetails[]): void {

			let parent: HTMLElement = this._elems.groups[this._elems.groups.length - 1] || this._elems.testContainer;

			// create the title element for this group of elems
			let titleElem: HTMLElement = createElement({ cls: "functionTitle", content: title, parent: parent });

			// Loop through each of the tests and verify each is working
			for (let idx = 0; idx < tests.length; idx += 1) {
				let testDetails: IUnitTestDetails = tests[idx];
				let result: any = funcToTest.apply(window, testDetails.params);
				let pass: boolean = this.testEquality(result, testDetails.result);
				let valueString: string = this._buildValueString(pass, result, testDetails.result);

				this._constructTestUI(testDetails.details, pass, valueString);
				this._logTest(testDetails.details, pass, valueString);
			}
		}

		/**...........................................................................
		 * visualTest
		 * ...........................................................................
		 * @param title 
		 * @param buttons 
		 * ...........................................................................
		 */
		public visualTest(title: string, buttons: IVisualTestButton[]): void {

			let parent: HTMLElement = this._elems.groups[this._elems.groups.length - 1] || this._elems.testContainer;

			let titleElem: HTMLElement = createElement({ cls: "functionTitle", content: title, parent: parent });

			// loop through the 
			for (let idx = 0; idx < buttons.length; idx += 1) {
				let btnDetails: IVisualTestButton = buttons[idx];
				let btnElem: HTMLElement = createElement({ cls: "visualTestBtn", parent: parent, children: [{ content: btnDetails.label, cls: "innerBtn"}] });
				btnElem.addEventListener("click", () => { btnDetails.callback(); });
			}
		}

		/**...........................................................................
		 * test
		 * ...........................................................................
		 * Check if the actual and expected results actually match
		 * 
		 * @param actualResult 		What the test returned
		 * @param expectedResult 	What the test should have returned
		 * 
		 * @returns	True if the actual result matches the expected result
		 * ...........................................................................
		 */
		public testEquality(actualResult: any, expectedResult: any): boolean {
			if (actualResult.equals) {
				return actualResult.equals(expectedResult);
			}
			return (actualResult === expectedResult);
		}

		/**...........................................................................
		 * _buildValueString
		 * ...........................................................................
		 * Build the string that will show whether the result is a match or not
		 * 
		 * @param	pass			If true, builds the pass string
		 * @param	actualResult	The value that was received 
		 * @param	expectedResult	The value we should have gotten
		 * 
		 * @returns	A string that's appropriate for this test's result
		 * ...........................................................................
		 */
		protected _buildValueString(pass: boolean, actualResult: any, expectedResult: any): string {
			if (pass) {
				return format ("'{0}' = '{1}'", actualResult, expectedResult);
			} else {
				return format ("'{0}' != '{1}'", actualResult, expectedResult);
			}
		}

		/**...........................................................................
		 * _buildTestString
		 * ...........................................................................
		 * Creates a test element for the div
		 * 
		 * @param	name			What to display as the name of the test
		 * @param 	pass    		True if the test passed
		 * @param	value_string	The value to display for a pass
		 * @param 	message 		Message to display with test 
		 * 
		 * @returns	The string displaying the result of the test
		 * ...........................................................................
		 */
		protected _buildTestString(name: string, pass: boolean, value_string: string, message: string): string {
			let content: string = "\t\t";

			content += this._passToString(pass).toUpperCase();
			content += ": " + name;
			content += (!pass ? " [" + value_string + "]" : "");
			content += (message ? " - " + message : "");

			return content;
		}

		/**...........................................................................
		 * _passToString
		 * ...........................................................................
		 * Display whether the test passed or failed
		 * 
		 * @param 	pass	True if the test passed
		 * 
		 * @returns	Display string for the pass result
		 * ...........................................................................
		 */
		protected _passToString(pass: boolean): string {
			return (pass ? "pass" : "fail");
		}

		/**...........................................................................
		 * _constructTestUI
		 * ...........................................................................
		 * Create the display elements for a test
		 * 
		 * @param 	name 			Name of the test
		 * @param 	pass 			True if the test passed
		 * @param 	value_string 	The value of the test
		 * @param 	message 		Optional message to go with the test
		 * ...........................................................................
		 */
		protected _constructTestUI(name: string, pass: boolean, value_string: string, message?: string): void {
			let pass_str: string = this._passToString(pass);
			let group: HTMLElement = this._elems.groups[this._elems.groups.length - 1];
			let test: HTMLElement = createElement({ cls: "test", parent: group, attr: {title: value_string} });

			createElement({ cls: pass_str, content: pass_str.toUpperCase(), parent: test });
			createElement({ cls: "name", content: name, parent: test });

			if (!pass) {
				createElement({ cls: "err", content: value_string, parent: test });
				createElement({ cls: "message", content: message, parent: test });
			}
		}

		/**...........................................................................
		 * _logTest
		 * ...........................................................................
		 * Adds the test to the console
		 * 
		 * @param 	name 		Name of the test
		 * @param 	pass 		True if the test passed
		 * @param 	value_str 	What the test returned
		 * @param 	message 	Optional messgae to go with the test
		 * ...........................................................................
		 */
		protected _logTest(name: string, pass: boolean, value_str: string, message?: string): void {
			let content: string = this._buildTestString(name, pass, value_str, message);
			console.log(content);
		}
	}
}