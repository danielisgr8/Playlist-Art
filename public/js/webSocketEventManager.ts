/**
 * Handles events sent to a WebSocket connection.
 * Data sent to this WebSocket must be a stringified JSON object of the following form:
 * {
 *     event: String,
 *     data: Any
 * }
 */
export class WebSocketEventManager {
    private ws: WebSocket;
    private handlers: object;

    /**
     * Creates a new WebSocketEventManager with a WebSocket connection at the given url
     * @param url The url the WebSocket will connect to.
     */
    constructor(url: string) {
        this.ws = new WebSocket(url);
        this.handlers = {};
        this.ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);

            const event = this.handlers[msg.event];
            if(event) {
                event(msg.data);
            }
        };
    }

    /**
     * Sets the handler for the given event.
     * @param event The event name.
     * @param callback A function that is called when this event is received.
     * This function will receive one parameter, data, that can be any JSON type.
     */
    public addHandler(event: string, callback: (data: any) => void): void {
        this.handlers[event] = callback;
    }

    /**
     * Sends the given event.
     * @param event The event name.
     * @param data The data associated with this event. Must be a valid JSON type.
     */
    public send(event: string, data: any): void {
        this.ws.send(JSON.stringify({
            "event": event,
            "data": data
        }));
    }

    /**
     * Allows event handling for when the WebSocket connection is opened.
     * @param callback The function to be called when the WebSocket connection opens.
     */
    set onopen(callback: (this: WebSocket, ev: Event) => any) {
        this.ws.onopen = callback;
    }
}

// TODO: document events and corresponding data types
