namespace KIP {
    
    export type StandardElement = HTMLElement | SVGElement;

	/** allow multiple types of elements to be added to our Drawables */
	export type DrawableElement = HTMLElement | SVGElement | Drawable;

	/**
	 * IDrawable
	 * ----------------------------------------------------------------------------
	 * The core pieecs that are required by our Drawable
	 */
	export interface IDrawable {
		draw(parent?: DrawableElement): void;
		erase(): void;
	}

	/**
	 * IDrawableElements
	 * ----------------------------------------------------------------------------
	 * Collection of elements that make up a Drawable
	 */
	export interface IDrawableElements {

		/** the lowest level element of this Drawable */
		base: StandardElement;

		/** any additional elements */
		[key: string]: DrawableElement | DrawableElement[];
	}
}