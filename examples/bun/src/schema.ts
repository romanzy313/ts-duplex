import { TypePack } from 'ts-duplex';
import type { InferTypeboxValidatorType } from 'ts-duplex/validators/typebox';
// import z from 'zod';
import { Type } from '@sinclair/typebox';
export const Server2Client = {
  newMessage: Type.Object({
    from: Type.String(),
    content: Type.String(),
    time: Type.Number(),
  }),
  hello: Type.Null(),
};

export const Client2Server = {
  sendMessage: Type.Object({
    as: Type.String(),
    content: Type.String(),
  }),
  gracefulDisconnect: Type.Null(),
};

export type AllTypes = TypePack<
  InferTypeboxValidatorType<typeof Client2Server>, // client to server communication goes first
  InferTypeboxValidatorType<typeof Server2Client>
>;
