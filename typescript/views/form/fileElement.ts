///<reference path="formElement.ts" />
namespace KIP.Forms {
    /**...........................................................................
     * @class FileUploadElement
     * ...........................................................................
     * handle file uploads such that they return a file list 
     * @version 1.0
     * ...........................................................................
     */
    export class FileUploadElement extends FormElement<FileList> {

        /** track the type of form element this is */
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.FILE_UPLOAD; }

        /** give this for element a default CSS class */
        protected get _defaultCls(): string { return "file"; }

        /** set a default value for this form element type */
        protected get _defaultValue(): FileList { return null; }

        /** keep track of the  */
        protected _attr: IAttributes;

        /**...........................................................................
         * Create a FileUploadElement
         * 
         * @param   id          The unqiue ID for the element
         * @param   template    The template element to use as a basis for this element
         * ...........................................................................
         */
        constructor(id: string, template: IFormFileElemTemplate<FileList> | FileUploadElement) {
            super(id, template);
        }

        /**...........................................................................
         * _parseElemTemplate
         * ...........................................................................
         * 
         * @param template 
         * ...........................................................................
         */
        protected _parseElemTemplate(template: IFormFileElemTemplate<FileList>): void {
            super._parseElemTemplate(template);
            this._attr = template.attr;
        }

