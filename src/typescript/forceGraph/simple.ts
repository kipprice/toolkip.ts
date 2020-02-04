namespace KIP.Force {
	const MAX_DIST = 80;
	const TICK_DIST = 2;

	/**---------------------------------------------------------------------------
	 * @class   SimpleGraph
	 * ---------------------------------------------------------------------------
	 * set up a simple force directed graph
	 * @author  Kip Price
	 * @version 1.0.0
	 * ---------------------------------------------------------------------------
	 */
	export class SimpleGraph {

		//.....................
		//#region PROPERTIES
		
		protected _nodes: Node[];
		
		//#endregion
		//.....................

		constructor() {
			this._createNodes();
			this._buildReferences();
			this._startAnimating();
		}

		protected _createNodes(): void {
			this._nodes = [];
			for (let i = 0; i < 25; i += 1) {
				let n = this._createNode();
				this._nodes.push(n);
			}
		}

		protected _createNode(): Node {
			let node = new Node();
			node.render();
			return node;
		}

		protected _buildReferences(): void {
			for (let n of this._nodes) {
				for (let o of this._nodes) {
					if (o === n) { continue; }
					n.addOtherNode(o);
				}
				n.sortOtherNodes();
			}
		}
	
		protected async _startAnimating(): Promise<void> {
			for (let n of this._nodes) {
				n.tick();
				n.render();
			}

			//await wait(500);

			window.requestAnimationFrame(() => {
				this._startAnimating();
			});
		}
	}
	/**---------------------------------------------------------------------------
	 * @class   Node
	 * ---------------------------------------------------------------------------
	 * the node to add
	 * @author  Kip Price
	 * @version 1.0.0
	 * ---------------------------------------------------------------------------
	 */
	class Node {

		//.....................
		//#region PROPERTIES
		
		protected _pt: KIP.IPoint;
		protected _nodes: Node[];

		protected _elem: HTMLElement;
		public get elem(): HTMLElement { return this._elem; }
		
		//#endregion
		//.....................

		/**
		 * Node
		 * ---------------------------------------------------------------------------
		 * create the node 
		 */
		constructor() {
			this._elem = KIP.createElement({
				cls: "node"
			});
			
			this._pt = {
				x: Math.floor(Math.random() * 30) + window.innerWidth / 2,
				y: Math.floor(Math.random() * 30) + window.innerHeight / 2
			};

			this._nodes = [];
		}

		public render(): void {
			if (!this._elem.parentNode) { document.body.appendChild(this._elem); }
			this._elem.style.left = Math.floor(this._pt.x) + "px";
			this._elem.style.top = Math.floor(this._pt.y) + "px";
		}

		public addOtherNode(node: Node): void {
			this._nodes.push(node);
		}

		public sortOtherNodes(): void {
			this._nodes.sort((a: Node, b: Node) => {
				let distanceA = distance(a.elem, this._elem);
				let distanceB = distance(b.elem, this._elem);

				if (distanceA < distanceB) { return 1; }
				if (distanceA > distanceB) { return -1; }
				return 0;
			});
		}

		public tick(): void {
			let vector: IPoint = { x: 0, y: 0 };

			for (let n of this._nodes) {
				let dist = distance(this._elem, n.elem);
				if (dist >= MAX_DIST) { continue; }

				// calculuate the distance we need to move
				let angle = KIP.Trig.getAngle(this._pt, n._pt);
				let x = -1 * Math.cos(angle) * TICK_DIST;
				let y = Math.sin(angle) * TICK_DIST;

				// update this node's position
				//vector.x += x;
				//vector.y += y;

				// update the other node's position
				n._pt.x -= x;
				n._pt.y -= y;
			}
		}
	}

	function distance(elem1: HTMLElement, elem2: HTMLElement): number {
		let pt1 = { x: elem1.offsetLeft, y: elem1.offsetTop };
		let pt2 = { x: elem2.offsetLeft, y: elem2.offsetTop };

		return KIP.Trig.getDistance(pt1, pt2);
	}
}