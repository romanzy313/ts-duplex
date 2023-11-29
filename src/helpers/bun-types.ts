// this just cant be imported... wtf bun?

export interface ServerWebSocket<T = undefined> {
  /**
   * Sends a message to the client.
   *
   * @param data The data to send.
   * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
   * @example
   * ws.send("Hello!");
   * ws.send("Compress this.", true);
   * ws.send(new Uint8Array([1, 2, 3, 4]));
   */
  send(
    data: string | BufferSource,
    compress?: boolean
  ): ServerWebSocketSendStatus;

  /**
   * Sends a text message to the client.
   *
   * @param data The data to send.
   * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
   * @example
   * ws.send("Hello!");
   * ws.send("Compress this.", true);
   */
  sendText(data: string, compress?: boolean): ServerWebSocketSendStatus;

  /**
   * Sends a binary message to the client.
   *
   * @param data The data to send.
   * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
   * @example
   * ws.send(new TextEncoder().encode("Hello!"));
   * ws.send(new Uint8Array([1, 2, 3, 4]), true);
   */
  sendBinary(data: BufferSource, compress?: boolean): ServerWebSocketSendStatus;

  /**
   * Closes the connection.
   *
   * Here is a list of close codes:
   * - `1000` means "normal closure" **(default)**
   * - `1009` means a message was too big and was rejected
   * - `1011` means the server encountered an error
   * - `1012` means the server is restarting
   * - `1013` means the server is too busy or the client is rate-limited
   * - `4000` through `4999` are reserved for applications (you can use it!)
   *
   * To close the connection abruptly, use `terminate()`.
   *
   * @param code The close code to send
   * @param reason The close reason to send
   */
  close(code?: number, reason?: string): void;

  /**
   * Abruptly close the connection.
   *
   * To gracefully close the connection, use `close()`.
   */
  terminate(): void;

  /**
   * Sends a ping.
   *
   * @param data The data to send
   */
  ping(data?: string | BufferSource): ServerWebSocketSendStatus;

  /**
   * Sends a pong.
   *
   * @param data The data to send
   */
  pong(data?: string | BufferSource): ServerWebSocketSendStatus;

  /**
   * Sends a message to subscribers of the topic.
   *
   * @param topic The topic name.
   * @param data The data to send.
   * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
   * @example
   * ws.publish("chat", "Hello!");
   * ws.publish("chat", "Compress this.", true);
   * ws.publish("chat", new Uint8Array([1, 2, 3, 4]));
   */
  publish(
    topic: string,
    data: string | BufferSource,
    compress?: boolean
  ): ServerWebSocketSendStatus;

  /**
   * Sends a text message to subscribers of the topic.
   *
   * @param topic The topic name.
   * @param data The data to send.
   * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
   * @example
   * ws.publish("chat", "Hello!");
   * ws.publish("chat", "Compress this.", true);
   */
  publishText(
    topic: string,
    data: string,
    compress?: boolean
  ): ServerWebSocketSendStatus;

  /**
   * Sends a binary message to subscribers of the topic.
   *
   * @param topic The topic name.
   * @param data The data to send.
   * @param compress Should the data be compressed? If the client does not support compression, this is ignored.
   * @example
   * ws.publish("chat", new TextEncoder().encode("Hello!"));
   * ws.publish("chat", new Uint8Array([1, 2, 3, 4]), true);
   */
  publishBinary(
    topic: string,
    data: BufferSource,
    compress?: boolean
  ): ServerWebSocketSendStatus;

  /**
   * Subscribes a client to the topic.
   *
   * @param topic The topic name.
   * @example
   * ws.subscribe("chat");
   */
  subscribe(topic: string): void;

  /**
   * Unsubscribes a client to the topic.
   *
   * @param topic The topic name.
   * @example
   * ws.unsubscribe("chat");
   */
  unsubscribe(topic: string): void;

