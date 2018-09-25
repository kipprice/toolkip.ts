namespace KIP {

    /**
     * @class   View
     * 
     * Full view that will be used in navigation
     * @author  Kip Price
     * @version 1.0.0
     */
    export abstract class View extends Drawable {

        public update(...params: any[]): void {
            // base implementation does nothing
        }

        public canNavigateAway(isCancel?: boolean): boolean {
            // Assume we can move away
            return true; 
        }

        public onNavigateAway(isCancel?: boolean): any {
            // base implementation doesn't do anything on nav away
            return null;
        }
    }
}