        /**...........................................................................
         * _onCreateElements
         * ...........................................................................
         * Handle create elements
         * ...........................................................................
         */
        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.core);
            this._elems.input = createInputElement("", "", "file", this._data, null, null, this._elems.core);
        }

        /**...........................................................................
         * _onChange
         * ...........................................................................
         * Handle when the user has uploaded a file
         * 
         * @returns True if the file passes validation
         * ...........................................................................
         */
        protected _onChange(): boolean {
            let files: FileList = (this._elems.input as HTMLInputElement).files;
            return this._standardValidation(files);
        }

        /**...........................................................................
         * _createClonedElement
         * ...........................................................................
         * Handle cloning this element
         * 
         * @param   appendToId  The ID to append to the cloned element
         * 
         * @returns The created cloned element
         * ...........................................................................
         */
        protected _createClonedElement(appendToId: string): FileUploadElement {
            return new FileUploadElement(this.id + appendToId, this);
        }
    }

    /**...........................................................................
     * @class FilePathElement
     * ...........................................................................
     * handle a file-upload field that supports just a file path 
     * @version 1.0
     * ...........................................................................
     */
    export class FilePathElement extends FormElement<string> {

        //#region PROPERTIES

        /** style elements for the file path */
        protected static _uncoloredStyles: Styles.IStandardStyles = {
            ".kipFormElem.filepath input[type=file]": {
                display: "none"
            },

            ".kipFormElem.filepath label.filepath": {
                backgroundColor: "<0>",
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

        /** select the appropriate type for the file path type */
        protected get _type(): FormElementTypeEnum { return FormElementTypeEnum.FILE_PATH; }

        /** set a default class for file-path elements */
        protected get _defaultCls(): string { return "filepath"; }

        /** set a default value for file-path elements */
        protected get _defaultValue(): string { return ""; }

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

        /**...........................................................................
         * Create the file path element
         * 
         * @param   id          Unique ID for this element
         * @param   template    Template to use to create this element
         * ...........................................................................
         */
        constructor(id: string, template: IFormFilePathElemTemplate | FilePathElement) {
            super(id, template);
        }

        /**...........................................................................
         * _parseElemTemplate
         * ...........................................................................
         * Handle creating this element off of a template
         * 
         * @param   template    
         * ...........................................................................
         */
        protected _parseElemTemplate(template: IFormFilePathElemTemplate): void {
            super._parseElemTemplate(template);
            this._onSaveCallback = template.onSave;
            this._onChangeCallback = template.onChange
            this._attr = template.attr;
        }

        protected _onCreateElements(): void {
            this._createStandardLabel(this._elems.core);
            this._elems.display = createSimpleElement("", "display", this._data, null, null, this._elems.core);
            this._elems.inputContainer = createSimpleElement("", "fileContainer", "", null, null, this._elems.core);
            this._elems.input = createInputElement(this._id + "|input", "", "file", "", null, null, this._elems.inputContainer);
            this._elems.inputLabel = createLabelForInput("Upload File", this._id + "|input", "filepath", this._elems.inputContainer);
        }

        /**...........................................................................
         * _onChange
         * ...........................................................................
         * handle when the data in this element changes
         * ...........................................................................
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

        protected _onLinkChange(): boolean {
            let out: boolean = this._standardValidation(this._tempLink);    // Check if we can set that link
            this._tempLink = null;                                          // Clear it in either case
            return out;                                                     // Quit with the result
        }

        public update(data: string): void {
            this._data = data;
            this._elems.display.innerHTML = data;
            this._elems.input.value = "";
        }

        public save(internalOnly?: boolean): string {
            if (internalOnly) { return; }                   // Don't do anything if this is an internal change
            if (this._files) {                              // Make sure that if we have files, we're uploading them
                if (!this._onSaveCallback) { return ""; }   // Don't do anything if we don't have a callback
                this._onSaveCallback(this._files);          // Run our callback
            }
            return this._data;                              // Return the appropriate data
        }

        protected _createClonedElement(appendToID: string): FilePathElement {
            return new FilePathElement(this.id + appendToID, this);
        }
    }

    /**...........................................................................
     * @class PhotoPathElement
     * ...........................................................................
     * create an element to upload photos
     * @version 1.0
     * ...........................................................................
     */
    export class PhotoPathElement extends FilePathElement {

        /** style the elements for this form element */
        protected static _uncoloredStyles: Styles.IStandardStyles = {

            ".kipFormElem.photopath .photoOverlay": {
                backgroundColor: "rgba(0,0,0,.5)",
                opacity: "0",
                transition: ".1s opacity ease-in-out",
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                width: "100%",
                height: "100%",
                left: "0",
                top: "0",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "100%"
            },

            ".kipFormElem.photopath .photoWrapper:hover .photoOverlay": {
                opacity: "1"
            },

            ".kipFormElem.photopath .photoWrapper": {
                width: "100px",
                height: "100px",
                borderRadius: "50px",
                border: "1px solid <0>",
                overflow: "hidden",
                position: "relative"
            },

            ".kipFormElem.photopath .photoWrapper img": {
                width: "100%"
            },

            ".kipFormElem.photopath .photoWrapper .photoBtn": {
                width: "100%",
                backgroundColor: "<0>",
                color: "#FFF",
                textAlign: "center",
                fontSize: "0.7em",
                cursor: "pointer",
                marginTop: "6px",
                opacity: "0.8"
            },

            ".kipFormElem.photopath .photoWrapper .photoBtn:hover": {
                opacity: "1"
            },

            ".kipFormElem.photopath .photoWrapper input[type='file']": {
                display: "none"
            }
        }

        /** default class for this element */
        protected get _defaultCls(): string { return "photopath"; }

        /** keep track of the elements needed for this element */
        protected _elems: {
            core: HTMLElement;
            photoWrapper: HTMLElement;
            display: HTMLImageElement;
            overlay: HTMLElement;
            linkBtn: HTMLElement;
            uploadBtn: HTMLElement;
            input: HTMLInputElement;
            error: HTMLElement;
        }

        /**...........................................................................
         * _onCreateElements
         * ...........................................................................
         * Handle creating elements for the form element
         * ...........................................................................
         */
        protected _onCreateElements(): void {

            this._elems.photoWrapper = createSimpleElement("", "photoWrapper", "", null, null, this._elems.core);

            this._elems.display = createElement({
                type: "img",
                cls: "photo",
                attr: {
                    "src": this._data
                },
                parent: this._elems.photoWrapper
            }) as HTMLImageElement;

            // draw the photo element
            this._elems.overlay = createSimpleElement("", "photoOverlay", "", null, null, this._elems.photoWrapper);

            // handle setting a manual link
            this._elems.linkBtn = createSimpleElement("", "photoBtn link", "CHANGE LINK", null, null, this._elems.overlay);
            this._elems.linkBtn.addEventListener("click", () => {
                let linkURL: string = window.prompt("What should the link be set to?", this._data);
                this._tempLink = linkURL;
                this._changeEventFired();
            });

            // Draw the option for file upload
            this._elems.input = createInputElement(this._id + "|input", "photoInput", "file", "", null, null, this._elems.overlay);
            this._elems.uploadBtn = createLabelForInput("UPLOAD", this._id + "|input", "photoBtn upload", this._elems.overlay);
            this._elems.input.addEventListener("change", () => {
                this._changeEventFired();
                this._onFileSelected();
            });
        }

        /**...........................................................................
         * _createClonedElement
         * ...........................................................................
         * Handle cloning this element
         * 
         * @param   appendToID  If provided, the ID to append to this element
         * 
         * @returns The created cloned element
         * ...........................................................................
         */
        protected _createClonedElement(appendToID: string): PhotoPathElement {
            return new PhotoPathElement(this.id + appendToID, this);
        }

        /**...........................................................................
         * update
         * ...........................................................................
         * @param data 
         * ...........................................................................
         */
        public update(data: string): void {
            this._data = data;
            if (!this._data) { return; }
            this._elems.display.src = data;
        }

        /**...........................................................................
         * _onFileSelected
         * ...........................................................................
         * 
         * ...........................................................................
         */
        protected _onFileSelected(): void {
            let file: File;

            // Quit early if we don't have any files
            if (!this._files) { return; }

            // Try to grab the first file & quit if we can't
            file = this._files[0];
            if (!file) { return; }

            let fileReader: FileReader = new FileReader();
            fileReader.addEventListener("load", () => {
                window.setTimeout(() => {
                    let photoURL = fileReader.result;
                    this._elems.display.src = photoURL;
                }, 0);
            });

            // read the file
            fileReader.readAsDataURL(file);
        }

        /**...........................................................................
         * _onLinkChange
         * ...........................................................................
         * 
         * ...........................................................................
         */
        protected _onLinkChange(): boolean {
            let link: string = this._tempLink;
            let out: boolean = super._onLinkChange();
            this._elems.display.src = link;
            return out;
        }

        /**...........................................................................
         * _onClear
         * ...........................................................................
         * 
         * ...........................................................................
         */
        protected _onClear(): void {
            this._data = "";
            this._elems.display.src = "";   // reset the photolink
        }
    }
}