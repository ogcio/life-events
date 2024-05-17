import { redirect, RedirectType } from "next/navigation";
import { TransactionStatuses } from "../types/TransactionStatuses";
import { ProviderType } from "./[locale]/(hosted)/paymentSetup/providers/types";

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(amount / 100);
}

export function stringToAmount(amount: string) {
  return Math.round(parseFloat(amount) * 100);
}

// Generating the amount to pay based on the business rules of the application
export const getRealAmount = ({
  amount,
  customAmount,
  amountOverride,
  allowAmountOverride,
  allowCustomOverride,
}: {
  // Default amount required from the database
  amount: number;
  // Custom amount choosen by the user (if applicable)
  customAmount?: number;
  // Amount override from the URL (if applicable)
  amountOverride?: number;
  allowAmountOverride: boolean;
  allowCustomOverride: boolean;
}) => {
  if (allowAmountOverride && amountOverride) return amountOverride;
  if (allowCustomOverride && customAmount) return customAmount;

  return amount;
};

export const getValidationErrors = (
  validations: any[],
): Record<string, string> => {
  return validations.reduce((errors, validation) => {
    switch (validation.keyword) {
      case "invalid": {
        errors[validation.params.field] = validation.message;
      }
    }

    return errors;
  }, {});
};

export const mapTransactionStatusColorClassName = (status: string) => {
  switch (status) {
    case TransactionStatuses.Initiated:
      return "govie-tag--blue";
    case TransactionStatuses.Pending:
      return "govie-tag--yellow";
    case TransactionStatuses.Succeeded:
      return "govie-tag--green";
    case TransactionStatuses.Cancelled:
      return "govie-tag--red";
    case TransactionStatuses.Failed:
      return "govie-tag--red";
    default:
      return "";
  }
};

export const paymentMethods = ["openbanking", "banktransfer", "card"] as const;
export type PaymentMethod = (typeof paymentMethods)[number];

export const providerTypeToPaymentMethod: Record<ProviderType, PaymentMethod> =
  {
    openbanking: "openbanking",
    banktransfer: "banktransfer",
    stripe: "card",
    realex: "card",
    worldpay: "card",
  };
export const paymentMethodToProviderType: Record<
  PaymentMethod,
  ProviderType[]
> = {
  openbanking: ["openbanking"],
  banktransfer: ["banktransfer"],
  card: ["stripe", "realex"],
};

export const errorHandler = (error) => {
  if (error.validation) {
    return;
  }

  if (error.name === "NotFoundError") {
    return redirect("/not-found", RedirectType.replace);
  }

  // Fallback to Error page
  console.error(error);
  return redirect("/error", RedirectType.replace);
};

/**
 * Pagination
 */

export const PAGINATION_PAGE_DEFAULT = 1;
export const PAGINATION_LIMIT_DEFAULT = 10;
export const PAGINATION_OFFSET_DEFAULT = 0;

export type PaginationLink = {
  href?: string;
};
export type PaginationLinks = {
  self: PaginationLink;
  next: PaginationLink;
  prev: PaginationLink;
  first: PaginationLink;
  last: PaginationLink;
  pages: Record<string, PaginationLink>;
};

export const offsetToPage = (
  offset: number = PAGINATION_OFFSET_DEFAULT,
  limit: number = PAGINATION_LIMIT_DEFAULT,
) => {
  return Math.floor(offset / limit) + 1;
};

export const pageToOffset = (
  page: number = PAGINATION_PAGE_DEFAULT,
  limit: number = PAGINATION_LIMIT_DEFAULT,
) => {
  return (page - 1) * limit;
};

export const buildPaginationLinks = (
  targetUrl: string,
  links?: PaginationLinks,
): PaginationLinks => {
  if (!links) {
    return {
      self: { href: undefined },
      next: { href: undefined },
      prev: { href: undefined },
      first: { href: undefined },
      last: { href: undefined },
      pages: {},
    };
  }

  const { pages: pagesLinks, ...paginationLinks } = links;

  const buildLinks = (data: Record<string, PaginationLink>) => {
    return Object.entries(data).reduce<Record<string, PaginationLink>>(
      (acc, [key, link]) => {
        if (!link.href) {
          acc[key] = {
            href: undefined,
          };
          return acc;
        }

        const url = new URL(
          link.href as string,
          process.env.PAYMENTS_BACKEND_URL,
        );
        const offset = parseInt(url.searchParams.get("offset") ?? "0");
        const limit = parseInt(url.searchParams.get("limit") ?? "10");

        acc[key] = {
          href: `${targetUrl}?limit=${limit}&page=${offsetToPage(offset, limit)}`,
        };

        return acc;
      },
      {},
    );
  };

  return {
    ...buildLinks(paginationLinks),
    pages: buildLinks(pagesLinks),
  } as PaginationLinks;
};
