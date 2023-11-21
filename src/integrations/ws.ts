// import { WebSocketClient } from '../WebSocketClient';
import { BaseEventMap, TypedDuplex } from '../TypedDuplex';
import { TypePack, ValidatorFn } from '../types';
// import { WebSocketServer } from 'ws';
// import ws from 'ws';
// import { Server } from 'ws';

import type WebSocket from 'ws';

type Options = {
  Server2Client?: ValidatorFn;
  Client2Server?: ValidatorFn;
};

export class WsDuplex<T extends TypePack> extends TypedDuplex<
  T['Server2Client'],
  T['Client2Server']
> {
  constructor(public ws: WebSocket, opts?: Options) {
    ws.on('message', (data) => {
      // convert and ensure
      const todoData = data.toString();

      this.handleMessage(todoData);
    });

    // cleanup the events
    ws.on('close', () => {
      this.offAll();
    });

    super(ws.send.bind(ws), {
      This2Other: opts?.Server2Client,
      Other2This: opts?.Client2Server,
    });
  }
}

type TestType = {
  Server2Client: {
    test2: { wassup: string };
    another: [number, string];
  };
  Client2Server: {
    test: { id: number };
  };
};

// const wss = new Server({ port: 8080 });

// wss.on('connection', function connection(_ws) {
//   _ws.on('error', console.error);

//   _ws.on('open', () => {
//     const ws = new WsWrapper<TestType>(_ws);

//     ws.on('test', (data) => {
//       ws.send('test2', {
//         wassup: data.id.toString(),
//       });
//       ws.send('another', [44, 'asdasd']);
//     });
//   });
// });

// const client = new WebSocketClient<TestType>('/testurl');

// client.on('test2', (data) => {
//   client.send('test', {
//     id: Math.random(),
//   });
//   client.send<any>('anykey', {});
// });

// client.
