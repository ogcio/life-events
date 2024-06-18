import { Static } from "@sinclair/typebox";
import {
  CreateTransactionBody,
  FullTransaction,
  Transaction,
  TransactionDetails,
  TransactionStatuses,
  UpdateTransactionBody,
} from "../../../routes/schemas";

export type TransactionStatuses = Static<typeof TransactionStatuses>;
export type FullTransactionDO = Static<typeof FullTransaction>;
export type TransactionDO = Static<typeof Transaction>;
export type TransactionDetailsDO = Static<typeof TransactionDetails>;
export type UpdateTransactionBodyDO = Static<typeof UpdateTransactionBody>;
export type CreateTransactionBodyDO = Static<typeof CreateTransactionBody>;
