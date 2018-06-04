///<reference path="tutorial.ts" />
namespace KIP {

	/**...........................................................................
	 * @class	HelpTipTutorial
	 * ...........................................................................
	 * Creates a helptip version of a tutorial (as opposed to a full screen one
	 * @version 1.0.1
	 * @author	Kip Price
	 * ...........................................................................
	 */
	export class HelpTipTutorial extends Tutorial {

		//#region ADD CSS STYLES FOR THE HELP-TIP TUTORIAL
		protected static _uncoloredStyles: Styles.IStandardStyles = {
			".inlineHelp": {
				position: "absolute",
				backgroundColor : "#eee",
				padding: "10px",
				boxShadow : "1px 1px 13px 5px rgba(0,0,0,.1)",
				borderRadius : "3px",
				maxWidth : "35%"
			},

			".inlineHelp .title" : {
				fontSize : "1.1em",
				fontWeight: "bold",
				textTransform : "uppercase",
				marginBottom : "5px"
			},

			".tutorial .inlineHelp .content": {
				display: "block"
			},

			".tutorialHilite":  {
				border: "5px #333 dotted",
				boxShadow: "1px 1px 8px 4px rgba(0,0,0, 0.2)"
			},

			".tutorialHilite:before": {
				content: '""',
				position: "absolute",
				width: "140%",
				height: "140%",
				top: "-20%",
				left: "-20%",
				zIndex : "-1",
				backgroundColor: "rgba(0,0,0,.1)",
				boxShadow : "1px 1px 25px 10px rgba(0,0,0,.1)"
			},

			".inlineBtns": {
				display: "flex",
				justifyContent : "space-between",
				marginTop: "10px"
			},

			".inlineBtn": {
				cursor: "pointer",
				transition: "all .1s ease-in-out"
			},

			".inlineBtn:hover": {
				transform: "scale(1.1)"
			},

			".close.inlineBtn": {
				position: "absolute",
				left: "calc(100% - 18px)",
				top: "-5px",
				borderRadius: "15px",
				padding: "2px 7px"
			}
		}
		//#endregion
	

		//#region ADD A PARTICULAR STEP

		/**...........................................................................
		 * _createStep
		 * ...........................................................................
		 * Create a particular inline step
		 * @param 	title 		Title of the step
		 * @param 	details 	Details for the step
		 * ...........................................................................
		 */
		protected _createStep (title: string, details?: string): TutorialTip {
			let tip: TutorialTip = new TutorialTip(this, title);
			tip.addDetails(details);
			return tip;
		}

		//#endregion

	}
}