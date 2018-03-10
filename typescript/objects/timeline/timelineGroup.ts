namespace KIP {

    export interface ITimelineGroupOptions {
        HORIZONTAL?: boolean;
        ELEMENT_GAP?: number;
        ELEM_HEIGHT?: number;
    }

    /** create an item on the project plan */
    export class TimelineGroup extends CanvasGroup implements ITimelineElement {

        //#region PROPERTIES

        /** the canvas upon which to draw the group */
        protected _canvas: Timeline;

        /** elements that make up this group */
        protected _elements: Collection<TimelineElement>;

        /** track the start date of the group */
        private _startDate: Date;
        public get startDate(): Date { return this._startDate; }
        public set startDate (start: Date) { this._startDate = start; }

        /** track the end date of the group */
        private _endDate: Date;
        public get endDate(): Date { return this._endDate; }
        public set endDate (end: Date) { this._endDate = end; }

        /** keep track of whether this group is collapsed */
        protected _isCollapsed: boolean = false;
        public get isCollapsed(): boolean { return this._isCollapsed; }

        /** handle options for the group */
        private _options: ITimelineGroupOptions;

        //#endregion

        /**...........................................................................
         * Creates a timeline group
         * 
         * @param   id          The unique ID for the group
         * @param   options     The options to use for the group
         * ...........................................................................
         */
        constructor (id: string, options?: ITimelineGroupOptions) {
            super(id);
            this._reconcileOptions(options);
        }

        /**...........................................................................
         * _createDefaultOptions
         * ...........................................................................
         * Create the default options for the group
         * ...........................................................................
         */
        protected _createDefaultOptions (): ITimelineGroupOptions {
            return {
                HORIZONTAL: false,
                ELEMENT_GAP: 2,
                ELEM_HEIGHT: 20
            };
        }

        /**...........................................................................
         * _reconcileOptions
         * ...........................................................................
         * reconcile the options for the group 
         * 
         * @param   options     The options to use for this group
         * ...........................................................................
         */
        protected _reconcileOptions(options: ITimelineGroupOptions): void {
            let defaults: ITimelineGroupOptions = this._createDefaultOptions();
            this._options = reconcileOptions(options, defaults);
        } 

        /**...........................................................................
         * addElement
         * ...........................................................................
         * add a new project line 
         * 
         * @param   elem    The element to add
         * ...........................................................................
         */
        public addElement (elem: TimelineElement): void {
            // handle extreme dates
            this._reconcileDates(elem);

            // Set the height if it hasn't been set yet & its not a group
            if ((elem.dimensions.h === 0) && (elem.type !== ElementType.Group)) {
                elem.dimensions.h = this._options.ELEM_HEIGHT;
            }

            // Horizontal groups don't get their y-position adjusted
            if (!this._options.HORIZONTAL) {
                elem.adjustDimensions({
                    x: 0,
                    y: this._dimensions.h + this._options.ELEMENT_GAP
                });
            }
            
            super.addElement(elem);
        }

        /**...........................................................................
         * _reconcileDates
         * ...........................................................................
         * Assign dates and update for extrema if needed
         * 
         * @param   elem    The element we are reconciling dates for
         * ...........................................................................
         */
        private _reconcileDates(elem: TimelineElement) : void {

            // If the element is missing dates, assign them
            if (!elem.startDate) {
                elem.startDate = this._startDate;
                return;
            }

            let needsUpdate: boolean;

            // Otherwise check if our extrema need updating
            if (!this._startDate || (elem.startDate < this._startDate)) {
                this._startDate = elem.startDate;
                needsUpdate = true;
            }

            if (!this._endDate || (elem.endDate > this._endDate)) {
                this._endDate = elem.endDate;
            }

            if (needsUpdate) { this._updateLabels(); }
        }

        /**...........................................................................
         * _setCanvas
         * ...........................................................................
         * @param   canvas  The canvas to set
         * ...........................................................................
         */
        protected _setCanvas (canvas: Timeline) : void {
            super._setCanvas(canvas);
        }

        // TODO: create sort function
        public sort (sortFunc: any): void {

        }

        public 

        /**...........................................................................
         * _updateLabels
         * ...........................................................................
         * update labels to my start position
         * ...........................................................................
         */
        private _updateLabels (): void {
            this._elements.map((elem: TimelineElement) => {
                if (elem.type === ElementType.Text) {
                    elem.startDate = this._startDate;
                }
            });
        }

    }
}