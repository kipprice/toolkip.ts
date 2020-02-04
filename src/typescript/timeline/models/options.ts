namespace KIP.Timeline {

    /**...........................................................................
     * ProjectDayFormatting
     * ...........................................................................
     * Keep track of how a day should be formatted
     * ...........................................................................
     */
    export enum ProjectDayFormatting {

        /** regular day */
        NORMAL = 0,

        /** weekend day */
        WEEKEND = 1,

        /** holiday */
        HOLIDAY = 2,

        /** current day */
        TODAY = 3
    };

    /**...........................................................................
     * TimelineOptions
     * ...........................................................................
     * display options for a given timeline 
     * ...........................................................................
     */
    export interface TimelineOptions extends IHTML5CanvasOptions {

        /** how far the Y dimension should extend for a day */
        DAY_HEIGHT?: number;

        /** how far the X dimension should extend for a day */
        DAY_WIDTH?: number;

        /** what should be considered the central date for the timeline */
        CENTRAL_DATE?: Date;

        /** the colors that should be used for the months */
        MONTH_COLORS?: string[];

        /** how days should be formatted per their values */
        DAY_FORMATTING?: {
            NORMAL?: string;
            WEEKEND?: string;
            HOLIDAY?: string;
            TODAY?: string;
        };

        /** what color should be used for borders on elements */
        BORDER_COLOR?: string;

        /** what should be used for the date background */
        DATE_BG_COLOR?: string;

        /** what font-size should be used for all text elements */
        FONT_SIZE?: number;

        /** false if we should hide the headers */
        SHOW_HEADERS?: boolean;

        /** false if we should hide the background */
        SHOW_BACKGROUND?: boolean;

        /** what the gap should be between elements in the canvas */
        BETWEEN_GROUP_GAP?: number;
    }

    
}