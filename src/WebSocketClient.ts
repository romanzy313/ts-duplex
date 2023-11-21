import { TypedDuplex } from './TypedDuplex';
import { TypePack, ValidatorFn } from './types';
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

  constructor(url: UrlProvider, private opts?: WebSocketClientOptions) {
    // dont do this, as reconnects will be tried

    const ws = new ReconnectingWebSocket(url, opts?.protocols, opts);

    // important to respect the standards
    // https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4
    ws.addEventListener('close', (ev) => {
      // console.log('websocket close recieved code', ev.);

      // 1000 = ok close, 1005 not specified...
      // include 1005 or not in this?
      // maybe use ev.wasClean
      if (ev.code === 1000) {
        // if (ev.code === 1000 || ev.code === 1005) {
        console.log('Gracefully closed the connection');
        this.offAll();
      }
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

  public stop() {
    this.ws.close();
    this.offAll();
  }
}
