namespace KIP.Forms {

    export interface IPhotoPathElemTemplate extends IFormFilePathElemTemplate {
        maxSize?: number;
    }

     /**----------------------------------------------------------------------------
     * @class PhotoPathElement
     * ----------------------------------------------------------------------------
     * create an element to upload photos
     * @author  Kip Price
     * @version 1.0.0
     * ----------------------------------------------------------------------------
     */
    export class PhotoPathElement extends FilePathElement {

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
            core: HTMLElement;
            photoWrapper: HTMLElement;
            display: HTMLImageElement;
            overlay: HTMLElement;
            linkBtn: HTMLElement;
            uploadBtn: HTMLElement;
            input: HTMLInputElement;
            error: HTMLElement;
        }

        protected _maxSize: number;

        protected _template: IPhotoPathElemTemplate;

        //#endregion
        //.....................

        //..........................................
        //#region CREATE THE ELEMENT
        
        public constructor(id: string, template: IPhotoPathElemTemplate) {
            super(id, template);
        }

        protected _parseElemTemplate(template: IPhotoPathElemTemplate): void {
            super._parseElemTemplate(template);
            this._maxSize = template.maxSize;
        }
        
        //#endregion
        //..........................................

        //..........................................
        //#region CREATE ELEMENTS FOR PHOTO UPLOAD
        
        /**
         * _onCreateElements
         * ----------------------------------------------------------------------------
         * Handle creating elements for the form element
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
        
        //#endregion
        //..........................................

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Handle cloning this element
         * @param   appendToID  If provided, the ID to append to this element
         * @returns The created cloned element
         */
        protected _createClonedElement(appendToID: string): PhotoPathElement {
            return new PhotoPathElement(this.id + appendToID, this._template);
        }

        /**
         * update
         * ----------------------------------------------------------------------------
         * Update the data within this form
         * @param   data    The details to update this element with
         */
        public update(data: string): void {
            this._data = data;
            if (!this._data) { return; }
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
        protected _onLinkChange(): boolean {
            let link: string = this._tempLink;
            let out: boolean = super._onLinkChange();
            this._elems.display.src = link;
            return out;
        }

        /**
         * _onClear
         * ----------------------------------------------------------------------------
         * handle clearing details within the file selector
         */
        protected _onClear(): void {
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
        public save(internalOnly?: boolean): string {
            if (internalOnly) { return; }                       // Don't do anything if this is an internal change
            
            if (this._files) {                                  // Make sure that if we have files, we're uploading them
                if (!this._onSaveCallback) { return ""; }       // Don't do anything if we don't have a callback
                this._resizeImages(this._files).then((blobs: Blob[]) => {
                    this._onSaveCallback(this._files, blobs);              // Run our callback
                });
            }

            return this._data;                                  // Return the appropriate data
        }

        //..........................................
        //#region HELPERS
        
        protected _readFile(file: File, defer?: boolean): KIP.KipPromise {
            return new KIP.KipPromise((resolve) => {
                let fileReader: FileReader = new FileReader();
                fileReader.onload = () => {
                    window.setTimeout(() => {
                        resolve(fileReader.result);
                    }, 0);
                };

                // read the file
                fileReader.readAsDataURL(file);
            }, defer)
        }

        protected _loadImage(defer?: boolean): KIP.KipPromise {
            return new KIP.KipPromise((resolve, reject, dataUrl: string) => {
                let img = new Image();
                img.onload = () => { resolve(img); }
                img.src = dataUrl;
            }, defer)
        }

        protected _renderOnCanvas(defer?: boolean): KIP.KipPromise {
            return new KIP.KipPromise((resolve, reject, img: HTMLImageElement) => {
                let cvs = KIP.createElement({ type: "canvas" }) as HTMLCanvasElement;

                // set default canvas size
                cvs.width = this._maxSize;
                cvs.height = this._maxSize;

                // adapt canvas to img size
                if (img.width > img.height) {
                    cvs.height = (img.height * this._maxSize) / img.width;
                } else if (img.height > img.width) {
                    cvs.width = (img.width * this._maxSize) / img.height;
                }

                // render the image at this size
                let ctx = cvs.getContext("2d");
                ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

                // return the canvas's data as a file
                cvs.toBlob(
                    (blob: Blob) => { resolve(blob); }
                );

            }, defer)
        }
        

        protected _resizeImages(files: FileList): KIP.KipPromise {
            if (!this._maxSize) { return KIP.KipPromise.resolve(); }

            let outFiles: Blob[] = [];
            let promiseChain = new KIP.PromiseChain();
            
            for (let fIdx = 0; fIdx < files.length; fIdx += 1) {
                let promise = this._resizeImage(files[fIdx], outFiles);
                promiseChain.addPromise(promise);
            }

            // ensure that the last step is spitting out all of the adjusted images
            promiseChain.addPromise(new KIP.KipPromise((resolve) => {
                resolve(outFiles);
            }, true))

            return promiseChain.execute();
        }

        protected _resizeImage (file: File, outFiles: Blob[]): KIP.KipPromise {
            let chain = new KIP.PromiseChain();
            chain.addPromise(this._readFile(file, true));
            chain.addPromise(this._loadImage(true));
            chain.addPromise(this._renderOnCanvas(true));
            chain.addPromise((blob: Blob) => { outFiles.push(blob); });
            return chain;
        }
        
        //#endregion
        //..........................................
    }
}