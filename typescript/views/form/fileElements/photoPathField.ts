namespace KIP.Forms {

    export interface IPhotoPathElemTemplate extends IFormFilePathElemTemplate {
        maxSize?: number;
    }

     /**----------------------------------------------------------------------------
     * @class PhotoPathField
     * ----------------------------------------------------------------------------
     * create an element to upload photos
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class PhotoPathField<T extends IPhotoPathElemTemplate = IPhotoPathElemTemplate> extends FilePathField<T> {

        //..................
        //#region STYLES

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
                border: "1px solid <formTheme>",
                overflow: "hidden",
                position: "relative"
            },

            ".kipFormElem.photopath .photoWrapper img": {
                width: "100%"
            },

            ".kipFormElem.photopath .photoWrapper .photoBtn": {
                width: "100%",
                backgroundColor: "<formTheme>",
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

        //#endregion
        //..................

        //.....................
        //#region PROPERTIES

        /** default class for this element */
        protected get _defaultCls(): string { return "photopath"; }

        /** keep track of the elements needed for this element */
        protected _elems: {
            base: HTMLElement;
            photoWrapper: HTMLElement;
            display: HTMLImageElement;
            overlay: HTMLElement;
            linkBtn: HTMLElement;
            uploadBtn: HTMLElement;
            input: HTMLInputElement;
            error: HTMLElement;
        }

        //#endregion
        //.....................

        //..........................................
        //#region CREATE ELEMENTS FOR PHOTO UPLOAD
        
        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * Handle creating elements for the form element
         */
        protected _onCreateElements(): void {

            this._elems.photoWrapper = createSimpleElement("", "photoWrapper", "", null, null, this._elems.base);

            this._elems.display = createElement({
                type: "img",
                cls: "photo",
                attr: { "src": this._data },
                parent: this._elems.photoWrapper
            }) as HTMLImageElement;

            // draw the photo element
            this._elems.overlay = createSimpleElement("", "photoOverlay", "", null, null, this._elems.photoWrapper);

            // handle setting a manual link
            this._elems.linkBtn = createSimpleElement("", "photoBtn link", "CHANGE LINK", null, null, this._elems.overlay);
            this._elems.linkBtn.addEventListener("click", () => {
                let linkURL: string = window.prompt("What should the link be set to?", this._data);

                // no change or cancel: don't continue
                if (linkURL === this._data) { return; }
                if (isNullOrUndefined(linkURL)) { return; }

                // otherwise save off the link and use it in our change function
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
        
        //#endregion
        //..........................................

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Handle cloning this element
         * @param   appendToID  If provided, the ID to append to this element
         * @returns The created cloned element
         */
        protected _createClonedElement(appendToID: string): PhotoPathField<T> {
            return new PhotoPathField<T>(this.id + appendToID, this._config);
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * Update the data within this form
         * @param   data    The details to update this element with
         */
        public update(data: string, allowEvents: boolean): void {
            this._files = null;
            if (!data) { data = ""; }
            this._data = data;
            this._elems.display.src = data;
        }

        /**
         * _onFileSelected
         * ----------------------------------------------------------------------------
         * handle when a file is selected
         */
        protected _onFileSelected(): void {
            let file: File;

            // Quit early if we don't have any files
            if (!this._files) { return; }

            // Try to grab the first file & quit if we can't
            file = this._files[0];
            if (!file) { return; }

            // load the image as a preview
            this._readFile(file)
                .then((photoURL: string) => { this._elems.display.src = photoURL; })
        }

        /**
         * _onLinkChange
         * ----------------------------------------------------------------------------
         * manage when the details of this photo change
         * @returns True if the link was changed appropriately
         */
        protected _onLinkChange(): string {
            let link = super._onLinkChange();
            this._elems.display.src = link;
            return link;
        }

        /**
         * _onClear
         * ----------------------------------------------------------------------------
         * handle clearing details within the file selector
         */
        public clear(): void {
            this._data = "";
            this._elems.display.src = "";   // reset the photolink
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
            if (internalOnly) { return; }                       // Don't do anything if this is an internal change
            
            if (this._files && this._onSaveCallback) {                          // Make sure that if we have files, we're uploading them
                let blobs = await this._resizeImages(this._files);              // resize images as appropriate
                this._data = await this._onSaveCallback(this._files, blobs);    // Run our callback
            }

            return this._data;                                  // Return the appropriate data
        }

        //..........................................
        //#region HELPERS
        
        protected async _readFile(file: File, defer?: boolean): Promise<string | ArrayBuffer> {
            
            let fileReader: FileReader = new FileReader();
            fileReader.readAsDataURL(file);

            return new Promise<string | ArrayBuffer>((resolve) => {
                fileReader.onload = () => {
                    resolve(fileReader.result);
                };
            })
            
        }

        protected async _loadImage(dataUrl: string): Promise<HTMLImageElement> {
            let img = new Image();
            img.src = dataUrl;

            return new Promise<HTMLImageElement>((resolve) => {
                img.onload = () => { resolve(img); }
            });
        }

        /**
         * _renderOnCanvas
         * ----------------------------------------------------------------------------
         * generate the files on canvas, in order to resize them
         */
        protected async _renderOnCanvas(img: HTMLImageElement): Promise<Blob> {
            let cvs = KIP.createElement({ type: "canvas" }) as HTMLCanvasElement;

            // set default canvas size
            cvs.width = this._config.maxSize;
            cvs.height = this._config.maxSize;

            // adapt canvas to img size
            if (img.width > img.height) {
                cvs.height = (img.height * this._config.maxSize) / img.width;
            } else if (img.height > img.width) {
                cvs.width = (img.width * this._config.maxSize) / img.height;
            }

            // render the image at this size
            let ctx = cvs.getContext("2d");
            ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

            // return the canvas's data as a file
            return new Promise<Blob>((resolve) => {
                cvs.toBlob(
                    (blob: Blob) => { resolve(blob); }
                );
            })
            
        }
        
        /**
         * _resizeImages
         * ----------------------------------------------------------------------------
         * resize all images included in this image upload
         */
        protected async _resizeImages(files: FileList): Promise<Blob[]> {

            // quit if there is no resizing to do
            if (!this._config.maxSize) { return Promise.resolve([]); }

            let outFiles: Blob[] = [];
    
            // loop through each file and resize it
            for (let fIdx = 0; fIdx < files.length; fIdx += 1) {
                let blob = await this._resizeImage(files[fIdx], outFiles);
                outFiles.push(blob);
            }

            // return the resized images
            return outFiles;
        }

        protected async _resizeImage (file: File, outFiles: Blob[]): Promise<Blob> {
            let dataUrl = await this._readFile(file);
            let img = await this._loadImage(dataUrl as string);
            let blob = await this._renderOnCanvas(img);
            return blob;
        }
        
        //#endregion
        //..........................................
    }
}