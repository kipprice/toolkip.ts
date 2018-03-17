namespace KIP {

	export interface ISegment {
		start?: Date;
		end: Date;
		lbl?: string;
		color: string;
	}

	export interface IProjectLine {
		id: string;
		lbl: string;
		segments: ISegment[][];
		start: Date;
		end: Date;
		src: any;
		eventGroup: SVGElement;
		segmentsGroup: SVGElement;
	}

	export interface IProjectMilestone {
		id: string;
		lbl: string;
		date: Date;
		color: string;
		lineID: string;
		src: any;
	}

	export interface IProjectOptions {
		showTitles: boolean;
		showHoverBubbles: boolean;
	}

	export class SVGProject extends Drawable {
		private _canvas: SVG.SVGDrawable;
		private _projectLines: Collection<IProjectLine>;
		private _options: IProjectOptions;
		private _lineCount: number

		constructor (options: IProjectOptions) {
			super({id: "project", cls: "project"});
			this._projectLines = new Collection<IProjectLine>();

			// Initialize options
			let defaults: IProjectOptions = this.__generateDefaultOptions();
			reconcileOptions(options, defaults);
		}

		protected _createElements(): void {}

		public addProjectLine (id: string, lbl: string, segments: ISegment[][], srcObject: any) : IProjectLine {
			let line: IProjectLine;

			// Create the basics of the 

			this._projectLines.addElement(id, line);

			return line;
		}

		private __addSegmentElements (segments: ISegment[][]) : void {
			
		}

		public getProjectLine (id: string) : IProjectLine {
			let out: IProjectLine;
			let pair: ICollectionElement<IProjectLine> = this._projectLines.getElement(id);
			if (!pair) { return out; }

			out = pair.value;
			return out;
		}

		public addProjectMilestone (lineID: string, id: string, lbl: string, date: Date, color: string, srcObject?: any) : IProjectMilestone {
			let milestone: IProjectMilestone;

			return milestone;
		}

		private __generateDefaultOptions () : IProjectOptions {
			let defaults: IProjectOptions = {
				showTitles: true,
				showHoverBubbles: false
			};

			return defaults;
		}
	
	}
}