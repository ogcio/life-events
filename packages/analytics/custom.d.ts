// / <reference types="next" />
// / <reference types="next/types/global" />

type Range<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N ? Acc[number] : Range<N, [...Acc, Acc["length"]]>;

type DimensionKeys = `dimension${Range<41>}`;

type Dimensions = Partial<{
  [key in DimensionKeys]: any;
}>;

interface Window {
  _paq?:
    | (
        | Dimensions
        | number[]
        | string[]
        | number
        | string
        | null
        | undefined
      )[][]
    | null;
}
declare namespace NodeJS {
  interface Global {
    _paq?:
      | (
          | Dimensions
          | number[]
          | string[]
          | number
          | string
          | null
          | undefined
        )[][]
      | null;
  }
}
