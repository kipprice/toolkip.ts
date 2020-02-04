namespace KIP {
    let _id = 0;

    export function generateUniqueID(prefix?: string): string {
        if (!prefix) { prefix = "id"; }
        _id += 1;
        return prefix + _id;
    }
}