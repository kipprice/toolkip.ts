///<reference path="../formElement.ts" />

namespace KIP.Forms {

    export interface IFormFileElemTemplate<T> extends IFormElemTemplate<T> {
        attr?: IAttributes;
    }
    
    /**----------------------------------------------------------------------------
     * @class FileUploadElement
     * ----------------------------------------------------------------------------
     * handle file uploads such that they return a file list 
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class FileUploadElement extends FormElement<FileList> {

        //.....................
        //#region PROPERTIES

        /** track the type of form element this is */
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.FILE_UPLOAD; }

        /** give this for element a default CSS class */
        protected get _defaultCls(): string { return "file"; }

        /** set a default value for this form element type */
        protected get _defaultValue(): FileList { return null; }

        /** keep track of the  */
        protected _attr: IAttributes;

        //#endregion
        //.....................

        /**
         * FileUploadElement
         * ----------------------------------------------------------------------------
         * Create a FileUploadElement
         * @param   id          The unqiue ID for the element
         * @param   template    The template element to use as a basis for this element
         */
        constructor(id: string, template: IFormFileElemTemplate<FileList> | FileUploadElement) {
            super(id, template);
        }

        /**
         * _parseElemTemplate
         * ----------------------------------------------------------------------------
         * Parse the details of how to render this element
         */
        protected _parseElemTemplate(template: IFormFileElemTemplate<FileList>): void {
            super._parseElemTemplate(template);
            this._attr = template.attr;
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * Handle creating elements
         */
        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.core);
            this._elems.input = createInputElement("", "", "file", this._data, null, null, this._elems.core);
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * Handle when the user has uploaded a file
         * @returns True if the file passes validation
         */
        protected _onChange(): boolean {
            let files: FileList = (this._elems.input as HTMLInputElement).files;
            return this._standardValidation(files);
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Handle cloning this element
         * @param   appendToId  The ID to append to the cloned element
         * @returns The created cloned element
         */
        protected _createClonedElement(appendToId: string): FileUploadElement {
            return new FileUploadElement(this.id + appendToId, this);
        }
    }

    

   
}