///<reference path="../../drawable/drawable.ts" />

namespace KIP {
    export class WebElement implements IDrawable {

        /** the data that will be displayed inside of the web element */
        protected _content: IWebElementContent;
        public get content(): IWebElementContent { return this._content; }
        public set content (data: IWebElementContent) { this._content = data; }

        /** the actual canvas element that will be created */
        protected _elem: CanvasElement;

        /** any children that should be associated with this web element */
        protected _childElements: WebElement[];

        /** any elements that should be linked to this element */
        protected _linkedElements: WebElement[];

        /** Create an element that will display in a web */
        constructor(content: IWebElementContent) {
            this._content = content;
        }

        public addChildElement(child: WebElement): void {
            this._childElements.push(child);
            child.draw();
            return;
        }

        public addLinkedElement(link: WebElement): void {

        }

        public draw(): void {}
        public erase(): void {}
    }
    
}