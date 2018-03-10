namespace KIP {
    export interface IComplexEnumItem {
        displayName: string;
        value: number;
    }

    export interface IComplexEnum {
        [key: string]: IComplexEnumItem;
    }
}