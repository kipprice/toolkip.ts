namespace KIP.Forms {
    
        //...............
        //#region ENUMS

        /** type of the element */
        export enum FieldTypeEnum {
            TEXT = 1,
            NUMBER = 2,
            DATE = 3,
            TIME = 4,
            DATE_TIME = 5,
            SELECT = 6,
            CHECKBOX = 7,
            TEXTAREA = 8,
            ARRAY = 9,
            ARRAY_CHILD = 10,
            TOGGLE_BUTTON = 11,
            CUSTOM = 12,
            SECTION = 13,
            HIDDEN = 14,
            FILE_UPLOAD = 15,
            FILE_PATH = 16,
            COLOR = 17,
            PERCENTAGE = 18
        };

        export enum ValidationType {
            KEEP_ERROR_VALUE = 1,
            RESTORE_OLD_VALUE = 2,
            CLEAR_ERROR_VALUE = 3,
            NO_BLUR_PROCESSED = 4
        }

         /** options for layout */
         export enum FormElementLayoutEnum {
            MULTILINE = 0,
            TABLE = 1,
            FLEX = 2,
            LABEL_AFTER = 3
        };

        //#endregion
        //...............

        //...............
        //#region TYPES

        /** handle more type safeness of form */
        export type IFields<F> = {
            [P in keyof F]?: Field<F[P]>;
        }

        /** handle multiple types of evaluable elements */
        export type EvaluableElem = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | IElemWithValue;

        //#endregion
        //...............

         //..................
        //#region FUNCTIONS

        /** allow another caller to listen to a form element changing */
        export interface IListenerFunction<T> {
            (key: string, data: T): void;
        }

        /** handle when the element's data has changed */
        export interface IValidateFunc<T> {
            (data: T, errorString: IErrorString): boolean;
        }

        /** handle when another element of the form has changed */
        export interface IOtherChangeFunc<T> {
            (otherID: string, data: any, formElement: Field<T>, context?: any): void;
        }

        //#endregion
        //..................

        //........................
        //#region UI INTERFACES
        
        /** consistent set of elements for all Form Elements */
        export interface IFieldElems {
            base: HTMLElement;
            error?: HTMLElement;
            lblContainer?: HTMLElement;
            lbl?: HTMLElement;
            helpTextIcon?: HTMLElement;
            input?: EvaluableElem;
            childrenContainer?: HTMLElement;
            [key: string]: HTMLElement | Drawable;
        }

        /** standard elements for a displayable form element */
        export interface IFormDisplay {
            label?: string;
            cls?: string;
            layout?: FormElementLayoutEnum;
            hideTitle?: boolean;
            useGhostText?: boolean;
            helpText?: string;
        }

        export interface IFormOptions extends IFormDisplay {
            popupForm?: boolean;
            noStandardStyles?: boolean;
            colors?: {
                formTheme: string;
                formSubTheme?: string;
            };
            addlButtons?: IFormButton[];
        }

        export interface IFormButton {
            display: string;
            cls?: string;
            callback: Function;
        }

        //#endregion
        //........................

        //..............................
        //#region VALIDATION INTERFACES

        export interface ICanSaveTracker {
            hasErrors: boolean;
            hasMissingRequired: boolean;
        }

        export interface IErrorString {
            title?: string;
            details?: string;
        }

        //#endregion
        //..............................

        //.................................
        //#region FUNCTIONALITY INTERFACES

         /** handle the template for setting up a form */
         export interface IFieldConfig<T> extends IFormDisplay {
            value?: T,
            defaultValue?: T;
            position?: number;
            required?: boolean;
    
            onValidate?: IValidateFunc<T>;
            onOtherChange?: IOtherChangeFunc<T>;

            validationType?: ValidationType;
        }
    
        /** handle an interface for anything that can contain a value */
        export interface IElemWithValue extends HTMLElement {
            value: any;
            checked?: boolean;
        }

        //#endregion
        //.................................
    }