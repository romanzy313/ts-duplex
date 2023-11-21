import z from 'zod';
import { TypePack } from 'ts-duplex';
import type { InferZodValidatorType } from 'ts-duplex/validators/zod';

export const Server2Client = {
  newMessage: z.object({
    from: z.string(),
    content: z.string(),
    time: z.number(),
  }),
  hello: z.null(),
};

export const Client2Server = {
  sendMessage: z.object({
    as: z.string(),
    content: z.string(),
  }),
  gracefulDisconnect: z.null(),
};

export type AllTypes = TypePack<
  InferZodValidatorType<typeof Client2Server>,
  InferZodValidatorType<typeof Server2Client>
>;
