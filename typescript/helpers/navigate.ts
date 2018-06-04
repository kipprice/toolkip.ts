///<reference path="../models/collection.ts" />

namespace KIP {

	/**...........................................................................
	 * INavigationData
	 * ...........................................................................
	 * Keep track of the individual details from
	 * ...........................................................................
	 */
	export interface INavigationData<M> {
		model?:M;
		url?: string;
		title?: string;
		[key: string]: any;
	}

	//#region INTERFACE FOR NAVIGATION

    /**...........................................................................
     * IHistoryData
     * ...........................................................................
     * Keep track of where we've navigated
     * @version 1.0
     * ...........................................................................
     */
    export interface IHistoryEntry<T> {
		
		/** keep track of what the path to navigation is */
		navigationPath: T;

        /** the URL to use to load the same page */
		url?: string;

        /** what the title of the site should be in the history */
		title?: string;
		
		/** any additional data to track in the history */
		data: INavigationData<any>;
    }
	//#endregion

	export enum INavTransitionType {
		NONE = 0,
		OPACITY = 1,
		SLIDE_LEFT = 2,
		SLIDE_RIGHT = 3,
		SLIDE_UP = 4,
		SLIDE_DOWN = 5
	}
	
	//#region STANDARD NAVIGATION
	/**...........................................................................
	 * @class	Navigator
	 * ...........................................................................
	 * @version	1.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export abstract class Navigator<T extends string> {

		//#region PROPERTIES

		/** keep track of the views */
		private _views: Collection<Drawable> = new Collection<Drawable>();

		protected abstract get _headerView(): NavigationHeader<T>;

		/** keep track of the parent element */
		protected abstract get _parent(): HTMLElement;

		/** allow the implementer to determine what type of transition is used */
		protected abstract get _transitionType(): INavTransitionType;

		/** keep track of what view is currently showing */
		protected _currentView: ICollectionElement<Drawable>;
		public get currentView(): ICollectionElement<Drawable> { return this._currentView; }

		/** keep track of the historical changes to the navigation */
		protected _history: HistoryChain<IHistoryEntry<T>>;
		public get history(): HistoryChain<IHistoryEntry<T>> { return this._history; }

		//#endregion

		/**...........................................................................
		 * Create this specific instance of a navigator
		 * ...........................................................................
		 */
		public constructor() {

			// keep track of our internal history
			this._history = new HistoryChain();

			// register the listener when the user presses the back button
			window.addEventListener("popstate", () => {
				this._handleState();
			});

			this._createHeader();
		}

		protected abstract _createHeader(): void;

		/**...........................................................................
		 * navigateTo
		 * ...........................................................................
		 * Move to a particular view in this navigator
		 * 
		 * @param	navigationPath	How to get to the specified view
		 * @param	constructor		How to create this view (if not already created)
		 * @param	addlData		Anything else that needs to be passed along (e.g. models)
		 * ...........................................................................
		 */

		public navigateTo<D extends Drawable, M>(navigationPath: T, constructor?: IConstructor<D>, addlData?: INavigationData<M>): void {

			// initialize the additional data array if unpassed
			if (!addlData) { addlData = {}; }

			// try to grab the view from our collection (quit if it doesn't exist and we can't create it)
			let view: Drawable = this._views.getValue(navigationPath);
			if (!view && !constructor) { return; }

			// if we couldn't find it, create it
			if (!view) {
				view = this._createView(constructor, addlData);
				this._views.addElement(navigationPath, view);
			
			// otherwise, check if this can receive an update
			} else {
				if (isUpdatable(view)) {
					this._updateView(view, addlData);
				}
			}

			// draw the view on the appropriate parent
			this._handleTransition(view);

			// update our internal view tracking
			this._currentView = this._views.getElement(navigationPath);

			// update the browser history
			this._updateHistory(navigationPath, addlData);

			// make sure to also update the header
			this._headerView.update(navigationPath, addlData);
		}

		/**...........................................................................
		 * _createView
		 * ...........................................................................
		 * Overridable constructor method for views; override to pass info into the 
		 * constructor method.
		 * 
		 * @param 	constructor 	Method to create the view
		 * @param 	addlData 		Additional data that could be passed to the constructor
		 * 
		 * @returns	The created drawable
		 * ...........................................................................
		 */
		protected _createView<D extends Drawable, M>(constructor: IConstructor<D>, addlData?: INavigationData<M>): D {
			let view = new constructor();
			return view;
		}

		/**...........................................................................
		 * _updateView
		 * ...........................................................................
		 * Update the created view with new data. Overridable if different data ought to be passed in
		 * @param 	view 		The view to update
		 * @param 	addlData 	Additional data to pass into the view
		 * ...........................................................................
		 */
		protected _updateView<D extends IUpdatable, M>(view: D, addlData?: INavigationData<M>): void {
			view.update(addlData.model, addlData);
		}

		/**...........................................................................
		 * _updateHistory
		 * ...........................................................................
		 * Add this navigate event to the history of the page
		 * 
		 * @param 	navigationPath 	The path to navigate to
		 * @param 	addlArgs 		Any additional data for this 
		 * ...........................................................................
		 */
		private _updateHistory(navigationPath: T, addlArgs: INavigationData<any>): void {
			let history: IHistoryEntry<T> = {
				navigationPath: navigationPath,
				url: addlArgs.url || "",
				title: addlArgs.title || navigationPath,
				data: addlArgs
			};
			this._pushHistoryState(history);

			// also push to our internal history
			this._history.push(history);
		}

		/**...........................................................................
		 * _handleTransition
		 * ...........................................................................
		 * Switches between two separate views in this navigation world
		 * ...........................................................................
		 */
		protected _handleTransition (view: Drawable): void {
			// verify we have enough data to handle this
			if (!view || !this._parent) { return; }
			
			switch (this._transitionType) {
				case INavTransitionType.OPACITY:
					this._opacityTransition(view);
					break;

				//TODO: Handle all the other cases
				default:
					this._noTransition(view);
					break;
			}
			
		 }

		 /**...........................................................................
		  * _noTransition
		  * ...........................................................................
		  * Swap out the parent contents for the child contents
		  * @param view 
		  * ...........................................................................
		  */
		 protected _noTransition(view: Drawable): void {
			this._parent.innerHTML = "";
			view.draw(this._parent);
		 }

		 /**...........................................................................
		  * _opacityTransition
		  * ...........................................................................
		  * Fade out the parent, swap out content, then fade back in
		  * @param view 
		  * ...........................................................................
		  */
		 protected _opacityTransition(view: Drawable): void {
			transition(
				this._parent,
				{opacity: "1"},
				{opacity: "0"},
				200
			).then(() => {
				this._parent.innerHTML = "";
				view.draw(this._parent);

				transition(
					this._parent,
					{opacity: "0"},
					{opacity: "1"},
					200
				);
			});
		 }

		/**...........................................................................
		 * pushHistoryState
		 * ...........................................................................
		 * make sure we can return to the right page
		 * 
		 * @param   history     The page to return to when hitting the back button
		 * ...........................................................................
		 */
    	protected _pushHistoryState(history: IHistoryEntry<T>): void {
			window.history.pushState(
				history,
				history.title,
				history.url
			);
		}

		/**...........................................................................
		 * _handleState
		 * ...........................................................................
		 * Override the back button to go to the right page
		 * ...........................................................................
		 */
		protected _handleState(): void {
			let state: IHistoryEntry<T> = window.history.state;
			if (!state) { return; }
			this.navigateTo(state.navigationPath, null, state.data);
		}
		
	}

	//#endregion
}