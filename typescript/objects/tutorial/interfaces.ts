namespace KIP {

	/** options to configure a tutorial to display as expected */
	export interface TutorialOptions {
		useStandardStyles?: boolean;
		loopAround?: boolean;
		inlineMargin?: number
	}

	export interface TutorialStepOptions {
		inlineMargin?: number;
	}

	/** pair details text with a CSS class */
	export interface TextClassPair {
		details: string;
		cls?: string;
	}

}