  /**
   * Is the client subscribed to a topic?
   *
   * @param topic The topic name.
   * @example
   * ws.subscribe("chat");
   * console.log(ws.isSubscribed("chat")); // true
   */
  isSubscribed(topic: string): boolean;

  /**
   * Batches `send()` and `publish()` operations, which makes it faster to send data.
   *
   * The `message`, `open`, and `drain` callbacks are automatically corked, so
   * you only need to call this if you are sending messages outside of those
   * callbacks or in async functions.
   *
   * @param callback The callback to run.
   * @example
   * ws.cork((ctx) => {
   *   ctx.send("These messages");
   *   ctx.sendText("are sent");
   *   ctx.sendBinary(new TextEncoder().encode("together!"));
   * });
   */
  cork<T = unknown>(callback: (ws: ServerWebSocket<T>) => T): T;

  /**
   * The IP address of the client.
   *
   * @example
   * console.log(socket.remoteAddress); // "127.0.0.1"
   */
  readonly remoteAddress: string;

  /**
   * The ready state of the client.
   *
   * - if `0`, the client is connecting.
   * - if `1`, the client is connected.
   * - if `2`, the client is closing.
   * - if `3`, the client is closed.
   *
   * @example
   * console.log(socket.readyState); // 1
   */
  readonly readyState: WebSocketReadyState;

  /**
   * Sets how binary data is returned in events.
   *
   * - if `nodebuffer`, binary data is returned as `Buffer` objects. **(default)**
   * - if `arraybuffer`, binary data is returned as `ArrayBuffer` objects.
   * - if `uint8array`, binary data is returned as `Uint8Array` objects.
   *
   * @example
   * let ws: WebSocket;
   * ws.binaryType = "uint8array";
   * ws.addEventListener("message", ({ data }) => {
   *   console.log(data instanceof Uint8Array); // true
   * });
   */
  binaryType?: 'nodebuffer' | 'arraybuffer' | 'uint8array';

  /**
   * Custom data that you can assign to a client, can be read and written at any time.
   *
   * @example
   * import { serve } from "bun";
   *
   * serve({
   *   fetch(request, server) {
   *     const data = {
   *       accessToken: request.headers.get("Authorization"),
   *     };
   *     if (server.upgrade(request, { data })) {
   *       return;
   *     }
   *     return new Response();
   *   },
   *   websocket: {
   *     open(ws) {
   *       console.log(ws.data.accessToken);
   *     }
   *   }
   * });
   */
  data: T;
}

