namespace KIP {

    /**
     * wait
     * ----------------------------------------------------------------------------
     * Set a timeout and resolve a promise when the timeout is done
     * @param   timeInMs    Time to wait before executing the 
     */
    export function wait(timeInMs: number): KipPromise {
        return new KipPromise((resolve) => {
            window.setTimeout(() => { resolve(); }, timeInMs);
        })
    }

    

    /**
     * onNextRender
     * ----------------------------------------------------------------------------
     * Run some code the next time the screen is rendering
     */
    export function onNextRender(): KIP.KipPromise {
        return new KIP.KipPromise((resolve) => {
            requestAnimationFrame(() => {
                resolve();
            })
        })
    }

}