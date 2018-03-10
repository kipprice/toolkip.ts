///<reference path="../drawable.ts" />
///<reference path="interfaces.ts" />

namespace KIP {

	/** create the class for the actual tutorial */
	export abstract class Tutorial extends Drawable {

		//===========================
		// TUTORIAL PROPERTIES
		//===========================

		/** keep track of various tips / screens */
		private _steps: TutorialStep[];
		private _currentStep: number;
		private _options: TutorialOptions;

		/** HTML element to add steps to */
		private _stepContainer: HTMLElement;

		/** allow a listener to listen to the tutorial closing */
		public onTutorialHidden: Function;

		protected _elems: {
			base: HTMLElement;
		}

		//========================
		// INITIALIZE THE CLASS
		//========================

		/** create the actual tutorial class */
		constructor(options: TutorialOptions) {
			super({ cls: "tutorial"});
			this._initializeVariables();
			this._reconcileOptions(options);
			this._createElements();
		}

		/** initiailize our properties */
		private _initializeVariables(): void {
			this._steps = [];
			this._currentStep = -1;
		}

		/** take options passed to the tutorial & reconcile with our defaults */
		private _reconcileOptions(options: TutorialOptions): void {
			let defaults: TutorialOptions = {
				loopAround: true,
				useStandardStyles: true,
				inlineMargin: 5
			};

			reconcileOptions(options, defaults);
		}

		//===========================
		// CREATE STANDARD STYLES
		//===========================

		/** create the HTML pieces of the tutorial */
		protected _createElements() : void {
			// Each individual implementation should implement this
		};

		/** create the container for the individual steps */
		protected _createStepContainer(): void {
			this._stepContainer = createSimpleElement("", "tutorialSteps");
			this.base.appendChild(this._stepContainer);
		}

		//=============================
		// ADD A STEP TO THE TUTORIAL
		//=============================

		/** adds a step to the tutorial */
		public addStep (title: string, details?: string): TutorialStep {
			// This should be overridden by a child class
			return null;
		}

		/** add the step we created to our internal collection */
		protected _addStepToCollection (step: TutorialStep): number {
			
			// Add to our collection
			let idx: number = this._steps.length;
			this._steps[idx] = step;
			return idx;
		}

		//==========================
		// SHOW A PARTICULAR STEP
		//==========================

		/** show a particular step in this tutorial */
		public showStep (idx: number) : void {
			let curStep: TutorialStep;

			// Check if we're already showing a tutorial step
			if (this._currentStep !== -1) {
				curStep = this._steps[this._currentStep];
			}

			// Stop showing the current step
			if (curStep) {
				(curStep as any as Drawable).erase();
				this._currentStep = -1;
			}

			// Get the next step that we want to show
			let step: TutorialStep = this._steps[idx];
			
			// Quit if there is no step to show
			if (!step) { return; }

			// Show the next step
			(step as any as Drawable).draw(this.base);

			// Track the currently shown step
			this._currentStep = idx;
		}

		/** show the next step in the tutorial */
		public nextStep (): void {
			let idx: number = this._currentStep;
			idx += 1;
			if (this._options.loopAround) { idx %= this._steps.length; }
			this.showStep(idx);
		}

		/** show the previous step in the tutorial */
		public previousStep(): void {
			let idx: number = this._currentStep;
			idx -= 1;
			if (idx < 0 && this._options.loopAround) { idx = (this._steps.length - 1); }
			this.showStep(idx);
		}

		//===========================
		// SHOW / HIDE THE TUTORIAL
		//===========================

		/** show the tutorial */
		public show(): void {

			// Make sure we show at least one step
			if (this._currentStep === -1) {
				this.showStep(0);
			}

			// Draw the tutorial if needed
			this.draw(document.body);

			// Add the appropriate class
			addClass(this._elems.base, "visible");
		}

		/** remove the tutorial from view */
		public hide(): void {
			if (!this.base.parentNode) { return; }
			removeClass(this._elems.base, "visible");

			// Call the callback if anyone is listening
			if (this.onTutorialHidden) {
				this.onTutorialHidden();
			}
		}

	}
	
}
