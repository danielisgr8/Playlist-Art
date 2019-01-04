/**
 * Handles events sent to a WebSocket connection.
 * Data sent to this WebSocket must be a stringified JSON object of the following form:
 * {
 *     event: String,
 *     data: Any
 * }
 */
class WebSocketEventManager {
    /**
     * Creates a new WebSocketEventManager with a WebSocket connection at the given url
     * @param url The url the WebSocket will connect to.
     */
    constructor(url) {
        console.log(url);
        this.ws = new WebSocket(url);
        this.handlers = {};
        this.ws.onmessage = (e) => {
            console.log(e.data);
            const msg = JSON.parse(e.data);

            const event = this.handlers[msg.event];
            if(event) {
                console.log("handling " + msg.event);
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
    addHandler(event, callback) {
        this.handlers[event] = callback;
    }

    /**
     * Sends the given event.
     * @param event The event name.
     * @param data The data associated with this event. Must be a valid JSON type.
     */
    send(event, data) {
        console.log("sending " + event + ", " + data);
        this.ws.send(JSON.stringify({
            "event": event,
            "data": data
        }));
    }

    /**
     * Allows event handling for when the WebSocket connection is opened.
     * @param callback The function to be called when the WebSocket connection opens.
     */
    set onopen(callback) {
        this.ws.onopen = callback;
    }
}
