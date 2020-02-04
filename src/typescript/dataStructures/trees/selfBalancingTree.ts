/// <reference path="./binaryTree.ts" />

namespace KIP {
    /**----------------------------------------------------------------------------
     * @class	BalancedBinaryTree
     * ----------------------------------------------------------------------------
     * handle balancing a binary tree
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export class BalancedBinaryTree<T extends Comparable> extends BinaryTree<T> {
		//.....................
		//#region PROPERTIES
		
		/** keep track of an actual root node, so that we can keep references the same when rebalancing */
		protected _root: BinaryTree<T>;

		/** pass throughs for the data proprty to draw from the binary tree node */
		protected get _data(): T { return (this._root as any)._data; }
		protected set _data(value: T) { }

		/** keep track of the subtrees */
		protected _subTrees: KIP.IDictionary<BalancedBinaryTree<T>, ISubTrees>;
		
		//#endregion
		//.....................

		public constructor(data: T) {
			super(null);
			this._root = new BinaryTree<T>(data);
		}

		public add(value: T): void {
			super.add(value);

			while(!this.isBalanced()) {
                this._rebalance();
            }
		}

		public remove(value: T): void {
			super.remove(value);

            while(!this.isBalanced()) {
                this._rebalance();
            }
		}

		protected _rebalance(): void {
			console.log(this.toString());
			// try balancing each side to see if that gets us anywhere
			this._rebalanceSubTree("left");
			this._rebalanceSubTree("right");

			// if we are now balanced, no need to do anything else
			if (this.isBalanced()) { return; }

			let leftDepth = this._getSideDepth("left");
			let rightDepth = this._getSideDepth("right");

			if (leftDepth > rightDepth) {
				this._rotate("left")
			} else {
				this._rotate("right");
			}

			return;
		}

		protected _rotate(type: ISubTrees): void {
			let subTree = this._subTrees[type];
			let oppositeSide = this._oppositeSide(type);

			// update parents appropriately
			subTree._parent = this._parent;
			this._parent = subTree;

			// update the way the children point
			if (subTree[oppositeSide]) { 
				this._subTrees[type] = subTree[oppositeSide];
				this._subTrees[type]._parent = this;
			} else {
				delete this._subTrees[type];
			}

			subTree[oppositeSide] = this;
		}

		protected _oppositeSide(type: ISubTrees): ISubTrees {
			switch (type) {
				case "left":	return "right";
				case "right":	return "left";
				default:		return null;
			}
		}

		protected _rebalanceSubTree(type: ISubTrees): void {
			if (this._isSubTreeBalanced(type)) { return; }
			return this._subTrees[type]._rebalance();
		}

		protected _createSubTree(value: T): BalancedBinaryTree<T> {
			return new BalancedBinaryTree<T>(value);
		}
    }
    
    export class SelfBalancingBinaryTree<T extends Comparable> extends BinaryTree<T> {

        //.....................
        //#region PROPERTIES
        
        protected _tree: BinaryTree<T>;
        
        //#endregion
        //.....................

        //..........................................
        //#region OVERRIDES

        public constructor(value: T) {
            super(null);
            this._tree = new BinaryTree(value);
        }
        
        public add(value: T): void {
            this._tree.add(value);
            console.log(this.toString());

            if (this._tree.isBalanced()) { return; }
            this._rebalance(this._tree as SelfBalancingBinaryTree<T>);
            console.log("After Rebalance: " + this.toString());
        }

        public remove(value: T): void {
            this._tree.remove(value);

            if (this._tree.isBalanced()) { return; }
            this._rebalance(this._tree as SelfBalancingBinaryTree<T>);
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region PASS THROUGH FUNCTIONS
        
        public isBalanced() { return this._tree.isBalanced(); }
        public isComplete() { return this._tree.isComplete(); }
        public isLeafNode() { return this._tree.isLeafNode(); }
        public toString() { return this._tree.toString(); }
        public getDepth() { return this._tree.getDepth(); }
        
        //#endregion
        //..........................................

        protected _rebalance(tree: SelfBalancingBinaryTree<T>): void {

            // try to rebalance at a lower level first
            this._rebalanceSubTree(tree, "left");
            this._rebalanceSubTree(tree, "right");

            // if we are balanced now, continue on
            if (tree.isBalanced()) { return; }

            // otherwise, we need to figure out which side needs to be adjusted
            let leftDepth = tree._getSideDepth("left");
			let rightDepth = tree._getSideDepth("right");

			if (leftDepth > rightDepth) {
				this._rotate(tree, "left");
			} else {
				this._rotate(tree, "right");
			}
        }

        protected _rebalanceSubTree(tree: SelfBalancingBinaryTree<T>, side: ISubTrees): void {
            if (!tree._subTrees[side]) { return; }
            if (tree._subTrees[side].isBalanced()) { return; }
            return this._rebalance(tree._subTrees[side] as SelfBalancingBinaryTree<T>);
        }

        protected _rotate(tree: SelfBalancingBinaryTree<T>, side: ISubTrees): void {
            let oppositeSide = this._oppositeSide(side);

            // get the node we are swapping with
            let newRoot = tree._subTrees[side] as SelfBalancingBinaryTree<T>;
            if (!newRoot) { return; }

            // make sure the old parent appropriately points to the new root
            let parent = tree._parent as SelfBalancingBinaryTree<T>;
            if (parent) {
                parent._subTrees[tree._getRelationToParent()] = newRoot;
            } else {
                this._tree = newRoot;
            }

            // update the respective parents of the nodes that are getting updated
			newRoot._parent = parent;
			tree._parent = newRoot;

			// update the way the children point
			if (newRoot._subTrees[oppositeSide]) { 
				tree._subTrees[side] = newRoot._subTrees[oppositeSide];
				(tree._subTrees[side] as SelfBalancingBinaryTree<T>)._parent = tree;
			} else {
				delete tree._subTrees[side];
			}

            // ensure that the new root points to the old node
            newRoot._subTrees[oppositeSide] = tree;
		}

		//..........................................
        //#region HELPERS
        
        protected _oppositeSide(type: ISubTrees): ISubTrees {
            switch (type) {
                case "left":	return "right";
                case "right":	return "left";
                default:		return null;
            }
        }
        
        //#endregion
        //..........................................
        


    }
}