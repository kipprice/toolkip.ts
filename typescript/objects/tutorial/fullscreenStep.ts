///<reference path="tutorialStep.ts" />
namespace KIP {
	//============================
	// FULL SCREEN TUTORIAL PAGE
	//============================

	/** display a particular screen of a tutorial */
	export class TutorialScreen extends TutorialStep {
		protected _defaultDetailsClass: string = "fullscreenDetails"; 
		
		//=================================
		// CREATE ELEMENTS FOR FULLSCREEN
		//=================================

		/** create the elements for this particular step */
		protected _createElements(): void {
			this._createTitle();
			this._createDetailContainer();
		}

		//======================
		// ADD TO THE TUTORIAL
		//======================

		/** add a particular element to hilite */
		public addHilitedElement(elem: HTMLElement, text?: string): void { 

		}

	}
}