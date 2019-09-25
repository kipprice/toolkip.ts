namespace KIP.Numbers {
    export function padToDigits(toPad: number, numberOfDigits: number): string {
        let outArr = toPad.toString().split("");

        while (outArr.length < numberOfDigits) {
            outArr.splice(0, 0, "0");
        }

        return outArr.join("")

    }
}