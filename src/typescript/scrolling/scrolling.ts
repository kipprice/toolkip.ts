namespace KIP {

	//..........................................
	//#region CONSTANTS
	
	/** how frequently we should loop in order to calculate the new scroll position */
	const LOOP_INTERVAL: number = 20;

	/** number of steps we should use in scrolling */
	const NUM_STEPS: number = 100;
	
	//#endregion
	//..........................................

	/**---------------------------------------------------------------------------
	 * scrollTo
	 * ---------------------------------------------------------------------------
	 * animate a scroll to a particular element
	 * @param 	elem  	the element to scroll to
	 * @param 	toTop 	if true, ensures that the top of the element is at the top 
	 * 					of the screen
	 * --------------------------------------------------------------------------
	 */
	export function scrollTo(elem: HTMLElement, targetPosition?: number): void {

		// figure out how far we need to scroll
		let top: number = _calculateScrollTarget(elem, targetPosition);

		// now adjust by the amount we've scrolled thus far
		let curAmt: number = _calculateAmtToScroll(top);
		let isNegative: boolean = (curAmt < 0);

		// calculate what a step looks like in this state
		let stepAmt: number = curAmt / (NUM_STEPS * NUM_STEPS);

		// We're going to emulate an exponential curve by
		//	1. picking an arbitrary number of steps
		//	2. pick an arbitrary distance to move
		//	3. once we hit halfway, reverse
		//	4. decelerate to find the right point
		window.setTimeout(() => {
			_loop(top, curAmt, 0, isNegative, stepAmt);
		}, LOOP_INTERVAL);

	}

	/**--------------------------------------------------------------------------
	 * _calculateScrollTarget
	 * --------------------------------------------------------------------------
	 * figure out where we should be targeting as the top of the scroll 
	 * 
	 * @param	elem	The element to calculate the distance for
	 * @param	toTop	If true, scrolls to the top of the page
	 * 
	 * @returns	The Y value that should be scrolled to
	 * --------------------------------------------------------------------------
	 */
	function _calculateScrollTarget(elem: HTMLElement, targetPosition?: number): number {
		// grab the current offset of the top
		let top: number = elem.offsetTop;

		// if we didn't define a target, set it so the element will just be onscreen
		if (KIP.isNullOrUndefined(targetPosition)) {
			if (elem.offsetHeight < window.innerHeight) {
				targetPosition = (window.innerHeight - elem.offsetHeight);
			} else {
				targetPosition = 0;
			}
		}

		// adjust the value by the appropriate targetPosition
		top -= targetPosition;
		return top;
	}

	/**--------------------------------------------------------------------------
	 * _loop
	 * --------------------------------------------------------------------------
	 * estimate an exponential curve to emulate a smooth scrolling experience 
	 * 
	 * @param	top			The current position of the top of the page
	 * @param	totalAmt	The total amount we need to scroll
	 * @param	iteration	How many times we've looped
	 * @param	isNegative	True if we should scroll up
	 * @param	stepAmt		How much we should scroll per iteration
	 * @param	half		True if we have passed the halfway mark
	 * --------------------------------------------------------------------------
	 */
	function _loop(top: number, totalAmt: number, iteration: number, isNegative: boolean, stepAmt: number, half?: number): void {
		let CLOSE_ENOUGH: number = 1
		// Increment our counter & calculate how much space we have left
		let curAmt: number = _calculateAmtToScroll(top);
		iteration += 1;

		// verify that we haven't gone too far
		let wentTooFar: boolean;
		if (isNegative) {
			wentTooFar = (curAmt >= (-1 * CLOSE_ENOUGH));
		} else {
			wentTooFar = (curAmt <= CLOSE_ENOUGH)
		}

		// check if we still haven't moved, as that's a pretty good sign that we can't or won't
		let canMove: boolean;
		canMove = !((iteration !== 1) && (curAmt === totalAmt));
		// TODO: make this work

		// If we've either exceed our target, or we've hit the # of steps, quit
		if (wentTooFar || (iteration === NUM_STEPS)) { return; }

		// Figure out if we are accelerating or decelerating, based on whether we are halfway yet
		let dy: number;
		if ((curAmt / totalAmt) > (1 / 2)) {
			dy = iteration;
		} else {
			if (!half) { half = iteration; }
			dy = ((half * 2) - iteration);
		}

		// Calculate how much we should move this time
		dy = stepAmt * (dy * dy);

		// if we're in the 2nd half and we're moving fractions of pixels, might as well quit early
		if ((Math.floor(dy) === 0) && half) {
			window.scrollBy({ top: curAmt });
			return;
		}

		window.scrollBy(0, dy);
		window.setTimeout(() => {
			_loop(top, totalAmt, iteration, isNegative, stepAmt, half);
		}, LOOP_INTERVAL);
	}

	/**--------------------------------------------------------------------------
	 * _calculateAmtToScroll
	 * --------------------------------------------------------------------------
	 * calculate how much distance is remaining to close in the scrolling pattern
	 * 
	 * @param	top		The top value for the element we are scrolling to
	 * 
	 * @returns	How much distance there is between the current position and the target
	 * --------------------------------------------------------------------------
	 */
	function _calculateAmtToScroll(target: number): number {
		let scrollPosition: IPoint = getScrollPosition();
		let curAmt: number = target - scrollPosition.y;
		return curAmt;
	}


}