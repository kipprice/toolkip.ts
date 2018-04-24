///<reference path="popup.ts" />
namespace KIP {
    export class ErrorPopup extends Popup {

        constructor(details: string, title?: string, obj?: IElemDefinition) {
            super(obj);
            this.setTitle(title || "Uh-oh...that wasn't supposed to happen");
            this.addContent("", "", details);
            this.addButton("Okay", () => { this.erase(); });
        }

    }
}