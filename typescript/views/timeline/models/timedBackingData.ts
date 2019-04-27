namespace KIP.Timeline {

	/**
	 * TimedBackingData
	 * ----------------------------------------------------------------------------
	 * 
	 */
	export interface TimedBackingData {
		id: string;
		label: string;
		color: string;
		type: number;
		handleEvent?: CanvasEventHandler;
	}
}