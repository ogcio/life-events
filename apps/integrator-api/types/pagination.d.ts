import { Static } from "@sinclair/typebox";
import {
  PaginationLink,
  PaginationLinks,
  PaginationParams,
} from "../routes/schemas";

export type PaginationParams = Static<typeof PaginationParams>;
export type PaginationLink = Static<typeof PaginationLink>;
export type PaginationLinks = Static<typeof PaginationLinks>;
