/// <reference path="./customOption.ts" />

namespace KIP {
    export class CustomMultiOption<T = any> extends CustomOption<T> {

        //.....................
        //#region PROPERTIES
        
        protected get _addlCls() { return "multi"; }
        
        //#endregion
        //.....................
        
        protected _createElements() {
            super._createElements();

            // TODO: add checkbox before the option
        }
    }
}