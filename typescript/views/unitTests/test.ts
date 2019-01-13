namespace KIP {

	export interface IUnitTestDetails {
		params: any[];
		result: any;
		details?: string;
	}

	/**----------------------------------------------------------------------------
	 * @class	UnitTestUI
	 * ----------------------------------------------------------------------------
	 * Generates UI to be able to see the results on unit tests
	 * @author	Kip Price
	 * @version	2.1.0
	 * ----------------------------------------------------------------------------
	 */
	export abstract class UnitTester extends Singleton {

		//...........................
		//#region STATIC PROPERTIES
		public static get instance(): UnitTester { return this._getInstance(); }
		//#endregion
		//...........................

		//.....................
		//#region PROPERTIES
		protected abstract get _ui(): TestUI;
		//#endregion
		//.....................

		/**
		 * UnitTester
		 * ----------------------------------------------------------------------------
		 * Construct a new instance of the UnitTester
		 */
		protected constructor() {
			super();
		}

		//...............
		//#region TEST

		/**
		 * _test
		 * ----------------------------------------------------------------------------
		 * State the result of whether a certain test passed or failed
		 * @param 	name 			The name of the assertion			
		 * @param 	actualResult 	What the result of the test was
		 * @param 	expectedResult 	What should have been the result
		 * @param 	message 		If provided, the additional message to display
		 */
		protected _test(name: string, actualResult: any, expectedResult: any, message?: string): boolean {
			message = message || "";
			let pass: boolean = this._testEquality(actualResult, expectedResult);
			
			this._ui.renderTest({
				name: name,
				pass: pass,
				actualResult: actualResult, 
				expectedResult: expectedResult,
				message: message
			});

			return pass;

		}

		/**
		 * test
		 * ----------------------------------------------------------------------------
		 * State the result of whether a certain test passed or failed
		 * @param 	name 			The name of the assertion			
		 * @param 	actualResult 	What the result of the test was
		 * @param 	expectedResult 	What should have been the result
		 * @param 	message 		If provided, the additional message to display
		 */
		public static test<T>(name: string, actualResult: T, expectedResult: T, message?: string): boolean {
			return this.instance._test(name, actualResult, expectedResult, message);
		}

		//#endregion
		//...............

		//...............
		//#region ASSERT

		/**
		 * _assert
		 * ----------------------------------------------------------------------------
		 * Asserts whether the passed in evaluation is true or false
		 * 
		 * @param 	name 			Name of the test we are running
		 * @param 	pass 			Evaluation of pass
		 * @param 	trueMessage 	What to show if the evaluation passes
		 * @param 	falseMessage 	What to show if the evaluation fails
		 */
		protected _assert(name: string, pass: boolean, trueMessage?: string, falseMessage?: string): void {
			let msg: string = pass? trueMessage : falseMessage;
			
			this._ui.renderTest({
				name: name,
				pass: pass,
				message: msg
			});
		}

		/**
		 * assert
		 * ----------------------------------------------------------------------------
		 * Asserts whether the passed in evaluation is true or false
		 * 
		 * @param 	name 			Name of the test we are running
		 * @param 	pass 			Evaluation of pass
		 * @param 	trueMessage 	What to show if the evaluation passes
		 * @param 	falseMessage 	What to show if the evaluation fails
		 */
		public static assert(name: string, pass: boolean, trueMessage?: string, falseMessage?: string): void {
			this.instance._assert(name, pass, trueMessage, falseMessage);
		}

		//#endregion
		//...............

		//..................
		//#region GROUPING

		/**
		 * startGroup
		 * ----------------------------------------------------------------------------
		 * Add a separator for grouping tests, displayed with the specified name
		 */
		public static startGroup(groupName: string): void {
			this.instance._ui.startGroup(groupName);
		}

		/**
		 * startSubgroup
		 * ----------------------------------------------------------------------------
		 * Add a separator for subgrouping tests, displayed with the specified name
		 */
		public static startSubGroup(subgroupName: string): void {
			this.instance._ui.startSubgroup(subgroupName);
		}

		//#endregion
		//..................

		//........................
		//#region TEST FUNCTION

		/**
		 * testFunction
		 * ----------------------------------------------------------------------------
		 * Verify various outputs for a particular function
		 * @param 	funcToTest 	Function to test results of
		 * @param 	title 		Title for the function subgroup
		 * @param 	tests 		Tests to evaluate with this function
		 * 
		 */
		protected _testFunction(funcToTest: Function, title: string, tests: IUnitTestDetails[]): void {

			this._ui.startSubgroup(title);

			// Loop through each of the tests and verify each is working
			for (let idx = 0; idx < tests.length; idx += 1) {
				let testDetails: IUnitTestDetails = tests[idx];
				let result: any = funcToTest.apply(window, testDetails.params);
				this._test(this._getTestName(testDetails), result, testDetails.result);
			}
		}

		/**
		 * testFunction
		 * ----------------------------------------------------------------------------
		 * Verify various outputs for a particular function
		 * @param 	funcToTest 	Function to test results of
		 * @param 	title 		Title for the function subgroup
		 * @param 	tests 		Tests to evaluate with this function
		 */
		public static testFunction(funcToTest: Function, title: string, tests: IUnitTestDetails[]): void {
			this.instance._testFunction(funcToTest, title, tests);
		}

		//#endregion
		//.....................
		
		//........................
		//#region EQUALITY TEST

		/**
		 * testEquality
		 * ----------------------------------------------------------------------------
		 * Check if the actual and expected results actually match
		 * 
		 * @param actualResult 		What the test returned
		 * @param expectedResult 	What the test should have returned
		 * 
		 * @returns	True if the actual result matches the expected result
		 */
		protected _testEquality(actualResult: any, expectedResult: any): boolean {
			if (actualResult.equals) { return actualResult.equals(expectedResult); }
			else { return (actualResult === expectedResult); }
		}

		/**
		 * testEquality
		 * ----------------------------------------------------------------------------
		 * Check if the actual and expected results actually match
		 * 
		 * @param actualResult 		What the test returned
		 * @param expectedResult 	What the test should have returned
		 * 
		 * @returns	True if the actual result matches the expected result
		 */
		public static testEquality<T>(actualResult: T, expectedResult: T): boolean {
			return this.instance._testEquality(actualResult, expectedResult);
		}	

		//#endregion
		//........................

		//.....................
		//#region VISUAL TESTS

		/**
         * visualTest
         * ----------------------------------------------------------------------------
         * Create an integration test to verify that UI is displaying appropriately
         * @param   title       Title for the group of buttons
         * @param   buttons     Buttons to display
         */
		public static visualTest(title: string, buttons: IVisualTestButton[]): void {
			this.instance._visualTest(title, buttons);
		}

		protected abstract _visualTest(title: string, buttons: IVisualTestButton[]): void;
		
		//#endregion
		//.....................
		
		//..................
		//#region HELPERS
		protected _getTestName(test: IUnitTestDetails): string {
			if (test.details) { return test.details; }
			
			return format(
				"({0}) ==> {1}",
				test.params.join(", "),
				test.result
			);
		}
		//#endregion
		//..................
	}

}