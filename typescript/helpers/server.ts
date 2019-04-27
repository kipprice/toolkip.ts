namespace KIP {

    //#region INTERFACES

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

    //#endregion

    //#region PUBLIC FUNCTIONS
    /**
     * ajaxRequest
     * ----------------------------------------------------------------------------
     * Sends an AJAX request to a url of our choice as either a POST or GET
     * 
     * @param   type        Set to either "POST" or "GET" to indicate the type of response we want
     * @param   url         The URL to send the request to
     * @param   success     A function to run if the call succeeds
     * @param   error       A function to run if the request errors out
     * @param   params      An object with key value pairs
     * 
     * @returns The request that was sent
    */
    export function ajaxRequest(type: AjaxTypeEnum, url: string, successCb?: IAjaxSuccessFunction, errorCb?: IAjaxErrorFunction, params?: IAjaxParams | FormData): XMLHttpRequest {
        let request: XMLHttpRequest;
        request = _getXmlRequestObject();                        // try to get an HTML Request
        if (!request) return null;                              // if we couldn't grab a request, quit

        _assignXmlRequestCallbacks(request, successCb, errorCb); // assign the callbacks upon request completion
        _sendXmlRequest(request, type, url, params);             // send the XML request

        return request;                                         // return the total request
    };

    export interface IAjaxDetails {
        type: AjaxTypeEnum;
        requestUrl: string;
        params: IAjaxParams | FormData;
    }

    /**
     * ajax
     * ----------------------------------------------------------------------------
     * Run an async ajax call to the specified server
     * @param   ajaxDetails     The type of request to run
     * @returns A promise that will return the results of the ajax call
     */
    export function ajax(ajaxDetails: IAjaxDetails): Promise<any> {
        return new Promise((resolve, reject) => {
            ajaxRequest(
                ajaxDetails.type,
                ajaxDetails.requestUrl,
                (data: any) => {
                    resolve(data);
                },
                () => {
                    reject("Ajax request failed: " + ajaxDetails.requestUrl)
                },
                ajaxDetails.params
            );
        });
    }

    /**
     * loadFile
     * ----------------------------------------------------------------------------
     * load a file from a particular URL
     * 
     * @param   url         The URL to load a file from
     * @param   success     What to do when the file is loaded successfully
     * @param   error       What do do if the file can't be loaded
     */
    export function loadFile(url: string, success?: IAjaxSuccessFunction, error?: IAjaxErrorFunction): void {
        let request: XMLHttpRequest = new XMLHttpRequest();

        // start the request to the remote file
        request.open('GET', url);

        // handle the file actually changing status
        request.onreadystatechange = () => {
            if (request.readyState == 4 && request.status == 200) {
                success(request.responseText);
            } else if (request.status === 404) {
                error(request.responseText);
            }
        };

        // actually send the appropriate request
        request.send();
    };

    export function saveFile(fileName: string, content: string | Blob): void {
        let blob: Blob;

        // make sure we handle either type of content sent our way
        if (typeof content === "string") {
            blob = new Blob([content], { type: "text/plain" });
        } else {
            blob = content;
        }

        // allow the user to download the generated file
        _generateDownload(fileName, blob);
    }

    function _generateDownload(filename: string, file: Blob): void {
		// Save the file to the user's machine
		// (taken from https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server)

		// handle IE saving
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(file, "u");
		}

		// handle all other browsers
		else {
			let elem = KIP.createElement({
				type: "a",
				attr: {
					"href": window.URL.createObjectURL(file),
					"download": filename
				}
			});

			// add the element to the document & simulate a click
			document.body.appendChild(elem);
			elem.click();
			document.body.removeChild(elem);
		}
	}

    //#endregion

    //#region HELPER FUNCTIONS

    /**...........................................................................
     * _getXmlRequestObject
     * ...........................................................................
     * create the Xml request object 
     * 
     * @returns A created request, appropriate for the particular browser
     * ...........................................................................
     */
    function _getXmlRequestObject () : XMLHttpRequest {
        let request: XMLHttpRequest = null;
        try { request = new XMLHttpRequest(); }                             // Try to create a non IE object
        catch (e) {                                                         // ...
            try { request = new ActiveXObject("Msxml2.XMLHTTP"); }          // If it failed, it could be because we're in IE, so try that
            catch (e) {                                                     // ...
                try { request = new ActiveXObject("Microsoft.XMLHTTP"); }   // If that failed too, then we'll try the other IE specific method
                catch (e) {                                                 // ...
                    return null;                                            // And if we still can't get anything, then we're out of options
                }
            }
        }
        return request;                                                     // return the updated request
    }

    /**...........................................................................
     * _assignXmlRequestCallbacks
     * ...........................................................................
     * handle the xml request getting back to us 
     * 
     * @param   request     The AJAX request, appropriate for the browser
     * @param   successCb   What to do if the request successfully returns
     * @param   errorCb     What to do if the request fails
     * 
     * @returns The request, now configured to handle success + error states
     * ...........................................................................
     */
    function _assignXmlRequestCallbacks (request: XMLHttpRequest, successCb?: IAjaxSuccessFunction, errorCb?: IAjaxErrorFunction) : XMLHttpRequest {
        request.onreadystatechange = () => {                // register the callback
            if (request.readyState === 4) {                 // make sure the request is ready to process
                if (request.status === 200) {               // handle success
                    if (successCb) {
                        successCb(request.responseText);
                    }
                } else {                                    // handle failure
                    if (errorCb) {
                        errorCb(request.responseText);
                    }
                }
            }
        };
        return request;                                 // return the appropriate request
    }

    /**...........................................................................
     * _buildParameters
     * ...........................................................................
     * turn a param object into a string suitable for a URI 
     * 
     * @param   params      List of parameters that we will turn into an appropriate AJAX request string
     * 
     * @returns The string containing all appropriate paramters
     * ...........................................................................
     */
    function _buildParameters (params: IAjaxParams) : string {
        let paramOut: string = "";
        let key: string;
        
        for (key in params) {
            if (params.hasOwnProperty(key)) {

                // Append the appropriate PHP delimiter
                if (paramOut.length > 0) {
                    paramOut += "&";
                }

                // Make sure we add the key-value pair, properly escaped
                paramOut += (encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));

            }
        }

        return paramOut;
    }

    /**...........................................................................
     * _sendXmlRequest
     * ...........................................................................
     * handle the actual sending of the request 
     * 
     * @param   request     The AJAX request to send
     * @param   type        Whether this is a POST or a GET request
     * @param   url         Where to send the request
     * @param   params      What parameters or data should be sent with the request
     * 
     * @returns The sent request
     * ...........................................................................
     */
    function _sendXmlRequest (request: XMLHttpRequest, type: AjaxTypeEnum, url: string, params?: IAjaxParams | FormData): XMLHttpRequest {
        if (type === AjaxTypeEnum.GET) { 
            return _sendGetRequest(request, url); 
        } else if (type === AjaxTypeEnum.POST) { 
            return _sendPostRequest(request, url, params); 
        }
    }

    /**...........................................................................
     * _sendGetRequest
     * ...........................................................................
     * handle sending GET AJAX requests 
     * 
     * @param   request     The request to send
     * @param   url         The URL to which to send the requesr
     * 
     * @returns The sent request
     * ...........................................................................
     */
    function _sendGetRequest (request: XMLHttpRequest, url: string) : XMLHttpRequest {
        request.open("GET", url, true);
        return request;
    }

    /**...........................................................................
     * _sendPostRequest
     * ...........................................................................
     * handle sending POST AJAX queries 
     * 
     * @param   request     The request to send
     * @param   url         The URL to which to send the request
     * @param   params      The parameters or data to send with the request
     * 
     * @returns The sent request
     * ...........................................................................
     */
    function _sendPostRequest (request: XMLHttpRequest, url: string, params?: IAjaxParams | FormData) : XMLHttpRequest {
        let reqHeaderType: string = "application/x-www-form-urlencoded";    // save off the appropriate header
        let reqHeaderDisposition: string;

        let uriParams: string | FormData;

        request.open("POST", url, true);                                    // open the connection
        
        if (params instanceof FormData) {
            uriParams = params;
            reqHeaderType = "";
        } else {
            uriParams = _buildParameters(params);  
        }

        if (reqHeaderType) { request.setRequestHeader("Content-Type", reqHeaderType); }         // pull in the data for the POST
        request.send(uriParams);                                                                // open request   

        return request;                                                                         // return the completed request                                          
    }

    //#endregion

}