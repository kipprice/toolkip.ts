///<reference path="../singleton/singleton.ts" />

namespace KIP {
    export interface OutgoingMessage {
        MsgType: string;
        Message: IDictionary<string>;
        Target?: string;
    }

    export interface IncomingMessage {
        MsgType: string;
        Message: IDictionary<string>;
        Sender: string;
        Token: string;
    }

    export interface MessageReceivedFunc {
        (type: string, message: any, sender: string): void;
    }

    /**----------------------------------------------------------------------------
     * @class   Sockets
     * ----------------------------------------------------------------------------
     * Helper to be able to leverage websocket communication
     * @author  Kip Price
     * @version 1.0.1
     * ----------------------------------------------------------------------------
     */
    export abstract class Sockets {

       	//.....................
        //#region PROPERTIES
        
        /** backing websocket */
        protected _ws: WebSocket;
        
        /** track whether this socket is connected currently */
        protected _connected: boolean;
        
        /** track any messages that should be sent, in cases where we aren't yet connected */
        protected _queuedMessages: OutgoingMessage[];

        /** allow the caller to override the behavior upon a message being received */
        protected _onMessageReceived: MessageReceivedFunc;
        public set onMessageReceived(f: MessageReceivedFunc) { this._onMessageReceived = f; }

        /** allow changing of the server on the fly */
        protected _serverUrl: string;

        /** track the token that this connection belongs within */
        protected _sharedToken: string;
        public get sharedToken(): string { return this._sharedToken; }
        protected abstract _getSharedToken(): string;

        /** unique identifier for this client websocket connection */
        protected _id: string;
        public get id(): string { return this._id; }

		//#endregion
        //.....................
    

        //.................................
        //#region CREATE THE WEB SOCKET

		/**
		 * Socket
		 * ---------------------------------------------------------------------------
		 * Generate the listener that will implement the WebSocket API
		 */
		public constructor(serverUrl: string) {
            this._serverUrl = serverUrl;
            this._ws = new WebSocket(this._buildUrl());

            this.addConnectionListeners();
			this._connected = false;
			this._queuedMessages = [];
        }

        /**
         * _buildUrl
         * ----------------------------------------------------------------------------
         * Generate the appropriate URL for this socket
         */
        protected _buildUrl(): string {
            let url = this._serverUrl;

            let token = this._getSharedToken();
            if (!token) { return url; }

            if (url.indexOf("?") !== -1) {
                url += "&";
            } else {
                url += "?"
            }

            url += "token=";
            url += token;

            return url;
        }

		/**
		 * addConnectionListeners
		 * ---------------------------------------------------------------------------
		 * Ensure we're tracking when the connection opens, closes, and receives 
		 * additional messages
		 */
		private addConnectionListeners() {
			this._ws.addEventListener("open", () => {
				this._connected = true;

				// send queued messages if we have any
				this._sendQueuedMessages();
			});

			this._ws.addEventListener("close", () => {
				this._connected = false;
			});

            this._ws.addEventListener("message", (e: MessageEvent) => {
                if (!e || !e.data) { return; }
                let incomingMsg: IncomingMessage = JSON.parse(e.data);

                if (incomingMsg.MsgType === "init") {
                    this._sharedToken = incomingMsg.Token;
                    this._id = incomingMsg.Message.Id;
                    return;
                }

                if (!this._onMessageReceived) { return; }
                this._onMessageReceived(incomingMsg.MsgType, incomingMsg.Message, incomingMsg.Sender);
            });
            
            window.addEventListener("beforeunload", () => {
                if (!this._ws) { return; }
                this._ws.close();

                // reregister in a second in case the user cancels
                window.setTimeout(() => { 
                    this._ws = new WebSocket(this._serverUrl);
                }, 1000);
            });
        }
        
        //#endregion
        //.................................

        //........................
        //#region SEND MESSAGES

		/**
		 * sendMessage
		 * ---------------------------------------------------------------------------
		 * Let the server know about something
		 */
		public sendMessage(msg: OutgoingMessage): void {

			if (this._connected) {
				this._ws.send(JSON.stringify(msg));
			} else {
				this._queueMessage(msg);
            }
		}

		/**
		 * _queueMessage
		 * ---------------------------------------------------------------------------
		 * If the connection isn't currently active, queue up the message for later
		 */
		protected _queueMessage(msg: OutgoingMessage): void {
			this._queuedMessages.push(msg);
		}

		/**
		 * _sendQueuedMessages
		 * ---------------------------------------------------------------------------
		 * Send all messages that we had queued up for later once we are connected 
		 * again
		 */
		protected _sendQueuedMessages(): void {
			if (this._queuedMessages.length > 0) {
				for (let m of this._queuedMessages) {
					this.sendMessage(m);
				}
				this._queuedMessages = [];
			}
        }
        
        //#endregion
        //........................

        //....................................
        //#region ALLOW CALLERS TO GET EVENTS

        public addEventListener(type: "open" | "close" | "error", callback: EventListener): void {
            this._ws.addEventListener(type, callback);
        }

        //#endregion
        //....................................
	}
}