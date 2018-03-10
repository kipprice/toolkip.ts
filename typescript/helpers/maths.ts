namespace KIP {

    /**...........................................................................
     * _normalizeValue
     * ...........................................................................
     * make sure a value is not past the relevant extrema 
     * 
     * @param	val		The value to normalize
     * @param	min     The minimum this value can be
     * @param   max     The maximum this value can be
     * 
     * @returns The normalized value
     * ...........................................................................
     */
    export function normalizeValue (val: number, min?: number, max?: number) : number {
        if (val < min) { val = min; }
        if (val > max) { val = max; }
        return val;
    }

    /**...........................................................................
     * boundedRandomNumber
     * ...........................................................................
     * Find a random number between two values
     * 
     * @param   max             The maximum value accepted
     * @param   min             The minimun value accepted. Defaults to 0
     * @param   isExclusive     True if we should exclude the max/min values
     * 
     * @returns A random number fitting these parameters
     * ...........................................................................
     */
    export function boundedRandomNumber(max: number, min?: number, isExclusive?: boolean): number {
        if (!min) { min = 0; }

        // make sure we can handle the inclusivity
        if (isExclusive) { min += 1; }
        else { max += 1; }

        return min + (Math.floor(Math.random() * (max - min)));
    }

    /**...........................................................................
     * roundToPlace
     * ...........................................................................
     * Helper function to round a number to a particular place
     * 
     * @param   num     The number to round
     * @param   place   A multiple of 10 that indicates the decimal place to round 
     *                  to. I.e., passing in 100 would round to the hundredths 
     *                  place
     * 
     * @returns The rounded number
     * ...........................................................................
     */
    export function roundToPlace(num: number, place: number): number {
        return (Math.round(num * place) / place);
    };
}