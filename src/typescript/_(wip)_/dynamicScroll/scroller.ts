// namespace KIP {

//     /**----------------------------------------------------------------------------
//      * @class	Scroller
//      * ----------------------------------------------------------------------------
//      * Helper class that allows for some fancy scroll types, so that cool
//      * effects can be accomplished
//      * 
//      * @author	Kip Price
//      * @version	1.0.0
//      * ----------------------------------------------------------------------------
//      */
//     export abstract class Scroller {

//         //.....................
//         //#region PROPERTIES
        
//         /** how far we've scrolled thus far */
//         protected _currentScrollAmt: number = 0;

//         /** how far we potentially could scroll */
//         protected _maxHeight: number;
        
//         //#endregion
//         //.....................

//         /**
//          * Scroller
//          * ----------------------------------------------------------------------------
//          * create a new helper to manage fancy scroll types
//          */
//         public constructor(maxHeight: number) {
//             this._maxHeight = maxHeight;
//         }

//         /**
//          * scrollBy
//          * ----------------------------------------------------------------------------
//          * process a tick in the scroll action
//          */
//         public scrollBy(delta: number, elems: IScrollElement[]): void {
//             this._updateCurrentScrollAmt(delta);
//             this._onScroll(this._currentScrollAmt, elems);
//         }

//         /**
//          * _onScroll
//          * ----------------------------------------------------------------------------
//          * pass on the actual scroll details to the children
//          */
//         protected abstract _onScroll(delta: number, elems: IScrollElement[]): void;


//         /**
//          * _updateCurrentScrollAmt
//          * ----------------------------------------------------------------------------
//          * ensure that we have an up-to-date measure of our current scroll amount
//          */
//         protected _updateCurrentScrollAmt(delta: number) {
//             this._currentScrollAmt += delta;
//             if (this._currentScrollAmt < 0) { this._currentScrollAmt = 0; }
//             if (this._currentScrollAmt > this._maxHeight) { this._currentScrollAmt = this._maxHeight; }
//         }
//     }

//     export class ParallaxScroller extends Scroller {

//         protected _onScroll(delta: number, elems: IScrollElement[]): void {
//             // loop through each of the elements
//             for (let e of elems) {
//                 let top = e.elem.offsetTop;

//                 // case 1: top half of the screen
                

//                 // case 2: bottom half of the screen

//                 // case 0: perfectly center
//             }
//         }

//     }
// }