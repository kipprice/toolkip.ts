///<reference path="promise.ts" />

namespace KIP {

    var _lastClsID: number = 0;

    export interface ITransitionStyle extends Styles.TypedClassDefinition {
        shouldRemove?: boolean;
    }

    /**...........................................................................
     * transition
     * ...........................................................................
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
     * ...........................................................................
     */
    export function transition (element: HTMLElement, startStyle: ITransitionStyle, endStyle: ITransitionStyle, time: number, delay?: number): KipPromise {

        if (!element) { return KipPromise.reject("no element"); }

        let startName: string = _generateRandomClassName();
        _createTransitionClass(startName, startStyle, element);
        
        let endName: string = _generateRandomClassName();
        if (!endStyle.transition) { endStyle.transition = "all ease-in-out " + (time / 1000) + "s"; }
        _createTransitionClass(endName, endStyle, element);

        addClass(element, startName);

        return new KipPromise((resolve, reject) => {

            // handle the delay
            window.setTimeout(() => {

                // add the final class to start transitioning
                addClass(element, endName);

                // handle the duration
                window.setTimeout(() => {
                    removeClass(element, startName);

                    // resolve the promise at the next render
                    window.requestAnimationFrame(() => {
                        resolve("success");

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

    function transitionProperty (element: HTMLElement, propertyName: string, startValue: any, endValue: any, duration: number, delay?: number): KipPromise {
        //TODO
        return KipPromise.reject("not implemented");
    }

    //#region HELPER FUNCTIONS

    function _generateRandomClassName (): string {
        _lastClsID += 1;
        return "gencls" + _lastClsID;
    }

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

        return Styles.createClass("." + className, classDef);
    }

    //#endregion
}