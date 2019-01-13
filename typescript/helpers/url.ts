namespace KIP.URL {

    /**
     * cleanURL
     * ----------------------------------------------------------------------------
     * Generate the current URL without any additional parameters
     */
    export function cleanURL(): string {
        return window.location.href.replace(window.location.search, "");
    }

    /**
     * splitParams
     * ----------------------------------------------------------------------------
     * Split the parameters included in a URL string into their requisite 
     * key-value pairs
     */
    export function splitParams(): IKeyValPair<string>[] {
        let paramStr = window.location.search.replace("?", "");
        let tmp: string[] = paramStr.split("&");
        let params: IKeyValPair<string>[] = [];

        for (let p of tmp) {
            let splitP = p.split("=");

            let pair: IKeyValPair<string> = {
                key: splitP[0],
                val: splitP[1]
            };

            params.push(pair);
        }

        return params;
    }
}