/// <reference path="./trees/tree.ts" />

namespace KIP {
    export abstract class Heap<T extends IComparable> extends Tree<T> {


        public add(value:T): void {

        }

        public remove(value:T): void {

        }
        
        protected abstract _shouldSwap(cur: T, comparison: T): boolean;


    }

    export class MinHeap<T extends IComparable> extends Heap<T> {

        protected _shouldSwap(curMin: T, comparison: T): boolean {
            if (curMin <= comparison) { return false; }
            return true;
        }

    }

    export class MaxHeap<T extends IComparable> extends Heap<T> {

        protected _shouldSwap(curMax: T, comparison: T): boolean {
            if (curMax >= comparison) { return false; }
            return true;
        }

    }
}