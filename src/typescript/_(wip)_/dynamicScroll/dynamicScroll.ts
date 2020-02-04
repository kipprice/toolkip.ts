// namespace KIP {

//     export interface IScrollElement {
//         elem: HTMLElement;

//         onStart: KIP.IClassDefinition;
//         onTransition?: KIP.IClassDefinition;
//         onEnd: KIP.IClassDefinition;

//         shouldStart: Function;
//         shouldEnd: Function;
//     }

//     class _DynamicScroller {

//         /**
//          * parallax
//          * ----------------------------------------------------------------------------
//          * allow elements to scroll with parallax
//          */
//         public parallax(parent: HTMLElement, elems: IScrollElement[]): void {
//             let scroller = new ParallaxScroller();

//             parent.addEventListener("wheel", (e: WheelEvent) => { 
//                 scroller.scrollBy(e.deltaY, elems);
//             });
//         }

//         public stickyScroll(parent: HTMLElement, elems: IScrollElement[]): void {

//         }

//         public upAndOver(parent: HTMLElement, elems: IScrollElement[]): void {

//         }
//     }

//     export const DynamicScroller = new _DynamicScroller();
// }