/// <reference path="../models/events/eventHandler.ts" />
/// <reference path="../models/events/event.ts" />

namespace KIP {

    /**----------------------------------------------------------------------------
     * @class	EventHandler
     * ----------------------------------------------------------------------------
     * Handle events that are a result of user interaction with the view
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class EventHandler<C extends Controller<I>, V extends MVCView<I>, ET extends string = string, I extends IModel = IModel> {

        //.....................
        //#region PROPERTIES
        
        /** track the view that we're listening for events on */
        protected _view: V;

        /** main controller for this model */
        protected _controller: C;
        
        //#endregion
        //.....................

        //..........................................
        //#region CREATE THE EVENT HANDLER
        
        /**
         * EventHandler
         * ----------------------------------------------------------------------------
         * create the event handler as appropriate
         */
        public constructor(view: V, controller: C) {
            this._view = view;
            this._controller = controller;

            // ensure that we are listening to events appropriately
            this._registerEventListeners();
        }

        /**
         * _registerEventListener
         * ----------------------------------------------------------------------------
         * ensure that we are listening to the listeners we intend to. 
         */
        protected abstract _registerEventListeners(): void;
        
        //#endregion
        //..........................................

        //..........................................
        //#region HANDLE EVENTS
        
        protected abstract _handleEvent(eventType: ET, event: Events.Event<IViewEventContext<I, ET>>): void;
        
        //#endregion
        //..........................................
    }

    /**----------------------------------------------------------------------------
     * @class	StandardEventHandler
     * ----------------------------------------------------------------------------
     * Standard event that gets fired for any event worth listening to on the view.
     * @author	Kip Price
     * @version	1.0.0
     * ----------------------------------------------------------------------------
     */
    export abstract class StandardEventHandler<C extends Controller<I>, V extends MVCView<I>, ET extends string = string, I extends IModel = IModel> extends EventHandler<C, V, ET, I> {
        protected _registerEventListeners(): void {
            // Events.addEventListener(VIEW_EVENT, { 
            //     target: this._view,
            //     func: (ev: ViewEvent<ET>) => { this._handleEvent(ev.context.type, ev); }
            // });
        }
    } 

    
    //..........................................
    //#region STANDARD EVENT DEFINITION
    
    export interface IViewEventContext<I extends IModel = IModel, ET extends string = string> extends Events.IEventContext {
        target: MVCView<I>;
        type: ET;
    }

    export const VIEW_EVENT = "viewevent";
    // KIP.Events.createEvent<IViewEventContext>({
    //     name: "View Event",
    //     key: VIEW_EVENT
    // });

    export class ViewEvent<ET extends string> extends Events.Event<IViewEventContext<IModel, ET>> {
        protected get _key(): string { return VIEW_EVENT; }
        protected _context: IViewEventContext<IModel, ET>;
    }
    
    //#endregion
    //..........................................
}
