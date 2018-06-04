///<reference path="../drawable.ts" />
///<reference path="interfaces.ts" />

namespace KIP {

	/**...........................................................................
	 * @class	Tutorial
	 * ...........................................................................
	 * create the class for the actual tutorial 
	 * @version	1.0.1
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export abstract class Tutorial extends Drawable {

		//#region PROPERTIES

		/** keep track of various tips / screens */
		private _steps: TutorialStep[];
		private _currentStep: number;
		private _options: TutorialOptions;

		/** allow a listener to listen to the tutorial closing */
		public onTutorialHidden: Function;

		protected _elems: {
			base: HTMLElement;
			stepContainer: HTMLElement;
		}
		//#endregion

		//#region INITIALIZE THE CLASS

		/**...........................................................................
		 * create the actual tutorial class 
		 * @param	options		Options with which to configure this particular tutorial
		 * ...........................................................................
		 */
		constructor(options: TutorialOptions) {
			super({ cls: "tutorial"});
			this._initializeVariables();
			this._reconcileOptions(options);
			this._createElements();
		}

		/** ...........................................................................
		 * _initializeVariables
		 * ...........................................................................
		 * initiailize our properties 
		 * ...........................................................................
		 */
		private _initializeVariables(): void {
			this._steps = [];
			this._currentStep = -1;
		}

		/**...........................................................................
		 * _reconcileOptions
		 * ...........................................................................
		 * take options passed to the tutorial & reconcile with our defaults 
		 * ...........................................................................
		 */
		private _reconcileOptions(options: TutorialOptions): void {
			let defaults: TutorialOptions = {
				loopAround: true,
				useStandardStyles: true,
				inlineMargin: 5
			};

			reconcileOptions(options, defaults);
		}

		//#endregion

		//#region CREATE ELEMENTS

		/**...........................................................................
		 * _createElements
		 * ...........................................................................
		 * create the HTML pieces of the tutorial 
		 * ...........................................................................
		 */
		protected _createElements() : void {
			this._elems = {} as any;
			this._elems.base = KIP.createElement({ cls: "tutorial" });
			this._elems.stepContainer = KIP.createElement({ cls: "tutorialSteps", parent: this._elems.base });
			this._createAdditionalElements();
		};

		/**...........................................................................
		 * _createAdditionalElements
		 * ...........................................................................
		 * Overridable function to create more elements for the tutorial
		 * ...........................................................................
		 */
		protected _createAdditionalElements(): void {}

		//#endregion

		//#region ADD A STEP TO THE TUTORIAL

		/**...........................................................................
		 * addStep
		 * ...........................................................................
		 * adds a step to the tutorial 
		 * @param	title	The title for the step
		 * @param	details	Details to show in the step
		 * @returns	The created tutorial step
		 * ...........................................................................
		 */
		public addStep (title: string, details?: string): TutorialStep {
			let step: TutorialStep = this._createStep(title, details);
			this._addStepToCollection(step);
			return step;
		}

		/**...........................................................................
		 * _createStep
		 * ...........................................................................
		 * Create aparticular tutorial step
		 * @param 	title 		The title of the step
		 * @param 	details 	Any details about this step
		 * @returns The created tutorial step
		 * ...........................................................................
		 */
		protected abstract _createStep(title: string, details?: string): TutorialStep;

		/**...........................................................................
		 * _addStepToCollection
		 * ...........................................................................
		 * add the step we created to our internal collection 
		 * ...........................................................................
		 */
		protected _addStepToCollection (step: TutorialStep): number {
			// Add to our collection
			let idx: number = this._steps.length;
			this._steps[idx] = step;
			return idx;
		}
		//#endregion

		//#region SHOW A PARTICULAR STEP

		/**...........................................................................
		 * showStep
		 * ...........................................................................
		 * show a particular step in this tutorial 
		 * @param	idx		The step number to show
		 * ...........................................................................
		 */
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

		/**...........................................................................
		 * nextStep
		 * ...........................................................................
		 * show the next step in the tutorial 
		 * ...........................................................................
		 */
		public nextStep (): void {
			let idx: number = this._currentStep;
			idx += 1;
			if (this._options.loopAround) { idx %= this._steps.length; }
			this.showStep(idx);
		}

		/**...........................................................................
		 * previousStep
		 * ...........................................................................
		 * show the previous step in the tutorial 
		 * ...........................................................................
		 */
		public previousStep(): void {
			let idx: number = this._currentStep;
			idx -= 1;
			if (idx < 0 && this._options.loopAround) { idx = (this._steps.length - 1); }
			this.showStep(idx);
		}

		//#endregion

		//#region SHOW / HIDE THE TUTORIAL

		/**...........................................................................
		 * show
		 * ...........................................................................
		 * show the tutorial 
		 * ...........................................................................
		 */
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

		/**...........................................................................
		 * hide
		 * ...........................................................................
		 * remove the tutorial from view 
		 * ...........................................................................
		 */
		public hide(): void {
			if (!this.base.parentNode) { return; }
			removeClass(this._elems.base, "visible");

			// Call the callback if anyone is listening
			if (this.onTutorialHidden) {
				this.onTutorialHidden();
			}
		}

		//#endregion

	}
	
}
