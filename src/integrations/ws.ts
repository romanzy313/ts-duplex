import { TypedDuplex } from '../TypedDuplex';
import { TypePack, ValidatorFn } from '../types';
import type WebSocket from 'ws';

type WsDuplexOptions = {
  Server2Client?: ValidatorFn;
  Client2Server?: ValidatorFn;
};

export class WsDuplex<T extends TypePack> extends TypedDuplex<
  T['Server2Client'],
  T['Client2Server']
> {
  constructor(public ws: WebSocket, opts?: WsDuplexOptions) {
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
