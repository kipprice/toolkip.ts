///<reference path="tutorialStep.ts" />

namespace KIP {

	/**...........................................................................
	 * @class	TutorialTip
	 * ........................................................................... 
	 * display a particular help tip for the tutorial 
	 * @version	1.0
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export class TutorialTip extends TutorialStep {
		
		protected _defaultDetailsClass: string = "inlineDetails"; 
		private point: IPoint;
		private _options: TutorialStepOptions;

		//==================================
		// CREATE ELEMENTS FOR INLINE HELP
		//==================================

		/** create the elements for this particular step */
		protected _createElements(): void {
			this._createTitle();
			this._createDetailContainer();
			this._createButtonContainer();
			this._createCloseButton();
		}

		/** create the close button for inline help */
		private _createCloseButton(): void {
			let closeBtn: HTMLElement = createSimpleElement("", "close btn", "X");
			this.base.appendChild(closeBtn);
		}

		/** create the container for the buttons */
		private _createButtonContainer(): void {
			let btns: HTMLElement = createSimpleElement("", "buttonContainer");
			this.base.appendChild(btns);

			this.__createPreviousButton(btns);
			this.__createNextButton(btns);
		}

		/** create the next button for the inline help step */
		private __createNextButton(parent: HTMLElement): void {
			let nextBtn: HTMLElement = createSimpleElement("", "next btn", "NEXT");
			parent.appendChild(nextBtn);

			nextBtn.addEventListener("click", () => {
				this._parentTutorial.nextStep();
			});
		}

		/** create the previous button for the inline help step */
		private __createPreviousButton(parent: HTMLElement): void {
			let prevBtn: HTMLElement = createSimpleElement("", "prev btn", "PREVIOUS");
			parent.appendChild(prevBtn);

			prevBtn.addEventListener("click", () => {
				this._parentTutorial.previousStep();
			});
		}
		
		//=======================
		//#region ADD DETAILS
		//=======================

		/** add a particular element to hilite */
		public addHilitedElement(elem: HTMLElement): void { 
			this._hilitedElement = elem;

			// Resize the 
		}

		private __findAppropriatePoint(): void {
			var srcBox, pt, needsSourceMeasure, max, bblPt;
			//TODO: fix
			// Measure the hilited element
			let tmpBox: ClientRect = this._hilitedElement.getBoundingClientRect();

			let elemBox: IBasicRect = {
				x: tmpBox.left - this._options.inlineMargin,
				y: tmpBox.top,
				w: tmpBox.width + (2 * this._options.inlineMargin),
				h: tmpBox.height
			};

			max = {
				x: (window.innerWidth - elemBox.w),
				y: (window.innerHeight - elemBox.h)
			};

			pt = {x: null, y: null};

			let obj: any;
			// FIRST LOOK TO THE ACTUAL POINTS SET BY THE USER (AS LONG AS THEY ARE WITHIN BOUNDS)
			if (obj.x !== undefined) { pt.x = Math.min(obj.x, max.x); }
			if (obj.y !== undefined) { pt.y = Math.min(obj.y, max.y); }

			// IF THERE IS NO SOURCE ELEMENT, THIS IS THE BEST WE CAN DO
			if (!obj.srcElem) { return pt; }

			// CALCULATE THE SIZE OF THE SOURCE ELEMENT
			srcBox = obj.srcElem.getBoundingClientRect();

			// USE THE SOURCE ELEMENT TO DETERMINE THE BEST POINTS
			//bblPt = KIP.Functions.FindBestPositionForBubbleAroundElement(srcBox, elemBox);
			if (pt.x === null) { pt.x = bblPt.x; }
			if (pt.y === null) { pt.y = bblPt.y; }

			return pt;
		}

		//#endregion

	}
}