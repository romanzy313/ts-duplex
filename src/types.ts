type EventName = string;
type EventData = unknown;

export type BaseEventMap = {
  [key: EventName]: EventData;
};

export type TypePack<
  Client2Server extends BaseEventMap = BaseEventMap,
  Server2Client extends BaseEventMap = BaseEventMap
> = {
  Server2Client: Server2Client;
  Client2Server: Client2Server;
};

export type ValidatorFn<T = any> = (key: string, data: unknown) => T;

export type Validators = {
  This2Other?: ValidatorFn;
  Other2This?: ValidatorFn;
};

export type ConnectionState =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'disconnecting';

// export type AllEventListener = (topic: string, data: any) => void;
// export type ConnectionChangedEventListener = (connectionState: string) => void;
