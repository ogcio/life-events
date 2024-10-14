import { Static } from "@sinclair/typebox";
import { PaginationLinks, PaginationParams } from "../routes/schemas";

export type PaginationParams = Static<typeof PaginationParams>;
export type PaginationLinks = Static<typeof PaginationLinks>;
