namespace KIP.ForceGraph {
    export class Node<T> {

        //#region PROPERTIES
        protected _data: T;
        public get data(): T { return this._data; }

        protected _incomingConnections: Node<T>[];
        public get incomingConnections(): Node<T>[] { return this._incomingConnections; }

        protected _outgoingConnections: Node<T>[];
        public get outgoingConnections(): Node<T>[] { return this._outgoingConnections; }

        public get connections(): Node<T>[] { 
            let arr: Node<T>[] = [];
            if (this._isDirected) { 
                arr.concat(this._incomingConnections, this._outgoingConnections);
            } else {
                arr.concat(this._incomingConnections);
            }
            return arr;
        }

        protected _isDirected: boolean;

        protected _position: IPoint;
        public get position(): IPoint { return this._position; }
        public set position(pt: IPoint) { this._position = pt; }

        protected _radius: number;
        public get radius(): number { return this._radius; }
        //#endregion

        constructor(data: T, isDirected: boolean) {
            this._data = data;
            this._isDirected = isDirected;
            this._incomingConnections = [];
            this._outgoingConnections = [];
        }

        public addConnection(otherNode: Node<T>): void {
            this._outgoingConnections.push(otherNode);
            if (!this._isDirected) {
                this._incomingConnections.push(otherNode)
                otherNode.addConnection(this);
            } else {
                otherNode.addConnection(this);
            }
        }

        public addIncomingConnection(otherNode: Node<T>) : void {
            this._incomingConnections.push(otherNode);
        }
    }


}