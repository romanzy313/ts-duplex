import { TypedDuplex } from '../TypedDuplex';
import { TypePack, ValidatorFn } from '../types';
import {
  BunConfigurableOpts,
  ServerWebSocket,
  WebSocketHandler,
} from '../helpers/bun-types';

type BunDuplexOptions<D> = {
  Server2Client?: ValidatorFn;
  Client2Server?: ValidatorFn;
} & BunConfigurableOpts<D>;

export class BunDuplex<T extends TypePack, D = unknown> extends TypedDuplex<
  T['Server2Client'],
  T['Client2Server']
> {
  // declare a run function?
  constructor(public ctx: ServerWebSocket<D>, opts?: BunDuplexOptions<D>) {
    super(ctx.sendText.bind(ctx), {
      This2Other: opts?.Server2Client,
      Other2This: opts?.Client2Server,
    });
  }

  // bun integration, kinda ugly
  close(_: any, code: number, reason: string) {
    this.offAll();
    //
  }
  open(_: any) {
    // no open is declared?
  }

  message(_: any, message: string | Buffer) {
    this.handleMessage(
      typeof message === 'string' ? message : message.toString()
    );
  }
}

// TODO provide passthrough?

export function bunWebSocketHandler<T extends TypePack, D = unknown>(
  opts: BunDuplexOptions<D>,
  handler: (bunDuplex: BunDuplex<T, D>) => void
): WebSocketHandler<D> {
  // probably the only way?
  const map = new Map<ServerWebSocket<D>, BunDuplex<any, D>>();

  return {
    close(ws, code, reason) {
      map.get(ws)?.close(ws, code, reason);
      map.delete(ws);
    },
    open(ws) {
      const duplex = new BunDuplex<T, D>(ws, opts);
      duplex.open(ws);
      //
      map.set(ws, duplex);

      handler(duplex);
    },

    message(ws, message) {
      //
      map.get(ws)?.message(ws, message);
    },
    ...opts,
  };
}
