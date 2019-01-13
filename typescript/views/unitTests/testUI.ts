namespace KIP {

    export interface TestResults<T> {
        name: string;
        expectedResult?: T;
        actualResult?: T;
        pass: boolean;
        message?: string;
    }

    /**----------------------------------------------------------------------------
     * @class   TestUI
     * ----------------------------------------------------------------------------
     * Render the appropriate UI for a set of unit tests
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class TestUI {
        abstract renderTest<T>(data: TestResults<T>): void;
        abstract startGroup(groupName: string): void;
        abstract startSubgroup(subgroupName: string): void;

        public constructor() {}
        
        /**
		 * _buildValueString
		 * ----------------------------------------------------------------------------
		 * Build the string that will show whether the result is a match or not
		 * 
		 * @param	pass			If true, builds the pass string
		 * @param	actualResult	The value that was received 
		 * @param	expectedResult	The value we should have gotten
		 * 
		 * @returns	A string that's appropriate for this test's result
		 */
		protected _buildValueString<T>(result: TestResults<T>): string {
            if (!result.actualResult || !result.expectedResult) { return ""; }
			if (result.pass) {
				return format ("'{0}' = '{1}'", result.actualResult, result.expectedResult);
			} else {
				return format ("'{0}' != '{1}'", result.actualResult, result.expectedResult);
			}
		}

		/**
		 * _passToString
		 * ----------------------------------------------------------------------------
		 * Display whether the test passed or failed
		 * 
		 * @param 	pass	True if the test passed
		 * 
		 * @returns	Display string for the pass result
		 */
		protected _passToString(pass: boolean): string {
			return (pass ? "pass" : "fail");
        }
    }
}