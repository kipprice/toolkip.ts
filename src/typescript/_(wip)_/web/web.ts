///<reference path="../../drawable/drawable.ts" />

namespace KIP {

    /**
     * Contains data that will be shown in a web element
     */
    export interface IWebElementContent {
        title: string;
        details: string;
        imageURL: string;
        htmlContent: string;
    }

    export class Web implements IDrawable{
        protected _elements: WebElement[];
        protected _canvas: HTML5Canvas;
        protected _parent: HTMLElement;

        constructor (parentElem?: HTMLElement, canvasOptions?: IHTML5CanvasOptions) {
            this._parent = parentElem || document.body;

            this._canvas = new HTML5Canvas("web", canvasOptions);
            if (this._parent) {
                this._canvas.draw(this._parent);
            }
        }

        public addWebElement (newElem: WebElement) : void {
            this._elements.push(newElem);
            this.draw();
        }

        public draw(parent?: HTMLElement): void {
            if (!this._parent) { this._parent = parent; }

            // TODO
        }

        public erase(): void {
            // TODO
        }

        public createWebElementFromContent (content: IWebElementContent) : WebElement {
            return null;
        }


    }
}