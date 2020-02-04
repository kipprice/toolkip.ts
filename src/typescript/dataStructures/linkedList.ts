namespace KIP {

	/**---------------------------------------------------------------------------
	 * @class   LinkedList<T>
	 * ---------------------------------------------------------------------------
	 * generic storage for items as a linkeed list
	 * @author  Kip Price
	 * @version 1.0.0
	 * ---------------------------------------------------------------------------
	 */
	export class LinkedList<T> {

		//.....................
		//#region PROPERTIES
		
		/** track the first node in the list */
		protected _firstNode: LinkedNode<T>;

		/** track the last node in the list */
		protected _lastNode: LinkedNode<T>;

		/** keep track of the length of the list */
		protected _length: number;
		public get length(): number { return this._length; }
		
		//#endregion
		//.....................

		//...................................................
		//#region CREATE THE LINKED LIST
		
		public constructor() {
			this._length = 0;
		}
		
		//#endregion
		//...................................................

		//...................................................
		//#region ADD ELEMENTS
		
		/**
		 * add
		 * ---------------------------------------------------------------------------
		 * add an element to the end of the linked list
		 * 
		 * @param	data	The element to add
		 * 
		 * @returns	True if the element was added successfully
		 */
		public add(data: T): boolean {
			return this.insert(data, this._length);
		}

		/**
		 * insert
		 * ---------------------------------------------------------------------------
		 * add an element at the specified index
		 * 
		 * @param	data	The element to add
		 * @param	idx		The index at which to add the element
		 * 
		 * @returns	True if the element was added successfully
		 */
		public insert(data: T, idx: number): boolean {

			// validate that we'll be able to insert
			if (idx < 0) { return false; }
			if (idx > this._length) { return false; }

			// create the node
			let newNode = new LinkedNode<T>(data);

			// grab the adjacent nodes
			let nextNode: LinkedNode<T> = this._getNodeAtIdx(idx);
			let prevNode: LinkedNode<T> = this._getNodeAtIdx(idx - 1);

			// if there's a node after this element, update the pointers
			if (nextNode) {
				nextNode.previous = newNode;
				newNode.next = nextNode;
				
			// otherwise, this must be the new last node
			} else {
				this._lastNode = newNode;
			}

			// if there's a node before this element, update the pointers
			if (prevNode) {
				prevNode.next = newNode;
				newNode.previous = prevNode;
			
			// otherwise, this must be the new first node
			} else {
				this._firstNode = newNode;
			}

			// increment the number of elements in this list
			this._length += 1;
		}

		//#endregion
		//...................................................

		//...................................................
		//#region REMOVE ELEMENTS

		/**
		 * remove
		 * ---------------------------------------------------------------------------
		 * remove the element at the specified index
		 * 
		 * @param	idx		The index to remove from
		 * 
		 * @returns	The data contained at that index
		 */
		public remove(idx: number): T {
			let node = this._getNodeAtIdx(idx);
			if (!node) { return null; }

			if (node.previous) { node.previous.next = node.next; }
			if (node.next) { node.next.previous = node.previous; }

			if (this._lastNode === node) { this._lastNode = node.previous; }
			if (this._firstNode === node) { this._firstNode = node.next; }
		
			// update the total number of elements
			this._length -= 1;

			// return the data that was in the node
			return node.data;
		}

		/**
		 * findAndRemove
		 * ---------------------------------------------------------------------------
		 * description
		 */
		public findAndRemove(val: T): boolean {
			let idx =  this.getIndex(val);
			if (idx === -1) { return false; }
			return !!this.remove(idx);
		}
		
		//#endregion
		//...................................................

		//...................................................
		//#region GET ELEMENTS
		
		public get(idx: number): T {
			let node = this._getNodeAtIdx(idx);
			if (!node) { return null; }
			return node.data;
		}

		public getIndex(val: T): number {
			let cnt: number = 0;
			let curNode = this._firstNode;

			while (curNode) {

				if (this._isEqual(val, curNode.data)) { 
					return cnt
				}

				curNode = curNode.next;
				cnt += 1;
			}

			return null;
		}

		public contains(val: T): boolean {
			let idx = this.getIndex(val);
			if (idx === -1) { return false; }
			return true;
		}

		protected _getNodeAtIdx(idx: number): LinkedNode<T> {

			// validate that we have a valid input
			if (idx < 0) { return null; }
			if (idx >= this._length) { return null; }
			
			// search from the end of the list that will be closer to the node
			if (idx < this._length / 2) { 
				return this._getNodeAtIdxForward(idx); 
			} else { 
				return this._getNodeAtIdxBackward(idx); 
			}
			
		}

		protected _isEqual(a: T, b: T): boolean {
			if (isEquatable(a) && isEquatable(b)) {
				return (a.equals(b));
			}
			return (a === b);
		}

		protected _getNodeAtIdxForward(idx: number): LinkedNode<T> {
			// loop through until we've hit the node at the specified index
			let curNode = this._firstNode;
			for (let count = 0; count < idx; count += 1) {
				curNode = curNode.next;
			}
			return curNode;
		}

		protected _getNodeAtIdxBackward(idx: number): LinkedNode<T> {
			let curNode = this._lastNode;
			for (let count = this._length - 1; count > idx; count -= 1) {
				curNode = curNode.previous;
			}
			return curNode;
		}
		
		//#endregion
		//...................................................
	}

	export class LinkedNode<T> {

		//.....................
		//#region PROPERTIES
		
		/** track the data associated in this node */
		protected _data: T;
		public get data(): T { return this._data; }
		public set data(data: T) { this._data = data; }
		
		/** keep track of the next node in sequence */
		protected _next: LinkedNode<T>;
		public get next(): LinkedNode<T> { return this._next; }
		public set next(data: LinkedNode<T>) { this._next = data; }

		/** keep track of the previous node in sequence */
		protected _previous: LinkedNode<T>;
		public get previous(): LinkedNode<T> { return this._previous; }
		public set previous(data: LinkedNode<T>) { this._previous = data; }
		
		//#endregion
		//.....................

		//...................................................
		//#region CREATE THE NODE
		
		public constructor(data: T) {
			this._data = data;
			this._previous = null;
			this._next = null;
		}
		
		//#endregion
		//...................................................
	}
}