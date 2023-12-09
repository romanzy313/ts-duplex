// minimal server integration

import { decodeMessage, encodeMessage } from './TypedDuplex';
import { TypePack, ValidatorFn } from './types';

// also provide encoder/decoder for json
// AKA superjson? https://github.com/blitz-js/superjson

type DuplexServerSerializerOptions = {
  Server2Client?: ValidatorFn;
  Client2Server?: ValidatorFn;
  onError?: (err: unknown) => void;
};

/**
 * Minimal amount of code needed to encode/decode messages on the server.
 * A single instance can be made and reused in server codebase.
 * This works really nice in bun.
 * And
 */
export class ServerSerializer<T extends TypePack> {
  private count = 0;

  constructor(protected opts?: DuplexServerSerializerOptions) {}

  protected decodeMessage(msg: string) {
    const val = JSON.parse(msg);

    if (!Array.isArray(val) || val.length != 3) {
      throw new Error('message is of wrong format');
    }

    return val;
  }

  protected encodeMessage(id: number | null, event: string, data: any): string {
    return JSON.stringify([id, event, data]);
  }

  public stringify<E extends keyof T['Server2Client']>(
    event: E,
    data: T['Server2Client'][E]
  ): string | null {
    try {
      const actualData =
        data === null
          ? null
          : this.opts?.Server2Client
          ? this.opts.Server2Client(event as string, data)
          : data;

      return this.encodeMessage(this.count++, event as string, actualData);
    } catch (err: unknown) {
      // capture as error on here
      if (this.opts?.onError) {
        this.opts.onError(err);
      }

      return null;
    }
  }

  public parse<E extends keyof T['Client2Server']>(
    msg: string
  ): {
    event: E;
    data: T['Client2Server'][E];
  } | null {
    try {
      const decoded = this.decodeMessage(msg);
      if (this.opts?.Client2Server) {
        const validatedData = this.opts.Client2Server(decoded[1], decoded[2]);
        return {
          event: decoded[1],
          data: validatedData,
        } as any;
      }
      return {
        event: decoded[1],
        data: decoded[2],
      } as any;
    } catch (err: unknown) {
      if (this.opts?.onError) {
        this.opts.onError(err);
      }

      return null;
    }
  }
}
