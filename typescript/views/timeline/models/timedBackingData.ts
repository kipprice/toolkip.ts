namespace KIP.Timeline {
	export interface TimedBackingData {
		id: string;
		label: string;
		color: string;
		type: number;
		handleEvent?: CanvasEventHandler;
	}
}