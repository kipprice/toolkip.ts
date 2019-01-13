namespace KIP.Forms {
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

        //#endregion
        //.....................

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

        /**
         * _createClonedElement
         * ----------------------------------------------------------------------------
         * Handle cloning this element
         * @param   appendToID  If provided, the ID to append to this element
         * @returns The created cloned element
         */
        protected _createClonedElement(appendToID: string): PhotoPathElement {
            return new PhotoPathElement(this.id + appendToID, this);
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

            let fileReader: FileReader = new FileReader();
            fileReader.addEventListener("load", () => {
                window.setTimeout(() => {
                    let photoURL = fileReader.result as string;
                    this._elems.display.src = photoURL;
                }, 0);
            });

            // read the file
            fileReader.readAsDataURL(file);
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
    }
}