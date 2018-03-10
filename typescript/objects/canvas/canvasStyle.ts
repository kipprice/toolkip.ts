namespace KIP {

    export type CanvasColor = string | CanvasGradient | CanvasPattern;

    export enum StyleChangeEnum {
        FILL_COLOR = 0,
        STROKE_COLOR = 1,
        FONT_FAMILY = 2,
        FONT_VARIANT = 3,
        FONT_SIZE = 4,
        STROKE_SIZE = 5,
        TEXT_ALIGN = 6,
        FONT = 7
    };

    export interface StyleChangeHandler {
        () : void;
    }

    export class CanvasElementStyle {

        protected _fillColor: CanvasColor;
        public get fillColor (): CanvasColor { return this._fillColor; }
        public set fillColor (color: CanvasColor) { 
            this._fillColor = color;
            this._onChange(StyleChangeEnum.FILL_COLOR);
        }

        protected _strokeColor: CanvasColor;
        public get strokeColor (): CanvasColor { return this._strokeColor; }
        public set strokeColor (color: CanvasColor) { 
            this._strokeColor = color;
            this._onChange(StyleChangeEnum.STROKE_COLOR);
        }

        protected _fontFamily: string
        public get fontFamily (): string { return this._fontFamily; }
        public set fontFamily (family: string) { 
            this._fontFamily = family;
            this._onChange(StyleChangeEnum.FONT_FAMILY);
        }

        protected _fontVariant: string;
        public get fontVariant (): string { return this._fontVariant; }
        public set fontVariant (variant: string) { 
            this._fontVariant = variant;
            this._onChange(StyleChangeEnum.FONT_VARIANT);
        }

        protected _fontSize: number;
        public get fontSize(): number { return this._fontSize; }
        public set fontSize (size: number) { 
            this._fontSize = size;
            this._onChange(StyleChangeEnum.FONT_SIZE);
        }

        protected _strokeSize: number;
        public get strokeSize(): number { return this._strokeSize; }
        public set strokeSize (size: number) {
            this._strokeSize = size;
            this._onChange(StyleChangeEnum.STROKE_SIZE);
        }

        protected _textAlign: string;
        public get textAlign (): string { return this._textAlign; }
        public set textAlign (align: string) {
            this._textAlign = align;
            this._onChange(StyleChangeEnum.TEXT_ALIGN);
        }

        protected _font: string;
        public get font (): string { 
            if (this._font) { return this._font; }
            let variant: string = (this._fontVariant? this._fontVariant + " ": "");
            let size: string = (this._fontSize? this._fontSize + "px ": "");

            return variant + size + this._fontFamily;
        }
        public set font (font: string) {
            this._font = font;
            this._onChange(StyleChangeEnum.FONT);
        }

        protected _listeners: StyleChangeHandler[][];

        protected _oldStyle: CanvasElementStyle;

        /** nothing to construct */
        public constructor (style?: CanvasElementStyle) {
            this._listeners = [];

            // clone the existing style
            if (style) {
                this._fillColor = style.fillColor;
                this._strokeColor = style.strokeColor;
                this._font = style.font;
                this._fontFamily = style.fontFamily;
                this._fontSize = style.fontSize;
                this._fontVariant = style.fontVariant;
                this._strokeSize = style.strokeSize;
                this._textAlign = style.textAlign;

            // or just use defaults
            } else {
				this._fillColor = "#000";
				this._strokeColor = "#000";
				this._strokeSize = 1;
				this._fontFamily = "Helvetica";
				this._fontSize = 40;
				this._textAlign = "left";
			}
        }

        public addStyleChangeListener (changeType: StyleChangeEnum, func: StyleChangeHandler) : void {
            if (!this._listeners[changeType]) {
                this._listeners[changeType] = [];
            }

            // Add to the array of listeners
            this._listeners[changeType].push(func);
        }

        protected _onChange (changeType: StyleChangeEnum) : void {
            if (!this._listeners[changeType]) { return; }
            let listener: StyleChangeHandler;
            for (listener of this._listeners[changeType]) {
                listener();
            }
        }

        public setStyle (context: CanvasRenderingContext2D) : void {
            this._saveOffOldStyle(context);
            this._applyStyleToContext(context, this);
        }

        public restoreStyle (context: CanvasRenderingContext2D) : void {
            this._applyStyleToContext(context, this._oldStyle);
        }

        protected _saveOffOldStyle (context: CanvasRenderingContext2D): void {
            this._oldStyle = new CanvasElementStyle();

            this._oldStyle.fillColor = context.fillStyle;
            this._oldStyle.strokeColor = context.strokeStyle;
            this._oldStyle.font = context.font;
            this._oldStyle.strokeSize = context.lineWidth;
            this._oldStyle.textAlign = context.textAlign;
        }

        protected _applyStyleToContext(context: CanvasRenderingContext2D, style: CanvasElementStyle): void {
            context.fillStyle = style.fillColor;
            context.strokeStyle = style.strokeColor;
            context.textAlign = style.textAlign;
            context.font = style.font;
            context.lineWidth = style.strokeSize;
        }
    }
}