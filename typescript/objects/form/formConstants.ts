namespace KIP.Forms {
    
        /** type of the element */
        export enum FormElementTypeEnum {
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
            COLOR = 17
        };
    
        /** options for layout */
        export enum FormElementLayoutEnum {
            MULTILINE = 0,
            TABLE = 1,
            FLEX = 2,
            LABEL_AFTER = 3
        };

        /** handle more type safeness of form */
        export type IFormElements<F> = {
            [P in keyof F]: FormElement<F[P]>;
        }

        /** standard elements for a displayable form element */
        export interface IFormDisplay {
            label?: string;
            cls?: string;
            layout?: FormElementLayoutEnum;
        }

        export interface IFormOptions extends IFormDisplay {
            popupForm?: boolean;
            noStandardStyles?: boolean;
            colors?: string[];
            addlButtons?: IFormButton[];
        }

        export interface IFormButton {
            display: string;
            cls?: string;
            callback: Function;
        }

         /** handle the template for setting up a form */
         export interface IFormElemTemplate<T> extends IFormDisplay {
            value?: T,
            position?: number;
            required?: boolean;
    
            onValidate?: IValidateFunc<T>;
            onOtherChange?: IOtherChangeFunc<T>;

            validationType?: ValidationType;
           
            [key: string]: any; 
        }
    
        export interface IFormArrayTemplate<T> extends IFormElemTemplate<T[]> {
            newLabel?: string;
        }
        /** select-specific template options */
        export interface IFormSelectTemplate extends IFormElemTemplate<number> {
            options: ISelectOptions;
        }

        export interface IFormToggleButtonTemplate<T> extends IFormElemTemplate<any> {
            options?: IToggleBtnOption<any>[];
        }

        export interface IFormSingleSelectButtonTemplate<T> extends IFormToggleButtonTemplate<T> {
            options?: IToggleBtnOption<T>[];
        }

        export interface IFormMultiSelectButtonTemplate<T> extends IFormToggleButtonTemplate<T[]> {
            options?: IToggleBtnOption<T>[];
        }

        export interface IFormFileElemTemplate<T> extends IFormElemTemplate<T> {
            attr?: IAttributes;
        }

        export interface IFormFilePathElemTemplate extends IFormFileElemTemplate<string> {
            onSave: IFileSaveCallback;
            onChange: IFileChangeCallback;
        }
    
        /** handle when the element's data has changed */
        export interface IValidateFunc<T> {
            (data: T): boolean;
        }
    
        /** handle when another element of the form has changed */
        export interface IOtherChangeFunc<T> {
            (otherID: string, data: any, formElement: FormElement<T>, context?: any): void;
        }

        export interface IFileChangeCallback {
            (files: FileList): string;
        }

        export interface IFileSaveCallback {
            (files: FileList): void;
        }
    
        /** handle multiple types of evaluable elements */
        export type EvaluableElem = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | IElemWithValue;
    
        /** handle an interface for anything that can contain a value */
        export interface IElemWithValue extends HTMLElement {
            value: any;
            checked?: boolean;
        }
    
        /** consistent set of elements for all Form Elements */
        export interface IFormHTMLElements {
            core: HTMLElement;
            error?: HTMLElement;
            lbl?: HTMLElement;
            input?: EvaluableElem;
            childrenContainer?: HTMLElement;
            [key: string]: HTMLElement;
        }
    
        /** allow another caller to listen to a form element changing */
        export interface IListenerFunction<T> {
            (key: string, data: T): void;
        }

        export enum DirectionType {
            FORWARD = 1,
            BACKWARD = -1,
            MOVE = 0
        }

        export enum ValidationType {
            KEEP_ERROR_VALUE = 1,
            RESTORE_OLD_VALUE = 2,
            CLEAR_ERROR_VALUE = 3,
            NO_BLUR_PROCESSED = 4
        }
    
    }