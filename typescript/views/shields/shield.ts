///<reference path="../drawable.ts" />
namespace KIP {

    export interface IShieldElements extends IDrawableElements {
        base: HTMLElement;
        shieldContent: HTMLElement;
    }

    export abstract class Shield extends Drawable {
        protected _elems: IShieldElements;

        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipShield": {
                position: "fixed",
                backgroundColor: "rgba(0,0,0,0.6)",
                width: "100%",
                height: "100%",
                left: "0",
                top: "0",
                zIndex: "100"
            },

            ".kipShield .shieldContent": {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%"
            }
        }

        constructor() {
            super();
        }

        protected _createElements(): void {
            this._elems.base = createElement({
                cls: "kipShield"
            });

            this._elems.shieldContent = createElement({
                cls: "shieldContent",
                parent: this._elems.base
            });

            this._createShieldDetails();
        };

        protected abstract _createShieldDetails(): void;

        public draw(parent?: HTMLElement): void {
            if (!parent) { parent = document.body; }
            super.draw(parent);
        }
    }
}