///<reference path="promise.ts" />

namespace KIP {

    var _lastClsID: number = 0;

    export interface ITransitionStyle extends Styles.TypedClassDefinition {
        shouldRemove?: boolean;
    }

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
    export function transition (element: HTMLElement, startStyle: ITransitionStyle, endStyle: ITransitionStyle, time: number, delay?: number, ): Promise<void> {

        if (!element) { return Promise.reject("no element"); }

        // generate the starting class
        let startName: string = _generateRandomClassName();
        _createTransitionClass(startName, startStyle, element);
        
        // generate the ending class
        let endName: string = _generateRandomClassName();
        if (!endStyle.transition) { endStyle.transition = "all ease-in-out " + (time / 1000) + "s"; }
        _createTransitionClass(endName, endStyle, element);

        addClass(element, startName);

        return new Promise((resolve) => {

            // handle the delay
            window.setTimeout(() => {

                // add the final class to start transitioning
                addClass(element, endName);

                // handle the duration
                window.setTimeout(() => {
                    removeClass(element, startName);

                    // resolve the promise at the next render
                    window.requestAnimationFrame(() => {
                        resolve();

                        window.setTimeout(() => {
                            removeClass(element, endName);
                        }, 10);
                    });

                }, time);
            }, delay);
        });
    }

    interface IPropertyTransition {
        name: string;
        start: any;
        end: any;
        duration: number;
        delay?: number;
    }

    function transitionProperty (element: HTMLElement, propertyName: string, startValue: any, endValue: any, duration: number, delay?: number): Promise<void> {
        //TODO
        return Promise.reject("not implemented");
    }

    //#region HELPER FUNCTIONS

    function _generateRandomClassName (): string {
        _lastClsID += 1;
        return "gencls" + _lastClsID;
    }

    /** keep track of the style element used for generated classes */
    let styleElem: HTMLStyleElement;

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
    function _createTransitionClass(className: string, classDef: ITransitionStyle, elem: HTMLElement): HTMLStyleElement {

        // replace any transition specific terms
        map(classDef, (value: string, key: string) => {
            value = value.replace("<width>", (elem.offsetWidth + 1) + "px");
            value = value.replace("<height>", elem.offsetHeight + "px");
            value = value.replace("<left>", elem.offsetLeft + "px");
            value = value.replace("<top>", elem.offsetTop + "px");
            value = value.replace("<right>", (elem.offsetLeft + elem.offsetWidth) + "px");
            value = value.replace("<bottom>", (elem.offsetTop + elem.offsetHeight) + "px");
            classDef[key] = value;
        });

        // create our style element if it doesn't exist
        if (!styleElem) { 
            styleElem = Styles.createStyleElement(false); 
            document.head.appendChild(styleElem);
        }

        // generate the style element and add to our style element
        let tmpElem: HTMLStyleElement = Styles.createClass("." + className, classDef, true);
        styleElem.innerHTML += tmpElem.innerHTML;
        return tmpElem;
    }

    //#endregion
}