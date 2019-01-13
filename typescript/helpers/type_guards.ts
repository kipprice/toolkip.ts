///<reference path="trig.ts" />

namespace KIP {

  /** check if the element is an HTML element */
  export function isHTMLElement (test: any) : test is HTMLElement {
    if (!test) { return false; }
    if (isDrawable(test)) { return false; }
    return (!!(test as HTMLElement).appendChild);
  }

  /** Check if the element is a string */
  export function isString (test: any) : test is string {
    return (typeof test === "string");
  }

  /** check if the element is a number */
  export function isNumber (test: any) : test is number {
    return (typeof test === "number");
  }

  /** check if the element is a boolean */
  export function isBoolean (test: any) : test is boolean {
    return (typeof test === "boolean");
  }

  /** check if the element is a function */
  export function isFunction (test: any): test is Function {
    return (typeof test === "function");
  }

  /** check if the element is a client rectangle */
  export function isClientRect (test: any) : test is ClientRect {
    let rect: ClientRect = {
      top: 1,
      bottom: 1,
      left: 1,
      right: 1,
      height: 1,
      width: 1,
    }

    if (isInterface<ClientRect>(test, rect)) { return true; }
    return false;
  };

  /** check if the element is a SVG rectangle */
  export function isSVGRect (test: any) : test is SVGRect {
    let rect: SVGRect = {
      x: 1,
      y: 1,
      width: 1,
      height: 1
    } as any as SVGRect;

    if (isInterface<SVGRect>(test, rect)) { return true; }
    return false;
  }

  /** check if the element is a basic rectangle */
  export function isIBasicRect (test: any) : test is IBasicRect {
    let rect: IBasicRect = {
      x: 1,
      y: 1,
      w: 1,
      h: 1
    };

    if (isInterface<IBasicRect>(test, rect)) { return true; }
    return false;
  }

  export function isIPoint (test: any) : test is IPoint {
    let pt: IPoint = {
      x: 1,
      y: 1,
      z: 0
    };

    return isInterface<IPoint>(test, pt);
  }

  /** check if the element is an element definition implementation */
  export function isIElemDefinition (test: any) : test is IElemDefinition {
    let out: boolean;
    let comp: IElemDefinition = {
      after_content: "",
      attr: null,
      before_content: "",
      children: null,
      cls: "",
      content: "",
      id: "",
      parent: null,
      type: ""
    }

    if (isInterface<IElemDefinition> (test, comp)) { return true; }
    return false;

  }

  /** check if the element is an IExtrema implementation */
  export function isIExtrema (test?: any) : test is IExtrema {
    let extrema: IExtrema = {
      min: {x: 0, y: 0},
      max: {x: 0, y: 0}
    }

    return isInterface<IExtrema>(test, extrema);
  }

  /** generic function to check if a given object implements a particular interface */
  export function isInterface<T extends Object> (test: any, full_imp: T) : test is T {

    // Loop through all of the properties of the full interface implementation & make sure at least one required elem is populated in the test
    let prop: string;
    let req_match: boolean = true;
    let val: string;

    for (prop in full_imp) {
      if (full_imp.hasOwnProperty(prop)) {
        val = full_imp[prop];

        if (val && ((test as T)[prop] === undefined)) {
          req_match = false;
          break;
        }
      }
    }

    if (!req_match) { return false; }

    // Now loop through all properties on the test to make sure there aren't extra props
    let has_extra: boolean = false;
    for (prop in test) {
      if (test.hasOwnProperty(prop)) {
        if (full_imp[prop] === undefined) {
          has_extra = true;
          break;
        }
      }
    }

    return (!has_extra);
  }

  /** check if the element implements the Editable class */
  export function isEditable<T> (test: any) : test is Editable<T> {
  	return isNamedClass<Editable<T>>(test, "Editable");
  }

  /** check if the element implements the drawable class */
  export function isDrawable (test: any) : test is Drawable {
    return isNamedClass<Drawable>(test, "Drawable");
  }

  /** check if the element is one that can be used as a drawable base */
  export function isDrawableElement (test: any) : test is DrawableElement {
    return (!!(test.appendChild));
  }

  /** generic function to check if an element has a particular class name in its inheritance tree */
  export function isNamedClass<T extends NamedClass> (test: any, name: string) : test is T {
  	if (!name) { return false; }
  	let test_name: string;
  	test_name = (test as T).paddedClassName;
  	if (!test_name) { return false; }
   	return (test_name.indexOf(name) !== -1);
  }

  /**
   * isUpdatable
   * 
   * Determine if this object has an update method
   * @param test 
   */
  export function isUpdatable (test: any): test is IUpdatable {
    if (!test) { return; }
    return !!((test as any).update);
  }

  /**...........................................................................
   * isArray
   * ...........................................................................
   * Check if some data is an array
   * @param   test  The data to check
   * @returns True (with type safety) if the data is an array
   * ........................................................................... 
   */
  export function isArray(test: any): test is Array<any> {
    return (test instanceof Array);
  }

  /**...........................................................................
   * isObject
   * ...........................................................................
   * Checks if some data is a complex object
   * @param   test  The data to check
   * @returns True (with type safety) if the data is an object
   * ........................................................................... 
   */
  export function isObject (test: any): test is Object {
    return (typeof test === typeof {});
  }

  export interface ISelectable {
    select(): void;
  }
  
  export function isSelectable (test: any): test is ISelectable {
    return !!(test as HTMLInputElement).select;
  }

}