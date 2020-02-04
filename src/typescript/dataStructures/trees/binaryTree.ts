/// <reference path="./tree.ts" />

namespace KIP {

	/**----------------------------------------------------------------------------
	 * @class	BinaryTree
	 * ----------------------------------------------------------------------------
	 * Create a version of a binary tree that can be very unbalanced, but will be
	 * a binary tree (all left nodes are less than the parent node; all right nodes
	 * are greater than the parent node)
	 * @author	Kip Price
	 * @version	1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class BinaryTree<T extends Comparable> extends Tree<T> {
		//.....................
		//#region PROPERTIES
		
		protected _subTrees: KIP.IDictionary<BinaryTree<T>, ISubTrees>;

		protected _parent: BinaryTree<T>;

		protected _count: number;
		
		//#endregion
		//.....................

		public constructor(data: T) {
			super(data);
			this._count = 1;
		}

		//..........................................
		//#region ADDING NEW NODES
		
		public add(value: T): void {
			let compareResult = this._compare(value);

			switch (compareResult) {

				case CompareResult.EQUAL:
					this._count += 1;
					break;

				case CompareResult.LESS_THAN:
					this._addToSubTree("left", value);
					break;

				case CompareResult.GREATER_THAN:
					this._addToSubTree("right", value);
					break;

			}
		}

		protected _addToSubTree(type: ISubTrees, value: T): void {
			if (!this._subTrees[type]) {
				this._subTrees[type] = this._createSubTree(value);
				this._subTrees[type]._parent = this;
			}

			this._subTrees[type].add(value);
		}
		
		//#endregion
		//..........................................

		//..........................................
		//#region REMOVING NODES
		
		public remove(value: T): void {
			let compareResult = this._compare(value);

			switch (compareResult) {
				case CompareResult.EQUAL:
					this._removeMe();
					break;

				case CompareResult.LESS_THAN:
					this._removeFromSubTree("left", value);
					break;

				case CompareResult.GREATER_THAN:
					this._removeFromSubTree("right", value);
					break;
			}
		}

		protected _removeMe(): void {
			let sideOfParent = this._getRelationToParent();
			if (!sideOfParent) { return this._removeMeAsTopNode(); }

			// there is likely a better way to do this, but because 
			// we already know that the add function works as appropriate, 
			// it's probably fine to just readd the children of this node
			delete this._parent[sideOfParent];

			// TODO: finish
		}

		protected _removeMeAsTopNode(): void {

		}

		protected _removeFromSubTree(type: ISubTrees, value: T): void {
			if (!this._subTrees[type]) { return; }
			this._subTrees[type].remove(value);
		}
		
		//#endregion
		//..........................................
		//..........................................
		//#region EXISTENCE CHECKS
		
		public exists(value: T): boolean {
			let compareResult = this._compare(value);

			switch (compareResult) {
				case CompareResult.EQUAL:
					return true;

				case CompareResult.LESS_THAN:
					return this._checkSubTreeExists("left", value);

				case CompareResult.GREATER_THAN:
					return this._checkSubTreeExists("right", value);

				default:
					return false;
			}
		}

		protected _checkSubTreeExists(type: ISubTrees, value: T): boolean {
			if (!this._subTrees[type]) { return false; }
			return this._subTrees[type].exists(value);
		}
		
		//#endregion
		//..........................................

		//..........................................
		//#region FINDING EXTREMA
		
		public max(): T {
			if (this._subTrees.right) { return this._subTrees.right.max(); }
			return this._data; 
		}

		public min(): T {
			if (this._subTrees.left) { return this._subTrees.left.min(); }
			return this._data; 
		}
		
		//#endregion
		//..........................................

		//..........................................
		//#region COMPARISON HELPERS

		protected _compare(value: T): CompareResult {
			if (KIP.isComparable(value)) {
				return this._compareObject(value);
			} else {
				return this._comparePrimitive(value as string | number);
			}
		}

		protected _compareObject(value: IComparable): CompareResult {
			if (!value) { return CompareResult.ERR; }

			let myValue = this._data as IComparable;
			if (!myValue) { return CompareResult.ERR; }

			if (value.equals(myValue)) { return CompareResult.EQUAL; }
			else if (value.lessThan(myValue)) { return CompareResult.LESS_THAN; }
			else if (value.greaterThan(myValue)) { return CompareResult.GREATER_THAN; }

			return CompareResult.ERR;
		}

		protected _comparePrimitive(value: string | number): CompareResult {
			if (value < this._data) { return CompareResult.LESS_THAN; }
			if (value > this._data) { return CompareResult.GREATER_THAN; }
			return CompareResult.EQUAL;
		}

		protected _getRelationToParent(): ISubTrees {
			let comparedToParent = CompareResult.ERR;
			if (this._parent) { comparedToParent = this._compare(this._parent._data); }

			switch (comparedToParent) {
				case CompareResult.LESS_THAN:		return "right";
				case CompareResult.GREATER_THAN:	return "left";
			}

			return null;
		}
		
		//#endregion
		//..........................................

		//..........................................
		//#region IDENTITY FUNCTIONS
		
		public isComplete(): boolean {
			if (!this._subTrees.left && !this._subTrees.right) { return true; }
			if (!this._subTrees.left) { return false; }
			if (!this._subTrees.right) { return false; }

			if (!this._subTrees.left.isComplete()) { return false; }
			if (!this._subTrees.right.isComplete()) { return false; }
			return true;
		}

		public isBalanced(): boolean {
			let leftDepth = this._getSideDepth("left");
			let rightDepth = this._getSideDepth("right");

			if (Math.abs(leftDepth - rightDepth) > 1) { return false; }

			if (!this._isSubTreeBalanced("left")) { return false; }
			if (!this._isSubTreeBalanced("right")) { return false; }

			return true; 
		}

		protected _isSubTreeBalanced(type: ISubTrees): boolean {
			if (!this._subTrees[type]) { return true; }
			return this._subTrees[type].isBalanced();
		}

		protected _getSideDepth(type: ISubTrees): number {
			if (!this._subTrees[type]) { return 0; }
			return this._subTrees[type].getDepth();
		}
		
		//#endregion
		//..........................................

		//..........................................
		//#region FACTORY FUNCTIONS
		
		protected _createSubTree(value: T): BinaryTree<T> {
			return new BinaryTree<T>(value);
		}
		
		//#endregion
		//..........................................

		//..........................................
		//#region OVERRIDES
		
		public toString(): string {
			let subTrees = [];
			if (this._subTrees.left) { subTrees.push(this._subTrees.left); }
			if (this._subTrees.right) { subTrees.push(this._subTrees.right); }

			let arr = [];
			arr.push(this._data);
			if (subTrees.length > 0) {
				arr.push("->(");
				arr.push(subTrees.join(","));
				arr.push(")");
			}
			return arr.join("");
		}
		
		//#endregion
		//..........................................
	}

	//..........................................
	//#region TYPES AND INTERFACES
	
	export type Comparable = IComparable | string | number;

	export type ISubTrees = "left" | "right";

	export enum CompareResult {
		ERR = 0,
		LESS_THAN = 1,
		EQUAL = 2,
		GREATER_THAN = 3
	}

	//#endregion
	//..........................................
}