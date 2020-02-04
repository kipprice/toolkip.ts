namespace KIP {
	
    /**----------------------------------------------------------------------------
	 * @class	HistoryChain
	 * ----------------------------------------------------------------------------
	 * Keep track of internal history & allow moving forward and backward
	 * @author	Kip Price
	 * @version 1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class HistoryChain<T> {

		//.....................
        //#region PROPERTIES
        /** the first history event tracked */
        protected _start: HistoryNode<T>;
        
        /** the last history event tracked */
        protected _end: HistoryNode<T>;
        
        /** the current history node we are sitting on */
        protected _curNode: HistoryNode<T>;
		//#endregion
		//.....................

        /**
         * push
         * ----------------------------------------------------------------------------
         * Push a new value into our history chain
         * @param   data    The data to add
         */
		public push(data: T): void {
			let node: HistoryNode<T> = new HistoryNode<T>(data);

			// case 1: first node we're adding
			if (!this._start) {
				this._start = node;
				this._end = node;
				this._curNode = node;
				return;
            }

			// clear the forward history if we're adding new data
			if (this._curNode !== this._end) {
				this._clearToCurIdx();
			}

			// everything else will just add to the end
			this._end.next = node;
			node.previous = this._end;
			this._end = node;
			this._curNode = this._end;

		}

        /**
         * _clearToCurIdx
         * ----------------------------------------------------------------------------
         * Clear out all history events that happened after the current index
         */
		protected _clearToCurIdx(): void {
			this._end = this._curNode;
			this._curNode.next = null;
		}

        /**
         * navigateBack
         * ----------------------------------------------------------------------------
         * Move bakcwards in the history chain
         * @returns The state we're moving to
         */
		public navigateBack(): T {
			if (!this._curNode.previous) { return null; }
			
			window.setTimeout(() => {
				this._curNode = this._curNode.previous;
			}, 0);
			return this._curNode.previous.data;
			
		}

        /**
         * navigateForward
         * ----------------------------------------------------------------------------
         * Move forwards in the history chain
         * @returns The atate we're moving to
         */
		public navigateForward(): T {
			if (!this._curNode.next) { return null; }

			window.setTimeout(() => {
				this._curNode = this._curNode.next;
			}, 0);
			return this._curNode.next.data;
		}

		/**
		 * updateCurrentState
		 * ----------------------------------------------------------------------------
		 * Update our current history node to include a new aspect of state
		 * @param 	newState 	The state to update to
		 * @returns	True if the state was updated, false otherwise
		 */
		public updateCurrentState(newState: T): boolean {
			if (!this._curNode) { return false; }
			let curState: T = this._curNode.data;
			let combinedState: T = combineObjects(curState, newState, true);
			this._curNode.data = combinedState;
			return true;
		}
	}

	/**----------------------------------------------------------------------------
	 * @class	HistoryNode
	 * ----------------------------------------------------------------------------
	 * Keep track of a history event
	 * @author	Kip Price
	 * @version 1.0.1
	 * ----------------------------------------------------------------------------
	 */
	export class HistoryNode<T> {

		//.....................
        //#region PROPERTIES
		public data: T;
		public next: HistoryNode<T>;
        public previous: HistoryNode<T>;
		//#endregion
		//.....................

        /**
		 * HistoryNode<T>
		 * ----------------------------------------------------------------------------
         * Create the history node
         * @param   data    What to store in the node
         */
		constructor(data: T) {
			this.data = data;
		}
	}
}