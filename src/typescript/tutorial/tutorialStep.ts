///<reference path="../drawable/drawable.ts" />
///<reference path="_interfaces.ts" />

namespace KIP {

	/** generic class to show a tutorial step */
	export class TutorialStep extends Drawable {

		//==========================
		// PROPERTIES FOR THE STEP
		//==========================

		/** properties of the step */
		protected _title: string;
		protected _details: TextClassPair[];
		protected _defaultDetailsClass: string = "details";

		/** HTML element */
		protected _hilitedElement: HTMLElement;
		protected _detailContainer: HTMLElement;
		protected _parentTutorial: Tutorial;

		/** create this particular step */
		constructor (parent: Tutorial, title: string) {
			super({cls: "tutorialStep"});
			this._title = title;
			this._parentTutorial = parent;
			this._details = [];

			this._createElements();
		}

		//==================
		// CREATE ELEMENTS
		//==================

		/** create generic version of the createElements set */
		protected _createElements(): void {
			// Implemented by sub classes
		};

		/** create the title for the step */
		protected _createTitle(): void {
			let title: HTMLElement = createSimpleElement("", "title", this._title);
			this.base.appendChild(title);
		}

		/** create the details container of the tutorial details */
		protected _createDetailContainer(): void {
			this._detailContainer = createSimpleElement("", "details");
			this.base.appendChild(this._detailContainer);
		}

		/** create details of the step */
		protected _createDetailElement(pair: TextClassPair): void {
			if (!pair) { return; }

			// Default the class
			pair.cls = pair.cls || this._defaultDetailsClass

			// Create the detail element & add it to our container
			let detailElem: HTMLElement = createSimpleElement("", pair.cls, pair.details);
			this._detailContainer.appendChild(detailElem);
		};

		//==================
		// ADD TO THE STEP
		//==================

		/** set the hilited element for the tutorial */
		public addHilitedElement(elem: HTMLElement): void {
			// Implemented by sub-classes
		}
		
		/** add details to the step */
		public addDetails(content: string, cssClass?: string): void {
			let pair: TextClassPair = {
				details: content,
				cls: cssClass
			};

			// Add to our array
			this._details.push(pair);

			// Add the UI for the details
			this._createDetailElement(pair);

		}

	}
}