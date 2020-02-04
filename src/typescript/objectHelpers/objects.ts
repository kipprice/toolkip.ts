namespace KIP {

  //#region INTERFACES AND CONSTANTS
  export enum SortOrderEnum {
    INCORRECT_ORDER = 1,
    SAME = 0,
    CORRECT_ORDER = -1 
  }
  
  export interface IKeyValPair<T> {
    key?: string;
    val?: T;
  }

  export type IMappedType<T> = {
    [K in keyof T]?: T[K];
  }

 //..........................................
 //#region SELECT OPTIONS
 
  export type ISelectOptions = INumericSelectOptions | IStringSelectOptions;

  export interface INumericSelectOptions {
    [value: number]: string;
  }

  export interface IStringSelectOptions {
    [value: string]: string;
  }
 
 //#endregion
 //..........................................

  /**
   * IConstructor
   * ----------------------------------------------------------------------------
   * Generic tracker of a constructor function
   */
  export interface IConstructor<T> {
    new(...addlArgs: any[]): T;
  }
  
  /**
   * IToggleBtnOptions
   * ----------------------------------------------------------------------------
   * Keep track of options for toggle buttons
   */
  export interface IToggleBtnOption<T> {
    label: string;
    value: T;
    imageURL?: string;
  }

  /**
   * IDictionary
   * ----------------------------------------------------------------------------
   * generic interface for key value pairs
   */
  export type IDictionary<T, K extends string = string> = {
    [key in K]: T;
  }

  export type INumericDictionary<T, K extends number = number> = {
    [key in K]: T;
  }


  /**
	 * IMapFunction
	 * ----------------------------------------------------------------------------
	 * allow for map function, similar to Array.map 
	 */
	export interface IMapFunction<T,R> {
		(elem: T, key: string | number | keyof any, idx: number) : R;
	}

	/**
	 * IQuitConditionFunction
	 * ----------------------------------------------------------------------------
	 * Determine whether we should stop looping over code
	 */
	export interface IQuitConditionFunction {
		() : boolean;
	}
  //#endregion

  //#region HELPER FUNCTIONS

  /**
   * map
   * ----------------------------------------------------------------------------
   * Loop through all keys in an object or array and perform an action on each 
   * element. Similar to Array.map.
   * 
   * @param   object      The object to loop through
   * @param   callback    What to do with each element
   * @param   shouldQuit  Function to evaluate whether we are done looping
   */
  export function map<T = any>(object: any, callback: IMapFunction<any, T>, shouldQuit?: IQuitConditionFunction): T[] {
    let out: T[] = [];
    if (!object) { return out; }

    // Use the default map function if available
    if (object.map) {
      let done: boolean;
      object.map((value: any, key: any, arr: any) => {
          if (done) { return; }

          let result = callback(value, key, arr);
          out.push(result);

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

          let result = callback(object[key], key, cnt);
          if (result) { out.push(result); }

          cnt += 1;

          // if we have a quit condition, test it & quit if appropriate
          if (!shouldQuit) { continue; }
          if (shouldQuit()) { break; }
        }
      }

    }

    return out;
  }

  /**
   * getNextKey
   * ----------------------------------------------------------------------------
   * Grab the next keyed element in an object. This is terribly un-performant in
   * all but the first key case.
   * 
   * @param   object    The object to get the key from
   * @param   lastKey   If provided, the key before the key we're looking for
   * 
   * @returns The next key for this element
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

  /**
   * keyCount
   * ----------------------------------------------------------------------------
   * Count & return how many keys exist in the specified object
   */
  export function keyCount(object: any): number {
    let cnt: number = 0;
    map(object, () => {
      cnt += 1;
    });
    return cnt;
  }

  /**
   * isEmptyObject
   * ----------------------------------------------------------------------------
   * Checks if the specified object doesn't have any keys
   * @returns True if no unique keys are on this object
   */
  export function isEmptyObject(object: any): boolean {
    return (!getNextKey(object));
  }
  //#endregion

  /**
   * combineObjects
   * ----------------------------------------------------------------------------
   * Take two separate objects and combine them into one
   * 
   * @param   objA    First object to combine
   * @param   objB    Second object to combine; will override A in cases of conflict
   * @param   deep    True if this should be recursive
   * 
   * @returns The combined object
   */
  export function combineObjects(objA: any, objB: any, deep?: boolean): any {
    let ret: {};
    let tmp: any;
    let loopThru: Function;
    ret = objA || {};

    // Write the array copies for B
    //if (objA) { _loopThru(objA, ret, deep); }
    if (objB) { _loopThru(objB, ret, deep); }

    // Return the appropriate output array
    return ret;
  }

  /**
   * _loopThru
   * ----------------------------------------------------------------------------
   * Combine an object into an output array
   * 
   * @param   objToCombine  The object to merge into the output
   * @param   outputObj     The object to output
   * @param   deep          True if we should recurse on this object
   * 
   * @returns The merged object
   */
  function _loopThru(objToCombine: any, outputObj: any, deep?: boolean): any {

    if (!objToCombine) { return outputObj; }

    if (objToCombine.__proto__) { outputObj.__proto__ = Object.create(objToCombine.__proto__); }

    // Loop thru each key in the array
    map(objToCombine, (value: any, key: string) => {

      // skip any values that aren't set
      if (isNullOrUndefined(value)) {
        return;
      }

      // If doing a deep copy, make sure we recurse
      if (deep && (typeof (value) === "object")) {
        let tmp: any = outputObj[key];

        // if there's nothing to merge, just take the existing object
        if (!tmp) { 
          outputObj[key] = value;
          return; 
        }

        tmp = combineObjects(tmp, value, deep);
        outputObj[key] = tmp;

      // Otherwise copy directly
      } else {
        outputObj[key] = value;
      }
      
    });
  }

  /**
   * reconcileOptions
   * ----------------------------------------------------------------------------
   * Takes in two different option objects & reconciles the options between them
   * 
   * @param   options    The user-defined set of option
   * @param   defaults   The default options
   * 
   * @returns The reconciled option list
   */
  export function reconcileOptions<T extends IDictionary<any>>(options: T, defaults: T): T {
    let key: keyof T;
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

  /**
   * isNullOrUndefined
   * ----------------------------------------------------------------------------
   * Determine whether the data passed in has value
   * 
   * @param   value   The value to check for null / undefined
   * 
   * @returns True if the value is null or undefined
   */
  export function isNullOrUndefined (value: any, strCheck?: boolean) : boolean {
    if (value === undefined) { return true; }
    if (value === null) { return true; }
    if (strCheck && value === "") { return true; }
    return false;
  }

  /**
   * stringify
   * ----------------------------------------------------------------------------
   * turn a JSON object into a string version
   */
  export function stringify(obj: any, asHtml: boolean, prefix?: string): string {
    let out: string[] = [];
    let newLineChar = asHtml ? "<br>" : "\n";
    let tabChar = asHtml ? "&nbsp;&nbsp;&nbsp;&nbsp;" : "\t";
    if (!prefix) { prefix = ""; }

    map(obj, (value: any, key: string) => {
      let valStr: string;
      switch (typeof value) {

        case "string":
          valStr = value;
          break;

        case "number":
        case "boolean":
          valStr = value.toString();
          break;

        default:
          if (!value) { 
            valStr = value as string;
            break;
          }

          if (value.hasOwnProperty("toString")) {
             valStr = newLineChar + value.toString();
          } else {
            valStr = newLineChar + stringify(value, asHtml, tabChar);
          }
      }

      out.push(_format(prefix + key, valStr, asHtml));
    })

    return out.join("");
  }

  /**
   * _format
   * ----------------------------------------------------------------------------
   * format a particular property appropriately
   */
  function _format(key: string, value: string, asHtml: boolean): string {
    if (asHtml) { return _formatPropertyAsHTML(key, value); }
    return _formatPropertyAsPlainText(key, value);
  }

  /**
   * _formatPropertyAsHTML
   * ----------------------------------------------------------------------------
   * show a property as HTML
   */
  function _formatPropertyAsHTML(key: string, value: string): string {
    return format(
      "<b>{0}</b>: {1}{2}",
      key,
      value,
      "<br>"
    );
  }

  /**
   * _formatPropertyAsPlainText
   * ----------------------------------------------------------------------------
   * show a JSON property as string
   */
  function _formatPropertyAsPlainText(key: string, value: string): string {
    return format(
      "{0}: {1}\n",
      key,
      value
    );
  }

}