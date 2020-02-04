namespace KIP {

    /**
     * wait
     * ----------------------------------------------------------------------------
     * Set a timeout and resolve a promise when the timeout is done
     * @param   timeInMs    Time to wait before executing the 
     */
    export function wait(timeInMs: number): Promise<any> {
        return new Promise(resolve => window.setTimeout(resolve, timeInMs) );
    }

    

    /**
     * onNextRender
     * ----------------------------------------------------------------------------
     * Run some code the next time the screen is rendering
     */
    export function nextRender(): Promise<any> {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                resolve();
            })
        })
    }

}