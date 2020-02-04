namespace KIP {
    export class Graph <V, E> {

        //.....................
        //#region PROPERTIES
        
        protected _nodes: GraphNode<V>[];
        
        //#endregion
        //.....................

        public constructor() {
            this._nodes = [];
        }

        public addNode(node: GraphNode<V>) {
            this._nodes.push(node);
        }

        public connect(nodeA: GraphNode<V>, nodeB: GraphNode<V>, ...addlParams: any): void {
            nodeA.addEdge(this._createEdge(nodeB, ...addlParams));
            nodeB.addEdge(this._createEdge(nodeA, ...addlParams));
        }

        protected _createEdge(node: GraphNode<V>, ...addlParams: any[]): GraphEdge<V> { 
            return new GraphEdge(node);
        }

        public traverse(startingWith: GraphNode<V>, endingWith: GraphNode<V>) {
            
        }

    }

    export class GraphNode<V> {

        //.....................
        //#region PROPERTIES
        
        protected _data: V;

        protected _edges: GraphEdge<V>[];
        
        //#endregion
        //.....................

        public constructor(data: V) {
            this._data = data;
        }

        public addEdge(edge: GraphEdge<V>) {
            this._edges.push(edge);
        }

        public getEdges() { return this._edges; }
        public getData() { return this._data; }
    }

    export class GraphEdge<V> {
        protected _direction: GraphEdgeDirection;
        protected _nextNode: GraphNode<V>;
        protected _cost: number;

        public constructor(node: GraphNode<V>, direction?: GraphEdgeDirection, cost?: number) {
            this._nextNode = node;
            this._direction = direction || GraphEdgeDirection.BIDIRECTIONAL;
            this._cost = cost || 0;
        }

        public getCost() { return this._cost; }
        public getNextNode() { return this._nextNode; }
        public getDirection() { return this._direction; }
    }

    export enum GraphEdgeDirection {
        ERR = 0,
        INCOMING = 1,
        OUTGOING = 2,
        BIDIRECTIONAL = 3
    }

}