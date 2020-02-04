///<reference path="../../identifiable/model.ts" />

namespace KIP.Timeline {
	export interface ITimeline {
		groups: Collection<ITimedGroup>
	}

	/**----------------------------------------------------------------------------
	 * @class	TimelineModel
	 * ----------------------------------------------------------------------------
	 * build the collection of timeline events
	 * @author	Kip Price
	 * @version	1.0.0
	 * ----------------------------------------------------------------------------
	 */
	export class TimelineModel extends Serializable<ITimeline> implements ITimeline {
		//#region PROPERTIES

		/** keep track of the groups that are displayed within the timeline */
		protected _groups: Collection<TimedGroup>;
		public get groups(): Collection<TimedGroup> { return this._groups; }
		public set groups(data: Collection<TimedGroup>) { this._groups = data; }

		//#endregion

		/**
		 * _setDefaultValues
		 * ----------------------------------------------------------------------------
		 * setup the objects in this model
		 */
		protected _setDefaultValues(): void {
			this._groups = new Collection<TimedGroup>();
		}

		/**
		 * _copyGroups
		 * ----------------------------------------------------------------------------
		 * copy all groups over
		 */
		protected _copyGroups(groups: Collection<ITimedGroup>): void {
			if (!groups) { return; }
			this._groups = groups as Collection<TimedGroup>;
		}
	}
}