namespace KIP {

	export abstract class Navigator<T extends string> {

		/** keep track of the views */
		private _views: Collection<Drawable> = new Collection<Drawable>();

		/** keep track of the parent element */
		protected abstract get _parent(): HTMLElement;

		public navigateTo<D extends Drawable>(navigationPath: T, constructor?: IConstructor<D>, ...addlArgs: any[]): void {
			let view: Drawable = this._views.getValue(navigationPath);

			if (!view) {
				view = new constructor(addlArgs);
			} else {
				if (isUpdatable(view)) {
					view.update.apply(addlArgs);
				}
			}

			view.draw(this._parent);
		}

		protected _handleTransition () { }
	}
}