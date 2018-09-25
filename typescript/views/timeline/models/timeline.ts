///<reference path="../../../models/model.ts" />

namespace KIP.Timeline {
	export interface ITimeline {
		groups: Collection<ITimedGroup>
	}

	export class TimelineModel extends Serializable<ITimeline> implements ITimeline {
		//#region PROPERTIES

		/** keep track of the groups that are displayed within the timeline */
		protected _groups: Collection<TimedGroup>;
		public get groups(): Collection<TimedGroup> { return this._groups; }
		public set groups(data: Collection<TimedGroup>) { this._groups = data; }

		//#endregion

		/**  */
		protected _setDefaultValues(): void {
			this._groups = new Collection<TimedGroup>();
		}

		protected _copyGroups(groups: Collection<ITimedGroup>): void {
			if (!groups) { return; }
			this._groups = groups as Collection<TimedGroup>;
		}
	}
}