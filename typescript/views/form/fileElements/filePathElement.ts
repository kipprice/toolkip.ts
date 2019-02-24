namespace KIP.Forms {
    
    export interface IFileChangeCallback {
        (files: FileList): string;
    }

    export interface IFileSaveCallback {
        (files: FileList, blobs?: Blob[]): void;
    }

    export interface IFormFilePathElemTemplate extends IFormFileElemTemplate<string> {
        onSave: IFileSaveCallback;
        onChange: IFileChangeCallback;
    }

    /**----------------------------------------------------------------------------
     * @class FilePathElement
     * ----------------------------------------------------------------------------
     * handle a file-upload field that supports just a file path 
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export class FilePathElement extends FormElement<string> {

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
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.FILE_PATH; }

        /** set a default class for file-path elements */
        protected get _defaultCls(): string { return "filepath"; }

        /** set a default value for file-path elements */
        protected get _defaultValue(): string { return ""; }

        /**  */
        protected _onSaveCallback: IFileSaveCallback;
        protected _onChangeCallback: IFileChangeCallback;
        protected _files: FileList;
        protected _attr: IAttributes;
        protected _tempLink: string;

        protected _elems: {
            core: HTMLElement;
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
         * FilePathElement
         * ----------------------------------------------------------------------------
         * Create the file path element
         * @param   id          Unique ID for this element
         * @param   template    Template to use to create this element
         */
        constructor(id: string, template: IFormFilePathElemTemplate | FilePathElement) {
            super(id, template);
        }

        /**
         * _parseElemTemplate
         * ----------------------------------------------------------------------------
         * Handle creating this element off of a template
         * @param   template    
         */
        protected _parseElemTemplate(template: IFormFilePathElemTemplate): void {
            super._parseElemTemplate(template);
            this._onSaveCallback = template.onSave;
            this._onChangeCallback = template.onChange
            this._attr = template.attr;
        }

        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         */
        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.core);
            this._elems.display = createSimpleElement("", "display", this._data, null, null, this._elems.core);
            this._elems.inputContainer = createSimpleElement("", "fileContainer", "", null, null, this._elems.core);
            this._elems.input = createInputElement(this._id + "|input", "", "file", "", null, null, this._elems.inputContainer);
            this._elems.inputLabel = createLabelForInput("Upload File", this._id + "|input", "filepath", this._elems.inputContainer);
        }

        /**
         * _onChange
         * ----------------------------------------------------------------------------
         * handle when the data in this element changes
         */
        protected _onChange(): boolean {
            // check if the link is the one that changed, and if so, update that
            if (!isNullOrUndefined(this._tempLink)) {
                return this._onLinkChange();
            }

            // quit if we can't turn this element into a string (rare)
            if (!this._onChangeCallback) { return false; }
            this._files = (this._elems.input as HTMLInputElement).files;
            console.log(this._files);
            if (!this._files) { return true; }

            // Handle the change event
            let str = this._onChangeCallback(this._files);
            if (this._standardValidation(str)) {
                return true;
            }
        }

        /**
         * _onLinkChange
         * ----------------------------------------------------------------------------
         */
        protected _onLinkChange(): boolean {
            let out: boolean = this._standardValidation(this._tempLink);    // Check if we can set that link
            this._tempLink = null;                                          // Clear it in either case
            return out;                                                     // Quit with the result
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * @param data 
         */
        public update(data: string): void {
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
        public save(internalOnly?: boolean): string {
            if (internalOnly) { return; }                       // Don't do anything if this is an internal change
            if (this._files) {                                  // Make sure that if we have files, we're uploading them
                if (!this._onSaveCallback) { return ""; }       // Don't do anything if we don't have a callback
                this._onSaveCallback(this._files);              // Run our callback
            }
            return this._data;                                  // Return the appropriate data
        }

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Duplicate this form element appropriately
         */
        protected _createClonedElement(appendToID: string): FilePathElement {
            return new FilePathElement(this.id + appendToID, this);
        }
    }
}