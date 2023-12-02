// why cant this import??

import type { TypePack } from 'ts-duplex';
import type { InferZodValidatorType } from 'ts-duplex/validators/zod';
import z from 'zod';

// define with zod. shape: Record<string, ZodSchema>
export const Client2Server = {
  sendMessage: z.object({
    as: z.string(),
    content: z.string(),
  }),
  gracefulDisconnect: z.null(),
};

// define as type, as server responses do not need to be validated
type Server2ClientType = {
  newMessage: {
    from: string;
    content: string;
    time: number;
  };
  hello: null;
};

export type DuplexTypes = TypePack<
  InferZodValidatorType<typeof Client2Server>, // client to server communication goes first
  Server2ClientType // then server to client
>;
