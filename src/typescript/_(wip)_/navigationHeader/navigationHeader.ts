///<reference path="../../drawable/drawable.ts" />
///<reference path="../../interfaces/iupdatable.ts" />
///<reference path="../../navigation/navigate.ts" />

namespace KIP {

    //#region DEFINITION OF A NAVIGATION HEADER

    /**...........................................................................
     * @class   NavigationHeader
     * ...........................................................................
     * @version 1.0.0
     * @author  Kip Price
     * ...........................................................................
     */
    export abstract class NavigationHeader<T extends string> extends Drawable implements IUpdatable {

        protected _navigator: Navigator<T>;
        public get navigator(): Navigator<T> { return this._navigator; }

        constructor(navigator: Navigator<T>) {
            super();
            this._navigator = navigator;
        }

        public abstract update(navigationPath: string, addlData?: any): void;
    }
    //#endregion

    //#region SIMPLE HEADER: NO HEADER AT ALL
    /**...........................................................................
     * @class   NoNavHeader
     * ...........................................................................
     * @version 1.0.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class NoNavHeader<T extends string> extends NavigationHeader<T> {
        protected _createElements(): void {}
        public update(): void {}
        public draw(): void {}
    }
    //#endregion

    //#region DEFAULT HEADER: BREADCRUMBS

    /**...........................................................................
     * IBreadCrumbElems
     * ...........................................................................
     * Elements for the Breacrumb navigation header
     * ...........................................................................
     */
    export interface IBreadCrumElems extends KIP.IDrawableElements{
        breadcrumbs: HTMLElement;
    }

    /**...........................................................................
     * @class   BreadCrumbsHeader
     * ...........................................................................
     * @version 1.0.0
     * @author  Kip Price
     * ...........................................................................
     */
    export class BreadCrumbsHeader<T extends string> extends NavigationHeader<T> {

        //#region PROPERTIES
        protected _elems: IBreadCrumElems;

        protected static _uncoloredStyles: KIP.Styles.IStandardStyles = {
            ".breadcrumbsContainer": {
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                backgroundColor: "<0>",
                color: "<1>",
                boxShadow: "0 2px 4px 2px rgba(0,0,0,.2)",
                zIndex: "10",
                paddingLeft: "10px",

                nested: {
                    ".breadcrumbs" : {
                        display: "flex",

                        nested: {

                            ".crumb": {
                                marginRight: "10px",
                                cursor: "pointer",
                                textDecoration: "underline",
                            },

                            ".divot" : {
                                marginRight: "10px",
                                cursor: "default"
                            }
                        }
                    }
                }
            }
        }
        //#endregion

        /**...........................................................................
         * _createElements
         * ...........................................................................
         * create elements for the navigation heder
         * ...........................................................................
         */
        protected _createElements(): void {
            this._elems = {} as any;
            this._elems.base = KIP.createElement({ cls: "breadcrumbsContainer" });
            this._elems.breadcrumbs = KIP.createElement({ cls: "breadcrumbs", parent: this._elems.base });
        }

        /**...........................................................................
         * update
         * ...........................................................................
         * @param   navigationPath  The path we have navigated to
         * @param   addlData        Any additional data that should be passed along to other elems
         * ...........................................................................
         */
        public update(navigationPath: string, addlData: any): void {

            // determine the delimiter being used
            let regexResults: RegExpExecArray = /([\/\\-_])/.exec(navigationPath);
            let delim:string = regexResults? regexResults[1] : "";

            let pathCrumbs: string[] = navigationPath.split(/[\/\\-_]/g);

            // clear the current set of breadcrumbs
            this._elems.breadcrumbs.innerHTML = "";

            // loop through the path elements and make separate breadcrumbs
            for (let idx = 0; idx < pathCrumbs.length; idx += 1) {
                if (idx !== 0) {
                    let divot: HTMLElement = KIP.createElement({ cls: "divot", content: ">", parent: this._elems.breadcrumbs });
                }

                let crumb: string = pathCrumbs[idx]; 

                // create the actual crumb element
                let crumbElem: HTMLElement = KIP.createElement({ 
                    cls: "crumb", 
                    content: crumb, 
                    parent: this._elems.breadcrumbs,
                    eventListeners: {

                        // make sure clicking on the crumb takes you to the nav path
                        click: () => {
                            let path: T = pathCrumbs.slice(0, idx + 1).join(delim) as T;
                            this._navigator.navigateTo(path, null, addlData);
                        }
                    }
                 });
            }
        }
    }
    //#endregion
}