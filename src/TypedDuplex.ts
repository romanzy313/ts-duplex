// export type Arguments<T> = [T] extends [(...args: infer U) => any]
//   ? U
//   : [T] extends [void]
//   ? []
//   : [T];

import { Validators, TypePack } from './types';

type EventName = string;
type EventData = unknown;

export type BaseEventMap = {
  [key: EventName]: EventData;
};

type InternalEventMap = {
  [key: EventName]: InternalCallbacks;
};

type InternalCallbacks = ((val: any) => void)[];

// the reason for null is that javascript JSON.stringify always turns undefines to nulls
type ConditionalOptionalArg<T> = T extends null ? [T?] : [T];

type UnsubscribeFn = () => void;
// type ListenerFunction = (...args: any[]) => void;

type Encoded = [number, string, any]; // id, method, data
function decode(msg: string): Encoded {
  const val = JSON.parse(msg);

  // console.log('decoding val', val);

  if (!Array.isArray(val) || val.length != 3) {
    throw new Error('message is of wrong format');
  }

  return val as Encoded;
}

function encode(id: number, op: string, data: any): string {
  console.log('encoding payload', op, 'data', data);

  return JSON.stringify([id, op, data]);
}

export class TypedDuplex<
  This2Other extends BaseEventMap,
  Other2This extends BaseEventMap
> {
  private count = 0;
  private eventMap: InternalEventMap = {} as InternalEventMap;

  // validators here

  constructor(
    private sendFn: (msg: string) => void,
    private validators: Validators
  ) {
    // listenFn((msg) => {
    //   const decoded = decode(msg);
    //   if (!decoded) return;
    //   this.emit<any>(decoded[1], decoded[2]);
    //   //   this.onEvent<any>(decoded[1], decoded[2]);
    // });
  }

  //Promise<ReturnType<This2Others[E]>>

  protected handleError(err: any) {
    console.error('TypedDuplex error', err);
  }

  /**
   * Emits an event
   * @param event Event name
   * @param data Arguments to emit with
   */
  protected emit<E extends keyof Other2This>(
    event: E,
    data: Other2This[E]
  ): boolean {
    const listeners = this.eventMap[event as string];
    if (!listeners) return false;
    listeners.forEach((callback) => {
      callback(data);
    });
    return true;
  }

  protected handleMessage(msg: string) {
    try {
      const decoded = decode(msg);
      if (this.validators.Other2This) {
        const validatedData = this.validators.Other2This(
          decoded[1],
          decoded[2]
        );
        this.emit<any>(decoded[1], validatedData);
        return;
      }

      this.emit<any>(decoded[1], decoded[2]);
    } catch (err: any) {
      this.handleError(err);
    }
  }

  public send<E extends keyof This2Other>(
    event: E,
    ...data: ConditionalOptionalArg<This2Other[E]>
  ): void {
    try {
      const actualData =
        typeof data[0] === 'undefined'
          ? null
          : this.validators.This2Other
          ? this.validators.This2Other(event as string, data[0])
          : data[0];

      const encoded = encode(this.count++, event as string, actualData);
      this.sendFn(encoded);
    } catch (err: any) {
      // capture as error on here
      this.handleError(err);
    }
  }

  public getSendPayload<E extends keyof This2Other>(
    event: E,
    ...data: ConditionalOptionalArg<This2Other[E]>
  ): string | null {
    try {
      const actualData =
        typeof data[0] === 'undefined'
          ? null
          : this.validators.This2Other
          ? this.validators.This2Other(event as string, data[0])
          : data[0];

      const encoded = encode(this.count++, event as string, actualData);
      return encoded;

      // const encoded = encode(this.count++, event as string, data[0]);
      // // this.sendFn(encoded);
      // return encoded;
    } catch (err: any) {
      // capture as error on here
      this.handleError(err);
      return null;
    }
  }

  /**
   * Subscribes to an event
   * @param event Event name
   * @param listener Callback function to execute when event is emitted
   * @returns
   */
  public on<E extends keyof Other2This>(
    event: E,
    listener: (data: Other2This[E]) => void
  ): UnsubscribeFn {
    if (!this.eventMap[event as string]) this.eventMap[event as string] = [];
    // this.eventMap[event] = this.eventMap[event] ?? [];
    this.eventMap[event as string].push(listener);

    // return unsubscriber function

    return () => {
      this.off(event, listener);
    };

    // return this;
  }

  // other convenience methods
  //   /**
  //    * Subscribes to event once
  //    * @param event Event name
  //    * @param listener Callback function to execute when event is emitted
  //    */
  //   public once<E extends keyof Other2This>(
  //     event: E,
  //     listener: Other2This[E]
  //   ): this {
  //     // FIX this will not be cleaned up if offAll is used
  //     const sub = (...args) => {
  //       this.off(event, sub as any);

  //       // eslint-disable-next-line prefer-rest-params
  //       // listener.apply(this, args);
  //       listener(...args);
  //     };

  //     this.on(event, sub as any);

  //     return this;
  //   }

  //   /**
  //    * Waits for event to complete, currently never rejects
  //    * @param event Event name
  //    * @returns In async context returns event data as an array
  //    */
  //   public async waitFor<E extends keyof Other2This>(
  //     event: E
  //   ): Promise<Arguments<Other2This[E]>> {
  //     // FIX this will not be cleaned up if offAll is used
  //     // For now the event will be hanging forever!
  //     // See skipped test

  //     return new Promise((resolve, _reject) => {
  //       const sub = (...args) => {
  //         this.off(event, sub as any);

  //         resolve(args as any);
  //       };

  //       this.on(event, sub as any);
  //     });
  //   }

  // TODO make as event iterator
  // public async asIterator<E extends keyof Events>(event: E): Promise<Arguments<Events[E]>> {

  // }

  /**
   * Unsubscribes from event
   * @param event Event name
   * @param listener Callback function used when subscribed
   */
  public off<E extends keyof Other2This>(
    event: E,
    listener: (data: Other2This[E]) => void
  ): this {
    const listeners = this.eventMap[event as string];
    if (!listeners) return this;

    for (let i = listeners.length - 1; i >= 0; i -= 1) {
      if (listeners[i] === listener) {
        listeners.splice(i, 1);
        break;
      }
    }
    return this;
  }

  /**
   * Unsubscribes all from event. If no arguments are passed,
   * all events are removed
   * @param event Event name
   * @returns
   */
  public offAll<E extends keyof Other2This>(event?: E): this {
    if (event) {
      const listeners = this.eventMap[event as string];
      if (!listeners) return this;
      delete this.eventMap[event as string];
    } else {
      this.eventMap = {};
    }
    return this;
  }
}
