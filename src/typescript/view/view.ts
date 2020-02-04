namespace KIP {

    /**----------------------------------------------------------------------------
     * @class   View
     * ----------------------------------------------------------------------------
     * View based on MVC paradigm that can also be used in navigation
     * @author  Kip Price
     * @version 1.1.0
     * ----------------------------------------------------------------------------
     */
    export abstract class View extends Drawable {

        /**
         * update
         * ----------------------------------------------------------------------------
         * change the view based on details in the model
         */
        public update(...params: any[]): void {
            // base implementation does nothing
        }


        /**
         * canNavigateAway
         * ----------------------------------------------------------------------------
         * True if we can leave this view in it's current state, false otherwise
         * @param   isCancel    True if the user chose to cancel
         */
        public canNavigateAway(isCancel?: boolean): boolean {
            // Assume we can move away
            return true; 
        }

        /**
         * onNavigateAway
         * ----------------------------------------------------------------------------
         * What to do if the user is leaving this view
         * @param   isCancel    True if the user chose to cancel
         */
        public onNavigateAway(isCancel?: boolean): any {
            // base implementation doesn't do anything on nav away
            return null;
        }
    }
}