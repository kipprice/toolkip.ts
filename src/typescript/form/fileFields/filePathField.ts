namespace KIP.Forms {

    export interface IFileSaveCallback {
        (files: FileList, blobs?: Blob[]): Promise<string>;
    }

    export interface IFormFilePathElemTemplate extends IFormFileElemTemplate<string> {
        onSave: IFileSaveCallback;
    }

    /**----------------------------------------------------------------------------
     * @class FilePathField
     * ----------------------------------------------------------------------------
     * handle a file-upload field that supports just a file path 
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class FilePathField<T extends IFormFilePathElemTemplate = IFormFilePathElemTemplate> extends Field<string, T> {

        //..................
        //#region STYLES

        /** style elements for the file path */
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem.filepath input[type=file]": {
                display: "none"
            },

            ".kipFormElem.filepath label.filepath": {
                backgroundColor: "<formTheme>",
                color: "#FFF",
                borderRadius: "2px",
                boxShadow: "1px 1px 5px 2px rgba(0,0,0,.1)",
                padding: "10px",
                fontSize: "0.7em",
                cursor: "pointer"
            },

            ".kipFormElem.filepath .display": {
                fontSize: "0.6em",
                whiteSpace: "break"
            }
        }

        //#endregion
        //..................

        //.....................
        //#region PROPERTIES

        /** select the appropriate type for the file path type */
        protected get _type(): FieldTypeEnum { return FieldTypeEnum.FILE_PATH; }

        /** set a default class for file-path elements */
        protected get _defaultCls(): string { return "filepath"; }

        /** set a default value for file-path elements */
        protected get _defaultValue(): string { return ""; }

        /** allow the caller to specify how the image gets saved to the server (and the filepath that ultimately gets saved) */
        protected _onSaveCallback: IFileSaveCallback;

        /** track the files that have been uploaded */
        protected _files: FileList;

        /** ??? */
        protected _attr: IAttributes;

        /** determine if the link was the element that changed */
        protected _tempLink: string;

        protected _elems: {
            base: HTMLElement;
            input: HTMLInputElement;
            inputLabel?: HTMLElement;
            inputContainer?: HTMLElement;
            label?: HTMLElement;
            error: HTMLElement;
            display: HTMLElement;
        }

        //#endregion
        //.....................

        /**
         * _parseFieldTemplate
         * ----------------------------------------------------------------------------
         * Handle creating this element off of a template
         * @param   template    
         */
        protected _parseFieldTemplate(template: T): void {
            super._parseFieldTemplate(template);
            this._onSaveCallback = template.onSave;
            this._attr = template.attr;
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         */
        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.base);
            this._elems.display = createSimpleElement("", "display", this._data, null, null, this._elems.base);
            this._elems.inputContainer = createSimpleElement("", "fileContainer", "", null, null, this._elems.base);
            this._elems.input = createInputElement(this._id + "|input", "", "file", "", null, null, this._elems.inputContainer);
            this._elems.inputLabel = createLabelForInput("Upload File", this._id + "|input", "filepath", this._elems.inputContainer);
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * handle when the data in this element changes
         */
        protected _getValueFromField(): string {

            // check if the link is the one that changed, and if so, update that
            if (!isNullOrUndefined(this._tempLink)) {
                return this._onLinkChange();
            }

            // quit if we don't have any files uploaded
            this._files = (this._elems.input as HTMLInputElement).files;
            console.log(this._files);
            if (!this._files) { return ""; }

            // treat the file name as the value for now
            // we will store the real path as part of the save function
            let str = this._files[0].name;
            return str;
        }

        /**
         * _onLinkChange
         * ----------------------------------------------------------------------------
         */
        protected _onLinkChange(): string {
            let out = this._tempLink;
            this._tempLink = null;
            return out;
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * update this element to have the appropriate data
         */
        public update(data: string, allowEvents: boolean): void {
            this._data = data;
            this._elems.display.innerHTML = data;
            this._elems.input.value = "";
        }

        /**
         * save
         * ----------------------------------------------------------------------------
         * @param   internalOnly    If true, we're only saving to our own data field,
         *                          not an external callers
         * 
         * @returns The file path that is now saved
         */
        public async save(internalOnly?: boolean): Promise<string> {
            if (internalOnly) { return; }                               // Don't do anything if this is an internal change
            if (this._files) {                                          // Make sure that if we have files, we're uploading them
                if (!this._onSaveCallback) { return ""; }               // Don't do anything if we don't have a callback
                this._data = await this._onSaveCallback(this._files);   // Run our callback
            }
            return this._data;                                          // Return the appropriate data
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Duplicate this form element appropriately
         */
        protected _createClonedElement(appendToID: string): FilePathField<T> {
            return new FilePathField<T>(this.id + appendToID, this);
        }
    }
}