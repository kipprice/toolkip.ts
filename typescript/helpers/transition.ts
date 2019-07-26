///<reference path="promise.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class	TransitionController
     * ----------------------------------------------------------------------------
     * keep track of the transitions that have been performed & manage generating
     * new ones
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    class _TransitionController {

        //.....................
        //#region PROPERTIES
        
        /** the last identifier we used for a generated class */
        protected _lastClsId: number = 0;

        /** all classes that we've already generated; key is the string version of the class, value is the class ID */
        protected _generatedClasses: KIP.IDictionary<string, string> = {};

        /** element in which these transitional classes will be added */
        protected _styleElem: HTMLStyleElement;
        
        //#endregion
        //.....................

        //..........................................
        //#region PUBLIC METHODS
        
        /**
         * transition
         * ----------------------------------------------------------------------------
         * add a transitionary class to the specified element
         * 
         * @param   details     object containing details about the transition to be 
         *                      performed
         * 
         * @returns     A promise that resolves once the transition is over
         */
        public async transition(details: ITransitionDetails): Promise<void> {
            if (!details.elem) { return Promise.reject("no element"); }
            if (!details.time) { return Promise.reject("no time"); }

            // get or generate the starting class
            let startName: string = this._getClass(details.start, details.elem);
        
            // get or generate the ending class
            if (!details.end.transition) { 
                details.end.transition = "all ease-in-out " + (details.time / 1000) + "s"; 
            }
            let endName: string = this._getClass(details.end, details.elem);

            // actually animate the transition
            await this._animate(details, startName, endName); 
        }

        /**
         * transitionProoerty
         * ----------------------------------------------------------------------------
         * TODO
         */
        protected transitionProperty (details: IPropertyTransition): Promise<void> {
            //TODO
            return Promise.reject("not implemented");
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region CLASS NAMING
        
        /**
         * _getClassName
         * ----------------------------------------------------------------------------
         * gets an existing class name if one exists for this style config; otherwise
         * creates a new generated class name
         * 
         * @param   classDef    the style that will be generated
         * 
         * @returns the existing class name or a new class name for this style
         */
        protected _getClass(classDef: ITransitionStyle, elem: HTMLElement): string {

            // get the absolute version of this class definition
            classDef = this._replacePlaceholders(classDef, elem);

            // turn the class into a string, to check it against our existing classes
            let strDef = JSON.stringify(classDef).replace(/ /g, "");

            // return the existing class if we have one that's a match
            if (this._generatedClasses[strDef]) { 
                return this._generatedClasses[strDef]; 
            }

            // otherwise, generate a new class
            let name = this._generateRandomClassName();
            this._generatedClasses[strDef] = name;
            this._createTransitionClass(name, classDef, elem);
            return name;
        }

        protected _generateRandomClassName (): string {
            this._lastClsId += 1;
            return "gencls" + this._lastClsId;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region CREATE TRANSITION CLASSES
        
        /**
         * _createTransitionClass
         * ---------------------------------------------------------------------------
         * Create a CSS class that will be one end of a transition
         * 
         * @param   className   Selector to use for the class
         * @param   classDef    Definition for the class
         * @param   elem        Element this class will be applied to
         * 
         * @returns The updated CSS class
         */
        protected _createTransitionClass(className: string, classDef: ITransitionStyle, elem: HTMLElement): void {

            // create our style element if it doesn't exist
            if (!this._styleElem) { this._createStyleElem(); }

            // generate the new contents for our style tag
            this._styleElem.innerHTML += Styles.generateContentForCSSClass("." + className, classDef, true);
        }

        /**
         * _replacePlaceholders
         * ----------------------------------------------------------------------------
         * ensure that we replace any placeholders accepted in transition classes with
         * the real measurement
         */
        protected _replacePlaceholders(classDef: ITransitionStyle, elem: HTMLElement): ITransitionStyle {
            map(classDef, (value: string, key: string) => {
                value = value.replace("<width>", (elem.offsetWidth + 1) + "px");
                value = value.replace("<height>", elem.offsetHeight + "px");
                value = value.replace("<left>", elem.offsetLeft + "px");
                value = value.replace("<top>", elem.offsetTop + "px");
                value = value.replace("<right>", (elem.offsetLeft + elem.offsetWidth) + "px");
                value = value.replace("<bottom>", (elem.offsetTop + elem.offsetHeight) + "px");
                classDef[key] = value;
            });

            return classDef;
        }

        /**
         * _createStyleElem
         * ----------------------------------------------------------------------------
         * creates a shared style tag for this class, so that we can continue to add
         * to it
         */
        protected _createStyleElem(): void {
            this._styleElem = Styles.createStyleElement(false); 
            document.head.appendChild(this._styleElem);
        }
        
        //#endregion
        //..........................................
        
        //..........................................
        //#region ACTUALLY ANIMATE
        
        /**
         * _animate
         * ----------------------------------------------------------------------------
         * add classes in the appropriate timeframe
         */
        protected async _animate(details: ITransitionDetails, startName: string, endName: string): Promise<void> {
            await nextRender();                     // ensure the class exists
            addClass(details.elem, startName);      // start by adding the start class
            await wait(details.delay || 0);         // wait for the delay to complete
            addClass(details.elem, endName);        // add the end class to start the transition
            await wait(details.time);               // wait for the transition to complete
            removeClass(details.elem, startName);   // remove the start class
            await nextRender();                     // and wait until the next frame
            
            // remove the end class after the caller has had time to apply the permanent state
            this._removeEndClass(details.elem, endName);                 
            return;
        }

        /**
         * _removeEndClass
         * ----------------------------------------------------------------------------
         * remove the end-state class
         */
        protected async _removeEndClass(elem: HTMLElement, endName: string): Promise<void> {
            await wait(10);
            removeClass(elem, endName);
        }
        
        //#endregion
        //..........................................
    
    }
    export const TransitionController = new _TransitionController();

    //..........................................
    //#region SHORTENED ACCESS
    
    /**
     * transition
     * ---------------------------------------------------------------------------
     * Transition an element to a particular style, then alert the caller that 
     * it has completed
     * 
     * @param   element     The element to transition
     * @param   startStyle  If needed, any specific new attributes that are needed for this object
     * @param   endStyle    The style we should end up with
     * @param   time        How long this transition should take
     * @param   delay       How long this transition should be delayed
     * 
     * @returns Promise that will be called after transition completes
     */
    export function transition (element: HTMLElement, startStyle: ITransitionStyle, endStyle: ITransitionStyle, time: number, delay?: number): Promise<void> {
        return TransitionController.transition({
            elem: element,
            start: startStyle,
            end: endStyle,
            time: time,
            delay: delay || 0
        });
        
    }
    
    //#endregion
    //..........................................

    //..........................................
    //#region TYPES AND INTERFACES
    
    export interface ITransitionStyle extends Styles.TypedClassDefinition {
        shouldRemove?: boolean;
    }
    
    interface IPropertyTransition {
        name: string;
        start: any;
        end: any;
        duration: number;
        delay?: number;
    }

    interface ITransitionDetails {
        elem: HTMLElement;
        start: ITransitionStyle;
        end: ITransitionStyle;
        time: number;
        delay: number;
    }

    //#endregion
    //..........................................

}