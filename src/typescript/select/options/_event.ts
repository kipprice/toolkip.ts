/// <reference path="../../codeEvent/_codeEvent.ts" />

namespace KIP {

    class _OptionSelectedCodeEvent extends _CodeEvent<IOptionSelectedEvent> {
        protected get _name() { return "optionselected"; }

        public addEventListener<T>(cb: ICodeEventCallback<IOptionSelectedEvent<T>>, target?: any){
            super.addEventListener(cb, target);
        }
    }

    export const OptionSelectedCodeEvent = new _OptionSelectedCodeEvent();

    //..........................................
    //#region TYPES AND INTERFACES
    
    export interface IOptionSelectedEvent<T = any> {
        value: T;
        display: string;
    }
    
    //#endregion
    //..........................................
}