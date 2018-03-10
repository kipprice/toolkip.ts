namespace KIP {

  //#region INTERFACES AND CONSTANTS

  export interface IKeyValPair<T> {
    key?: string;
    val?: T;
  }

  export type IMappedType<T> = {
    [K in keyof T]?: T[K];
  }

  export interface ISelectOptions {
    [value: number]: string;
  }
  
  /**...........................................................................
   * IToggleBtnOptions
   * ...........................................................................
   * Keep track of options for toggle buttons
   * ...........................................................................
   */
  export interface IToggleBtnOption<T> {
    label: string;
    value: T
  }

  /**...........................................................................
   * IDictionary
   * ...........................................................................
   * generic interface for key value pairs
   * ...........................................................................
   */
  export interface IDictionary {
    [key: string]: any;
  }

  /**...........................................................................
	 * IMapFunction
	 * ...........................................................................
	 * allow for map function, similar to Array.map 
	 * ...........................................................................
	 */
	export interface IMapFunction<T> {
		(elem: T, key: string | number, idx: number) : void;
	}

	/**...........................................................................
	 * IQuitConditionFunction
	 * ...........................................................................
	 * Determine whether we should stop looping over code
	 * ...........................................................................
	 */
	export interface IQuitConditionFunction {
		() : boolean;
	}
  //#endregion

  //#region HELPER FUNCTIONS

  /**...........................................................................
   * map
   * ...........................................................................
   * Loop through all keys in an object or array and perform an action on each 
   * element. Similar to Array.map.
   * 
   * @param   object      The object to loop through
   * @param   callback    What to do with each element
   * @param   shouldQuit  Function to evaluate whether we are done looping
   * ...........................................................................
   */
  export function map(object: any, callback: IMapFunction<any>, shouldQuit?: IQuitConditionFunction): void {
    if (!object) { return; }

    // Use the default map function if available
    if (object.map) {
      let done: boolean;
      object.map((value: any, key: any, arr: any) => {
          if (done) { return; }
          callback(value, key, arr);

          // if we have a quit condition, test it & quit if appropriate
          if (!shouldQuit) { return; }
          if (shouldQuit()) { done = true; }
        }
      );

    // Otherwise, do a standard object map
    } else {
      let cnt: number = 0;
      let key: string;

      // Do it safely with the appropriate checks
      for (key in object) {
        if (object.hasOwnProperty(key)) {
          callback(object[key], key, cnt);
          cnt += 1;

          // if we have a quit condition, test it & quit if appropriate
          if (!shouldQuit) { continue; }
          if (shouldQuit()) { break; }
        }
      }

    }
  }

  /**...........................................................................
   * getNextKey
   * ...........................................................................
   * Grab the next keyed element in an object. This is terribly un-performant in
   * all but the first key case.
   * 
   * @param   object    The object to get the key from
   * @param   lastKey   If provided, the key before the key we're looking for
   * 
   * @returns The next key for this element
   * ...........................................................................
   */
  export function getNextKey(object: any, lastKey?: string): string {
    let propName: string;
    let nextKey: boolean = (!lastKey);

    for (propName in object) {
      if (object.hasOwnProperty(propName)) {
        if (nextKey) { 
          return propName; 
        } else if (propName === lastKey) {
          nextKey = true;
        }
      }
    }

    return "";
  }

  //#endregion

  /**...........................................................................
   * removeElemFromArr
   * ...........................................................................
   * Finds & removes an element from the array if it exists.
   * 
   * @param   arr     The array to remove from
   * @param   elem    The element to remove
   * @param   equal   The function that is used to test for equality
   * ...........................................................................
   */
  export function removeElemFromArr<T>(arr: T[], elem: T, equal?: Function): T[] {
    let idx: number;
    let outArr: T[];
    // If we didn't get a function to test for equality, set it to the default
    if (!equal) {
      equal = function(a, b) { return (a === b); };
    }

    // Loop through the array and remove all equal elements
    for (idx = (arr.length - 1); idx >= 0; idx -= 1) {
      if (equal(arr[idx], elem)) {
        outArr = arr.splice(idx, 1);
      }
    }

    return outArr;
  };

  /**...........................................................................
   * combineObjects
   * ...........................................................................
   * Take two separate objects and combine them into one
   * 
   * @param   objA    First object to combine
   * @param   objB    Second object to combine
   * @param   deep    True if this should be recursive
   * 
   * @returns The combined object
   * ...........................................................................
   */
  export function combineObjects(objA: {}, objB: {}, deep?: boolean): {} {
    "use strict";
    let ret: {};
    let tmp: any;
    let loopThru: Function;
    ret = {};

    // Define a function that will pull in relevant details from
    loopThru = function(array, retArr) {
      let key: string;

      // Loop thru each key in the array
      for (key in array) {
        if (array.hasOwnProperty(key)) {

          // If doing a deep copy, make sure we recurse
          if (deep && (typeof (array[key]) === "object")) {
            tmp = {};
            tmp.prototype = Object.create(array[key].prototype);
            tmp = combineObjects(tmp, array[key]);
            retArr[key] = tmp;

            // Otherwise copy directly
          } else {
            retArr[key] = array[key];
          }
        }
      }
    }

    // Write the array copies for A & B
    loopThru(objA, ret);
    loopThru(objB, ret);

    // Return the appropriate output array
    return ret;
  }

  /**...........................................................................
   * reconcileOptions
   * ...........................................................................
   * Takes in two different option objects & reconciles the options between them
   * 
   * @param   options    The user-defined set of option
   * @param   defaults   The default options
   * 
   * @returns The reconciled option list
   * ...........................................................................
   */
  export function reconcileOptions<T extends IDictionary>(options: T, defaults: T): T {
    "use strict";
    let key: string;
    let opt: string;

    if (!options) { options = ({} as T) };

    for (key in defaults) {
      if (defaults.hasOwnProperty(key)) {

        opt = options[key];
        if ((opt === undefined) || (opt === null)) {
          options[key] = defaults[key];
        }
      }
    }

    return options;
  }

  /**...........................................................................
   * isNullOrUndefined
   * ...........................................................................
   * Determine whether the data passed in has value
   * 
   * @param   value   The value to check for null / undefined
   * 
   * @returns True if the value is null or undefined
   * ...........................................................................
   */
  export function isNullOrUndefined (value: any) : boolean {
    if (value === undefined) { return true; }
    if (value === null) { return true; }
    return false;
  }

}