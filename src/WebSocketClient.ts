import { TypedDuplex } from './TypedDuplex';
import { ConnectionState, TypePack, ValidatorFn } from './types';
import ReconnectingWebSocket from 'reconnecting-websocket';
import type { UrlProvider, Options } from 'reconnecting-websocket';

type WebSocketClientOptions = {
  Server2Client?: ValidatorFn;
  Client2Server?: ValidatorFn;
  protocols?: string | string[];
} & Options;

export class WebSocketClient<T extends TypePack> extends TypedDuplex<
  T['Client2Server'],
  T['Server2Client']
> {
  public ws: ReconnectingWebSocket;

  private eventsStateChanged: ((connectionState: ConnectionState) => void)[] =
    [];

  constructor(url: UrlProvider, private opts?: WebSocketClientOptions) {
    // dont do this, as reconnects will be tried

    const ws = new ReconnectingWebSocket(url, opts?.protocols, opts);

    // important to respect the standards
    // https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4
    ws.addEventListener('close', (ev) => {
      this.emitConnectionStateChanged();
      // maybe use ev.wasClean
      if (ev.code === 1000) {
        // if (ev.code === 1000 || ev.code === 1005) {
        console.log('Gracefully closed the connection');
        // is this needed?
        ws.close(1000);

        // remove this!!
        this.offAll();
      }
    });
    ws.addEventListener('open', (ev) => {
      this.emitConnectionStateChanged();
    });

    ws.addEventListener('message', (ev) => {
      this.handleMessage(ev.data);
    });
    super(
      // ws.send.bind(ws),
      (msg) => {
        ws.send(msg);
      },
      {
        Other2This: opts?.Server2Client,
        This2Other: opts?.Client2Server,
      }
    );
    this.ws = ws;
    // this.WsImpl = opts?.WebSocket || WebSocket;
  }

  private emitConnectionStateChanged() {
    const state = this.getConnectionState();
    for (let i = 0; i < this.eventsStateChanged.length; i++) {
      this.eventsStateChanged[i](state);
    }
  }

  public getConnectionState(): ConnectionState {
    // this.ws.readyState
    if (this.ws.readyState === ReconnectingWebSocket.CLOSED)
      return 'disconnected';
    else if (this.ws.readyState === ReconnectingWebSocket.OPEN)
      return 'connected';
    // I dont think it can ever get to here?
    // its wierd there is no native event
    else if (this.ws.readyState === ReconnectingWebSocket.CONNECTING)
      return 'connecting';
    else return 'disconnecting';
  }

  public onConnectionStateChanged(
    listener: (connectionState: ConnectionState) => void
  ) {
    this.eventsStateChanged.push(listener);

    return () => this.offConnectionStateChanged(listener);
  }

  public offConnectionStateChanged(
    listener?: (connectionState: ConnectionState) => void
  ) {
    if (!listener) {
      // cleanup everything
      this.eventsStateChanged = [];
      return this;
    }

    for (let i = this.eventsStateChanged.length - 1; i >= 0; i -= 1) {
      if (this.eventsStateChanged[i] === listener) {
        this.eventsStateChanged.splice(i, 1);
        break;
      }
    }
    return this;
  }

  public stop() {
    this.ws.close(1000);
    this.offAll();
  }
}
