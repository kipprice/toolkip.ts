/// <reference path="testUi.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
	 * @class	HTMLUnitTester
	 * ----------------------------------------------------------------------------
	 * Unit tester that renders results as HTML elements
	 * @author	Kip Price
	 * @version	1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class HTMLUnitTester extends UnitTester {
        protected static _instance: HTMLUnitTester;

		private __ui: HTMLUnitTestUI;
		protected get _ui(): HTMLUnitTestUI { 
			if (this.__ui) { return this.__ui; }
			this.__ui = new HTMLUnitTestUI();
			return this.__ui;
		}

		protected _visualTest(title: string, buttons: IVisualTestButton[]): void {
			this._ui.startSubgroup(title);
			for (let btn of buttons) {
				this._ui.addVisualTestButton(btn);
			}
		}
    }
    
    /**----------------------------------------------------------------------------
     * @class   HTMLUnitTestUI
     * ----------------------------------------------------------------------------
     * 
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class HTMLUnitTestUI extends TestUI {

        //#region PROPERTIES
        protected _drawable: UI;
        //#endregion

        /**
         * HTMLUnitTestUI
         * ----------------------------------------------------------------------------
         * Initialize the UI needed for the HTML Unit Tester
         */
        constructor() {
            super();
            this._drawable = new UI();
            this._drawable.draw(document.body);
        }

        /**
         * renderTest
         * ----------------------------------------------------------------------------
         * Show the results of the specified test
         */
        public renderTest<T>(result: TestResults<T>): void {
            let extendedResults: VisualResults<T> = result as VisualResults<T>;

            extendedResults.value = this._buildValueString(result);
            extendedResults.passStr = this._passToString(result.pass);

            this._drawable.addTestResult(extendedResults);
        }

        /**
         * startGroup
         * ----------------------------------------------------------------------------
         * Create a group, labeled with the specified test
         */
        public startGroup(groupName: string): void {
            this._drawable.startGroup(groupName);
        }

        public startSubgroup(subgroupName: string): void {
            this._drawable.startSubgroup(subgroupName);
        }

        public addVisualTestButton(btn: IVisualTestButton): void {
            this._drawable.addVisualButton(btn);
        }

    }

    /**----------------------------------------------------------------------------
     * @class   HTMLTest
     * ----------------------------------------------------------------------------
     * Generate a HTML UI for a set of unit tests
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class UI extends Drawable {

        //.....................
        //#region PROPERTIES

        /** drawable associated with this class */
        protected _elems: IUnitTestElems;

        //#endregion
        //.....................

        //..................
        //#region STYLES

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

        //#endregion
        //..................

        protected _createElements(): void {
            this._elems = {
                base: createElement({
                    cls: "tests"
                }),
                groups: []
            } as IUnitTestElems;

            this._elems.testContainer = createElement({
                cls: "testContainer",
                parent: this._elems.base
            });
        }

        /**
         * addVisualButton
         * ----------------------------------------------------------------------------
         * Add a button that can render an integration test for verification with the 
         * specified details
         */
        public addVisualButton(btn: IVisualTestButton): void {

            let btnElem: HTMLElement = createElement({ 
                cls: "visualTestBtn", 
                parent: this._getParentElement(), 
                children: [
                    { content: btn.label, cls: "innerBtn" }
                ],
                eventListeners:{
                    click: () => { btn.callback(); }
                }
            });
        }

        public addTestResult<T>(result: VisualResults<T>): void {
            let group: HTMLElement = this._getParentElement();

            let test: HTMLElement = createElement({ 
                cls: "test", 
                parent: group, 
                attr: { title: result.value } 
            });

            createElement({ cls: result.passStr, content: result.passStr.toUpperCase(), parent: test });
            createElement({ cls: "name", content: result.name, parent: test });

            if (!result.pass) {
                createElement({ cls: "err", content: result.value, parent: test });
                createElement({ cls: "message", content: result.message, parent: test });
            }
        }

        /**
         * startGroup
         * ----------------------------------------------------------------------------
         * Generate a group of unit tests, labeled with the specified name
         */
        public startGroup(groupName: string): void {
            let group: HTMLElement = createElement({ 
                cls: "group", 
                parent: this._elems.testContainer 
            });
            this._elems.groups.push(group);
            
            // add the name of the group
			createElement({ 
                cls: "groupName", 
                parent: group, 
                content: groupName 
            });
        }

        /**
         * startSubgroup
         * ----------------------------------------------------------------------------
         * Generate a subgroup of unit tests, labeled with the specified name
         */
        public startSubgroup(subgroupName: string): void {
			// create the title element for this group of elems
			createElement({ 
                cls: "functionTitle", 
                content: subgroupName, 
                parent: this._getParentElement()
            });
        }

        protected _getParentElement(): HTMLElement {
            return this._elems.groups[this._elems.groups.length - 1] || this._elems.testContainer;
        }


    }

    

    //#region INTERFACES
    export interface IVisualTestButton {
		label: string;
		callback: Function;
    }
    
    /**
	 * IUnitTestElems
	 * ----------------------------------------------------------------------------
	 * Elements for unit tests
	 */
    export interface IUnitTestElems extends IDrawableElements {
        testContainer: HTMLElement;
        groups: HTMLElement[];
    }

    export interface VisualResults<T> extends TestResults<T> {
        value: string;
        passStr: string;
    }
    //#endregion

}