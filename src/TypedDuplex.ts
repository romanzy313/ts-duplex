// export type Arguments<T> = [T] extends [(...args: infer U) => any]
//   ? U
//   : [T] extends [void]
//   ? []
//   : [T];

import { Validators, TypePack, ConnectionState } from './types';

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

type Encoded = [number | null, string, any]; // id, method, data
export function decodeMessage(msg: string): Encoded {
  const val = JSON.parse(msg);

  if (!Array.isArray(val) || val.length != 3) {
    throw new Error('message is of wrong format');
  }

  return val as Encoded;
}

export function encodeMessage(
  id: number | null,
  event: string,
  data: any
): string {
  return JSON.stringify([id, event, data]);
}

type InternalOptions = {
  debug?: boolean; // non optional method to log incoming/outgoing events
  // handleError?: ()
} & Validators;

export class TypedDuplex<
  This2Other extends BaseEventMap,
  Other2This extends BaseEventMap
> {
  private count = 0;
  private eventMap: InternalEventMap = {} as InternalEventMap;
  private eventsStar: ((topic: string, data: any) => void)[] = [];
  // validators here
  // ability to set context, like the original one
  constructor(
    private sendFn: (msg: string) => void,
    private internalOptions: InternalOptions
  ) {}

  // TODO expose to the lib
  protected handleError(err: any) {
    console.error('TypedDuplex error', err);
  }

  /**
   * Emits an event
   * @param event Event name
   * @param data Arguments to emit with
   */
  protected emit<E extends keyof Other2This>(event: E, data: Other2This[E]) {
    // data is different to emit for all?

    const starListeners = this.eventsStar;
    for (let i = 0; i < starListeners.length; i++) {
      starListeners[i](event as string, data);
    }

    const listeners = this.eventMap[event as string];
    if (listeners) {
      for (let i = 0; i < listeners.length; i++) {
        listeners[i](data);
      }
    }
  }

  protected handleMessage(msg: string) {
    try {
      const decoded = decodeMessage(msg);
      if (this.internalOptions.Other2This) {
        const validatedData = this.internalOptions.Other2This(
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
          : this.internalOptions.This2Other
          ? this.internalOptions.This2Other(event as string, data[0])
          : data[0];

      const encoded = encodeMessage(this.count++, event as string, actualData);
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
          : this.internalOptions.This2Other
          ? this.internalOptions.This2Other(event as string, data[0])
          : data[0];

      const encoded = encodeMessage(this.count++, event as string, actualData);
      return encoded;
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
    event: '*',
    listener: (topic: E, data: Other2This[E]) => void
  ): UnsubscribeFn;
  public on<E extends keyof Other2This>(
    event: E,
    listener: (data: Other2This[E]) => void
  ): UnsubscribeFn;
  public on<E extends keyof Other2This>(
    event: E | '*',
    listener:
      | ((data: Other2This[E]) => void)
      | ((topic: E, data: Other2This[E]) => void)
  ): UnsubscribeFn {
    if (event === '*') {
      this.eventsStar.push(listener as any);
      return () => this.off('*', listener as any);
    }

    if (!this.eventMap[event as string]) this.eventMap[event as string] = [];
    this.eventMap[event as string].push(listener as any);

    // return unsubscriber function, very nice
    return () => this.off(event, listener as any);
  }

  /**
   * Unsubscribes from event
   * @param event Event name
   * @param listener Callback function used when subscribed
   */
  public off<E extends keyof Other2This>(
    event: '*',
    listener: (topic: E, data: Other2This[E]) => void
  ): this;
  public off<E extends keyof Other2This>(
    event: E,
    listener: (data: Other2This[E]) => void
  ): this;
  public off<E extends keyof Other2This>(
    event: E | '*',
    listener:
      | ((data: Other2This[E]) => void)
      | ((topic: E, data: Other2This[E]) => void)
  ): this {
    if (event === '*') {
      for (let i = this.eventsStar.length - 1; i >= 0; i -= 1) {
        if (this.eventsStar[i] === listener) {
          this.eventsStar.splice(i, 1);
          break;
        }
      }
      return this;
    }

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
   * Unsubscribes all from event name. If no arguments are passed,
   * all events are removed complely. Used internally when cleaning up
   * @param event Event name
   * @returns
   */
  public offAll<E extends keyof Other2This>(event?: E | '*'): this {
    // only specific event
    if (event) {
      if (event === '*') {
        // clear it, is this okay?
        this.eventsStar = [];
        return this;
      }

      const listeners = this.eventMap[event as string];
      if (!listeners) return this;
      delete this.eventMap[event as string];
      return this;
    }

    // clear everything otherwise
    this.eventsStar = [];
    this.eventMap = {};

    return this;
  }

  /**
   * Subscribes to event once
   * @param event Event name
   * @param listener Callback function to execute when event is emitted
   */
  public once<E extends keyof Other2This>(
    event: E,
    listener: (data: Other2This[E]) => void
  ): this {
    // FIX this may not be cleaned up if offAll is used
    const sub = (innerData: any) => {
      listener(innerData);

      setTimeout(() => {
        this.off(event, sub as any);
      });
    };

    this.on(event, sub);

    return this;
  }

  /**
   * Waits for event to complete, currently never rejects
   * @param event Event name
   * @returns In async context returns event data as an array
   */
  public async waitFor<E extends keyof Other2This>(
    event: E
  ): Promise<Other2This[E]> {
    // FIX this may not be cleaned up if offAll is used
    // this promise could never resolve

    return new Promise((resolve, _reject) => {
      const sub = (innerData: any) => {
        resolve(innerData);

        setTimeout(() => {
          this.off(event, sub);
        });
      };

      this.on(event, sub as any);
    });
  }

  // TODO other convenience methods
  // TODO make as event iterator
  // public async asIterator<E extends keyof Events>(event: E): Promise<Arguments<Events[E]>> {

  // }

  // protected wrapEventInPromise(listener: (...args: any[]) => void) {
  //   this.on()
  // }
}
