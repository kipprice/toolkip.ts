namespace KIP {

    export var IS_DEBUG: boolean = false;

    /**...........................................................................
     * printObject
     * ...........................................................................
     * @param obj 
     * ...........................................................................
     */
    export function printObject(obj: any): void {
        let str: string = getObjectString(obj);
        console.log(str);
    }

    /**...........................................................................
     * getObjectString
     * ...........................................................................
     * 
     * @param   obj         The object to print
     * @param   prefix      The current prefix to use for this layer
     * 
     * @returns The created string
     * ...........................................................................
     */
    export function getObjectString(obj: any, prefix?: string): string {
        if (!prefix) { prefix = ""; }

        if ((typeof obj === "string") ||
            (typeof obj === "number") ||
            (typeof obj === "boolean") ||
            (obj instanceof Date) ||
            (obj instanceof Function))
        { 
            return obj.toString(); 
        }

        let outputStr: string = "";
        outputStr += prefix + "{";
        map(
            obj, 
            (elem: any, key: string) => {
                outputStr += "\n  " + prefix + key + " : " + getObjectString(elem, prefix + "  ");
            }
        );
        outputStr += "\n" + prefix + "}\n";

        return outputStr;
    }

    /**...........................................................................
     * printCallStack
     * ...........................................................................
     * Print out the current callstack
     * ...........................................................................
     */
    export function printCallStack(): void {
        console.log(new Error().stack);
    }
}