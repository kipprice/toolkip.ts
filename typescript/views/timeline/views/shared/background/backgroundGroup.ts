namespace KIP.Timeline {

    export interface BackgroundGroupElements {
        monthHeaders: TimedGroup;
        dayHeaders: TimedGroup;
        columns: TimedGroup;
    }

    export class BackgroundGroup<G extends TimedGroup> extends TimedGroup {
        //#region PROPERTIES
        protected _elems; 
        //#endregion
    }
}