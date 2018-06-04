namespace KIP.Timeline {

	export interface ITimedElement {
		start: Date;
		end: Date;
		backingData: TimedBackingData;
	}

	/**...........................................................................
	 * @class	TimedElement
	 * ...........................................................................
	 * Keep track of timeline elements
	 * @author	Kip Price
	 * @version 1.0.0
	 * ...........................................................................
	 */
	export class TimedElement extends Serializable<ITimedElement> implements ITimedElement {

		//#region PROPERTIES

		/** the start date for this timed event */
		protected _start: Date;
		public get start(): Date { return this._start; }
		public set start(data: Date) { this._start = data; }

		/** the end date for this timed event */
		protected _end: Date;
		public get end(): Date { return this._end || this._start; }
		public set end(data: Date) { this._end = data; }

		/** the data that this timed element references */
		protected _backingData: TimedBackingData;
		public get backingData(): TimedBackingData { return this._backingData; }
		public set backingData(data: TimedBackingData) { this._backingData = data; }

		//#endregion

		protected _copyStart(start: string | Date) {
			this._start = new Date(start as any);
		}

		protected _copyEnd(end: string | Date) {
			this._end = new Date(end as any);
		}
	}
}