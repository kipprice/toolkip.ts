namespace KIP {

    export interface ICommand<R = void> {
        execute: (...params: any[]) => R;
        unexecute: (...params: any[]) => R;
    }


    export interface ICommandFunction<R> {
        (...params: any[]): R;
    }

    export enum CommandState {
        ERR = 0,
        EXECUTED = 1,
        REVERSED = 2
    }

    /**----------------------------------------------------------------------------
     * @class	CustomizableCommand
     * ----------------------------------------------------------------------------
     * allow a user to choose what a command does
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export class CustomizableCommand<R = void> implements ICommand<R> {
        
        //.....................
        //#region PROPERTIES
        
        /** how to perform this action */
        protected _onExecute: ICommandFunction<R>;
        public set onExecute(f: ICommandFunction<R>) { this._onExecute = f; }

        /** how to reverse performing this action */
        protected _onUnexecute: ICommandFunction<R>;
        public set onUnexecute(f: ICommandFunction<R>) { this._onUnexecute = f; }

        protected _state: CommandState;
        
        //#endregion
        //.....................

        //..........................................
        //#region HANDLE RUNNING THE COMMAND
        
        /**
         * execute
         * ---------------------------------------------------------------------------
         * perform the action on this commend
         */
        public execute(...params: any[]): R {

            // validate that we can execute this command
            if (this._state === CommandState.EXECUTED) { throw new Error("already performed"); }
            if (!this._onExecute) { throw new Error("no do action"); }

            // execute the command & update the state
            this._state = CommandState.EXECUTED;
            return this._onExecute(...params);
        }

        /**
         * unexecute
         * ---------------------------------------------------------------------------
         * reverse the action of this command
         */
        public unexecute(...params: any[]): R {

            // validate that we can unexecute this command
            if (this._state !== CommandState.EXECUTED) { throw new Error("not yet performed"); }
            if (!this._onUnexecute) { throw new Error("no undo action"); }

            // reverse the command & update the state
            this._state = CommandState.REVERSED;
            return this._onUnexecute(...params);
        }
        
        //#endregion
        //..........................................
        
    }

    
}