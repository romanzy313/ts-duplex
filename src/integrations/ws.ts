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
  constructor(public ctx: WebSocket, opts?: WsDuplexOptions) {
    ctx.on('message', (data) => {
      // convert and ensure its of right format
      const todoData = data.toString();

      this.handleMessage(todoData);
    });

    // cleanup the events
    ctx.on('close', () => {
      // here we must cleanup, as it is server side, connection is unique per client
      this.offAll();
    });

    super(ctx.send.bind(ctx), {
      This2Other: opts?.Server2Client,
      Other2This: opts?.Client2Server,
    });
  }
}
