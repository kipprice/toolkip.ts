namespace KIP {
     /**...........................................................................
     * enum to keep track of the types of AJAX requesr
     * @version 1.0
     * ...........................................................................
     */
    export enum AjaxTypeEnum {
        POST = 1,
        GET = 2
    };

    /**...........................................................................
     * @interface IAjaxSuccessFunction
     * @version 1.0
     * handle when an ajax request ends in a success
     * ...........................................................................
     */
    export interface IAjaxSuccessFunction {
        (response: string) : void;
    }

    /**...........................................................................
     * @interface IAjaxErrorFunction
     * @version 1.0
     * handle when an ajax request ends in a failure
     * ...........................................................................
     */
    export interface IAjaxErrorFunction {
        (response: string) : void;
    }

    /**...........................................................................
     * @interface IAjaxParams
     * @version 1.0
     * keeps track of parameters that will be sent in an AJAX call
     * ...........................................................................
     */
    export interface IAjaxParams {
        [ajaxKey: string] : string;
    }

    export interface IAjaxDetails {
        type: AjaxTypeEnum;
        requestUrl: string;
        params: IAjaxParams | FormData;
        headerParams?: IAjaxParams;
    }
}