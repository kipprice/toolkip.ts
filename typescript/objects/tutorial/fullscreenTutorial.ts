///<reference path="tutorial.ts" />
namespace KIP {
	//=======================
	// FULL-SCREEN TUTORIAL
	//=======================
	export class FullScreenTutorial extends Tutorial {
		
		//#region PROPERTIES
		/** allow user to jump to a particular step */
		private __navStepContainer: HTMLElement;

		protected static _uncoloredStyles: Styles.IStandardStyles = {
			".tutorial": {
				top: "0",
				left: "0",
				position: "fixed",
				width: "100%",
				height: "100%",
				opacity: "0",
				transition: "opacity 0.2s ease-in-out",
				fontFamily: "Segoe UI, Calibri, Helvetica",
				userSelect: "none",
				pointerEvents: "none"
			},

			".tutorial.visible": {
				opacity: "1",
				pointerEvents: "auto"
			},

			".tutorial .overlay": {
				backgroundColor: "rgba(0,0,0,0.8)",
				position: "absolute",
				left: "0",
				top: "0"
			},

			".tutorial .content .title": {
				color: "#FFF",
				fontSize: "2em"
			}
		};

		//#endregion

		//#region CREATE ALL ELEMENTS

		/** create the elements to actually show the tutorial */
		protected _createElements(): void {
			this._createOverlay();
			this._createStepContainer();
			this._createCloseButton();
			this._createNavigationalElements();
		};

		/** creates the background element */
		private _createOverlay (): void {
			let overlay: HTMLElement = createSimpleElement("", "overlay");
			this.base.appendChild(overlay);
		}
		
		/** create the close button for the tutorial */
		private _createCloseButton(): void {
			let closeBtn: HTMLElement = createSimpleElement("", "close btn", "CLOSE");
			this.base.appendChild(closeBtn);

			closeBtn.addEventListener("click", () => {
				this.hide();
			});

		}

		/** create buttons to navigate the tutorial */
		private _createNavigationalElements(): void {
			let navContainer: HTMLElement = createSimpleElement("", "tutorialNavButtons");

			// Previous button
			this.__createPreviousBtn(navContainer);

			// Holds the dots for each step
			this.__navStepContainer = createSimpleElement("", "tutorialStepsNav");

			// Next button
			this.__createNextBtn(navContainer);
		}

		/** create the previous button */
		private __createPreviousBtn(parent: HTMLElement): void {
			let prevBtn: HTMLElement = createSimpleElement("", "prev btn", "PREV");
			parent.appendChild(prevBtn);

			prevBtn.addEventListener("click", () => {
				this.previousStep();
			});
		}

		/** create the next button */
		private __createNextBtn(parent: HTMLElement): void {
			let nextBtn: HTMLElement = createSimpleElement("", "next btn", "NEXT");
			parent.appendChild(nextBtn);

			nextBtn.addEventListener("click", () => {
				this.nextStep();
			});
		}
		//#endregion

		//#region ADD A PARTICULAR STEP

		/** add a particular step to the tutorial */
		public addStep (title: string, details?: string): TutorialStep {
			let screen: TutorialScreen = new TutorialScreen(this, title);
			screen.addDetails(details);

			// Add to our collection of steps
			let idx: number = this._addStepToCollection(screen);

			// Add a step in our navigator
			this.__addStepNavigator(idx);

			// Return the screen we created
			return screen;
		}

		/** show a particular step in the tutorial */
		private __addStepNavigator(idx: number): void {
			let stepNav: HTMLElement = createSimpleElement("", "navStep");
			this.__navStepContainer.appendChild(stepNav);

			stepNav.addEventListener("click", () => {
				this.showStep(idx);
			}); 
		}

		//#endregion
		
		
	}
}