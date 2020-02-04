namespace KIP {

	export class HashMap<T> implements Iterable<T> {

		//.....................
		//#region PROPERTIES
		
		public [Symbol.iterator](): Iterator<T> {
			
			const iterator: Iterator<T> = {
				next(): IteratorResult<T> {
					return null;
				}
			}
			return iterator;
		}

		/** keep track of all of the elements */
		protected _data: IDictionary<T[]>;

		/** keep track of the total number of elements */
		protected _length: number;
		
		//#endregion
		//.....................

		//...................................................
		//#region CREATE THE MAP
		
		
		
		//#endregion
		//...................................................

		//...................................................
		//#region ADD ELEMENTS
		
		
		
		//#endregion
		//...................................................

		//...................................................
		//#region REMOVE ELEMENTS
		
		
		
		//#endregion
		//...................................................

		//...................................................
		//#region FIND ELEMENTS
		
		
		
		//#endregion
		//...................................................
	}
}