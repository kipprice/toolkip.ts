namespace KIP {

    export type TimelineElement = TimelineGroup | TimelineEvent | Timespan | TimelineLabel;

    export interface ITimelineElement {
        startDate: Date;
        endDate: Date;
    }
}