export type WebSocketHandler<T = undefined> = {
  /**
   * Called when the server receives an incoming message.
   *
   * If the message is not a `string`, its type is based on the value of `binaryType`.
   * - if `nodebuffer`, then the message is a `Buffer`.
   * - if `arraybuffer`, then the message is an `ArrayBuffer`.
   * - if `uint8array`, then the message is a `Uint8Array`.
   *
   * @param ws The websocket that sent the message
   * @param message The message received
   */
  message(
    ws: ServerWebSocket<T>,
    message: string | Buffer
  ): void | Promise<void>;

  /**
   * Called when a connection is opened.
   *
   * @param ws The websocket that was opened
   */
  open?(ws: ServerWebSocket<T>): void | Promise<void>;

  /**
   * Called when a connection was previously under backpressure,
   * meaning it had too many queued messages, but is now ready to receive more data.
   *
   * @param ws The websocket that is ready for more data
   */
  drain?(ws: ServerWebSocket<T>): void | Promise<void>;

  /**
   * Called when a connection is closed.
   *
   * @param ws The websocket that was closed
   * @param code The close code
   * @param message The close message
   */
  close?(
    ws: ServerWebSocket<T>,
    code: number,
    reason: string
  ): void | Promise<void>;

  /**
   * Called when a ping is sent.
   *
   * @param ws The websocket that received the ping
   * @param data The data sent with the ping
   */
  ping?(ws: ServerWebSocket<T>, data: Buffer): void | Promise<void>;

  /**
   * Called when a pong is received.
   *
   * @param ws The websocket that received the ping
   * @param data The data sent with the ping
   */
  pong?(ws: ServerWebSocket<T>, data: Buffer): void | Promise<void>;

  /**
   * Sets the maximum size of messages in bytes.
   *
   * Default is 16 MB, or `1024 * 1024 * 16` in bytes.
   */
  maxPayloadLength?: number;

  /**
   * Sets the maximum number of bytes that can be buffered on a single connection.
   *
   * Default is 16 MB, or `1024 * 1024 * 16` in bytes.
   */
  backpressureLimit?: number;

  /**
   * Sets if the connection should be closed if `backpressureLimit` is reached.
   *
   * Default is `false`.
   */
  closeOnBackpressureLimit?: boolean;

  /**
   * Sets the the number of seconds to wait before timing out a connection
   * due to no messages or pings.
   *
   * Default is 2 minutes, or `120` in seconds.
   */
  idleTimeout?: number;

  /**
   * Should `ws.publish()` also send a message to `ws` (itself), if it is subscribed?
   *
   * Default is `false`.
   */
  publishToSelf?: boolean;

  /**
   * Should the server automatically send and respond to pings to clients?
   *
   * Default is `true`.
   */
  sendPings?: boolean;

  /**
   * Sets the compression level for messages, for clients that supports it. By default, compression is disabled.
   *
   * Default is `false`.
   */
  perMessageDeflate?:
    | boolean
    | {
        /**
         * Sets the compression level.
         */
        compress?: WebSocketCompressor | boolean;
        /**
         * Sets the decompression level.
         */
        decompress?: WebSocketCompressor | boolean;
      };
};

type ServerWebSocketSendStatus = 0 | -1 | number;

type WebSocketCompressor =
  | 'disable'
  | 'shared'
  | 'dedicated'
  | '3KB'
  | '4KB'
  | '8KB'
  | '16KB'
  | '32KB'
  | '64KB'
  | '128KB'
  | '256KB';

type WebSocketReadyState = 0 | 1 | 2 | 3;

export type BunConfigurableOpts<T> = {
  /**
   * Called when a ping is sent.
   *
   * @param ws The websocket that received the ping
   * @param data The data sent with the ping
   */
  ping?(ws: ServerWebSocket<T>, data: Buffer): void | Promise<void>;

  /**
   * Called when a pong is received.
   *
   * @param ws The websocket that received the ping
   * @param data The data sent with the ping
   */
  pong?(ws: ServerWebSocket<T>, data: Buffer): void | Promise<void>;

  /**
   * Sets the maximum size of messages in bytes.
   *
   * Default is 16 MB, or `1024 * 1024 * 16` in bytes.
   */
  maxPayloadLength?: number;

  /**
   * Sets the maximum number of bytes that can be buffered on a single connection.
   *
   * Default is 16 MB, or `1024 * 1024 * 16` in bytes.
   */
  backpressureLimit?: number;

  /**
   * Sets if the connection should be closed if `backpressureLimit` is reached.
   *
   * Default is `false`.
   */
  closeOnBackpressureLimit?: boolean;

  /**
   * Sets the the number of seconds to wait before timing out a connection
   * due to no messages or pings.
   *
   * Default is 2 minutes, or `120` in seconds.
   */
  idleTimeout?: number;

  /**
   * Should `ws.publish()` also send a message to `ws` (itself), if it is subscribed?
   *
   * Default is `false`.
   */
  publishToSelf?: boolean;

  /**
   * Should the server automatically send and respond to pings to clients?
   *
   * Default is `true`.
   */
  sendPings?: boolean;

  /**
   * Sets the compression level for messages, for clients that supports it. By default, compression is disabled.
   *
   * Default is `false`.
   */
  perMessageDeflate?:
    | boolean
    | {
        /**
         * Sets the compression level.
         */
        compress?: WebSocketCompressor | boolean;
        /**
         * Sets the decompression level.
         */
        decompress?: WebSocketCompressor | boolean;
      };
};
