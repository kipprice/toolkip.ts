/// <reference path="./promiseTypes.ts" />

namespace KIP {

	/**----------------------------------------------------------------------------
	 * @class	Binder
	 * ----------------------------------------------------------------------------
	 * keeps track of all bound elements and consolidates into a single animation 
	 * frame event; prevents poor performance with lots of bound views
	 * @author	Kip Price
	 * @version	1.0.0
	 * ----------------------------------------------------------------------------
	 */
	class _Binder {
		//.....................
		//#region PROPERTIES
		
		protected _boundDetails: KIP.IDictionary<IBindingDetails<any>>;

		protected _id: number = 0;

		protected _started: boolean = false;
		
		//#endregion
		//.....................

		//..........................................
		//#region HANDLE IDENTIFIERS
		
		protected _getNextId(): string {
			this._id += 1;
			return this._id.toString();
		}
		
		//#endregion
		//..........................................

		//..........................................
		//#region CONSTRUCTORS
		
		public constructor() {
			this._boundDetails = {};
			this._startAnimationLoop();
		}
		
		//#endregion
		//..........................................

		//...............................................................
		//#region PUBLIC FUNCS FOR REGISTERING / UNREGISTERING BINDINGS
		
		public bind<T = any>(evalFunc: BoundEvalFunction<T>, updateFunc: BoundUpdateFunction<T>, deleteFunc?: BoundDeleteFunction, equalsFunc?: EqualityFunction<T>): string {
			if (!evalFunc || !updateFunc) { 
				return "";
			}

			let details: IBindingDetails<T> = {
				id: this._getNextId(),
				eval: evalFunc,
				update: updateFunc,
				delete: deleteFunc || (() => false),
				lastValue: evalFunc(),
				equals: equalsFunc || ((a, b) => { return a === b} )
			}

			// add to our dictionary
			this._boundDetails[details.id] = details;
			
			// return the identifier of the
			return details.id;
		}

		public unbind(key: string): boolean {
			if (!this._boundDetails[key]) { return false; }

			delete this._boundDetails[key];
			return true;
		}
		
		//#endregion
		//...............................................................

		//..........................................
		//#region SHARED ANIMATION FRAME HANDLING

		protected _startAnimationLoop(): void {
			if (this._started) { return; }
			this._onFrame();
		}
		
		protected async _onFrame(): Promise<void> {
			KIP.map(this._boundDetails, (details: IBindingDetails<any>) => {
				this._handlingBinding(details);
			})

			// queue up the next render
			KIP.nextRender().then(() => this._onFrame());
		}

		protected async _handlingBinding<T>(details: IBindingDetails<T>): Promise<void> {

			// check first if this element should be deleted
			if (details.delete()) { 
				this.unbind(details.id);
				return;
			}

			// next check if the value has changed
			let newVal = details.eval();
			if (details.equals(newVal, details.lastValue)) { return; }

			// last, perform the update function
			details.lastValue = newVal;
			details.update(newVal);
		}
		
		//#endregion
		//..........................................

	}
	
	export const Binder = new _Binder();

	

	/**
	 * bind
	 * ---------------------------------------------------------------------------
	 * Ties a particular piece of data to an update function, so that if the 
	 * value changes, the update function can be executed
	 * 
	 * @param 	evalFunc 	Function to grab current state of the value
	 * @param 	updateFunc 	Function to call upon the value changing
	 * 
	 * @returns	The current state of the value
	 */
	export function bind<T>(evalFunc: BoundEvalFunction<T>, updateFunc: BoundUpdateFunction<T>, deleteFunc?: BoundDeleteFunction, equalsFunc?: EqualityFunction<T>): T {
		let id = Binder.bind(evalFunc, updateFunc, deleteFunc, equalsFunc);
		if (!id) { return null; }

		return evalFunc();
	}

	//..........................................
	//#region TYPES AND INTERFACES
	
	export interface BoundEvalFunction<T> {
		(): T
	}

	export interface BoundUpdateFunction<T> {
		(newVal: T): void;
	}

	export interface BoundDeleteFunction {
		(): boolean;
	}

	export interface IBindingDetails<T> {
		id: string;
		eval: BoundEvalFunction<T>;
		update: BoundUpdateFunction<T>;
		delete: BoundDeleteFunction;
		lastValue: T;
		equals: EqualityFunction<T>;
	}
	
	//#endregion
	//..........................................
	
}