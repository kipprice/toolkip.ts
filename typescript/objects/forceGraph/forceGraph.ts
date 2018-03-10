namespace KIP.ForceGraph {

    // PHYSICS REFERENCE
    // Coulombes Law: F = (m1m2)/??
    // Gravity: F = Gm1m2/a
    // Hooke's Law: F - -kX

    export interface IConnectionParams<T> {
        id?: string,
        node?: Node<T>
    }

    export class ForceGraph<T> extends Drawable {

        //#region PROPERTIES
        private _width: number = 1000;
        private _height: number = 1000;
        protected _nodes: Collection<Node<T>>;
        protected _isDirected: boolean;
        //#endregion

        //#region CREATE THE GRAPH STRUCTURE
        public constructor(isDirected: boolean) {
            super();
            this._nodes = new Collection<Node<T>>(CollectionTypeEnum.ReplaceDuplicateKeys);
            this._isDirected = isDirected;
        }

        protected _createElements(): void {
            this._elems.base = createElement({
                cls: "forceGraph"
            });
        }
        //#endregion

        //#region ADD NEW NODES
        public addNode(id: string, data: T): Node<T> {
            let node: Node<T> = new Node(data, this._isDirected);
            this._nodes.addElement(id, node);
            return node;
        }

        public addConnectionToNode(parent: IConnectionParams<T>, target: IConnectionParams<T>): void {
            if ((!parent) || (target)) { return; }

            // ensure the parent node exists
            let parentNode: Node<T> = this._getNodeFromConnectionParams(parent);
            if (!parentNode) { return; }

            // ensure the target node exists
            let targetNode: Node<T> = this._getNodeFromConnectionParams(target);
            if (!targetNode) { return; }

            parentNode.addConnection(targetNode);
        }

        private _getNodeFromConnectionParams(params: IConnectionParams<T>): Node<T> {
            return (params.node || this._nodes.getElement(params.id).value);
        }
        //#endregion

        //#region HANDLE ARRANGING NODES
        public arrangeNodes(): void {

            // 1. Find the node we should start with 
            let startNode: Node<T>;
            if (this._isDirected) { startNode = this._getStartNode(); }
            else { startNode = this._getNodeWithMostConnections(); }

            // 2. Stick that node somewhere on the screen
            if (this._isDirected) { startNode.position = { x: 0, y: 0 } }
            else { startNode.position = { x: this._width / 2, y: this._height / 2 }}

            // 3. Go through each of the connections for this node to determine approximate arrangement
        }

        /**
         * _getNodeWithMostConnections
         * 
         * Find the most connected node so as to start with it, as it will take the most planning
         */
        private _getNodeWithMostConnections(): Node<T> {
            let max: number = -1;
            let maxNode: Node<T>;
            this._nodes.map((node: Node<T>) => {
                if (node.connections.length > max) {
                    max = node.connections.length;
                    maxNode = node;
                }
            });

            return maxNode;
        }

        private _getStartNode(): Node<T> {
            return this._nodes[0];
        }
        //#endregion
    }
}