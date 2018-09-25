namespace KIP {

    /**
     * Undoable
     * ----------------------------------------------------------------------------
     * Keep track of an action that can be undone
     */
    export interface Undoable {
        forwardFunction: Function;
        reverseFunction: Function;
    }

    /**----------------------------------------------------------------------------
     * @class   UndoChain
     * ----------------------------------------------------------------------------
     * Allow actions to be undone / redone
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class UndoChain extends HistoryChain<Undoable> {

        /**
         * UndoChain
         * ----------------------------------------------------------------------------
         * Create an undo chain and registers appropriate listeners
         */
        constructor() {
            super();
            window.addEventListener("keyup", (event: KeyboardEvent) => {
                if (!event.ctrlKey) { return; }                     // we always need ctrl to be pressed
                if (event.keyCode !== 90) { return; }               // likewise, we always need a z
                if (this._shouldIgnoreEvent(event)) { return; }     // alo listen to user-specified ignores

                // shift key means we're trying to redo
                if (event.shiftKey) {
                    this.redo();

                // otherwise, perform an undo
                } else {
                    this.undo();
                }
            });
        }

        /**
         * _shouldIgnoreEvent
         * ----------------------------------------------------------------------------
         * Overridable function that checks if we should ignore a relevant key event.
         * This is useful for cases where the browser has built in undo/redo 
         * functionality, so we don't perform 2 actions.
         * 
         * @param   event   The event we could potentially ignore
         * 
         * @returns True if we should ignore the event
         */
        protected abstract _shouldIgnoreEvent(event: KeyboardEvent): boolean;

        /**
         * undo
         * ----------------------------------------------------------------------------
         * Undo an action. Also fired by ctrl + z;
         */
        public undo(): void {
            let undoable: Undoable = this.navigateBack();
            if (!undoable || !undoable.reverseFunction) { return; }
            undoable.reverseFunction();
        }

        /**
         * redo
         * ----------------------------------------------------------------------------
         * Redo an action. Also fired by ctrl + shift + z.
         */
        public redo(): void {
            let undoable: Undoable = this.navigateForward();
            if (!undoable || !undoable.forwardFunction) { return; }
            undoable.forwardFunction();
        }
    }
}