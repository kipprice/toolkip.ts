///<reference path="../_field.ts" />

namespace KIP.Forms {

    export interface IFormFileElemTemplate<T> extends IFieldConfig<T> {
        attr?: IAttributes;
    }
    
    /**----------------------------------------------------------------------------
     * @class FileUploadField
     * ----------------------------------------------------------------------------
     * handle file uploads such that they return a file list 
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class FileUploadField<T extends IFormFileElemTemplate<FileList> = IFormFileElemTemplate<FileList>> extends Field<FileList,T> {

        //.....................
        //#region PROPERTIES

        /** track the type of form element this is */
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.FILE_UPLOAD; }

        /** give this for element a default CSS class */
        protected get _defaultCls(): string { return "file"; }

        /** set a default value for this form element type */
        protected get _defaultValue(): FileList { return null; }

        /** keep track of the  */
        protected _attr: IAttributes;

        //#endregion
        //.....................

        /**
         * _parseFieldTemplate
         * ----------------------------------------------------------------------------
         * Parse the details of how to render this element
         */
        protected _parseFieldTemplate(template: T): void {
            super._parseFieldTemplate(template);
            this._attr = template.attr;
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * Handle creating elements
         */
        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.base);
            this._elems.input = createInputElement("", "", "file", this._data, null, null, this._elems.base);
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * Handle when the user has uploaded a file
         * @returns True if the file passes validation
         */
        protected _getValueFromField(): FileList {
            let files: FileList = (this._elems.input as HTMLInputElement).files;
            return files
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Handle cloning this element
         * @param   appendToId  The ID to append to the cloned element
         * @returns The created cloned element
         */
        protected _createClonedElement(appendToId: string): FileUploadField<T> {
            return new FileUploadField<T>(this.id + appendToId, this);
        }
    }

    

   
}