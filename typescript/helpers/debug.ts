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
    export function getObjectString(obj: any, prefix?: string, isHtml?: boolean): string {
        if (!prefix) { prefix = ""; }

        if ((typeof obj === "string") ||
            (typeof obj === "number") ||
            (typeof obj === "boolean") ||
            (obj instanceof Date) ||
            (obj instanceof Function))
        { 
            return obj.toString(); 
        }

        let newLine = isHtml ? "<br>" : "\n";
        let tab = isHtml ? "&nbsp;&nbsp;&nbsp;&nbsp;" : "\t";

        let outputStr: string = "";
        outputStr += "{";
        map(
            obj, 
            (elem: any, key: string) => {
                outputStr += newLine + tab + prefix + key + " : " + getObjectString(elem, prefix + tab, isHtml);
            }
        );
        outputStr += newLine + prefix + "}\n";

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